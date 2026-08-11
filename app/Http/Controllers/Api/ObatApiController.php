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
                    ->orWhere('kode_obat', 'like', "%{$search}%")
                    ->orWhere('nie', 'like', "%{$search}%")
                    ->orWhere('komposisi', 'like', "%{$search}%")
                    ->orWhere('pendaftar', 'like', "%{$search}%");
            });
        }

        if ($request->filled('bentuk_sediaan') && $request->input('bentuk_sediaan') !== 'all') {
            $sediaanKey = strtolower($request->input('bentuk_sediaan'));
            $categories = [
                'tablet' => ['TABLET', 'KAPLET', 'PIL'],
                'sirup' => ['SIRUP', 'SUSPENSI', 'LARUTAN', 'CAIRAN', 'EMULSI', 'ELIXIR'],
                'kapsul' => ['KAPSUL'],
                'injeksi' => ['INJEKSI', 'INFUS', 'SERBUK INJEKSI'],
                'salep' => ['SALEP', 'KRIM', 'GEL', 'LOTION', 'PASTA'],
                'tetes' => ['TETES', 'DROP', 'GUTTAE'],
            ];

            if (array_key_exists($sediaanKey, $categories)) {
                $keywords = $categories[$sediaanKey];
                $query->where(function ($q) use ($keywords) {
                    foreach ($keywords as $kw) {
                        $q->orWhere('bentuk_sediaan', 'like', "%{$kw}%");
                    }
                });
            } else {
                $query->where('bentuk_sediaan', 'like', "%{$sediaanKey}%");
            }
        }

        if ($request->filled('stock_filter')) {
            if ($request->input('stock_filter') === 'low') {
                $query->where('stok', '<', 50);
            } elseif ($request->input('stock_filter') === 'safe') {
                $query->where('stok', '>=', 50);
            }
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
            'unit_farmasi_id', 'kode_obat', 'nie', 'nama_obat', 'bentuk_sediaan', 'kemasan', 'komposisi', 'pendaftar', 'tanggal_terbit', 'masa_berlaku', 'diterbitkan_oleh', 'stok', 'harga',
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
            'unit_farmasi_id', 'kode_obat', 'nie', 'nama_obat', 'bentuk_sediaan', 'kemasan', 'komposisi', 'pendaftar', 'tanggal_terbit', 'masa_berlaku', 'diterbitkan_oleh', 'stok', 'harga',
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
