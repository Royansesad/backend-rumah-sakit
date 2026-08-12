<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\BillingService;
use App\Models\Pasien;
use App\Models\Tagihan;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class TagihanApiController extends Controller
{
    public function __construct(protected BillingService $billing)
    {
    }

    /**
     * GET /api/v1/tagihan
     * List tagihan / invoice kasir.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Tagihan::with(['pasien:id,nama_lengkap,nik,nomor_rekam_medis,penjamin,no_hp']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('no_invoice', 'like', "%{$search}%")
                    ->orWhere('layanan', 'like', "%{$search}%")
                    ->orWhereHas('pasien', function ($qp) use ($search) {
                        $qp->where('nama_lengkap', 'like', "%{$search}%")
                            ->orWhere('nik', 'like', "%{$search}%")
                            ->orWhere('nomor_rekam_medis', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        $tagihans = $query->orderBy('created_at', 'desc')->paginate($request->input('per_page', 20));

        return response()->json([
            'status' => 'success',
            'data' => $tagihans,
        ]);
    }

    /**
     * GET /api/v1/tagihan/{id}
     * Detail invoice.
     */
    public function show(string $id): JsonResponse
    {
        $tagihan = Tagihan::with(['pasien', 'kasir'])->find($id);

        if (! $tagihan) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tagihan / Invoice tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $tagihan,
        ]);
    }

    /**
     * POST /api/v1/tagihan
     * Buat invoice tagihan baru (nomor invoice atomic via BillingService).
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'pasien_id' => 'required|exists:pasien,id',
            'layanan' => 'required|string',
            'rincian' => 'required|array|min:1',
        ]);

        $tagihan = $this->billing->buatInvoice(
            $request->only(['pasien_id', 'layanan', 'rincian', 'diskon', 'pajak', 'catatan']),
            $this->billing->resolveOperator($request)
        );

        return response()->json([
            'status' => 'success',
            'message' => "Invoice baru {$tagihan->no_invoice} berhasil dibuat.",
            'data' => $tagihan->load('pasien'),
        ], 201);
    }

    /**
     * POST /api/v1/tagihan/{id}/bayar
     * Proses pembayaran tagihan.
     */
    public function bayar(Request $request, string $id): JsonResponse
    {
        $tagihan = Tagihan::with('pasien')->find($id);

        if (! $tagihan) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tagihan tidak ditemukan.',
            ], 404);
        }

        $request->validate([
            'metode_pembayaran' => 'nullable|string|max:50',
            'jumlah_dibayar' => 'nullable|integer|min:0',
        ]);

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
            return response()->json([
                'status' => 'error',
                'message' => $result['error'],
            ], $result['code']);
        }

        /** @var Tagihan $tagihan */
        $tagihan = $result['tagihan'];

        return response()->json([
            'status' => 'success',
            'message' => "Pembayaran invoice {$tagihan->no_invoice} berhasil diproses.",
            'data' => $tagihan->fresh(['pasien', 'kasir']),
        ]);
    }

    /**
     * PATCH /api/v1/tagihan/{id}/batalkan
     * Batalkan invoice tagihan.
     */
    public function batalkan(Request $request, string $id): JsonResponse
    {
        $tagihan = Tagihan::find($id);

        if (! $tagihan) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tagihan tidak ditemukan.',
            ], 404);
        }

        $this->billing->batalkan($tagihan, $this->billing->resolveOperator($request));

        return response()->json([
            'status' => 'success',
            'message' => "Tagihan {$tagihan->no_invoice} telah dibatalkan.",
        ]);
    }

    /**
     * GET /api/v1/tagihan/laporan
     * Laporan rekap billing (harian/bulanan) dengan filter.
     */
    public function laporan(Request $request): JsonResponse
    {
        $request->validate([
            'from' => 'nullable|date',
            'to' => 'nullable|date',
            'status' => 'nullable|string',
            'metode' => 'nullable|string',
        ]);

        $from = $request->filled('from')
            ? Carbon::parse($request->input('from'))->startOfDay()
            : Carbon::today()->startOfWeek();
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

        $perPenjamin = $rows
            ->groupBy(fn ($t) => $t->pasien->penjamin ?? 'Umum')
            ->map(fn ($group) => [
                'penjamin' => strtoupper($group->first()->pasien->penjamin ?? 'Umum'),
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
            $dayRows = $rows->filter(function ($t) use ($cursor) {
                return $t->created_at->toDateString() === $cursor->toDateString();
            });
            $seriHarian[] = [
                'tanggal' => $cursor->toDateString(),
                'label' => $cursor->format('d M'),
                'jumlah' => $dayRows->count(),
                'pendapatan' => (int) $dayRows->where('status', 'lunas')->sum('total_tagihan'),
            ];
            $cursor->addDay();
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'ringkasan' => $ringkasan,
                'per_metode' => $perMetode,
                'per_penjamin' => $perPenjamin,
                'per_layanan' => $perLayanan,
                'seri_harian' => $seriHarian,
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
            ],
        ]);
    }
}