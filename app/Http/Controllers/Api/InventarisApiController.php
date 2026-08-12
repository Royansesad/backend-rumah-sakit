<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use App\Models\Supplier;
use App\Models\Warehouse;
use App\Services\InventoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class InventarisApiController extends Controller
{
    public function __construct(protected InventoryService $inventory)
    {
    }

    /**
     * GET /api/v1/inventaris
     * List barang inventaris (filter: search, kategori, kondisi_stok).
     */
    public function index(Request $request): JsonResponse
    {
        $query = InventoryItem::with(['category:id,nama_kategori', 'warehouse:id,nama_gudang', 'supplier:id,nama_supplier']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('nama_barang', 'like', "%{$search}%")
                    ->orWhere('kode_barang', 'like', "%{$search}%");
            });
        }

        if ($request->filled('kategori') && $request->input('kategori') !== 'all') {
            $query->where('inventory_category_id', $request->input('kategori'));
        }

        if ($request->filled('kondisi') && $request->input('kondisi') !== 'all') {
            $kondisi = $request->input('kondisi');
            if ($kondisi === 'habis') {
                $query->where('stok_saat_ini', '<=', 0);
            } elseif ($kondisi === 'kritis') {
                $query->where('stok_saat_ini', '>', 0)->whereRaw('stok_saat_ini <= stok_minimum');
            } elseif ($kondisi === 'aman') {
                $query->whereRaw('stok_saat_ini > stok_minimum');
            }
        }

        $items = $query->orderBy('nama_barang')->paginate($request->input('per_page', 20));

        return response()->json([
            'status' => 'success',
            'data' => $items,
        ]);
    }

    /**
     * GET /api/v1/inventaris/master
     * Data master referensi (kategori, gudang, supplier) untuk dropdown & KPI.
     */
    public function master(): JsonResponse
    {
        $totalNilaiBeli = (float) InventoryItem::query()->sum('harga_beli');

        return response()->json([
            'status' => 'success',
            'data' => [
                'kategori' => InventoryCategory::where('is_aktif', true)->orderBy('nama_kategori')->get(),
                'gudang' => Warehouse::where('is_aktif', true)->orderBy('nama_gudang')->get(),
                'supplier' => Supplier::where('is_aktif', true)->orderBy('nama_supplier')->get(),
                'kpi' => [
                    'total_barang' => InventoryItem::count(),
                    'barang_habis' => InventoryItem::where('stok_saat_ini', '<=', 0)->count(),
                    'barang_kritis' => InventoryItem::where('stok_saat_ini', '>', 0)
                        ->whereRaw('stok_saat_ini <= stok_minimum')->count(),
                    'total_nilai_stok' => (float) InventoryItem::query()->sum('harga_beli'),
                ],
            ],
        ]);
    }

    /**
     * GET /api/v1/inventaris/{id}
     * Detail barang + riwayat mutasi (kartu stok).
     */
    public function show(string $id): JsonResponse
    {
        $item = InventoryItem::with(['category', 'warehouse', 'supplier', 'stockMovements.warehouse'])
            ->find($id);

        if (! $item) {
            return response()->json(['status' => 'error', 'message' => 'Barang tidak ditemukan.'], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'item' => $item,
                'status_stok' => $item->status_stok,
                'mutasi' => $item->stockMovements->sortByDesc('created_at')->values(),
            ],
        ]);
    }

    /**
     * POST /api/v1/inventaris
     * Tambah barang baru.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'kode_barang' => 'required|string|max:100|unique:inventory_items,kode_barang',
            'nama_barang' => 'required|string|max:255',
            'inventory_category_id' => 'required|exists:inventory_categories,id',
            'satuan' => 'nullable|string|max:50',
            'stok_minimum' => 'nullable|integer|min:0',
            'stok_awal' => 'nullable|integer|min:0',
            'harga_beli' => 'nullable|numeric|min:0',
            'harga_jual' => 'nullable|numeric|min:0',
            'warehouse_id' => 'nullable|exists:warehouses,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'masa_berlaku' => 'nullable|date',
            'deskripsi' => 'nullable|string',
        ]);

        $operator = $this->resolveOperator($request);
        $stokAwal = (int) ($validated['stok_awal'] ?? 0);

        $item = InventoryItem::create([
            'id' => (string) Str::uuid(),
            'kode_barang' => strtoupper($validated['kode_barang']),
            'nama_barang' => $validated['nama_barang'],
            'inventory_category_id' => $validated['inventory_category_id'],
            'satuan' => $validated['satuan'] ?? 'pcs',
            'stok_minimum' => (int) ($validated['stok_minimum'] ?? 0),
            'stok_saat_ini' => $stokAwal,
            'harga_beli' => $validated['harga_beli'] ?? 0,
            'harga_jual' => $validated['harga_jual'] ?? 0,
            'warehouse_id' => $validated['warehouse_id'] ?? null,
            'supplier_id' => $validated['supplier_id'] ?? null,
            'masa_berlaku' => $validated['masa_berlaku'] ?? null,
            'deskripsi' => $validated['deskripsi'] ?? null,
        ]);

        AuditLog::create([
            'id' => (string) Str::uuid(),
            'pembuat_type' => $operator['role'],
            'pembuat_id' => $operator['id'] ?? (string) Str::uuid(),
            'modul' => 'inventaris_barang',
            'aksi' => 'tambah_barang',
            'target_label' => 'Kode Barang',
            'target_id' => $item->kode_barang,
            'data_sesudah' => $item->toArray(),
            'created_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => "Barang '{$item->nama_barang}' ({$item->kode_barang}) berhasil ditambahkan.",
            'data' => $item->load(['category', 'warehouse', 'supplier']),
        ], 201);
    }

    /**
     * PUT /api/v1/inventaris/{id}
     * Perbarui data barang.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $item = InventoryItem::find($id);

        if (! $item) {
            return response()->json(['status' => 'error', 'message' => 'Barang tidak ditemukan.'], 404);
        }

        $validated = $request->validate([
            'kode_barang' => 'required|string|max:100|unique:inventory_items,kode_barang,'.$id,
            'nama_barang' => 'required|string|max:255',
            'inventory_category_id' => 'required|exists:inventory_categories,id',
            'satuan' => 'nullable|string|max:50',
            'stok_minimum' => 'nullable|integer|min:0',
            'harga_beli' => 'nullable|numeric|min:0',
            'harga_jual' => 'nullable|numeric|min:0',
            'warehouse_id' => 'nullable|exists:warehouses,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'masa_berlaku' => 'nullable|date',
            'deskripsi' => 'nullable|string',
            'is_aktif' => 'nullable|boolean',
        ]);

        $item->update([
            'kode_barang' => strtoupper($validated['kode_barang']),
            'nama_barang' => $validated['nama_barang'],
            'inventory_category_id' => $validated['inventory_category_id'],
            'satuan' => $validated['satuan'] ?? $item->satuan,
            'stok_minimum' => (int) ($validated['stok_minimum'] ?? $item->stok_minimum),
            'harga_beli' => $validated['harga_beli'] ?? $item->harga_beli,
            'harga_jual' => $validated['harga_jual'] ?? $item->harga_jual,
            'warehouse_id' => $validated['warehouse_id'] ?? $item->warehouse_id,
            'supplier_id' => $validated['supplier_id'] ?? $item->supplier_id,
            'masa_berlaku' => $validated['masa_berlaku'] ?? $item->masa_berlaku,
            'deskripsi' => $validated['deskripsi'] ?? $item->deskripsi,
            'is_aktif' => array_key_exists('is_aktif', $validated) ? (bool) $validated['is_aktif'] : $item->is_aktif,
        ]);

        $operator = $this->resolveOperator($request);
        AuditLog::create([
            'id' => (string) Str::uuid(),
            'pembuat_type' => $operator['role'],
            'pembuat_id' => $operator['id'] ?? (string) Str::uuid(),
            'modul' => 'inventaris_barang',
            'aksi' => 'update_barang',
            'target_label' => 'Kode Barang',
            'target_id' => $item->kode_barang,
            'data_sesudah' => $item->toArray(),
            'created_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => "Barang '{$item->nama_barang}' berhasil diperbarui.",
            'data' => $item->load(['category', 'warehouse', 'supplier']),
        ]);
    }

    /**
     * POST /api/v1/inventaris/{id}/mutasi
     * Catat mutasi stok (masuk/keluar/transfer/penyesuaian/retur/kadaluarsa).
     */
    public function mutasi(Request $request, string $id): JsonResponse
    {
        $item = InventoryItem::find($id);

        if (! $item) {
            return response()->json(['status' => 'error', 'message' => 'Barang tidak ditemukan.'], 404);
        }

        $validated = $request->validate([
            'tipe' => 'required|string|in:masuk,keluar,transfer,penyesuaian,retur,kadaluarsa',
            'qty' => 'required|integer|min:1',
            'warehouse_id' => 'nullable|exists:warehouses,id',
            'referensi' => 'nullable|string|max:150',
            'keterangan' => 'nullable|string|max:255',
        ]);

        $result = $this->inventory->mutasi(
            $item,
            $validated['tipe'],
            (int) $validated['qty'],
            [
                'warehouse_id' => $validated['warehouse_id'] ?? null,
                'referensi' => $validated['referensi'] ?? null,
                'keterangan' => $validated['keterangan'] ?? null,
            ],
            $this->resolveOperator($request)
        );

        if (isset($result['error'])) {
            return response()->json(['status' => 'error', 'message' => $result['error']], $result['code']);
        }

        return response()->json([
            'status' => 'success',
            'message' => "Mutasi {$validated['tipe']} pada '{$item->nama_barang}' berhasil. Stok saat ini: {$result['stok_baru']}",
            'data' => [
                'item' => $item->fresh(['category', 'warehouse', 'supplier']),
                'movement' => $result['movement'],
                'stok_baru' => $result['stok_baru'],
            ],
        ]);
    }

    /**
     * GET /api/v1/inventaris/laporan
     * Rekap inventaris: KPI, nilai stok per kategori, daftar stok kritis.
     */
    public function laporan(Request $request): JsonResponse
    {
        $kondisiHabis = InventoryItem::where('stok_saat_ini', '<=', 0);
        $kondisiKritis = InventoryItem::where('stok_saat_ini', '>', 0)->whereRaw('stok_saat_ini <= stok_minimum');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $kondisiHabis->where('nama_barang', 'like', "%{$search}%");
            $kondisiKritis->where('nama_barang', 'like', "%{$search}%");
        }

        $habis = $kondisiHabis->with('category:id,nama_kategori')->orderBy('nama_barang')->get();
        $kritis = $kondisiKritis->with('category:id,nama_kategori')->orderBy('stok_saat_ini')->take(20)->get();

        $perKategori = InventoryCategory::with('items')
            ->get()
            ->map(function ($kategori) {
                return [
                    'kategori' => $kategori->nama_kategori,
                    'jumlah_barang' => $kategori->items->count(),
                    'nilai_stok' => (float) round($kategori->items->sum(fn ($i) => $i->stok_saat_ini * $i->harga_beli), 2),
                ];
            })
            ->values();

        return response()->json([
            'status' => 'success',
            'data' => [
                'kpi' => [
                    'total_barang' => InventoryItem::count(),
                    'barang_habis' => InventoryItem::where('stok_saat_ini', '<=', 0)->count(),
                    'barang_kritis' => InventoryItem::where('stok_saat_ini', '>', 0)
                        ->whereRaw('stok_saat_ini <= stok_minimum')->count(),
                    'total_nilai_stok' => (float) round(InventoryItem::query()->get()->sum(fn ($i) => $i->stok_saat_ini * $i->harga_beli), 2),
                ],
                'stok_habis' => $habis,
                'stok_kritis' => $kritis,
                'per_kategori' => $perKategori,
            ],
        ]);
    }

    /**
     * DELETE /api/v1/inventaris/{id}
     * Hapus barang inventaris.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $item = InventoryItem::find($id);

        if (! $item) {
            return response()->json(['status' => 'error', 'message' => 'Barang tidak ditemukan.'], 404);
        }

        $operator = $this->resolveOperator($request);
        AuditLog::create([
            'id' => (string) Str::uuid(),
            'pembuat_type' => $operator['role'],
            'pembuat_id' => $operator['id'] ?? (string) Str::uuid(),
            'modul' => 'inventaris_barang',
            'aksi' => 'hapus_barang',
            'target_label' => 'Kode Barang',
            'target_id' => $item->kode_barang,
            'data_sebelum' => $item->toArray(),
            'created_at' => now(),
        ]);

        $kode = $item->kode_barang;
        $item->delete();

        return response()->json([
            'status' => 'success',
            'message' => "Barang '{$kode}' telah dihapus dari inventaris.",
        ]);
    }

    /**
     * @return array{id: string|null, role: string}
     */
    protected function resolveOperator(Request $request): array
    {
        return app(\App\Services\SimrsOperatorService::class)->resolve($request);
    }
}