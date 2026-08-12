<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\InventoryItem;
use App\Models\InventoryStockMovement;
use Illuminate\Support\Str;

class InventoryService
{
    public const TIPE_TERSEDIA = ['masuk', 'keluar', 'transfer', 'penyesuaian', 'retur', 'kadaluarsa'];

    /**
     * Terapkan mutasi stok secara transaksional & catat ledger + audit log.
     * `qty` selalu positif; arah pergerakan ditentukan oleh `tipe`.
     * Khusus `penyesuaian`, `qty` boleh bertanda (positif menambah, negatif mengurangi).
     *
     * @param  array{warehouse_id?: string|null, referensi?: string|null, keterangan?: string|null}  $data
     * @param  array{id?: string|null, role?: string|null}  $operator
     * @return array{ok: bool, movement: InventoryStockMovement, stok_baru: int}|array{error: string, code: int}
     */
    public function mutasi(InventoryItem $item, string $tipe, int $qty, array $data = [], array $operator = []): array
    {
        if (! in_array($tipe, self::TIPE_TERSEDIA, true)) {
            return ['error' => "Tipe mutasi '{$tipe}' tidak dikenali.", 'code' => 422];
        }

        $qty = (int) $qty;

        $delta = match ($tipe) {
            'masuk', 'retur' => abs($qty),
            'keluar', 'kadaluarsa' => -abs($qty),
            'penyesuaian' => $qty,
            'transfer' => 0,
            default => 0,
        };

        $stokBaru = $item->stok_saat_ini + $delta;
        if ($stokBaru < 0) {
            return [
                'error' => "Stok '{$item->nama_barang}' tidak mencukupi (Stok: {$item->stok_saat_ini}, Dibutuhkan: ".abs($delta).').',
                'code' => 422,
            ];
        }

        $item->update(['stok_saat_ini' => $stokBaru]);

        $movement = InventoryStockMovement::create([
            'id' => (string) Str::uuid(),
            'inventory_item_id' => $item->id,
            'tipe' => $tipe,
            'qty' => $delta,
            'warehouse_id' => $data['warehouse_id'] ?? $item->warehouse_id,
            'referensi' => $data['referensi'] ?? null,
            'keterangan' => $data['keterangan'] ?? null,
            'stok_setelah' => $stokBaru,
            'operator_role' => $operator['role'] ?? null,
            'operator_id' => $operator['id'] ?? null,
            'created_at' => now(),
        ]);

        $this->catatAudit($operator, "mutasi_{$tipe}", $item, $delta, $stokBaru, $data['referensi'] ?? null);

        return ['ok' => true, 'movement' => $movement, 'stok_baru' => $stokBaru];
    }

    /**
     * @param  array{id?: string|null, role?: string|null}  $operator
     * @param  array<string, mixed>  $extra
     */
    protected function catatAudit(array $operator, string $aksi, InventoryItem $item, int $delta, int $stokBaru, ?string $referensi, array $extra = []): void
    {
        AuditLog::create([
            'id' => (string) Str::uuid(),
            'pembuat_type' => $operator['role'] ?? 'admin',
            'pembuat_id' => $operator['id'] ?? (string) Str::uuid(),
            'modul' => 'inventaris_barang',
            'aksi' => $aksi,
            'target_label' => 'Kode Barang',
            'target_id' => $item->kode_barang,
            'data_sesudah' => [
                'nama_barang' => $item->nama_barang,
                'delta' => $delta,
                'stok_setelah' => $stokBaru,
                'referensi' => $referensi,
                ...$extra,
            ],
            'created_at' => now(),
        ]);
    }
}