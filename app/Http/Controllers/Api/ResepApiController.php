<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Obat;
use App\Models\Pasien;
use App\Models\Resep;
use App\Models\ResepDetail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ResepApiController extends Controller
{
    /**
     * GET /api/v1/resep
     * Daftar resep (paginated, filterable).
     */
    public function index(Request $request): JsonResponse
    {
        $query = Resep::with([
            'pasien:id,nama_lengkap,nomor_rekam_medis',
            'dokter:id,nama_lengkap,spesialisasi',
            'details.obat:id,kode_obat,nama_obat,bentuk_sediaan,harga',
        ]);

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
            $query->where(function ($q) use ($search) {
                $q->where('no_resep', 'like', "%{$search}%")
                    ->orWhereHas('pasien', function ($sub) use ($search) {
                        $sub->where('nama_lengkap', 'like', "%{$search}%")
                            ->orWhere('nomor_rekam_medis', 'like', "%{$search}%");
                    });
            });
        }

        $data = $query->orderByDesc('created_at')->paginate($request->input('per_page', 15));

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }

    /**
     * GET /api/v1/resep/{id}
     * Detail resep dengan semua detail obat.
     */
    public function show(string $id): JsonResponse
    {
        $resep = Resep::with([
            'pasien:id,nama_lengkap,nomor_rekam_medis,tanggal_lahir,jenis_kelamin,alergi',
            'dokter:id,nama_lengkap,spesialisasi',
            'rekamMedis:id,keluhan_utama,icd10_code,diagnosis_deskripsi',
            'details.obat',
        ])->find($id);

        if (! $resep) {
            return response()->json([
                'status' => 'error',
                'message' => 'Resep tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $resep,
        ]);
    }

    /**
     * POST /api/v1/resep
     * Buat resep baru beserta detail obat.
     */
    public function store(Request $request): JsonResponse
    {
        $required = ['pasien_id', 'details'];
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

        $details = $request->input('details', []);
        if (! is_array($details) || count($details) === 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Minimal satu detail obat harus diisi.',
            ], 422);
        }

        // Validate each detail
        foreach ($details as $index => $detail) {
            if (empty($detail['obat_id']) || empty($detail['aturan_pakai']) || empty($detail['jumlah_dosis'])) {
                return response()->json([
                    'status' => 'error',
                    'message' => "Detail obat ke-" . ($index + 1) . ": obat_id, aturan_pakai, dan jumlah_dosis wajib diisi.",
                ], 422);
            }

            $obat = Obat::find($detail['obat_id']);
            if (! $obat) {
                return response()->json([
                    'status' => 'error',
                    'message' => "Detail obat ke-" . ($index + 1) . ": Obat dengan ID {$detail['obat_id']} tidak ditemukan.",
                ], 404);
            }
        }

        // Generate nomor resep
        $noResep = $this->generateNoResep();

        $resep = Resep::create([
            'id' => (string) Str::uuid(),
            'no_resep' => $noResep,
            'pasien_id' => $request->input('pasien_id'),
            'dokter_id' => $request->input('dokter_id'),
            'rekam_medis_id' => $request->input('rekam_medis_id'),
            'status' => 'menunggu_ditebus',
        ]);

        foreach ($details as $detail) {
            ResepDetail::create([
                'resep_id' => $resep->id,
                'obat_id' => $detail['obat_id'],
                'aturan_pakai' => $detail['aturan_pakai'],
                'jumlah_dosis' => (int) $detail['jumlah_dosis'],
                'catatan' => $detail['catatan'] ?? null,
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Resep berhasil dibuat.',
            'data' => $resep->load([
                'pasien:id,nama_lengkap,nomor_rekam_medis',
                'dokter:id,nama_lengkap,spesialisasi',
                'details.obat:id,kode_obat,nama_obat,bentuk_sediaan,harga',
            ]),
        ], 201);
    }

    /**
     * PATCH /api/v1/resep/{id}/tebus
     * Tebus resep (menunggu_ditebus -> sudah_ditebus) dan kurangi stok obat.
     */
    public function tebus(string $id): JsonResponse
    {
        $resep = Resep::with('details.obat')->find($id);

        if (! $resep) {
            return response()->json([
                'status' => 'error',
                'message' => 'Resep tidak ditemukan.',
            ], 404);
        }

        if ($resep->status === 'sudah_ditebus') {
            return response()->json([
                'status' => 'error',
                'message' => 'Resep sudah ditebus sebelumnya.',
            ], 422);
        }

        // Cek stok
        foreach ($resep->details as $detail) {
            if ($detail->obat && $detail->obat->stok < $detail->jumlah_dosis) {
                return response()->json([
                    'status' => 'error',
                    'message' => "Stok obat {$detail->obat->nama_obat} tidak mencukupi. Stok: {$detail->obat->stok}, Dibutuhkan: {$detail->jumlah_dosis}.",
                ], 422);
            }
        }

        // Kurangi stok
        foreach ($resep->details as $detail) {
            if ($detail->obat) {
                $detail->obat->decrement('stok', $detail->jumlah_dosis);
            }
        }

        $resep->update(['status' => 'sudah_ditebus']);

        return response()->json([
            'status' => 'success',
            'message' => 'Resep berhasil ditebus.',
            'data' => $resep->fresh(['pasien:id,nama_lengkap', 'details.obat:id,kode_obat,nama_obat,stok']),
        ]);
    }

    private function generateNoResep(): string
    {
        $tanggal = now()->format('Ymd');
        $pattern = "RSP-{$tanggal}-%";

        $last = Resep::where('no_resep', 'like', $pattern)
            ->selectRaw('MAX(no_resep) as last_no')
            ->value('last_no');

        if ($last) {
            $parts = explode('-', $last);
            $sequence = (int) end($parts) + 1;
        } else {
            $sequence = 1;
        }

        return sprintf('RSP-%s-%03d', $tanggal, $sequence);
    }
}
