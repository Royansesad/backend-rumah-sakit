<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Contracts\HasSimrsRole;
use App\Models\Pasien;
use App\Models\Poli;
use App\Models\Ruangan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PatientApiController extends Controller
{
    /**
     * GET /api/v1/pasien
     * Returns paginated list of patients with search filtering across ERD fields.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Pasien::query();

        if ($request->user('sanctum') instanceof Pasien) {
            $query->whereKey($request->user('sanctum')->getKey());
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('nama_lengkap', 'like', "%{$search}%")
                    ->orWhere('nomor_rekam_medis', 'like', "%{$search}%")
                    ->orWhere('nomor_pendaftaran', 'like', "%{$search}%")
                    ->orWhere('nik', 'like', "%{$search}%")
                    ->orWhere('no_hp', 'like', "%{$search}%");
            });
        }

        if ($request->filled('jenis_layanan')) {
            $query->where('jenis_layanan', $request->input('jenis_layanan'));
        }

        if ($request->filled('status_pendaftaran')) {
            $query->where('status_pendaftaran', $request->input('status_pendaftaran'));
        }

        $patients = $query->orderByDesc('created_at')->paginate($request->input('per_page', 15));

        return response()->json([
            'status' => 'success',
            'data' => $patients,
        ]);
    }

    /**
     * GET /api/v1/pasien/{id}
     * Returns full patient record details.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $patient = Pasien::with(['dokter:id,nama_lengkap,spesialisasi', 'poli:id,nama_poli', 'ruangan:id,nama_ruangan,tipe_ruangan'])->find($id);

        if (! $patient) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pasien tidak ditemukan',
            ], 404);
        }

        if ($request->user('sanctum') instanceof Pasien && (string) $patient->getKey() !== (string) $request->user('sanctum')->getKey()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda tidak memiliki akses ke resource ini.',
            ], 403);
        }

        return response()->json([
            'status' => 'success',
            'data' => $patient,
        ]);
    }

    /**
     * POST /api/v1/pasien
     * Creates new patient record with all ERD attributes and optional pendaftaran status (rawat_jalan, rawat_inap, igd).
     */
    public function store(Request $request): JsonResponse
    {
        $namaLengkap = $request->input('nama_lengkap', $request->input('name'));

        if (empty($namaLengkap)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Field nama_lengkap wajib diisi.',
            ], 422);
        }

        $noRm = $request->input('nomor_rekam_medis', $request->input('no_rm', 'RM-'.date('Y').'-'.str_pad((string) rand(1, 9999), 4, '0', STR_PAD_LEFT)));

        $data = $request->except(['name', 'no_rm', '_token', '_method']);
        $data['id'] = (string) Str::uuid();
        $data['nama_lengkap'] = $namaLengkap;
        $data['nomor_rekam_medis'] = $noRm;

        if ($request->has('password') && ! empty($request->password)) {
            $data['password'] = Hash::make($request->password);
        }

        // Pendaftaran otomatis jika jenis_layanan dikirim
        if ($request->filled('jenis_layanan')) {
            $jenisLayanan = $request->input('jenis_layanan');
            if (! in_array($jenisLayanan, ['rawat_jalan', 'rawat_inap', 'igd'], true)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Nilai jenis_layanan harus berupa: rawat_jalan, rawat_inap, atau igd.',
                ], 422);
            }

            $currentUser = $request->user();

            $data['jenis_layanan'] = $jenisLayanan;
            $data['status_pendaftaran'] = 'menunggu';
            $data['nomor_pendaftaran'] = $this->generateNomorPendaftaran($jenisLayanan);
            $data['tanggal_pendaftaran'] = $request->input('tanggal_pendaftaran', now()->toDateString());

            if ($jenisLayanan === 'rawat_jalan') {
                $data['poli_id'] = $request->input('poli_id') ?? Poli::first()?->id;
            } else {
                $data['poli_id'] = $request->input('poli_id');
            }

            if ($jenisLayanan === 'rawat_inap') {
                $data['ruangan_id'] = $request->input('ruangan_id') ?? Ruangan::first()?->id;
            } else {
                $data['ruangan_id'] = $request->input('ruangan_id');
            }

            $data['dokter_id'] = $request->input('dokter_id');
            $data['penjamin'] = $request->input('penjamin', 'umum');
            $data['nomor_penjamin'] = $request->input('nomor_penjamin');
            $data['prioritas'] = $jenisLayanan === 'igd' ? $request->input('prioritas', 'normal') : null;
            $data['keluhan'] = $request->input('keluhan');
            $data['didaftarkan_oleh'] = $currentUser instanceof HasSimrsRole ? (string) $currentUser->getAuthIdentifier() : null;
            $data['tipe_pendaftar'] = $currentUser instanceof HasSimrsRole ? $currentUser->getRoleAttribute() : null;
        }

        $patient = Pasien::create($data);

        $currentUser = $request->user();

        if ($currentUser instanceof HasSimrsRole) {
            AuditLog::create([
                'pembuat_id' => $currentUser->getAuthIdentifier(),
                'pembuat_type' => $currentUser->getRoleAttribute(),
                'modul' => 'api_pasien',
                'aksi' => 'CREATE_PATIENT',
                'data_sesudah' => json_encode([
                    'patient_id' => $patient->id,
                    'no_rm' => $noRm,
                    'nama_lengkap' => $namaLengkap,
                    'jenis_layanan' => $patient->jenis_layanan,
                    'nomor_pendaftaran' => $patient->nomor_pendaftaran,
                ]),
                'ip_address' => $request->ip(),
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Data pasien berhasil ditambahkan',
            'data' => $patient,
        ], 201);
    }

    /**
     * PUT /api/v1/pasien/{id}
     * Updates patient record details.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $patient = Pasien::find($id);

        if (! $patient) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pasien tidak ditemukan',
            ], 404);
        }

        $dataSebelum = $patient->toArray();
        $payload = $request->except(['id', '_token', '_method']);

        if (array_key_exists('nama_lengkap', $payload) && empty($payload['nama_lengkap'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Field nama_lengkap tidak boleh kosong.',
            ], 422);
        }

        if (isset($payload['password']) && ! empty($payload['password'])) {
            $payload['password'] = Hash::make($payload['password']);
        } else {
            unset($payload['password']);
        }

        // Tangani perubahan jenis_layanan jika dikirim
        if (isset($payload['jenis_layanan']) && $payload['jenis_layanan'] !== $patient->jenis_layanan) {
            if (! empty($payload['jenis_layanan'])) {
                $payload['nomor_pendaftaran'] = $this->generateNomorPendaftaran($payload['jenis_layanan']);
                if ($patient->status_pendaftaran === 'belum_daftar') {
                    $payload['status_pendaftaran'] = 'menunggu';
                }
                $payload['tanggal_pendaftaran'] = $payload['tanggal_pendaftaran'] ?? now()->toDateString();
            }
        }

        $patient->update($payload);

        $currentUser = $request->user();
        if ($currentUser instanceof HasSimrsRole) {
            AuditLog::create([
                'pembuat_id' => $currentUser->getAuthIdentifier(),
                'pembuat_type' => $currentUser->getRoleAttribute(),
                'modul' => 'api_pasien',
                'aksi' => 'UPDATE_PATIENT',
                'data_sebelum' => json_encode(['id' => $patient->id, 'nama_lengkap' => $dataSebelum['nama_lengkap']]),
                'data_sesudah' => json_encode(['id' => $patient->id, 'updated_fields' => array_keys($payload)]),
                'ip_address' => $request->ip(),
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Data pasien berhasil diperbarui.',
            'data' => $patient,
        ]);
    }

    /**
     * DELETE /api/v1/pasien/{id}
     * Deletes patient record.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $patient = Pasien::find($id);

        if (! $patient) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pasien tidak ditemukan',
            ], 404);
        }

        $dataSebelum = ['id' => $patient->id, 'no_rm' => $patient->nomor_rekam_medis, 'nama_lengkap' => $patient->nama_lengkap];
        $patient->delete();

        $currentUser = $request->user();
        if ($currentUser instanceof HasSimrsRole) {
            AuditLog::create([
                'pembuat_id' => $currentUser->getAuthIdentifier(),
                'pembuat_type' => $currentUser->getRoleAttribute(),
                'modul' => 'api_pasien',
                'aksi' => 'DELETE_PATIENT',
                'data_sebelum' => json_encode($dataSebelum),
                'ip_address' => $request->ip(),
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Data pasien berhasil dihapus.',
        ]);
    }

    private function generateNomorPendaftaran(string $jenisLayanan): string
    {
        $prefixMap = [
            'rawat_jalan' => 'RJ',
            'rawat_inap' => 'RI',
            'igd' => 'IGD',
        ];

        $prefix = $prefixMap[$jenisLayanan] ?? 'REG';
        $tanggal = now()->format('Ymd');
        $pattern = "{$prefix}-{$tanggal}-%";

        $lastNumber = Pasien::where('nomor_pendaftaran', 'like', $pattern)
            ->selectRaw('MAX(nomor_pendaftaran) as last_nomor')
            ->value('last_nomor');

        if ($lastNumber) {
            $parts = explode('-', $lastNumber);
            $sequence = (int) end($parts) + 1;
        } else {
            $sequence = 1;
        }

        return sprintf('%s-%s-%04d', $prefix, $tanggal, $sequence);
    }
}
