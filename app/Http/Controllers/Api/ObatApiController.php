<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Obat;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ObatApiController extends Controller
{
    /**
     * GET /api/v1/obat
     * Daftar obat (paginated, searchable).
     */
    public function index(Request $request): JsonResponse
    {
        $query = Obat::with('unitFarmasi:id,nama_unit');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('nama_obat', 'like', "%{$search}%")
                    ->orWhere('kode_obat', 'like', "%{$search}%");
            });
        }

        if ($request->filled('bentuk_sediaan')) {
            $query->where('bentuk_sediaan', $request->input('bentuk_sediaan'));
        }

        $data = $query->orderBy('nama_obat')->paginate($request->input('per_page', 15));

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }

    /**
     * GET /api/v1/obat/{id}
     * Detail obat.
     */
    public function show(string $id): JsonResponse
    {
        $obat = Obat::with('unitFarmasi:id,nama_unit')->find($id);

        if (! $obat) {
            return response()->json([
                'status' => 'error',
                'message' => 'Obat tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $obat,
        ]);
    }

    /**
     * POST /api/v1/obat
     * Tambah obat baru.
     */
    public function store(Request $request): JsonResponse
    {
        $required = ['kode_obat', 'nama_obat', 'bentuk_sediaan'];
        foreach ($required as $field) {
            if (! $request->filled($field)) {
                return response()->json([
                    'status' => 'error',
                    'message' => "Field {$field} wajib diisi.",
                ], 422);
            }
        }

        if (Obat::where('kode_obat', $request->input('kode_obat'))->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kode obat sudah digunakan.',
            ], 422);
        }

        $obat = Obat::create($request->only([
            'unit_farmasi_id', 'kode_obat', 'nama_obat', 'bentuk_sediaan', 'stok', 'harga',
        ]));

        return response()->json([
            'status' => 'success',
            'message' => 'Obat berhasil ditambahkan.',
            'data' => $obat,
        ], 201);
    }

    /**
     * PUT /api/v1/obat/{id}
     * Update data obat.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $obat = Obat::find($id);

        if (! $obat) {
            return response()->json([
                'status' => 'error',
                'message' => 'Obat tidak ditemukan.',
            ], 404);
        }

        $payload = $request->only([
            'unit_farmasi_id', 'kode_obat', 'nama_obat', 'bentuk_sediaan', 'stok', 'harga',
        ]);

        if (isset($payload['kode_obat']) && $payload['kode_obat'] !== $obat->kode_obat) {
            if (Obat::where('kode_obat', $payload['kode_obat'])->exists()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Kode obat sudah digunakan.',
                ], 422);
            }
        }

        $obat->update($payload);

        return response()->json([
            'status' => 'success',
            'message' => 'Data obat berhasil diperbarui.',
            'data' => $obat,
        ]);
    }

    /**
     * DELETE /api/v1/obat/{id}
     * Hapus obat.
     */
    public function destroy(string $id): JsonResponse
    {
        $obat = Obat::find($id);

        if (! $obat) {
            return response()->json([
                'status' => 'error',
                'message' => 'Obat tidak ditemukan.',
            ], 404);
        }

        $obat->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Obat berhasil dihapus.',
        ]);
    }
}
