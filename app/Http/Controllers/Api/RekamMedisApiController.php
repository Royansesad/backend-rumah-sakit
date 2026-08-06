<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pasien;
use App\Models\RekamMedis;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RekamMedisApiController extends Controller
{
    /**
     * GET /api/v1/rekam-medis
     * Daftar semua rekam medis (paginated, filterable).
     */
    public function index(Request $request): JsonResponse
    {
        $query = RekamMedis::with(['pasien:id,nama_lengkap,nomor_rekam_medis', 'dokter:id,nama_lengkap,spesialisasi', 'perawat:id,nama_lengkap', 'poli:id,nama_poli']);

        if ($request->filled('pasien_id')) {
            $query->where('pasien_id', $request->input('pasien_id'));
        }

        if ($request->filled('dokter_id')) {
            $query->where('dokter_id', $request->input('dokter_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->whereHas('pasien', function ($q) use ($search) {
                $q->where('nama_lengkap', 'like', "%{$search}%")
                    ->orWhere('nomor_rekam_medis', 'like', "%{$search}%");
            });
        }

        $data = $query->orderByDesc('created_at')->paginate($request->input('per_page', 15));

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }

    /**
     * GET /api/v1/rekam-medis/{id}
     * Detail satu rekam medis.
     */
    public function show(string $id): JsonResponse
    {
        $rekamMedis = RekamMedis::with([
            'pasien:id,nama_lengkap,nomor_rekam_medis,tanggal_lahir,jenis_kelamin,golongan_darah,alergi,kondisi_terakhir',
            'dokter:id,nama_lengkap,spesialisasi',
            'perawat:id,nama_lengkap',
            'poli:id,nama_poli',
            'resep.details.obat',
        ])->find($id);

        if (! $rekamMedis) {
            return response()->json([
                'status' => 'error',
                'message' => 'Rekam medis tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $rekamMedis,
        ]);
    }

    /**
     * POST /api/v1/rekam-medis
     * Buat rekam medis baru (draft).
     */
    public function store(Request $request): JsonResponse
    {
        $required = ['pasien_id', 'keluhan_utama'];
        foreach ($required as $field) {
            if (! $request->filled($field)) {
                return response()->json([
                    'status' => 'error',
                    'message' => "Field {$field} wajib diisi.",
                ], 422);
            }
        }

        $pasien = Pasien::find($request->input('pasien_id'));
        if (! $pasien) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pasien tidak ditemukan.',
            ], 404);
        }

        $data = $request->only([
            'pasien_id', 'dokter_id', 'perawat_id', 'poli_id',
            'sistol', 'diastol', 'suhu_tubuh', 'denyut_nadi', 'spo2', 'kondisi_pasien',
            'catatan_keperawatan',
            'keluhan_utama', 'icd10_code', 'diagnosis_deskripsi', 'catatan_dokter',
            'lampiran_path',
        ]);
        $data['id'] = (string) Str::uuid();
        $data['status'] = 'draft';

        $rekamMedis = RekamMedis::create($data);

        // Update kondisi_terakhir pasien
        if ($request->filled('kondisi_pasien')) {
            $pasien->update(['kondisi_terakhir' => $request->input('kondisi_pasien')]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Rekam medis berhasil dibuat.',
            'data' => $rekamMedis->load(['pasien:id,nama_lengkap,nomor_rekam_medis', 'dokter:id,nama_lengkap', 'perawat:id,nama_lengkap', 'poli:id,nama_poli']),
        ], 201);
    }

    /**
     * PUT /api/v1/rekam-medis/{id}
     * Update rekam medis (hanya jika masih draft).
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $rekamMedis = RekamMedis::find($id);

        if (! $rekamMedis) {
            return response()->json([
                'status' => 'error',
                'message' => 'Rekam medis tidak ditemukan.',
            ], 404);
        }

        if ($rekamMedis->status === 'final') {
            return response()->json([
                'status' => 'error',
                'message' => 'Rekam medis yang sudah final tidak dapat diubah.',
            ], 422);
        }

        $payload = $request->only([
            'dokter_id', 'perawat_id', 'poli_id',
            'sistol', 'diastol', 'suhu_tubuh', 'denyut_nadi', 'spo2', 'kondisi_pasien',
            'catatan_keperawatan',
            'keluhan_utama', 'icd10_code', 'diagnosis_deskripsi', 'catatan_dokter',
            'lampiran_path',
        ]);

        $rekamMedis->update($payload);

        // Update kondisi_terakhir pasien
        if ($request->filled('kondisi_pasien')) {
            $rekamMedis->pasien->update(['kondisi_terakhir' => $request->input('kondisi_pasien')]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Rekam medis berhasil diperbarui.',
            'data' => $rekamMedis->fresh(['pasien:id,nama_lengkap,nomor_rekam_medis', 'dokter:id,nama_lengkap', 'perawat:id,nama_lengkap', 'poli:id,nama_poli']),
        ]);
    }

    /**
     * PATCH /api/v1/rekam-medis/{id}/finalize
     * Finalisasi rekam medis (draft -> final).
     */
    public function finalize(string $id): JsonResponse
    {
        $rekamMedis = RekamMedis::find($id);

        if (! $rekamMedis) {
            return response()->json([
                'status' => 'error',
                'message' => 'Rekam medis tidak ditemukan.',
            ], 404);
        }

        if ($rekamMedis->status === 'final') {
            return response()->json([
                'status' => 'error',
                'message' => 'Rekam medis sudah dalam status final.',
            ], 422);
        }

        $rekamMedis->update([
            'status' => 'final',
            'finalized_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Rekam medis berhasil difinalisasi.',
            'data' => $rekamMedis,
        ]);
    }

    /**
     * GET /api/v1/rekam-medis/{pasienId}/monitoring
     * Data monitoring vitals pasien (terkini + riwayat).
     */
    public function monitoring(string $pasienId): JsonResponse
    {
        $pasien = Pasien::select('id', 'nomor_rekam_medis', 'nama_lengkap', 'tanggal_lahir', 'jenis_kelamin', 'golongan_darah', 'alergi', 'kondisi_terakhir')
            ->find($pasienId);

        if (! $pasien) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pasien tidak ditemukan.',
            ], 404);
        }

        $riwayat = RekamMedis::where('pasien_id', $pasienId)
            ->whereNotNull('sistol')
            ->with(['perawat:id,nama_lengkap'])
            ->orderByDesc('created_at')
            ->limit(20)
            ->get()
            ->map(function ($rm) {
                return [
                    'id' => $rm->id,
                    'tanggal_pemeriksaan' => $rm->created_at->toIso8601String(),
                    'vital_signs' => [
                        'sistol' => $rm->sistol,
                        'diastol' => $rm->diastol,
                        'suhu_tubuh' => $rm->suhu_tubuh,
                        'denyut_nadi' => $rm->denyut_nadi,
                        'spo2' => $rm->spo2,
                    ],
                    'kondisi_pasien' => $rm->kondisi_pasien,
                    'perawat' => $rm->perawat ? [
                        'id' => $rm->perawat->id,
                        'nama_lengkap' => $rm->perawat->nama_lengkap,
                    ] : null,
                    'catatan_keperawatan' => $rm->catatan_keperawatan,
                ];
            });

        $terkini = $riwayat->first();

        // Alert logic
        $hasAlert = false;
        $alertMessage = null;
        if ($terkini && $terkini['kondisi_pasien'] === 'kritis') {
            $hasAlert = true;
            $alertMessage = 'PERINGATAN: Kondisi pasien kritis! Segera lakukan tindakan medis.';
        } elseif ($terkini && $terkini['kondisi_pasien'] === 'perlu_perhatian') {
            $hasAlert = true;
            $alertMessage = 'Kondisi pasien memerlukan perhatian khusus.';
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Data monitoring vitals pasien berhasil diambil.',
            'data' => [
                'pasien' => $pasien,
                'monitoring_terkini' => $terkini,
                'riwayat_monitoring' => $riwayat,
                'alert' => [
                    'has_alert' => $hasAlert,
                    'message' => $alertMessage,
                ],
            ],
        ]);
    }
}
