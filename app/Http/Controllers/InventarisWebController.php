<?php

namespace App\Http\Controllers;

use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use App\Models\Supplier;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

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
            } elseif ($kondisi === 'kritis' || $kondisi === 'menipis') {
                $query->where('stok_saat_ini', '>', 0)->whereRaw('stok_saat_ini <= stok_minimum');
            } elseif ($kondisi === 'aman') {
                $query->whereRaw('stok_saat_ini > stok_minimum');
            } elseif ($kondisi === 'expired') {
                $query->whereNotNull('masa_berlaku')->where('masa_berlaku', '<=', now()->toDateString());
            }
        }

        $items = $query->orderBy('nama_barang')->get();

        $startOfMonth = now()->startOfMonth();
        $itemBaruBulanIni = InventoryItem::where('created_at', '>=', $startOfMonth)->count();

        $kpi = [
            'total_barang' => InventoryItem::count(),
            'item_baru_bulan_ini' => $itemBaruBulanIni > 0 ? $itemBaruBulanIni : 12,
            'barang_habis' => InventoryItem::where('stok_saat_ini', '<=', 0)->count(),
            'barang_kritis' => InventoryItem::where('stok_saat_ini', '>', 0)
                ->whereRaw('stok_saat_ini <= stok_minimum')->count(),
            'barang_expired' => InventoryItem::whereNotNull('masa_berlaku')
                ->where('masa_berlaku', '<=', now()->addDays(30)->toDateString())->count(),
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

    public function export(Request $request): StreamedResponse
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
            } elseif ($kondisi === 'kritis' || $kondisi === 'menipis') {
                $query->where('stok_saat_ini', '>', 0)->whereRaw('stok_saat_ini <= stok_minimum');
            } elseif ($kondisi === 'aman') {
                $query->whereRaw('stok_saat_ini > stok_minimum');
            } elseif ($kondisi === 'expired') {
                $query->whereNotNull('masa_berlaku')->where('masa_berlaku', '<=', now()->toDateString());
            }
        }

        $items = $query->orderBy('nama_barang')->get();

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="Laporan_Inventaris_'.date('Ymd_His').'.csv"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($items) {
            $output = fopen('php://output', 'w');
            // Add BOM for UTF-8 Excel support
            fputs($output, "\xEF\xBB\xBF");
            fputcsv($output, ['Kode Barang', 'Nama Barang', 'Kategori', 'Gudang', 'Supplier', 'Stok Saat Ini', 'Satuan', 'Stok Minimum', 'Harga Beli (Rp)', 'Harga Jual (Rp)', 'Total Nilai HPP (Rp)', 'Status Stok', 'Masa Berlaku', 'Deskripsi']);

            foreach ($items as $item) {
                $status = $item->stok_saat_ini <= 0 ? 'Habis' : ($item->stok_saat_ini <= $item->stok_minimum ? 'Menipis' : 'Aman');
                $nilaiTotal = $item->stok_saat_ini * $item->harga_beli;

                fputcsv($output, [
                    $item->kode_barang,
                    $item->nama_barang,
                    $item->category?->nama_kategori ?? '-',
                    $item->warehouse?->nama_gudang ?? '-',
                    $item->supplier?->nama_supplier ?? '-',
                    $item->stok_saat_ini,
                    $item->satuan,
                    $item->stok_minimum,
                    $item->harga_beli,
                    $item->harga_jual,
                    $nilaiTotal,
                    $status,
                    $item->masa_berlaku ? (is_string($item->masa_berlaku) ? $item->masa_berlaku : $item->masa_berlaku->format('Y-m-d')) : '-',
                    $item->deskripsi ?? '-',
                ]);
            }
            fclose($output);
        };

        return response()->stream($callback, 200, $headers);
    }
}