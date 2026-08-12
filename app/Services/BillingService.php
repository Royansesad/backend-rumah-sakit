<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Contracts\HasSimrsRole;
use App\Models\Pasien;
use App\Models\Tagihan;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BillingService
{
    public const STATUS_BELUM_LUNAS = 'belum_lunas';
    public const STATUS_LUNAS = 'lunas';
    public const STATUS_DIBATALKAN = 'dibatalkan';

    /**
     * Resolve the current operator (id + role) either from the authenticated
     * Sanctum user (API) or from the staff session (Web).
     *
     * @return array{id: string|null, role: string}
     */
    public function resolveOperator(Request $request): array
    {
        return app(SimrsOperatorService::class)->resolve($request);
    }

    /**
     * Generate nomor invoice atomic berbasis sequence bulanan (INV-YYYYMM-NNN).
     * Dibungkus transaction + lockForUpdate untuk menghindari duplikasi saat konkurensi.
     */
    public function generateNomorInvoice(): string
    {
        $prefix = 'INV-'.Carbon::now()->format('Ym').'-';

        return DB::transaction(function () use ($prefix) {
            $last = Tagihan::query()
                ->where('no_invoice', 'like', "{$prefix}%")
                ->orderByDesc('no_invoice')
                ->lockForUpdate()
                ->first();

            $sequence = 1;
            if ($last !== null) {
                $sequence = ((int) substr($last->no_invoice, strlen($prefix))) + 1;
            }

            return $prefix.str_pad((string) $sequence, 3, '0', STR_PAD_LEFT);
        });
    }

    /**
     * Buat invoice baru dari rincian layanan pasien.
     *
     * @param  array<string, mixed>  $data
     * @param  array{id: string|null, role: string}  $operator
     */
    public function buatInvoice(array $data, array $operator): Tagihan
    {
        $pasien = Pasien::findOrFail($data['pasien_id']);
        $subtotal = 0;
        $formattedRincian = [];

        foreach ($data['rincian'] as $item) {
            $price = (int) ($item['price'] ?? 0);
            $qty = max(1, (int) ($item['qty'] ?? 1));
            $itemTotal = $price * $qty;
            $subtotal += $itemTotal;

            $formattedRincian[] = [
                'label' => $item['label'] ?? 'Layanan Medis',
                'desc' => $item['desc'] ?? '',
                'price' => $price,
                'qty' => $qty,
                'total' => $itemTotal,
                'icon' => $item['icon'] ?? 'stethoscope',
            ];
        }

        $diskon = (int) ($data['diskon'] ?? 0);
        $pajak = (int) ($data['pajak'] ?? 0);
        $totalTagihan = max(0, $subtotal - $diskon + $pajak);
        $noInvoice = $this->generateNomorInvoice();

        $tagihan = Tagihan::create([
            'id' => (string) Str::uuid(),
            'no_invoice' => $noInvoice,
            'pasien_id' => $pasien->id,
            'layanan' => $data['layanan'],
            'subtotal' => $subtotal,
            'diskon' => $diskon,
            'pajak' => $pajak,
            'total_tagihan' => $totalTagihan,
            'status' => self::STATUS_BELUM_LUNAS,
            'rincian' => $formattedRincian,
            'catatan' => $data['catatan'] ?? null,
        ]);

        $this->catatAudit($operator, 'buat_invoice', $noInvoice, [], [
            'no_invoice' => $noInvoice,
            'nama_pasien' => $pasien->nama_lengkap ?? '-',
            'layanan' => $data['layanan'],
            'total_tagihan' => $totalTagihan,
            'status' => self::STATUS_BELUM_LUNAS,
        ]);

        return $tagihan->load('pasien');
    }

    /**
     * Proses pembayaran invoice & catat audit log.
     *
     * @param  array{id: string|null, role: string}  $operator
     * @return array{ok: bool, tagihan: Tagihan}|array{error: string, code: int}
     */
    public function prosesPembayaran(Tagihan $tagihan, string $metode, int $jumlahDibayar, array $operator, ?string $catatan = null): array
    {
        $tagihan->loadMissing('pasien');

        if ($tagihan->status !== self::STATUS_BELUM_LUNAS) {
            return ['error' => 'Tagihan ini sudah lunas atau dibatalkan sebelumnya.', 'code' => 422];
        }

        if ($jumlahDibayar < $tagihan->total_tagihan && ! in_array(strtolower($metode), ['bpjs', 'asuransi'])) {
            return [
                'error' => 'Jumlah pembayaran kurang dari total tagihan (Rp '.number_format($tagihan->total_tagihan, 0, ',', '.').').',
                'code' => 422,
            ];
        }

        $kembalian = max(0, $jumlahDibayar - $tagihan->total_tagihan);

        $tagihan->update([
            'status' => self::STATUS_LUNAS,
            'metode_pembayaran' => $metode,
            'jumlah_dibayar' => $jumlahDibayar,
            'kembalian' => $kembalian,
            'waktu_pembayaran' => Carbon::now(),
            'kasir_id' => $operator['id'],
            'catatan' => $catatan ?? $tagihan->catatan,
        ]);

        $this->catatAudit($operator, 'proses_pembayaran', $tagihan->no_invoice, [], [
            'no_invoice' => $tagihan->no_invoice,
            'nama_pasien' => $tagihan->pasien->nama_lengkap ?? '-',
            'total_tagihan' => $tagihan->total_tagihan,
            'metode_pembayaran' => $metode,
            'jumlah_dibayar' => $jumlahDibayar,
            'kembalian' => $kembalian,
            'status' => self::STATUS_LUNAS,
        ]);

        return ['ok' => true, 'tagihan' => $tagihan];
    }

    /**
     * Batalkan invoice & catat audit log.
     *
     * @param  array{id: string|null, role: string}  $operator
     */
    public function batalkan(Tagihan $tagihan, array $operator): void
    {
        $dataSebelum = $tagihan->only(['no_invoice', 'status', 'total_tagihan']);
        $tagihan->update(['status' => self::STATUS_DIBATALKAN]);

        $this->catatAudit($operator, 'batalkan_invoice', $tagihan->no_invoice, $dataSebelum, [
            'no_invoice' => $tagihan->no_invoice,
            'status' => self::STATUS_DIBATALKAN,
            'total_tagihan' => $tagihan->total_tagihan,
        ]);
    }

    /**
     * Tulis baris AuditLog untuk semua aksi billing.
     *
     * @param  array{id: string|null, role: string}  $operator
     * @param  array<string, mixed>  $sebelum
     * @param  array<string, mixed>  $sesudah
     */
    protected function catatAudit(array $operator, string $aksi, string $noInvoice, array $sebelum, array $sesudah): void
    {
        AuditLog::create([
            'id' => (string) Str::uuid(),
            'pembuat_type' => $operator['role'],
            'pembuat_id' => $operator['id'] ?? (string) Str::uuid(),
            'modul' => 'pembayaran_kasir',
            'aksi' => $aksi,
            'target_label' => 'No. Invoice',
            'target_id' => $noInvoice,
            'data_sebelum' => $sebelum,
            'data_sesudah' => $sesudah,
            'created_at' => Carbon::now(),
        ]);
    }
}