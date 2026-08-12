<?php

namespace App\Http\Controllers;

use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use App\Models\Supplier;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventarisWebController extends Controller
{
    public function index(Request $request): Response
    {
        $user = session('simrs_user', null);
        $role = session('simrs_role', 'admin');

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

        $items = $query->orderBy('nama_barang')->get();

        $kpi = [
            'total_barang' => InventoryItem::count(),
            'barang_habis' => InventoryItem::where('stok_saat_ini', '<=', 0)->count(),
            'barang_kritis' => InventoryItem::where('stok_saat_ini', '>', 0)
                ->whereRaw('stok_saat_ini <= stok_minimum')->count(),
            'total_nilai_stok' => (float) round(InventoryItem::all()->sum(fn ($i) => $i->stok_saat_ini * $i->harga_beli), 2),
        ];

        return Inertia::render('inventaris', [
            'user' => $user,
            'role' => $role,
            'items' => $items,
            'kategori' => InventoryCategory::where('is_aktif', true)->orderBy('nama_kategori')->get(),
            'gudang' => Warehouse::where('is_aktif', true)->orderBy('nama_gudang')->get(),
            'supplier' => Supplier::where('is_aktif', true)->orderBy('nama_supplier')->get(),
            'kpi' => $kpi,
            'filters' => [
                'search' => $request->input('search', ''),
                'kategori' => $request->input('kategori', 'all'),
                'kondisi' => $request->input('kondisi', 'all'),
            ],
        ]);
    }
}