<?php

namespace App\Http\Controllers;

use App\Models\Tagihan;
use App\Services\BillingService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TagihanWebController extends Controller
{
    public function __construct(protected BillingService $billing)
    {
    }

    /**
     * GET /laporan-kasir
     * Halaman rekap & laporan billing kasir (Web).
     */
    public function laporan(Request $request): Response
    {
        $user = session('simrs_user', null);
        $role = session('simrs_role', 'kasir');

        $from = $request->filled('from')
            ? Carbon::parse($request->input('from'))->startOfDay()
            : Carbon::today()->startOfMonth();
        $to = $request->filled('to')
            ? Carbon::parse($request->input('to'))->endOfDay()
            : Carbon::today()->endOfDay();

        $invoices = Tagihan::with('pasien:id,nama_lengkap,nomor_rekam_medis,penjamin')
            ->whereBetween('created_at', [$from, $to]);

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $invoices->where('status', $request->input('status'));
        }

        if ($request->filled('metode') && $request->input('metode') !== 'all') {
            $invoices->where('metode_pembayaran', $request->input('metode'));
        }

        $rows = $invoices->orderBy('created_at', 'desc')->get();

        $ringkasan = [
            'from' => $from->toDateString(),
            'to' => $to->toDateString(),
            'total_invoice' => $rows->count(),
            'total_lunas' => $rows->where('status', 'lunas')->count(),
            'total_belum_lunas' => $rows->where('status', 'belum_lunas')->count(),
            'total_dibatalkan' => $rows->where('status', 'dibatalkan')->count(),
            'total_nominal' => (int) $rows->sum('total_tagihan'),
            'pendapatan_terkumpul' => (int) $rows->where('status', 'lunas')->sum('total_tagihan'),
        ];

        $perMetode = $rows
            ->where('status', 'lunas')
            ->groupBy(fn ($t) => $t->metode_pembayaran ?? 'Tunai')
            ->map(fn ($group) => [
                'metode' => $group->first()->metode_pembayaran ?? 'Tunai',
                'jumlah' => $group->count(),
                'nominal' => (int) $group->sum('total_tagihan'),
            ])
            ->values();

        $perLayanan = $rows
            ->groupBy('layanan')
            ->map(fn ($group) => [
                'layanan' => $group->first()->layanan,
                'jumlah' => $group->count(),
                'nominal' => (int) $group->sum('total_tagihan'),
            ])
            ->values()
            ->sortByDesc('nominal')
            ->values();

        $seriHarian = [];
        $cursor = $from->copy();
        while ($cursor->lte($to)) {
            $dayRows = $rows->filter(fn ($t) => $t->created_at->toDateString() === $cursor->toDateString());
            $seriHarian[] = [
                'tanggal' => $cursor->toDateString(),
                'label' => $cursor->format('d M'),
                'jumlah' => $dayRows->count(),
                'pendapatan' => (int) $dayRows->where('status', 'lunas')->sum('total_tagihan'),
            ];
            $cursor->addDay();
        }

        return Inertia::render('laporan-kasir', [
            'user' => $user,
            'role' => $role,
            'ringkasan' => $ringkasan,
            'perMetode' => $perMetode,
            'perLayanan' => $perLayanan,
            'seriHarian' => $seriHarian,
            'invoices' => $rows->map(function ($t) {
                return [
                    'id' => $t->id,
                    'no_invoice' => $t->no_invoice,
                    'nama_pasien' => $t->pasien->nama_lengkap ?? 'Pasien Umum',
                    'layanan' => $t->layanan,
                    'total_tagihan' => (int) $t->total_tagihan,
                    'status' => $t->status,
                    'metode_pembayaran' => $t->metode_pembayaran,
                    'penjamin' => $t->pasien->penjamin ?? 'Umum',
                    'waktu_pembayaran' => $t->waktu_pembayaran?->toIso8601String(),
                    'created_at' => $t->created_at->toIso8601String(),
                ];
            }),
            'filters' => [
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
                'status' => $request->input('status', 'all'),
                'metode' => $request->input('metode', 'all'),
            ],
        ]);
    }

    /**
     * POST /tagihan/{id}/bayar
     * Web action for processing cashier payment.
     */
    public function bayar(Request $request, string $id): RedirectResponse
    {
        $tagihan = Tagihan::with('pasien')->findOrFail($id);

        $metode = $request->input('metode_pembayaran', 'Tunai');
        $jumlahDibayar = (int) $request->input('jumlah_dibayar', $tagihan->total_tagihan);

        $result = $this->billing->prosesPembayaran(
            $tagihan,
            $metode,
            $jumlahDibayar,
            $this->billing->resolveOperator($request),
            $request->input('catatan')
        );

        if (isset($result['error'])) {
            return back()->with('error', $result['error']);
        }

        return back()->with('success', "Pembayaran invoice {$tagihan->no_invoice} berhasil diproses.");
    }
}