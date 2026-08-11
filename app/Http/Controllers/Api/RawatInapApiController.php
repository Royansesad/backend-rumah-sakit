<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bed;
use App\Models\Pasien;
use App\Models\RawatInapAdmission;
use App\Models\RiwayatPindahBed;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RawatInapApiController extends Controller
{
    /**
     * Display a listing of rawat inap admissions.
     */
    public function index(Request $request): JsonResponse
    {
        $query = RawatInapAdmission::with([
            'pasien',
            'bed.ruangan',
            'bed.bangsal',
            'ruangan',
            'bangsal',
            'dpjp',
            'riwayatPindah.bedAsal',
            'riwayatPindah.bedTujuan',
        ]);

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('pasien_id')) {
            $query->where('pasien_id', $request->query('pasien_id'));
        }

        if ($request->filled('dpjp_id')) {
            $query->where('dpjp_id', $request->query('dpjp_id'));
        }

        if ($request->filled('bangsal_id')) {
            $query->where('bangsal_id', $request->query('bangsal_id'));
        }

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('nomor_admission', 'like', "%{$search}%")
                  ->orWhereHas('pasien', function ($pq) use ($search) {
                      $pq->where('nama_lengkap', 'like', "%{$search}%")
                         ->orWhere('nomor_rekam_medis', 'like', "%{$search}%");
                  });
            });
        }

        $admissions = $query->orderBy('tanggal_masuk', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'data' => $admissions,
        ]);
    }

    /**
     * Store check-in admission.
     */
    public function checkIn(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'pasien_id' => 'required|uuid|exists:pasien,id',
            'bed_id' => 'required|uuid|exists:beds,id',
            'dpjp_id' => 'nullable|uuid|exists:dokters,id',
            'tanggal_masuk' => 'nullable|date',
            'tanggal_keluar_rencana' => 'nullable|date|after_or_equal:tanggal_masuk',
            'alasan_masuk' => 'nullable|string',
            'diagnosa_awal' => 'nullable|string',
        ]);

        $bed = Bed::with(['ruangan', 'bangsal'])->find($validated['bed_id']);

        if (! $bed) {
            return response()->json([
                'status' => 'error',
                'message' => 'Bed tidak ditemukan',
            ], 404);
        }

        if ($bed->status !== 'tersedia') {
            return response()->json([
                'status' => 'error',
                'message' => "Bed {$bed->nomor_bed} sedang tidak tersedia (status saat ini: {$bed->status}).",
            ], 422);
        }

        // Check if patient already has an active inpatient admission
        $existingActive = RawatInapAdmission::where('pasien_id', $validated['pasien_id'])
            ->where('status', 'aktif')
            ->first();

        if ($existingActive) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pasien tersebut masih memiliki admisi rawat inap yang aktif.',
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Generate unique admission number RI-YYYYMMDD-XXXX
            $datePrefix = now()->format('Ymd');
            $randomSuffix = strtoupper(Str::random(5));
            $nomorAdmission = 'RI-' . $datePrefix . '-' . $randomSuffix;

            $admission = RawatInapAdmission::create([
                'nomor_admission' => $nomorAdmission,
                'pasien_id' => $validated['pasien_id'],
                'bed_id' => $bed->id,
                'ruangan_id' => $bed->ruangan_id,
                'bangsal_id' => $bed->bangsal_id,
                'dpjp_id' => $validated['dpjp_id'] ?? null,
                'tanggal_masuk' => $validated['tanggal_masuk'] ?? now(),
                'tanggal_keluar_rencana' => $validated['tanggal_keluar_rencana'] ?? null,
                'status' => 'aktif',
                'alasan_masuk' => $validated['alasan_masuk'] ?? null,
                'diagnosa_awal' => $validated['diagnosa_awal'] ?? null,
                'didaftarkan_oleh' => $request->user()?->id,
            ]);

            // Update bed status to 'terisi'
            $bed->update(['status' => 'terisi']);

            // Update patient record
            $pasien = Pasien::find($validated['pasien_id']);
            if ($pasien) {
                $pasien->update([
                    'jenis_layanan' => 'rawat_inap',
                    'ruangan_id' => $bed->ruangan_id,
                    'status_pendaftaran' => 'diperiksa',
                ]);
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Check-in rawat inap berhasil didaftarkan',
                'data' => $admission->load(['pasien', 'bed.ruangan', 'bed.bangsal', 'dpjp']),
            ], 201);
        } catch (\Throwable $e) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mendaftarkan rawat inap: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display admission details.
     */
    public function show(string $id): JsonResponse
    {
        $admission = RawatInapAdmission::with([
            'pasien',
            'bed.ruangan',
            'bed.bangsal',
            'dpjp',
            'riwayatPindah.bedAsal',
            'riwayatPindah.bedTujuan',
        ])->find($id);

        if (! $admission) {
            return response()->json([
                'status' => 'error',
                'message' => 'Admisi rawat inap tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $admission,
        ]);
    }

    /**
     * Transfer patient to another bed.
     */
    public function pindahBed(Request $request, string $id): JsonResponse
    {
        $admission = RawatInapAdmission::find($id);

        if (! $admission) {
            return response()->json([
                'status' => 'error',
                'message' => 'Admisi rawat inap tidak ditemukan',
            ], 404);
        }

        if ($admission->status !== 'aktif') {
            return response()->json([
                'status' => 'error',
                'message' => 'Hanya admisi aktif yang dapat dipindahkan bed/kamar.',
            ], 422);
        }

        $validated = $request->validate([
            'bed_tujuan_id' => 'required|uuid|exists:beds,id',
            'alasan_pindah' => 'nullable|string',
        ]);

        $bedAsal = Bed::find($admission->bed_id);
        $bedTujuan = Bed::with(['ruangan', 'bangsal'])->find($validated['bed_tujuan_id']);

        if ($bedTujuan->id === $admission->bed_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Bed tujuan harus berbeda dari bed saat ini.',
            ], 422);
        }

        if ($bedTujuan->status !== 'tersedia') {
            return response()->json([
                'status' => 'error',
                'message' => "Bed tujuan ({$bedTujuan->nomor_bed}) tidak tersedia (status: {$bedTujuan->status}).",
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Record bed transfer history
            RiwayatPindahBed::create([
                'admission_id' => $admission->id,
                'bed_asal_id' => $bedAsal?->id,
                'bed_tujuan_id' => $bedTujuan->id,
                'tanggal_pindah' => now(),
                'alasan_pindah' => $validated['alasan_pindah'] ?? 'Permintaan Pindah Bed/Kamar',
                'petugas_id' => $request->user()?->id,
            ]);

            // Update old bed status to 'dibersihkan'
            if ($bedAsal) {
                $bedAsal->update(['status' => 'dibersihkan']);
            }

            // Update new bed status to 'terisi'
            $bedTujuan->update(['status' => 'terisi']);

            // Update admission record
            $admission->update([
                'bed_id' => $bedTujuan->id,
                'ruangan_id' => $bedTujuan->ruangan_id,
                'bangsal_id' => $bedTujuan->bangsal_id,
            ]);

            // Update patient room
            $pasien = Pasien::find($admission->pasien_id);
            if ($pasien) {
                $pasien->update(['ruangan_id' => $bedTujuan->ruangan_id]);
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Pasien berhasil dipindahkan ke Bed baru',
                'data' => $admission->load(['pasien', 'bed.ruangan', 'bed.bangsal', 'riwayatPindah']),
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memindahkan bed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Check-out / Discharge patient from rawat inap.
     */
    public function checkOut(Request $request, string $id): JsonResponse
    {
        $admission = RawatInapAdmission::find($id);

        if (! $admission) {
            return response()->json([
                'status' => 'error',
                'message' => 'Admisi rawat inap tidak ditemukan',
            ], 404);
        }

        if ($admission->status !== 'aktif') {
            return response()->json([
                'status' => 'error',
                'message' => 'Admisi ini sudah diselesaikan/pulang sebelumnya.',
            ], 422);
        }

        $validated = $request->validate([
            'status' => 'required|in:pulang_sembuh,pulang_paksa,dirujuk,meninggal',
            'ringkasan_pulang' => 'nullable|string',
            'tanggal_keluar_aktual' => 'nullable|date',
        ]);

        DB::beginTransaction();
        try {
            $admission->update([
                'status' => $validated['status'],
                'ringkasan_pulang' => $validated['ringkasan_pulang'] ?? null,
                'tanggal_keluar_aktual' => $validated['tanggal_keluar_aktual'] ?? now(),
            ]);

            // Free up bed -> set status to 'dibersihkan'
            $bed = Bed::find($admission->bed_id);
            if ($bed) {
                $bed->update(['status' => 'dibersihkan']);
            }

            // Update patient registration status
            $pasien = Pasien::find($admission->pasien_id);
            if ($pasien) {
                $pasien->update([
                    'status_pendaftaran' => 'selesai',
                    'ruangan_id' => null,
                ]);
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Pasien berhasil di-Discharge (Check-out) dari Rawat Inap',
                'data' => $admission->load(['pasien', 'bed']),
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memproses check-out: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Summary statistics for rawat inap.
     */
    public function statistik(): JsonResponse
    {
        $aktifCount = RawatInapAdmission::where('status', 'aktif')->count();
        $dischargedToday = RawatInapAdmission::whereDate('tanggal_keluar_aktual', now()->toDateString())->count();
        $admittedToday = RawatInapAdmission::whereDate('tanggal_masuk', now()->toDateString())->count();

        $totalBeds = Bed::count();
        $occupiedBeds = Bed::where('status', 'terisi')->count();

        $bor = $totalBeds > 0 ? round(($occupiedBeds / $totalBeds) * 100, 2) : 0;

        return response()->json([
            'status' => 'success',
            'data' => [
                'pasien_rawat_inap_aktif' => $aktifCount,
                'admisi_hari_ini' => $admittedToday,
                'pulang_hari_ini' => $dischargedToday,
                'total_beds' => $totalBeds,
                'occupied_beds' => $occupiedBeds,
                'bor_percentage' => $bor,
            ],
        ]);
    }
}
