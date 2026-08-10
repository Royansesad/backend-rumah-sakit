<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PendaftaranRequest;
use App\Models\AuditLog;
use App\Models\Contracts\HasSimrsRole;
use App\Models\Pasien;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PendaftaranApiController extends Controller
{
    /**
     * GET /api/v1/pendaftaran
     * List pasien yang terdaftar dengan filter dan pencarian.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Pasien::query()
            ->terdaftar()
            ->with(['dokter:id,nama_lengkap,spesialisasi', 'poli:id,nama_poli', 'ruangan:id,nama_ruangan,tipe_ruangan']);

        // Filter: jenis layanan
        if ($request->filled('jenis_layanan')) {
            $query->jenisLayanan($request->input('jenis_layanan'));
        }

        // Filter: status pendaftaran
        if ($request->filled('status')) {
            $query->statusPendaftaran($request->input('status'));
        }

        // Filter: tanggal tepat
        if ($request->filled('tanggal')) {
            $query->tanggalPendaftaran($request->input('tanggal'));
        }

        // Filter: rentang tanggal
        if ($request->filled('tanggal_dari')) {
            $query->whereDate('tanggal_pendaftaran', '>=', $request->input('tanggal_dari'));
        }
        if ($request->filled('tanggal_sampai')) {
            $query->whereDate('tanggal_pendaftaran', '<=', $request->input('tanggal_sampai'));
        }

        // Filter: poli
        if ($request->filled('poli_id')) {
            $query->where('poli_id', $request->input('poli_id'));
        }

        // Filter: dokter
        if ($request->filled('dokter_id')) {
            $query->where('dokter_id', $request->input('dokter_id'));
        }

        // Filter: prioritas (untuk IGD)
        if ($request->filled('prioritas')) {
            $query->where('prioritas', $request->input('prioritas'));
        }

        // Pencarian umum
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('nama_lengkap', 'like', "%{$search}%")
                    ->orWhere('nomor_pendaftaran', 'like', "%{$search}%")
                    ->orWhere('nomor_rekam_medis', 'like', "%{$search}%")
                    ->orWhere('nik', 'like', "%{$search}%");
            });
        }

        // Urutan: terbaru lebih dulu
        $query->orderByDesc('tanggal_pendaftaran')->orderByDesc('created_at');

        $data = $query->paginate($request->input('per_page', 15));

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }

    /**
     * POST /api/v1/pendaftaran
     * Daftarkan pasien ke layanan (rawat jalan, rawat inap, IGD).
     */
    public function store(PendaftaranRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $pasien = Pasien::find($validated['pasien_id']);

        if (! $pasien) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pasien tidak ditemukan.',
            ], 404);
        }

        // Cek apakah pasien sudah memiliki pendaftaran aktif
        if ($pasien->jenis_layanan !== null && ! in_array($pasien->status_pendaftaran, ['belum_daftar', 'selesai', 'batal'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pasien sudah memiliki pendaftaran aktif. Selesaikan atau batalkan pendaftaran sebelumnya terlebih dahulu.',
                'data' => [
                    'nomor_pendaftaran' => $pasien->nomor_pendaftaran,
                    'jenis_layanan' => $pasien->jenis_layanan,
                    'status_pendaftaran' => $pasien->status_pendaftaran,
                ],
            ], 422);
        }

        $jenisLayanan = $validated['jenis_layanan'];
        $nomorPendaftaran = $this->generateNomorPendaftaran($jenisLayanan);

        $pasien->update([
            'nomor_pendaftaran' => $nomorPendaftaran,
            'jenis_layanan' => $jenisLayanan,
            'status_pendaftaran' => 'menunggu',
            'dokter_id' => $validated['dokter_id'] ?? null,
            'poli_id' => $validated['poli_id'] ?? null,
            'ruangan_id' => $validated['ruangan_id'] ?? null,
            'tanggal_pendaftaran' => $validated['tanggal_pendaftaran'] ?? now()->toDateString(),
            'keluhan' => $validated['keluhan'] ?? null,
            'penjamin' => $validated['penjamin'],
            'nomor_penjamin' => $validated['nomor_penjamin'] ?? null,
            'prioritas' => $jenisLayanan === 'igd' ? ($validated['prioritas'] ?? 'normal') : null,
            'catatan_pendaftaran' => $validated['catatan_pendaftaran'] ?? null,
            'didaftarkan_oleh' => $this->getAuthId($request),
            'tipe_pendaftar' => $this->getAuthRole($request),
        ]);

        $pasien->load(['dokter:id,nama_lengkap,spesialisasi', 'poli:id,nama_poli', 'ruangan:id,nama_ruangan,tipe_ruangan']);

        $this->writeAuditLog($request, 'CREATE_PENDAFTARAN', null, [
            'pasien_id' => $pasien->id,
            'nomor_pendaftaran' => $nomorPendaftaran,
            'jenis_layanan' => $jenisLayanan,
            'nama_lengkap' => $pasien->nama_lengkap,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Pendaftaran pasien berhasil.',
            'data' => $pasien,
        ], 201);
    }

    /**
     * GET /api/v1/pendaftaran/{id}
     * Detail pendaftaran pasien.
     */
    public function show(string $id): JsonResponse
    {
        $pasien = Pasien::with(['dokter:id,nama_lengkap,spesialisasi', 'poli:id,nama_poli', 'ruangan:id,nama_ruangan,tipe_ruangan'])
            ->find($id);

        if (! $pasien) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pasien tidak ditemukan.',
            ], 404);
        }

        if ($pasien->jenis_layanan === null && $pasien->status_pendaftaran === 'belum_daftar') {
            return response()->json([
                'status' => 'error',
                'message' => 'Pasien belum memiliki data pendaftaran.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $pasien,
        ]);
    }

    /**
     * PUT /api/v1/pendaftaran/{id}
     * Update data pendaftaran pasien.
     */
    public function update(PendaftaranRequest $request, string $id): JsonResponse
    {
        $pasien = Pasien::find($id);

        if (! $pasien) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pasien tidak ditemukan.',
            ], 404);
        }

        if ($pasien->status_pendaftaran === 'belum_daftar') {
            return response()->json([
                'status' => 'error',
                'message' => 'Pasien belum memiliki pendaftaran aktif.',
            ], 422);
        }

        $validated = $request->validated();
        $dataSebelum = $pasien->only([
            'jenis_layanan', 'dokter_id', 'poli_id', 'ruangan_id',
            'keluhan', 'penjamin', 'nomor_penjamin', 'prioritas', 'catatan_pendaftaran',
        ]);

        $updateData = [];
        $fillableFields = [
            'jenis_layanan', 'dokter_id', 'poli_id', 'ruangan_id',
            'tanggal_pendaftaran', 'keluhan', 'penjamin', 'nomor_penjamin',
            'prioritas', 'catatan_pendaftaran',
        ];

        foreach ($fillableFields as $field) {
            if (array_key_exists($field, $validated)) {
                $updateData[$field] = $validated[$field];
            }
        }

        // Regenerate nomor pendaftaran jika jenis layanan berubah
        if (isset($updateData['jenis_layanan']) && $updateData['jenis_layanan'] !== $pasien->jenis_layanan) {
            $updateData['nomor_pendaftaran'] = $this->generateNomorPendaftaran($updateData['jenis_layanan']);
        }

        if (! empty($updateData)) {
            $pasien->update($updateData);
        }

        $pasien->load(['dokter:id,nama_lengkap,spesialisasi', 'poli:id,nama_poli', 'ruangan:id,nama_ruangan,tipe_ruangan']);

        $this->writeAuditLog($request, 'UPDATE_PENDAFTARAN', $dataSebelum, [
            'pasien_id' => $pasien->id,
            'nomor_pendaftaran' => $pasien->nomor_pendaftaran,
            'updated_fields' => array_keys($updateData),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Data pendaftaran berhasil diperbarui.',
            'data' => $pasien,
        ]);
    }

    /**
     * PATCH /api/v1/pendaftaran/{id}/status
     * Update status pendaftaran pasien.
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'status_pendaftaran' => 'required|in:menunggu,diperiksa,selesai,batal',
        ], [
            'status_pendaftaran.required' => 'Status pendaftaran wajib diisi.',
            'status_pendaftaran.in' => 'Status pendaftaran harus berupa: menunggu, diperiksa, selesai, atau batal.',
        ]);

        $pasien = Pasien::find($id);

        if (! $pasien) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pasien tidak ditemukan.',
            ], 404);
        }

        if ($pasien->status_pendaftaran === 'belum_daftar') {
            return response()->json([
                'status' => 'error',
                'message' => 'Pasien belum memiliki pendaftaran aktif.',
            ], 422);
        }

        $statusSebelum = $pasien->status_pendaftaran;
        $statusBaru = $request->input('status_pendaftaran');

        $pasien->update(['status_pendaftaran' => $statusBaru]);

        $this->writeAuditLog($request, 'UPDATE_STATUS_PENDAFTARAN', [
            'status_sebelum' => $statusSebelum,
        ], [
            'pasien_id' => $pasien->id,
            'nomor_pendaftaran' => $pasien->nomor_pendaftaran,
            'status_baru' => $statusBaru,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => "Status pendaftaran berhasil diubah dari '{$statusSebelum}' menjadi '{$statusBaru}'.",
            'data' => $pasien,
        ]);
    }

    /**
     * DELETE /api/v1/pendaftaran/{id}/batalkan
     * Batalkan pendaftaran pasien (reset kolom pendaftaran).
     */
    public function batalkan(Request $request, string $id): JsonResponse
    {
        $pasien = Pasien::find($id);

        if (! $pasien) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pasien tidak ditemukan.',
            ], 404);
        }

        if ($pasien->status_pendaftaran === 'belum_daftar') {
            return response()->json([
                'status' => 'error',
                'message' => 'Pasien belum memiliki pendaftaran aktif.',
            ], 422);
        }

        $dataSebelum = $pasien->only([
            'nomor_pendaftaran', 'jenis_layanan', 'status_pendaftaran',
            'dokter_id', 'poli_id', 'ruangan_id', 'tanggal_pendaftaran',
            'keluhan', 'penjamin', 'nomor_penjamin', 'prioritas', 'catatan_pendaftaran',
        ]);

        $pasien->update([
            'nomor_pendaftaran' => null,
            'jenis_layanan' => null,
            'status_pendaftaran' => 'belum_daftar',
            'dokter_id' => null,
            'poli_id' => null,
            'ruangan_id' => null,
            'tanggal_pendaftaran' => null,
            'keluhan' => null,
            'penjamin' => null,
            'nomor_penjamin' => null,
            'prioritas' => null,
            'catatan_pendaftaran' => null,
            'didaftarkan_oleh' => null,
            'tipe_pendaftar' => null,
        ]);

        $this->writeAuditLog($request, 'BATALKAN_PENDAFTARAN', $dataSebelum, [
            'pasien_id' => $pasien->id,
            'keterangan' => 'Pendaftaran dibatalkan dan data direset.',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Pendaftaran pasien berhasil dibatalkan.',
            'data' => $pasien,
        ]);
    }

    /**
     * GET /api/v1/pendaftaran/statistik
     * Statistik pendaftaran per jenis layanan.
     */
    public function statistik(Request $request): JsonResponse
    {
        $tanggal = $request->input('tanggal', now()->toDateString());

        $stats = [
            'tanggal' => $tanggal,
            'total' => Pasien::terdaftar()->tanggalPendaftaran($tanggal)->count(),
            'per_jenis_layanan' => [
                'rawat_jalan' => Pasien::terdaftar()->jenisLayanan('rawat_jalan')->tanggalPendaftaran($tanggal)->count(),
                'rawat_inap' => Pasien::terdaftar()->jenisLayanan('rawat_inap')->tanggalPendaftaran($tanggal)->count(),
                'igd' => Pasien::terdaftar()->jenisLayanan('igd')->tanggalPendaftaran($tanggal)->count(),
            ],
            'per_status' => [
                'menunggu' => Pasien::statusPendaftaran('menunggu')->tanggalPendaftaran($tanggal)->count(),
                'diperiksa' => Pasien::statusPendaftaran('diperiksa')->tanggalPendaftaran($tanggal)->count(),
                'selesai' => Pasien::statusPendaftaran('selesai')->tanggalPendaftaran($tanggal)->count(),
                'batal' => Pasien::statusPendaftaran('batal')->tanggalPendaftaran($tanggal)->count(),
            ],
        ];

        // Statistik prioritas IGD jika ada
        $igdCount = $stats['per_jenis_layanan']['igd'];
        if ($igdCount > 0) {
            $stats['igd_prioritas'] = [
                'normal' => Pasien::terdaftar()->jenisLayanan('igd')->where('prioritas', 'normal')->tanggalPendaftaran($tanggal)->count(),
                'urgent' => Pasien::terdaftar()->jenisLayanan('igd')->where('prioritas', 'urgent')->tanggalPendaftaran($tanggal)->count(),
                'emergency' => Pasien::terdaftar()->jenisLayanan('igd')->where('prioritas', 'emergency')->tanggalPendaftaran($tanggal)->count(),
            ];
        }

        return response()->json([
            'status' => 'success',
            'data' => $stats,
        ]);
    }

    // --- Private Helpers ---

    /**
     * Generate nomor pendaftaran unik berdasarkan jenis layanan.
     * Format: PREFIX-YYYYMMDD-XXXX (contoh: RJ-20260805-0001)
     */
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

    private function getAuthId(Request $request): ?string
    {
        $user = $request->user();

        return $user instanceof HasSimrsRole ? (string) $user->getAuthIdentifier() : null;
    }

    private function getAuthRole(Request $request): ?string
    {
        $user = $request->user();

        return $user instanceof HasSimrsRole ? $user->getRoleAttribute() : null;
    }

    private function writeAuditLog(Request $request, string $aksi, ?array $sebelum, ?array $sesudah): void
    {
        $user = $request->user();

        if (! $user instanceof HasSimrsRole) {
            return;
        }

        AuditLog::create([
            'pembuat_id' => $user->getAuthIdentifier(),
            'pembuat_type' => $user->getRoleAttribute(),
            'modul' => 'api_pendaftaran',
            'aksi' => $aksi,
            'data_sebelum' => $sebelum,
            'data_sesudah' => $sesudah,
            'ip_address' => $request->ip(),
        ]);
    }
}
