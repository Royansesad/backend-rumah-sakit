<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Obat;
use App\Models\Resep;
use App\Models\Tagihan;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ApotekerWebController extends Controller
{
    /**
     * POST /resep/{id}/tebus
     * Web action untuk penebusan resep digital & pemotongan stok obat otomatis.
     */
    public function tebusResep(Request $request, string $id): RedirectResponse
    {
        $resep = Resep::with(['details.obat', 'pasien', 'dokter'])->find($id);

        if (! $resep) {
            return back()->with('error', 'Resep tidak ditemukan.');
        }

        if ($resep->status === 'sudah_ditebus') {
            return back()->with('error', 'Resep ini sudah ditebus sebelumnya.');
        }

        // 1. Cek ketersediaan stok semua obat dalam resep
        foreach ($resep->details as $detail) {
            if ($detail->obat) {
                if ($detail->obat->stok < $detail->jumlah_dosis) {
                    return back()->with('error', "Stok obat '{$detail->obat->nama_obat}' tidak mencukupi (Stok: {$detail->obat->stok}, Dibutuhkan: {$detail->jumlah_dosis}).");
                }
            }
        }

        // 2. Potong stok obat di database
        $totalBiayaObat = 0;
        foreach ($resep->details as $detail) {
            if ($detail->obat) {
                $detail->obat->decrement('stok', $detail->jumlah_dosis);
                $hargaObat = $detail->obat->harga ?? 0;
                $totalBiayaObat += ($hargaObat * $detail->jumlah_dosis);
            }
        }

        // 3. Update status resep menjadi sudah_ditebus
        $resep->update([
            'status' => 'sudah_ditebus',
            'updated_at' => Carbon::now(),
        ]);

        // 4. Catat Audit Log
        $user = session('simrs_user', null);
        AuditLog::create([
            'id' => (string) Str::uuid(),
            'pembuat_type' => session('simrs_role', 'apoteker'),
            'pembuat_id' => $user['id'] ?? (string) Str::uuid(),
            'modul' => 'resep_farmasi',
            'aksi' => 'tebus_resep',
            'target_label' => 'No. Resep',
            'target_id' => $resep->no_resep,
            'data_sesudah' => [
                'no_resep' => $resep->no_resep,
                'nama_pasien' => $resep->pasien->nama_lengkap ?? '-',
                'jumlah_item' => $resep->details->count(),
                'status' => 'sudah_ditebus',
            ],
            'created_at' => Carbon::now(),
        ]);

        return back()->with('success', "Resep {$resep->no_resep} atas nama " . ($resep->pasien->nama_lengkap ?? 'Pasien') . " berhasil ditebus dan stok obat telah diperbarui.");
    }

    /**
     * POST /obat/{id}/stok
     * Web action untuk penyesuaian/restock kuantitas obat.
     */
    public function updateStokObat(Request $request, string $id): RedirectResponse
    {
        $request->validate([
            'stok' => 'required|integer|min:0',
            'alasan' => 'nullable|string|max:255',
        ]);

        $obat = Obat::findOrFail($id);
        $stokLama = $obat->stok;
        $stokBaru = (int) $request->input('stok');

        $obat->update(['stok' => $stokBaru]);

        $user = session('simrs_user', null);
        AuditLog::create([
            'id' => (string) Str::uuid(),
            'pembuat_type' => session('simrs_role', 'apoteker'),
            'pembuat_id' => $user['id'] ?? (string) Str::uuid(),
            'modul' => 'inventaris_obat',
            'aksi' => 'update_stok',
            'target_label' => 'Nama Obat',
            'target_id' => $obat->nama_obat,
            'data_sebelum' => ['stok' => $stokLama],
            'data_sesudah' => [
                'stok' => $stokBaru,
                'alasan' => $request->input('alasan', 'Penyesuaian stok manual / Restock'),
            ],
            'created_at' => Carbon::now(),
        ]);

        return back()->with('success', "Stok obat '{$obat->nama_obat}' berhasil diperbarui dari {$stokLama} menjadi {$stokBaru}.");
    }

    /**
     * POST /obat
     * Web action untuk menambah obat baru ke katalog.
     */
    public function storeObat(Request $request): RedirectResponse
    {
        $request->validate([
            'nama_obat' => 'required|string|max:255',
            'kode_obat' => 'required|string|unique:obats,kode_obat',
            'bentuk_sediaan' => 'required|string',
            'stok' => 'required|integer|min:0',
            'harga' => 'nullable|numeric|min:0',
        ]);

        $obat = Obat::create([
            'kode_obat' => strtoupper($request->input('kode_obat')),
            'nama_obat' => $request->input('nama_obat'),
            'bentuk_sediaan' => $request->input('bentuk_sediaan'),
            'kemasan' => $request->input('kemasan', 'Botol / Strip'),
            'komposisi' => $request->input('komposisi', '-'),
            'stok' => (int) $request->input('stok', 0),
            'harga' => (float) $request->input('harga', 0),
        ]);

        $user = session('simrs_user', null);
        AuditLog::create([
            'id' => (string) Str::uuid(),
            'pembuat_type' => session('simrs_role', 'apoteker'),
            'pembuat_id' => $user['id'] ?? (string) Str::uuid(),
            'modul' => 'inventaris_obat',
            'aksi' => 'tambah_obat',
            'target_label' => 'Nama Obat',
            'target_id' => $obat->nama_obat,
            'data_sesudah' => $obat->toArray(),
            'created_at' => Carbon::now(),
        ]);

        return back()->with('success', "Obat baru '{$obat->nama_obat}' ({$obat->kode_obat}) berhasil ditambahkan ke inventaris.");
    }
}
