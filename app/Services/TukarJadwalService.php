<?php

namespace App\Services;

use App\Models\JadwalDokter;
use App\Models\JadwalShiftPerawat;
use App\Models\PengajuanTukarJadwal;
use Exception;
use Illuminate\Support\Facades\DB;

class TukarJadwalService
{
    /**
     * Respon persetujuan level 1 dari Target Pengganti (Dokter / Perawat).
     */
    public function persetujuanTarget(PengajuanTukarJadwal $pengajuan, bool $setuju): PengajuanTukarJadwal
    {
        if ($pengajuan->status_persetujuan_target !== 'menunggu') {
            throw new Exception("Pengajuan tukar ini telah diproses oleh target pengganti.");
        }

        $pengajuan->update([
            'status_persetujuan_target' => $setuju ? 'disetujui' : 'ditolak',
            'waktu_persetujuan_target' => now(),
            'status_persetujuan_admin' => $setuju ? 'menunggu' : 'ditolak',
        ]);

        return $pengajuan;
    }

    /**
     * Respon persetujuan level 2 dari Admin / Kepala Bagian & Eksekusi Tukar Jadwal di DB.
     */
    public function persetujuanAdmin(PengajuanTukarJadwal $pengajuan, bool $setuju, string $adminId, ?string $alasanPenolakan = null): PengajuanTukarJadwal
    {
        if ($pengajuan->status_persetujuan_target !== 'disetujui') {
            throw new Exception("Pengajuan belum disetujui oleh rekan pengganti (Level 1).");
        }

        if ($pengajuan->status_persetujuan_admin !== 'menunggu') {
            throw new Exception("Pengajuan tukar ini telah diproses oleh admin.");
        }

        return DB::transaction(function () use ($pengajuan, $setuju, $adminId, $alasanPenolakan) {
            if (!$setuju) {
                $pengajuan->update([
                    'status_persetujuan_admin' => 'ditolak',
                    'disetujui_oleh_admin_id' => $adminId,
                    'alasan_penolakan' => $alasanPenolakan,
                ]);
                return $pengajuan;
            }

            // Jika disetujui Admin, tukar entitas pemilik jadwal (dokter_id / perawat_id)
            if ($pengajuan->kategori_tukar === 'jadwal_dokter') {
                $jadwalPemohon = JadwalDokter::findOrFail($pengajuan->jadwal_pemohon_id);
                
                if ($pengajuan->jadwal_target_id) {
                    $jadwalTarget = JadwalDokter::findOrFail($pengajuan->jadwal_target_id);
                    
                    // Tukar dokter_id antara 2 slot
                    $tempDokterId = $jadwalPemohon->dokter_id;
                    $jadwalPemohon->update(['dokter_id' => $jadwalTarget->dokter_id]);
                    $jadwalTarget->update(['dokter_id' => $tempDokterId]);
                } else {
                    // Hanya pindah tangan ke target_pengganti_id
                    $jadwalPemohon->update(['dokter_id' => $pengajuan->target_pengganti_id]);
                }
            } else { // shift_perawat
                $shiftPemohon = JadwalShiftPerawat::findOrFail($pengajuan->jadwal_pemohon_id);

                if ($pengajuan->jadwal_target_id) {
                    $shiftTarget = JadwalShiftPerawat::findOrFail($pengajuan->jadwal_target_id);

                    // Tukar perawat_id antara 2 slot shift
                    $tempPerawatId = $shiftPemohon->perawat_id;
                    $shiftPemohon->update(['perawat_id' => $shiftTarget->perawat_id]);
                    $shiftTarget->update(['perawat_id' => $tempPerawatId]);
                } else {
                    $shiftPemohon->update(['perawat_id' => $pengajuan->target_pengganti_id]);
                }
            }

            $pengajuan->update([
                'status_persetujuan_admin' => 'disetujui',
                'disetujui_oleh_admin_id' => $adminId,
            ]);

            return $pengajuan;
        ]);
    }
}
