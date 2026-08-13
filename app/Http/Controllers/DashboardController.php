<?php

namespace App\Http\Controllers;

use App\Models\Antrian;
use App\Models\AuditLog;
use App\Models\Obat;
use App\Models\Pasien;
use App\Models\Resep;
use App\Models\Tagihan;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = session('simrs_user', null);
        $role = session('simrs_role', 'admin');

        // =====================================================================
        // Data khusus role Manajemen (Farmasi Dashboard)
        // =====================================================================
        $manajemenData = [];
        if ($role === 'manajemen') {
            $manajemenData = $this->getManajemenData();
        }

        $resepsionisData = [];
        if ($role === 'resepsionis') {
            $resepsionisData = $this->getResepsionisData();
        }

        $kasirData = [];
        if ($role === 'kasir') {
            $kasirData = $this->getKasirData();
        }

        $apotekerData = [];
        if ($role === 'apoteker' || $role === 'admin') {
            $apotekerData = $this->getApotekerData();
        }

        $perawatData = [];
        if ($role === 'perawat') {
            $perawatData = $this->getPerawatData();
        }

        $dokterData = [];
        if ($role === 'dokter') {
            $dokterData = $this->getDokterData();
        }

        // Total Pasien
        $totalPatients = DB::table('pasien')->count();

        // Appointment Hari Ini
        $today = Carbon::today()->toDateString();
        $todayAppointments = DB::table('pasien')->whereDate('tanggal_pendaftaran', $today)->count();
        if (Schema::hasTable('antrian')) {
            $todayAppointments += Antrian::whereHas('jadwalDokter', fn($q) => $q->whereDate('tanggal', $today))->count();
        }

        // Dokter Aktif
        $activeDoctors = DB::table('dokters')->where('status_praktik', 'aktif')->count();
        if ($activeDoctors === 0) {
            $activeDoctors = DB::table('dokters')->count();
        }

        // Pendapatan Bulan Ini (real dari tagihan lunas)
        $monthlyRevenueRaw = Tagihan::where('status', 'lunas')
            ->whereYear('waktu_pembayaran', now()->year)
            ->whereMonth('waktu_pembayaran', now()->month)
            ->sum('total_tagihan');
        $monthlyRevenueDisplay = $monthlyRevenueRaw > 0
            ? $this->formatRupiah($monthlyRevenueRaw)
            : 'Rp 0';

        $stats = [
            'totalPatients' => number_format($totalPatients, 0, ',', '.'),
            'todayAppointments' => (string) $todayAppointments,
            'monthlyRevenue' => $monthlyRevenueDisplay,
            'activeDoctors' => (string) $activeDoctors,
            'patientTrend' => $this->computeTrend('pasien', 'created_at', 'registered'),
            'appointmentTrend' => $this->computeTrend('antrian', 'created_at', 'appointment'),
            'revenueTrend' => $this->computeRevenueTrend(),
            'doctorTrend' => $activeDoctors > 0 ? 'Stable' : 'Belum ada data',
        ];

        // Data Kunjungan Pasien 7 Hari Terakhir (real dari antrian & rawat inap)
        $dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        $weeklyVisits = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $rawatJalan = Antrian::whereDate('created_at', $date)->count();
            $rawatInap = \App\Models\RawatInapAdmission::whereDate('tanggal_masuk', $date)->count();
            $igd = \App\Models\RekamMedis::whereDate('created_at', $date)
                ->whereHas('poli', fn($q) => $q->where('nama_poli', 'like', '%IGD%'))
                ->count();
            $weeklyVisits[] = [
                'day' => $dayNames[$date->dayOfWeek],
                'fullName' => $date->isoFormat('dddd'),
                'count' => $rawatJalan + $rawatInap + $igd,
                'rawatJalan' => $rawatJalan,
                'igd' => $igd,
                'rawatInap' => $rawatInap,
                'isHighlighted' => $date->isToday(),
            ];
        }

        // Aktivitas Terbaru (real dari AuditLog, tanpa fallback dummy)
        $auditLogs = AuditLog::orderBy('created_at', 'desc')->take(10)->get();
        $recentActivities = [];

        foreach ($auditLogs as $log) {
            $pembuatName = $log->pembuat['nama_lengkap'] ?? 'Petugas';
            $modulName = str_replace('_', ' ', $log->modul ?? '');
            $aksiName = strtolower(str_replace('_', ' ', $log->aksi ?? 'memperbarui data'));
            $target = $log->target_id ? " ({$log->target_id})" : '';

            $iconType = 'user';
            if (str_contains(strtolower($log->modul ?? ''), 'jadwal')) {
                $iconType = 'calendar';
            } elseif (str_contains(strtolower($log->modul ?? ''), 'obat') || str_contains(strtolower($log->modul ?? ''), 'resep')) {
                $iconType = 'stock';
            } elseif (str_contains(strtolower($log->modul ?? ''), 'medis') || str_contains(strtolower($log->modul ?? ''), 'pasien')) {
                $iconType = 'document';
            }

            $timeAgo = Carbon::parse($log->created_at)->diffForHumans();

            $recentActivities[] = [
                'id' => $log->id,
                'title' => "{$pembuatName} {$aksiName} pada modul {$modulName}{$target}.",
                'time' => $timeAgo,
                'type' => $iconType,
            ];
        }

        return Inertia::render('dashboard', array_merge([
            'stats' => $stats,
            'weeklyVisits' => $weeklyVisits,
            'recentActivities' => $recentActivities,
            'recentAuditLogs' => $auditLogs,
            'user' => $user,
            'role' => $role,
        ], $manajemenData, $resepsionisData, $kasirData, $apotekerData, $perawatData, $dokterData));
    }

    /**
     * Mengambil data khusus dashboard Manajemen Farmasi dari database.
     * Semua data real — tidak ada dummy/placeholder.
     */
    private function getManajemenData(): array
    {
        $today = Carbon::today();

        // ----- 1. Resep Masuk Hari Ini + Breakdown Status -----
        $todayReseps = Resep::whereDate('created_at', $today)->count();
        $pendingReseps = Resep::whereDate('created_at', $today)
            ->where('status', 'menunggu_ditebus')->count();
        $completedReseps = Resep::whereDate('created_at', $today)
            ->where('status', 'sudah_ditebus')->count();

        // ----- 2. Stok Kritis (obat dengan stok <= 10) -----
        $lowStockList = Obat::where('stok', '<=', 10)
            ->orderBy('stok', 'asc')
            ->limit(5)
            ->get(['id', 'nama_obat', 'stok', 'bentuk_sediaan'])
            ->map(function ($obat) {
                return [
                    'id' => $obat->id,
                    'nama' => $obat->nama_obat,
                    'stok' => $obat->stok,
                    'bentuk_sediaan' => $obat->bentuk_sediaan,
                    'level' => $obat->stok <= 0 ? 'habis' : 'menipis',
                ];
            });

        // ----- 3. Transaksi Harian — 7 hari terakhir (untuk bar chart) -----
        $dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        $weeklyTransactions = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $count = Resep::whereDate('created_at', $date)->count();
            $weeklyTransactions[] = [
                'day' => $dayNames[$date->dayOfWeek],
                'date' => $date->toDateString(),
                'count' => $count,
            ];
        }
        $todayProcessed = Resep::whereDate('created_at', $today)
            ->where('status', 'sudah_ditebus')->count();

        // ----- 4. Antrian Resep Masuk (tabel — 10 terbaru) -----
        $prescriptionQueue = Resep::with([
            'pasien:id,nama_lengkap',
            'dokter:id,nama_lengkap,spesialisasi',
            'details',
        ])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(function ($resep) {
                return [
                    'id' => $resep->id,
                    'no_resep' => $resep->no_resep,
                    'nama_pasien' => $resep->pasien->nama_lengkap ?? '-',
                    'dokter' => $resep->dokter
                        ? ($resep->dokter->spesialisasi
                            ? $resep->dokter->nama_lengkap . ', ' . $resep->dokter->spesialisasi
                            : $resep->dokter->nama_lengkap)
                        : '-',
                    'jumlah_item' => $resep->details->count(),
                    'status' => $resep->status,
                    'created_at' => $resep->created_at->toIso8601String(),
                ];
            });

        // ----- 5. Riwayat Terakhir (3 transaksi terbaru yang sudah ditebus) -----
        $recentTransactions = Resep::with('pasien:id,nama_lengkap')
            ->where('status', 'sudah_ditebus')
            ->orderByDesc('updated_at')
            ->limit(5)
            ->get()
            ->map(function ($resep) {
                return [
                    'id' => $resep->id,
                    'no_resep' => $resep->no_resep,
                    'nama_pasien' => $resep->pasien->nama_lengkap ?? '-',
                    'waktu' => Carbon::parse($resep->updated_at)->format('H:i') . ' ' . Carbon::parse($resep->updated_at)->format('A'),
                    'tanggal' => Carbon::parse($resep->updated_at)->toDateString(),
                ];
            });

        return [
            'mgtTodayReseps' => $todayReseps,
            'mgtPendingReseps' => $pendingReseps,
            'mgtCompletedReseps' => $completedReseps,
            'mgtLowStockList' => $lowStockList,
            'mgtWeeklyTransactions' => $weeklyTransactions,
            'mgtTodayProcessed' => $todayProcessed,
            'mgtPrescriptionQueue' => $prescriptionQueue,
            'mgtRecentTransactions' => $recentTransactions,
        ];
    }

    /**
     * Mengambil data khusus dashboard Resepsionis dari database.
     */
    private function getResepsionisData(): array
    {
        $today = Carbon::today()->toDateString();

        // 1. Pasien Check-in Hari Ini
        $rcpCheckinCount = DB::table('pasien')->whereDate('tanggal_pendaftaran', $today)->count();
        if ($rcpCheckinCount === 0 && Schema::hasTable('antrian')) {
            $rcpCheckinCount = Antrian::whereHas('jadwalDokter', fn($q) => $q->whereDate('tanggal', $today))
                ->whereIn('status', ['dipanggil', 'sedang_dilayani', 'selesai'])
                ->count();
        }

        // 2. Antrian Walk-in Aktif (live)
        $rcpActiveQueue = 0;
        if (Schema::hasTable('antrian')) {
            $rcpActiveQueue = Antrian::whereHas('jadwalDokter', fn($q) => $q->whereDate('tanggal', $today))
                ->whereIn('status', ['menunggu', 'skrining', 'dipanggil'])
                ->count();
        }

        // 3. Janji Temu Hari Ini
        $rcpTodayAppointments = DB::table('pasien')->whereDate('tanggal_pendaftaran', $today)->count();
        if (Schema::hasTable('antrian')) {
            $rcpTodayAppointments += Antrian::whereHas('jadwalDokter', fn($q) => $q->whereDate('tanggal', $today))->count();
        }

        // 4. Antrian Terbaru (live dari database)
        $rcpLatestQueue = [];
        if (Schema::hasTable('antrian')) {
            $rcpLatestQueue = Antrian::with(['pasien:id,nama_lengkap', 'poli:id,nama_poli'])
                ->whereHas('jadwalDokter', fn($q) => $q->whereDate('tanggal', $today))
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($q) {
                    return [
                        'id' => $q->id,
                        'nomor_antrian' => $q->nomor_antrian,
                        'nama' => $q->pasien->nama_lengkap ?? 'Pasien Walk-in',
                        'poli' => $q->poli->nama_poli ?? 'Poli Umum',
                        'status' => $q->status ?? 'menunggu',
                    ];
                })
                ->toArray();
        }

        return [
            'rcpCheckinCount' => (string) $rcpCheckinCount,
            'rcpActiveQueue' => (string) $rcpActiveQueue,
            'rcpTodayAppointments' => (string) $rcpTodayAppointments,
            'rcpLatestQueue' => $rcpLatestQueue,
        ];
    }

    /**
     * Mengambil data khusus dashboard Kasir / Billing dari database.
     */
    private function getKasirData(): array
    {
        $today = Carbon::today();

        $kasirTodayRevenue = Tagihan::where('status', 'lunas')
            ->whereDate('waktu_pembayaran', $today)
            ->sum('total_tagihan');

        $kasirPendingCount = Tagihan::where('status', 'belum_lunas')->count();
        $kasirPendingAmount = Tagihan::where('status', 'belum_lunas')->sum('total_tagihan');
        $kasirPaidTodayCount = Tagihan::where('status', 'lunas')
            ->whereDate('waktu_pembayaran', $today)
            ->count();

        $kasirInvoices = Tagihan::with(['pasien:id,nama_lengkap,nomor_rekam_medis,nik,penjamin,no_hp'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($inv) {
                return [
                    'id' => $inv->id,
                    'no_invoice' => $inv->no_invoice,
                    'nama_pasien' => $inv->pasien->nama_lengkap ?? 'Pasien Umum',
                    'pasien_id' => $inv->pasien_id,
                    'no_rm' => $inv->pasien->nomor_rekam_medis ?? '-',
                    'nik' => $inv->pasien->nik ?? '-',
                    'penjamin' => $inv->pasien->penjamin ?? 'Umum',
                    'layanan' => $inv->layanan,
                    'subtotal' => (int) $inv->subtotal,
                    'diskon' => (int) $inv->diskon,
                    'pajak' => (int) $inv->pajak,
                    'total_tagihan' => (int) $inv->total_tagihan,
                    'jumlah_dibayar' => (int) $inv->jumlah_dibayar,
                    'kembalian' => (int) $inv->kembalian,
                    'status' => $inv->status,
                    'metode_pembayaran' => $inv->metode_pembayaran,
                    'waktu_pembayaran' => $inv->waktu_pembayaran ? $inv->waktu_pembayaran->toIso8601String() : null,
                    'rincian' => $inv->rincian ?? [],
                    'catatan' => $inv->catatan,
                    'created_at' => $inv->created_at->toIso8601String(),
                ];
            });

        $kasirPatientsList = Pasien::select('id', 'nama_lengkap', 'nomor_rekam_medis', 'nik', 'penjamin')
            ->orderBy('nama_lengkap')
            ->limit(50)
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'nama_lengkap' => $p->nama_lengkap,
                    'no_rm' => $p->nomor_rekam_medis ?? '-',
                    'nik' => $p->nik ?? '-',
                    'penjamin' => $p->penjamin ?? 'Umum',
                ];
            });

        return [
            'kasirTodayRevenue' => (int) $kasirTodayRevenue,
            'kasirPendingCount' => (int) $kasirPendingCount,
            'kasirPendingAmount' => (int) $kasirPendingAmount,
            'kasirPaidTodayCount' => (int) $kasirPaidTodayCount,
            'kasirInvoices' => $kasirInvoices,
            'kasirPatientsList' => $kasirPatientsList,
        ];
    }

    /**
     * Mengambil data khusus dashboard Apoteker / Farmasi dari database.
     * 100% data real dari tabel reseps, resep_details, obats, pasien, dokters.
     */
    private function getApotekerData(): array
    {
        $today = Carbon::today();

        // 1. Resep Masuk Hari Ini & Breakdown Status
        $aptTodayReseps = Resep::whereDate('created_at', $today)->count();
        $aptPendingReseps = Resep::whereDate('created_at', $today)
            ->where('status', 'menunggu_ditebus')->count();
        $aptPreparingReseps = Resep::whereDate('created_at', $today)
            ->whereIn('status', ['sedang_diproses', 'disiapkan'])->count();
        $aptCompletedReseps = Resep::whereDate('created_at', $today)
            ->where('status', 'sudah_ditebus')->count();

        // 2. Stok Kritis & Menipis (obat dengan stok <= 20)
        $aptLowStockList = Obat::where('stok', '<=', 20)
            ->orderBy('stok', 'asc')
            ->limit(10)
            ->get(['id', 'kode_obat', 'nama_obat', 'stok', 'bentuk_sediaan', 'harga'])
            ->map(function ($obat) {
                return [
                    'id' => $obat->id,
                    'kode_obat' => $obat->kode_obat,
                    'nama' => $obat->nama_obat,
                    'stok' => (int) $obat->stok,
                    'bentuk_sediaan' => $obat->bentuk_sediaan,
                    'harga' => (int) $obat->harga,
                    'level' => $obat->stok <= 0 ? 'habis' : 'menipis',
                ];
            });

        // 3. Transaksi Harian (7 Hari Terakhir)
        $dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        $aptWeeklyTransactions = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $count = Resep::whereDate('created_at', $date)->count();
            $aptWeeklyTransactions[] = [
                'day' => $dayNames[$date->dayOfWeek],
                'date' => $date->toDateString(),
                'count' => $count,
            ];
        }
        $aptTodayProcessed = Resep::whereDate('updated_at', $today)
            ->where('status', 'sudah_ditebus')->count();

        // 4. Antrian Resep Masuk (semua resep terbaru dengan detail obat)
        $aptPrescriptionQueue = Resep::with([
            'pasien:id,nama_lengkap,nomor_rekam_medis',
            'dokter:id,nama_lengkap,spesialisasi',
            'details.obat:id,kode_obat,nama_obat,bentuk_sediaan,stok,harga',
        ])
            ->orderByDesc('created_at')
            ->limit(20)
            ->get()
            ->map(function ($resep) {
                return [
                    'id' => $resep->id,
                    'no_resep' => $resep->no_resep,
                    'pasien_id' => $resep->pasien_id,
                    'nama_pasien' => $resep->pasien->nama_lengkap ?? 'Pasien Umum',
                    'no_rm' => $resep->pasien->nomor_rekam_medis ?? '-',
                    'dokter' => $resep->dokter
                        ? ($resep->dokter->spesialisasi
                            ? $resep->dokter->nama_lengkap . ', ' . $resep->dokter->spesialisasi
                            : $resep->dokter->nama_lengkap)
                        : 'Dokter Jaga',
                    'jumlah_item' => $resep->details->count(),
                    'status' => $resep->status ?? 'menunggu_ditebus',
                    'created_at' => $resep->created_at->toIso8601String(),
                    'details' => $resep->details->map(function ($d) {
                        return [
                            'id' => $d->id,
                            'obat_id' => $d->obat_id,
                            'nama_obat' => $d->obat->nama_obat ?? 'Obat',
                            'kode_obat' => $d->obat->kode_obat ?? '-',
                            'stok_tersedia' => (int) ($d->obat->stok ?? 0),
                            'harga_satuan' => (int) ($d->obat->harga ?? 0),
                            'aturan_pakai' => $d->aturan_pakai,
                            'jumlah_dosis' => (int) $d->jumlah_dosis,
                            'catatan' => $d->catatan,
                        ];
                    }),
                ];
            });

        // 5. Riwayat Penebusan Terakhir (sudah_ditebus)
        $aptRecentTransactions = Resep::with('pasien:id,nama_lengkap')
            ->where('status', 'sudah_ditebus')
            ->orderByDesc('updated_at')
            ->limit(10)
            ->get()
            ->map(function ($resep) {
                return [
                    'id' => $resep->id,
                    'no_resep' => $resep->no_resep,
                    'nama_pasien' => $resep->pasien->nama_lengkap ?? 'Pasien Umum',
                    'waktu' => Carbon::parse($resep->updated_at)->format('H:i') . ' WIB',
                    'tanggal' => Carbon::parse($resep->updated_at)->format('d M Y'),
                    'status' => 'Selesai',
                ];
            });

        // 6. Master Obat Katalog untuk Modal Kelola Stok & Pencarian Penuh (Limit 50 terpopuler)
        $aptObatMasterList = Obat::orderBy('nama_obat')
            ->limit(50)
            ->get(['id', 'kode_obat', 'nama_obat', 'bentuk_sediaan', 'kemasan', 'stok', 'harga'])
            ->map(function ($o) {
                return [
                    'id' => $o->id,
                    'kode_obat' => $o->kode_obat,
                    'nama_obat' => $o->nama_obat,
                    'bentuk_sediaan' => $o->bentuk_sediaan ?? 'Tablet',
                    'kemasan' => $o->kemasan ?? 'Pcs',
                    'stok' => (int) $o->stok,
                    'harga' => (int) $o->harga,
                    'status_stok' => $o->stok <= 0 ? 'Habis' : ($o->stok <= 20 ? 'Menipis' : 'Aman'),
                ];
            });

        return [
            'aptTodayReseps' => (int) $aptTodayReseps,
            'aptPendingReseps' => (int) $aptPendingReseps,
            'aptPreparingReseps' => (int) $aptPreparingReseps,
            'aptCompletedReseps' => (int) $aptCompletedReseps,
            'aptLowStockList' => $aptLowStockList,
            'aptWeeklyTransactions' => $aptWeeklyTransactions,
            'aptTodayProcessed' => (int) $aptTodayProcessed,
            'aptPrescriptionQueue' => $aptPrescriptionQueue,
            'aptRecentTransactions' => $aptRecentTransactions,
            'aptObatMasterList' => $aptObatMasterList,
        ];
    }

    /**
     * Data khusus dashboard Perawat: shift hari ini, pasien dirawat, dan tugas keperawatan.
     */
    private function getPerawatData(): array
    {
        $user = session('simrs_user', []);
        $perawat = \App\Models\Perawat::with('ruangan:id,nama_ruangan')->find(data_get($user, 'id'));

        // 1. Jadwal shift hari ini
        $shiftHariIni = null;
        if ($perawat) {
            $shiftHariIni = \App\Models\JadwalShiftPerawat::where('perawat_id', $perawat->id)
                ->whereDate('tanggal', Carbon::today())
                ->with('bangsal:id,nama_bangsal')
                ->orderBy('jam_mulai')
                ->first();
        }

        $shiftLabel = $shiftHariIni
            ? ucfirst($shiftHariIni->jenis_shift).' • '.$shiftHariIni->bangsal->nama_bangsal
            : null;
        $jamShift = $shiftHariIni
            ? Carbon::parse($shiftHariIni->jam_mulai)->format('H:i').' – '.Carbon::parse($shiftHariIni->jam_selesai)->format('H:i').' WIB'
            : null;

        // 2. Pasien rawat inap (dirawat hari ini)
        $pasienRawatinapCount = \App\Models\RawatInapAdmission::whereDate('tanggal_masuk', '<=', Carbon::today())
            ->where(fn ($q) => $q->whereNull('tanggal_keluar_aktual')->orWhereDate('tanggal_keluar_aktual', '>=', Carbon::today()))
            ->count();

        // 3. Tugas keperawatan: rekam medis yang belum difinalisasi / pasien rawat inap aktif
        $tugasPerawatan = \App\Models\RekamMedis::with(['pasien:id,nama_lengkap', 'poli:id,nama_poli'])
            ->whereDate('created_at', Carbon::today())
            ->where('status', '!=', 'final')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(function ($rm) {
                return [
                    'task' => substr($rm->keluhan_utama ?: 'Perawatan pasien', 0, 60),
                    'desc' => ($rm->pasien->nama_lengkap ?? 'Pasien').' • '.($rm->poli->nama_poli ?? '-'),
                    'time' => $rm->created_at->format('H:i'),
                    'status' => false,
                ];
            });

        // 4. Pasien yang belum probing vitals (status draft dari rawat inap aktif)
        $pasienPerluPerhatian = \App\Models\RawatInapAdmission::whereDate('tanggal_masuk', '<=', Carbon::today())
            ->where(fn ($q) => $q->whereNull('tanggal_keluar_aktual')->orWhereDate('tanggal_keluar_aktual', '>=', Carbon::today()))
            ->where('status', '!=', 'pulang_sembuh')
            ->count();

        return [
            'prjShiftLabel' => $shiftLabel,
            'prjJamShift' => $jamShift,
            'prjTotalPasien' => (int) $pasienRawatinapCount,
            'prjPerluPerhatian' => (int) $pasienPerluPerhatian,
            'prjTugasPerawatan' => $tugasPerawatan,
        ];
    }

    /**
     * Data khusus dashboard Dokter: antrian pasien hari ini, jadwal praktik, dan statistik.
     */
    private function getDokterData(): array
    {
        $user = session('simrs_user', []);
        $dokter = \App\Models\Dokter::find(data_get($user, 'id'));
        $today = Carbon::today();

        // 1. Antrian pasien untuk dokter ini (hari ini)
        $antrianHariIni = [];
        $jadwalIds = [];
        if ($dokter) {
            $jadwalHariIni = \App\Models\JadwalDokter::where('dokter_id', $dokter->id)
                ->whereDate('tanggal', $today)
                ->pluck('id');
            $jadwalIds = $jadwalHariIni->toArray();

            $antrianHariIni = Antrian::with(['pasien:id,nama_lengkap', 'poli:id,nama_poli'])
                ->where('dokter_id', $dokter->id)
                ->whereDate('created_at', $today)
                ->orderBy('angka_antrian')
                ->get()
                ->map(function ($a) {
                    return [
                        'nomor_antrian' => $a->nomor_antrian,
                        'nama' => $a->pasien->nama_lengkap ?? '-',
                        'poli' => $a->poli->nama_poli ?? '-',
                        'time' => $a->created_at->format('H:i'),
                        'status' => $a->status,
                    ];
                })
                ->values()
                ->toArray();
        }

        // 2. Jadwal praktik hari ini
        $jadwalPraktik = \App\Models\JadwalDokter::where('dokter_id', $dokter?->id)
            ->whereDate('tanggal', $today)
            ->orderBy('jam_mulai')
            ->get(['id', 'tanggal', 'jam_mulai', 'jam_selesai', 'status', 'kuota_maksimal'])
            ->map(function ($j) {
                return [
                    'jam' => Carbon::parse($j->jam_mulai)->format('H:i').' – '.Carbon::parse($j->jam_selesai)->format('H:i'),
                    'status' => $j->status,
                    'kuota' => $j->kuota_maksimal,
                ];
            });

        // 3. Jumlah pasien & selesai hari ini
        $jmlPasienHariIni = count($antrianHariIni);
        $jmlSelesai = collect($antrianHariIni)->whereIn('status', ['selesai', 'sedang_dilayani'])->count();

        return [
            'dktNama' => $dokter?->nama_lengkap,
            'dktAntrianHariIni' => $antrianHariIni,
            'dktJadwalPraktik' => $jadwalPraktik,
            'dktJmlPasienHariIni' => $jmlPasienHariIni,
            'dktJmlSelesai' => $jmlSelesai,
            'dktJadwalIds' => $jadwalIds,
        ];
    }

    /**
     * Format angka menjadi Rupiah, mis. Rp 1.245.000.
     */
    private function formatRupiah(float|int $value): string
    {
        if ($value >= 1000000000) {
            return 'Rp ' . number_format($value / 1000000000, 1, ',', '.') . 'M';
        }
        if ($value >= 1000000) {
            return 'Rp ' . number_format($value / 1000000, 1, ',', '.') . 'M';
        }
        if ($value >= 1000) {
            return 'Rp ' . number_format($value / 1000, 1, ',', '.') . 'K';
        }

        return 'Rp ' . number_format($value, 0, ',', '.');
    }

    /**
     * Hitung tren kunjungan/pendaftaran: membandingkan hari ini dengan kemarin untuk
     * antrian, atau bulan ini vs bulan lalu untuk pendaftaran pasien.
     */
    private function computeTrend(string $table, string $column, string $kind = 'appointment'): string
    {
        if (! Schema::hasTable($table)) {
            return $kind === 'registered' ? 'Belum ada data' : 'Belum ada data';
        }

        if ($kind === 'registered') {
            $current = DB::table($table)->whereMonth($column, now()->month)
                ->whereYear($column, now()->year)->count();
            $previous = DB::table($table)->whereMonth($column, now()->subMonthNoOverflow()->month)
                ->whereYear($column, now()->subMonthNoOverflow()->year)->count();

            if ($previous === 0) {
                return $current > 0 ? 'Baru bulan ini' : 'Belum ada data';
            }

            return (($current - $previous) / $previous * 100) >= 0
                ? '+'.round(($current - $previous) / $previous * 100, 0).'% vs last month'
                : round(($current - $previous) / $previous * 100, 0).'% vs last month';
        }

        // appointment kind
        $todayCount = DB::table('antrian')->whereDate($column, Carbon::today())->count();
        $yesterdayCount = DB::table('antrian')->whereDate($column, Carbon::yesterday())->count();

        if ($yesterdayCount === 0) {
            return 'Baru hari ini';
        }

        $diff = $todayCount - $yesterdayCount;

        return ($diff >= 0 ? '+'.$diff : $diff).' vs yesterday';
    }

    /**
     * Hitung tren pendapatan: bulan ini vs bulan lalu dari tagihan lunas.
     */
    private function computeRevenueTrend(): string
    {
        $current = Tagihan::where('status', 'lunas')
            ->whereMonth('waktu_pembayaran', now()->month)
            ->whereYear('waktu_pembayaran', now()->year)
            ->sum('total_tagihan');
        $previous = Tagihan::where('status', 'lunas')
            ->whereMonth('waktu_pembayaran', now()->subMonthNoOverflow()->month)
            ->whereYear('waktu_pembayaran', now()->subMonthNoOverflow()->year)
            ->sum('total_tagihan');

        if ($previous <= 0) {
            return $current > 0 ? 'Baru bulan ini' : 'Belum ada data';
        }

        $pct = round(($current - $previous) / $previous * 100, 0);

        return $pct >= 0 ? '+'.$pct.'% vs last month' : $pct.'% vs last month';
    }
}

