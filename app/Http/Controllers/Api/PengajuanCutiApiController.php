<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dokter;
use App\Models\JadwalDokter;
use App\Models\JadwalShiftPerawat;
use App\Models\PengajuanCuti;
use App\Models\Perawat;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PengajuanCutiApiController extends Controller
{
    /**
     * Submit Pengajuan Cuti Mandiri (Dokter & Perawat)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'jenis_pengajuan' => 'required|string|max:100',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
            'alasan' => 'nullable|string',
        ]);

        $user = $request->user();
        $inputPemohonId = $request->input('pemohon_id');

        if ($inputPemohonId) {
            $dokter = Dokter::find($inputPemohonId);
            $perawat = Perawat::find($inputPemohonId);
        } elseif ($user instanceof Dokter) {
            $dokter = $user;
            $perawat = null;
        } elseif ($user instanceof Perawat) {
            $perawat = $user;
            $dokter = null;
        } else {
            $dokter = Dokter::where('email', $user?->email)->orWhere('id', $user?->id)->first();
            $perawat = Perawat::where('email', $user?->email)->orWhere('id', $user?->id)->first();
        }

        if ($dokter) {
            $validated['peran_pemohon'] = 'dokter';
            $validated['pemohon_id'] = $dokter->id;
        } elseif ($perawat) {
            $validated['peran_pemohon'] = 'perawat';
            $validated['pemohon_id'] = $perawat->id;
        } else {
            $validated['peran_pemohon'] = 'dokter';
            $validated['pemohon_id'] = $user?->id ?? Dokter::first()->id;
        }

        $validated['status'] = 'menunggu';

        $pengajuan = PengajuanCuti::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan cuti berhasil dikirim dan menunggu persetujuan admin.',
            'data' => $pengajuan,
        ], 201);
    }

    /**
     * List Riwayat Pengajuan Cuti Mandiri
     */
    public function riwayatMandiri(Request $request): JsonResponse
    {
        $user = $request->user();
        $dokter = Dokter::where('email', $user->email)->orWhere('id', $user->id)->first();
        $perawat = Perawat::where('email', $user->email)->orWhere('id', $user->id)->first();

        $pemohonId = $dokter->id ?? ($perawat->id ?? $user->id);

        $riwayat = PengajuanCuti::where('pemohon_id', $pemohonId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $riwayat,
        ]);
    }

    /**
     * Persetujuan Admin (Approve / Reject) Cuti
     */
    public function persetujuanAdmin(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'setuju' => 'required|boolean',
            'alasan_penolakan' => 'nullable|string',
        ]);

        $pengajuan = PengajuanCuti::findOrFail($id);

        if ($pengajuan->status !== 'menunggu') {
            return response()->json([
                'success' => false,
                'message' => 'Pengajuan ini telah diproses sebelumnya.',
            ], 422);
        }

        DB::transaction(function () use ($pengajuan, $validated, $request) {
            if ($validated['setuju']) {
                $pengajuan->update([
                    'status' => 'disetujui',
                    'disetujui_oleh_admin_id' => $request->user()->id ?? null,
                ]);

                // Auto-update jadwal dokter / perawat menjadi status 'cuti'
                if ($pengajuan->peran_pemohon === 'dokter') {
                    JadwalDokter::where('dokter_id', $pengajuan->pemohon_id)
                        ->update(['status' => 'cuti', 'ada_bentrok' => false]);
                } else {
                    JadwalShiftPerawat::where('perawat_id', $pengajuan->pemohon_id)
                        ->update(['status' => 'cuti']);
                }
            } else {
                $pengajuan->update([
                    'status' => 'ditolak',
                    'disetujui_oleh_admin_id' => $request->user()->id ?? null,
                    'alasan_penolakan' => $validated['alasan_penolakan'] ?? null,
                ]);
            }
        });

        return response()->json([
            'success' => true,
            'message' => $validated['setuju'] ? 'Pengajuan cuti disetujui & jadwal diperbarui.' : 'Pengajuan cuti ditolak.',
            'data' => $pengajuan->fresh(),
        ]);
    }
}
