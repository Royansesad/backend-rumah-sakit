<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\AssetLoan;
use App\Models\AssetMaintenance;
use App\Models\AuditLog;
use App\Models\Ruangan;
use App\Models\Supplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AsetApiController extends Controller
{
    /**
     * GET /api/v1/aset
     * List aset tetap (filter: search, kategori, status).
     */
    public function index(Request $request): JsonResponse
    {
        $query = Asset::with(['category:id,nama_kategori', 'ruangan:id,nama_ruangan', 'supplier:id,nama_supplier']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('nama_aset', 'like', "%{$search}%")
                    ->orWhere('kode_aset', 'like', "%{$search}%")
                    ->orWhere('nomor_seri', 'like', "%{$search}%");
            });
        }

        if ($request->filled('kategori') && $request->input('kategori') !== 'all') {
            $query->where('asset_category_id', $request->input('kategori'));
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        $assets = $query->orderBy('nama_aset')->paginate($request->input('per_page', 20));

        return response()->json([
            'status' => 'success',
            'data' => $assets,
        ]);
    }

    /**
     * GET /api/v1/aset/master
     * Master referensi + KPI ringkas.
     */
    public function master(): JsonResponse
    {
        $allAssets = Asset::all();

        return response()->json([
            'status' => 'success',
            'data' => [
                'kategori' => AssetCategory::where('is_aktif', true)->orderBy('nama_kategori')->get(),
                'ruangan' => Ruangan::orderBy('nama_ruangan')->get(['id', 'nama_ruangan']),
                'supplier' => Supplier::where('is_aktif', true)->orderBy('nama_supplier')->get(),
                'kpi' => [
                    'total_aset' => $allAssets->count(),
                    'nilai_perolehan' => (float) round($allAssets->sum('nilai_perolehan'), 2),
                    'nilai_buku' => (float) round($allAssets->sum(fn ($a) => $a->nilai_buku), 2),
                    'rusak' => $allAssets->where('status', 'rusak')->count(),
                    'maintenance' => $allAssets->where('status', 'maintenance')->count(),
                    'dipinjam' => $allAssets->where('status', 'dipinjam')->count(),
                ],
            ],
        ]);
    }

    /**
     * GET /api/v1/aset/{id}
     * Detail aset + riwayat pemeliharaan & peminjaman.
     */
    public function show(string $id): JsonResponse
    {
        $asset = Asset::with(['category', 'ruangan', 'supplier', 'maintenances', 'loans'])
            ->find($id);

        if (! $asset) {
            return response()->json(['status' => 'error', 'message' => 'Aset tidak ditemukan.'], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'asset' => $asset,
                'nilai_buku' => $asset->nilai_buku,
                'nilai_penyusutan' => $asset->nilai_penyusutan,
            ],
        ]);
    }

    /**
     * POST /api/v1/aset
     * Tambah aset baru.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'kode_aset' => 'required|string|max:100|unique:assets,kode_aset',
            'nama_aset' => 'required|string|max:255',
            'asset_category_id' => 'required|exists:asset_categories,id',
            'merk' => 'nullable|string|max:150',
            'model' => 'nullable|string|max:150',
            'nomor_seri' => 'nullable|string|max:150',
            'tanggal_perolehan' => 'nullable|date',
            'nilai_perolehan' => 'nullable|numeric|min:0',
            'umur_ekonomis_tahun' => 'nullable|integer|min:1',
            'nilai_residu' => 'nullable|numeric|min:0',
            'ruangan_id' => 'nullable|exists:ruangan,id',
            'lokasi' => 'nullable|string|max:255',
            'penanggung_jawab' => 'nullable|string|max:150',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'garansi_sampai' => 'nullable|date',
            'deskripsi' => 'nullable|string',
        ]);

        $operator = $this->resolveOperator($request);

        $asset = Asset::create([
            'id' => (string) Str::uuid(),
            'kode_aset' => strtoupper($validated['kode_aset']),
            'nama_aset' => $validated['nama_aset'],
            'asset_category_id' => $validated['asset_category_id'],
            'merk' => $validated['merk'] ?? null,
            'model' => $validated['model'] ?? null,
            'nomor_seri' => $validated['nomor_seri'] ?? null,
            'tanggal_perolehan' => $validated['tanggal_perolehan'] ?? null,
            'nilai_perolehan' => $validated['nilai_perolehan'] ?? 0,
            'umur_ekonomis_tahun' => (int) ($validated['umur_ekonomis_tahun'] ?? 5),
            'nilai_residu' => $validated['nilai_residu'] ?? 0,
            'ruangan_id' => $validated['ruangan_id'] ?? null,
            'lokasi' => $validated['lokasi'] ?? null,
            'status' => 'aktif',
            'penanggung_jawab' => $validated['penanggung_jawab'] ?? null,
            'supplier_id' => $validated['supplier_id'] ?? null,
            'garansi_sampai' => $validated['garansi_sampai'] ?? null,
            'deskripsi' => $validated['deskripsi'] ?? null,
        ]);

        $this->catatAudit($operator, 'tambah_aset', $asset->kode_aset, $asset->toArray());

        return response()->json([
            'status' => 'success',
            'message' => "Aset '{$asset->nama_aset}' ({$asset->kode_aset}) berhasil didaftarkan.",
            'data' => $asset->load(['category', 'ruangan', 'supplier']),
        ], 201);
    }

    /**
     * PUT /api/v1/aset/{id}
     * Perbarui data aset.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $asset = Asset::find($id);

        if (! $asset) {
            return response()->json(['status' => 'error', 'message' => 'Aset tidak ditemukan.'], 404);
        }

        $validated = $request->validate([
            'kode_aset' => 'required|string|max:100|unique:assets,kode_aset,'.$id,
            'nama_aset' => 'required|string|max:255',
            'asset_category_id' => 'required|exists:asset_categories,id',
            'merk' => 'nullable|string|max:150',
            'model' => 'nullable|string|max:150',
            'nomor_seri' => 'nullable|string|max:150',
            'tanggal_perolehan' => 'nullable|date',
            'nilai_perolehan' => 'nullable|numeric|min:0',
            'umur_ekonomis_tahun' => 'nullable|integer|min:1',
            'nilai_residu' => 'nullable|numeric|min:0',
            'ruangan_id' => 'nullable|exists:ruangan,id',
            'lokasi' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:aktif,rusak,maintenance,dipinjam,dihapuskan',
            'penanggung_jawab' => 'nullable|string|max:150',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'garansi_sampai' => 'nullable|date',
            'deskripsi' => 'nullable|string',
            'is_aktif' => 'nullable|boolean',
        ]);

        $asset->update([
            'kode_aset' => strtoupper($validated['kode_aset']),
            'nama_aset' => $validated['nama_aset'],
            'asset_category_id' => $validated['asset_category_id'],
            'merk' => $validated['merk'] ?? $asset->merk,
            'model' => $validated['model'] ?? $asset->model,
            'nomor_seri' => $validated['nomor_seri'] ?? $asset->nomor_seri,
            'tanggal_perolehan' => $validated['tanggal_perolehan'] ?? $asset->tanggal_perolehan,
            'nilai_perolehan' => $validated['nilai_perolehan'] ?? $asset->nilai_perolehan,
            'umur_ekonomis_tahun' => (int) ($validated['umur_ekonomis_tahun'] ?? $asset->umur_ekonomis_tahun),
            'nilai_residu' => $validated['nilai_residu'] ?? $asset->nilai_residu,
            'ruangan_id' => $validated['ruangan_id'] ?? $asset->ruangan_id,
            'lokasi' => $validated['lokasi'] ?? $asset->lokasi,
            'status' => $validated['status'] ?? $asset->status,
            'penanggung_jawab' => $validated['penanggung_jawab'] ?? $asset->penanggung_jawab,
            'supplier_id' => $validated['supplier_id'] ?? $asset->supplier_id,
            'garansi_sampai' => $validated['garansi_sampai'] ?? $asset->garansi_sampai,
            'deskripsi' => $validated['deskripsi'] ?? $asset->deskripsi,
            'is_aktif' => array_key_exists('is_aktif', $validated) ? (bool) $validated['is_aktif'] : $asset->is_aktif,
        ]);

        $operator = $this->resolveOperator($request);
        $this->catatAudit($operator, 'update_aset', $asset->kode_aset, $asset->toArray());

        return response()->json([
            'status' => 'success',
            'message' => "Aset '{$asset->nama_aset}' berhasil diperbarui.",
            'data' => $asset->load(['category', 'ruangan', 'supplier']),
        ]);
    }

    /**
     * POST /api/v1/aset/{id}/maintenance
     * Catat jadwal/riwayat pemeliharaan aset & ubah status aset menjadi maintenance.
     */
    public function maintenance(Request $request, string $id): JsonResponse
    {
        $asset = Asset::find($id);

        if (! $asset) {
            return response()->json(['status' => 'error', 'message' => 'Aset tidak ditemukan.'], 404);
        }

        $validated = $request->validate([
            'tanggal' => 'required|date',
            'jenis' => 'required|string|in:rutin,perbaikan,kalibrasi',
            'biaya' => 'nullable|numeric|min:0',
            'vendor' => 'nullable|string|max:200',
            'keterangan' => 'nullable|string',
        ]);

        $operator = $this->resolveOperator($request);

        $maintenance = AssetMaintenance::create([
            'id' => (string) Str::uuid(),
            'asset_id' => $asset->id,
            'tanggal' => $validated['tanggal'],
            'jenis' => $validated['jenis'],
            'biaya' => $validated['biaya'] ?? 0,
            'vendor' => $validated['vendor'] ?? null,
            'keterangan' => $validated['keterangan'] ?? null,
            'status' => 'menunggu',
            'operator_role' => $operator['role'],
            'operator_id' => $operator['id'],
        ]);

        $asset->update(['status' => 'maintenance']);

        $this->catatAudit($operator, 'tambah_maintenance', $asset->kode_aset, [
            'nama_aset' => $asset->nama_aset,
            'jenis' => $validated['jenis'],
            'biaya' => (float) ($validated['biaya'] ?? 0),
            'status_aset' => 'maintenance',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Pemeliharaan aset berhasil dicatat; status aset menjadi maintenance.',
            'data' => [
                'asset' => $asset->fresh(['category', 'ruangan', 'supplier']),
                'maintenance' => $maintenance,
            ],
        ], 201);
    }

    /**
     * PATCH /api/v1/aset/maintenance/{id}/selesai
     * Selesaikan pekerjaan pemeliharaan & kembalikan status aset ke aktif.
     */
    public function maintenanceSelesai(Request $request, string $maintId): JsonResponse
    {
        $maintenance = AssetMaintenance::with('asset')->find($maintId);

        if (! $maintenance) {
            return response()->json(['status' => 'error', 'message' => 'Pemeliharaan tidak ditemukan.'], 404);
        }

        $maintenance->update(['status' => 'selesai']);

        $asset = $maintenance->asset;
        if ($asset && $asset->status === 'maintenance') {
            $asset->update(['status' => 'aktif']);
        }

        $operator = $this->resolveOperator($request);
        $this->catatAudit($operator, 'selesai_maintenance', $asset->kode_aset, [
            'nama_aset' => $asset->nama_aset,
            'status_aset' => 'aktif',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Pemeliharaan selesai; aset kembali aktif.',
            'data' => [
                'asset' => $asset->fresh(['category', 'ruangan', 'supplier']),
                'maintenance' => $maintenance->fresh(),
            ],
        ]);
    }

    /**
     * POST /api/v1/aset/{id}/pinjam
     * Catat peminjaman aset antar unit & ubah status aset menjadi dipinjam.
     */
    public function pinjam(Request $request, string $id): JsonResponse
    {
        $asset = Asset::find($id);

        if (! $asset) {
            return response()->json(['status' => 'error', 'message' => 'Aset tidak ditemukan.'], 404);
        }

        if ($asset->status === 'dipinjam') {
            return response()->json(['status' => 'error', 'message' => 'Aset ini sedang dipinjam.'], 422);
        }

        $validated = $request->validate([
            'unit_peminjam' => 'required|string|max:200',
            'penanggung_jawab' => 'nullable|string|max:150',
            'tanggal_pinjam' => 'required|date',
            'tanggal_kembali' => 'nullable|date|after_or_equal:tanggal_pinjam',
            'keterangan' => 'nullable|string',
        ]);

        $operator = $this->resolveOperator($request);

        $loan = AssetLoan::create([
            'id' => (string) Str::uuid(),
            'asset_id' => $asset->id,
            'unit_peminjam' => $validated['unit_peminjam'],
            'penanggung_jawab' => $validated['penanggung_jawab'] ?? null,
            'tanggal_pinjam' => $validated['tanggal_pinjam'],
            'tanggal_kembali' => $validated['tanggal_kembali'] ?? null,
            'keterangan' => $validated['keterangan'] ?? null,
            'status' => 'dipinjam',
            'operator_role' => $operator['role'],
            'operator_id' => $operator['id'],
        ]);

        $asset->update(['status' => 'dipinjam']);

        $this->catatAudit($operator, 'pinjam_aset', $asset->kode_aset, [
            'nama_aset' => $asset->nama_aset,
            'unit_peminjam' => $validated['unit_peminjam'],
            'status_aset' => 'dipinjam',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => "Aset '{$asset->nama_aset}' dipinjam oleh {$validated['unit_peminjam']}.",
            'data' => ['asset' => $asset->fresh(['category', 'ruangan', 'supplier']), 'loan' => $loan],
        ], 201);
    }

    /**
     * POST /api/v1/aset/{id}/kembalikan
     * Proses pengembalian pinjaman aset & ubah status aset kembali aktif.
     */
    public function kembalikan(Request $request, string $id): JsonResponse
    {
        $asset = Asset::find($id);

        if (! $asset) {
            return response()->json(['status' => 'error', 'message' => 'Aset tidak ditemukan.'], 404);
        }

        $loan = $asset->loans()->where('status', 'dipinjam')->latest()->first();

        if (! $loan) {
            return response()->json(['status' => 'error', 'message' => 'Tidak ada peminjaman aktif untuk aset ini.'], 422);
        }

        $loan->update([
            'status' => 'dikembalikan',
            'tanggal_kembali' => now()->toDateString(),
        ]);

        $asset->update(['status' => 'aktif']);

        $operator = $this->resolveOperator($request);
        $this->catatAudit($operator, 'kembali_aset', $asset->kode_aset, [
            'nama_aset' => $asset->nama_aset,
            'unit_peminjam' => $loan->unit_peminjam,
            'status_aset' => 'aktif',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => "Aset '{$asset->nama_aset}' telah dikembalikan dan aktif kembali.",
            'data' => ['asset' => $asset->fresh(['category', 'ruangan', 'supplier']), 'loan' => $loan->fresh()],
        ]);
    }

    /**
     * GET /api/v1/aset/laporan
     * Rekap aset: KPI, nilai per kategori, status, daftar aset bermasalah.
     */
    public function laporan(): JsonResponse
    {
        $allAssets = Asset::with('category:id,nama_kategori')->get();

        $perKategori = $allAssets
            ->groupBy(fn ($a) => $a->category->nama_kategori ?? 'Tanpa Kategori')
            ->map(fn ($group) => [
                'kategori' => $group->first()->category->nama_kategori ?? 'Tanpa Kategori',
                'jumlah' => $group->count(),
                'nilai_perolehan' => (float) round($group->sum('nilai_perolehan'), 2),
                'nilai_buku' => (float) round($group->sum(fn ($a) => $a->nilai_buku), 2),
            ])
            ->values();

        $perStatus = ['aktif', 'rusak', 'maintenance', 'dipinjam', 'dihapuskan'];

        return response()->json([
            'status' => 'success',
            'data' => [
                'kpi' => [
                    'total_aset' => $allAssets->count(),
                    'nilai_perolehan' => (float) round($allAssets->sum('nilai_perolehan'), 2),
                    'nilai_buku' => (float) round($allAssets->sum(fn ($a) => $a->nilai_buku), 2),
                    'total_penyusutan' => (float) round($allAssets->sum(fn ($a) => $a->nilai_penyusutan), 2),
                    ...collect($perStatus)->mapWithKeys(fn ($s) => [$s => $allAssets->where('status', $s)->count()])->toArray(),
                ],
                'per_kategori' => $perKategori,
                'aset_bermasalah' => $allAssets->whereIn('status', ['rusak', 'maintenance', 'dipinjam'])
                    ->values()
                    ->map(fn ($a) => [
                        'id' => $a->id,
                        'kode_aset' => $a->kode_aset,
                        'nama_aset' => $a->nama_aset,
                        'status' => $a->status,
                        'lokasi' => $a->lokasi,
                        'nilai_buku' => $a->nilai_buku,
                    ]),
            ],
        ]);
    }

    /**
     * DELETE /api/v1/aset/{id}
     * Hapus aset dari daftar.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $asset = Asset::find($id);

        if (! $asset) {
            return response()->json(['status' => 'error', 'message' => 'Aset tidak ditemukan.'], 404);
        }

        $operator = $this->resolveOperator($request);
        $this->catatAudit($operator, 'hapus_aset', $asset->kode_aset, $asset->toArray());

        $kode = $asset->kode_aset;
        $asset->delete();

        return response()->json([
            'status' => 'success',
            'message' => "Aset '{$kode}' telah dihapus.",
        ]);
    }

    /**
     * @return array{id: string|null, role: string}
     */
    protected function resolveOperator(Request $request): array
    {
        return app(\App\Services\SimrsOperatorService::class)->resolve($request);
    }

    /**
     * @param  array{id?: string|null, role?: string|null}  $operator
     * @param  array<string, mixed>  $sesudah
     */
    protected function catatAudit(array $operator, string $aksi, string $kodeAset, array $sesudah): void
    {
        AuditLog::create([
            'id' => (string) Str::uuid(),
            'pembuat_type' => $operator['role'] ?? 'admin',
            'pembuat_id' => $operator['id'] ?? (string) Str::uuid(),
            'modul' => 'inventaris_aset',
            'aksi' => $aksi,
            'target_label' => 'Kode Aset',
            'target_id' => $kodeAset,
            'data_sesudah' => $sesudah,
            'created_at' => now(),
        ]);
    }
}