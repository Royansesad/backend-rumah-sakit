<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\Ruangan;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AsetWebController extends Controller
{
    public function index(Request $request): Response
    {
        $user = session('simrs_user', null);
        $role = session('simrs_role', 'admin');

        $query = Asset::with(['category:id,nama_kategori', 'ruangan:id,nama_ruangan', 'supplier:id,nama_supplier', 'maintenances', 'loans']);

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

        $assets = $query->orderBy('nama_aset')->get();

        $allAssets = Asset::all();

        $kpi = [
            'total_aset' => $allAssets->count(),
            'nilai_perolehan' => (float) round($allAssets->sum('nilai_perolehan'), 2),
            'nilai_buku' => (float) round($allAssets->sum(fn ($a) => $a->nilai_buku), 2),
            'rusak' => $allAssets->where('status', 'rusak')->count(),
            'maintenance' => $allAssets->where('status', 'maintenance')->count(),
            'dipinjam' => $allAssets->where('status', 'dipinjam')->count(),
        ];

        return Inertia::render('aset', [
            'user' => $user,
            'role' => $role,
            'assets' => $assets,
            'kategori' => AssetCategory::where('is_aktif', true)->orderBy('nama_kategori')->get(),
            'ruangan' => Ruangan::orderBy('nama_ruangan')->get(['id', 'nama_ruangan']),
            'supplier' => Supplier::where('is_aktif', true)->orderBy('nama_supplier')->get(),
            'kpi' => $kpi,
            'filters' => [
                'search' => $request->input('search', ''),
                'kategori' => $request->input('kategori', 'all'),
                'status' => $request->input('status', 'all'),
            ],
        ]);
    }
}