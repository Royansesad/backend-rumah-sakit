<?php

namespace App\Http\Controllers;

use App\Models\Antrian;
use App\Models\AuditLog;
use App\Models\JadwalDokter;
use App\Models\Pasien;
use App\Models\Poli;
use App\Models\RekamMedis;
use App\Models\Tagihan;
use App\Services\AntrianService;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PatientPortalController extends Controller
{
    public function __construct(
        protected AntrianService $antrianService
    ) {}

    /**
     * Ambil entitas pasien yang sedang login dari session.
     */
    private function pasienSession(): Pasien
    {
        $user = session('simrs_user');

        return Pasien::findOrFail(data_get($user, 'id'));
    }

    /**
     * Halaman Beranda Portal Pasien.
     */
    public function portal(): Response
    {
        $pasien = $this->pasienSession();

        $bookingAktif = Antrian::with(['poli:id,nama_poli', 'dokter:id,nama_lengkap,spesialisasi', 'jadwalDokter:id,tanggal,jam_mulai,jam_selesai'])
            ->where('pasien_id', $pasien->id)
            ->where('sumber', Antrian::SUMBER_ONLINE)
            ->where('status', '!=', 'dibatalkan')
            ->orderByDesc('created_at')
            ->take(5)
            ->get()
            ->map(fn ($a) => $this->mapAntrian($a));

        $rekamMedisTerbaru = $pasien->rekamMedis()
            ->with(['poli:id,nama_poli', 'dokter:id,nama_lengkap,spesialisasi'])
            ->where('status', 'final')
            ->orderByDesc('finalized_at')
            ->take(5)
            ->get()
            ->map(fn ($rm) => $this->mapRekamMedis($rm))
            ->values();

        return Inertia::render('portal/dashboard', [
            'user' => session('simrs_user'),
            'role' => 'pasien',
            'pasien' => $pasien,
            'jumlahRekamMedis' => $pasien->rekamMedis()->where('status', 'final')->count(),
            'jumlahKunjungan' => Antrian::where('pasien_id', $pasien->id)->count(),
            'jumlahTagihan' => Tagihan::where('pasien_id', $pasien->id)->count(),
            'bookingAktif' => $bookingAktif,
            'rekamMedisTerbaru' => $rekamMedisTerbaru,
        ]);
    }

    /**
     * Daftar Rekam Medis (hanya status final) milik pasien login.
     */
    public function rekamMedis(): Response
    {
        $pasien = $this->pasienSession();

        $rekamMedis = $pasien->rekamMedis()
            ->with(['poli:id,nama_poli', 'dokter:id,nama_lengkap,spesialisasi'])
            ->where('status', 'final')
            ->orderByDesc('finalized_at')
            ->get()
            ->map(fn ($rm) => $this->mapRekamMedis($rm));

        return Inertia::render('portal/rekam-medis', [
            'user' => session('simrs_user'),
            'role' => 'pasien',
            'rekamMedis' => $rekamMedis,
        ]);
    }

    /**
     * Detail Rekam Medis milik pasien login (termasuk resep digital).
     */
    public function rekamMedisShow(string $id): Response
    {
        $pasien = $this->pasienSession();

        $rm = $pasien->rekamMedis()
            ->with([
                'poli:id,nama_poli',
                'dokter:id,nama_lengkap,spesialisasi',
                'perawat:id,nama_lengkap',
                'resep.details.obat:id,kode_obat,nama_obat,bentuk_sediaan',
            ])
            ->where('status', 'final')
            ->findOrFail($id);

        return Inertia::render('portal/rekam-medis-detail', [
            'user' => session('simrs_user'),
            'role' => 'pasien',
            'rekamMedis' => $this->mapRekamMedisDetail($rm),
        ]);
    }

    /**
     * Riwayat Kunjungan pasien (rawat jalan, rawat inap, dan tagihan).
     */
    public function riwayat(): Response
    {
        $pasien = $this->pasienSession();

        $kunjunganRawatJalan = Antrian::with(['poli:id,nama_poli', 'dokter:id,nama_lengkap,spesialisasi', 'jadwalDokter:id,tanggal'])
            ->where('pasien_id', $pasien->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($a) => $this->mapAntrian($a));

        $rawatInap = $pasien->rawatInapAdmissions()
            ->with(['bangsal:id,nama_bangsal', 'ruangan:id,nama_ruangan', 'dpjp:id,nama_lengkap'])
            ->orderByDesc('tanggal_masuk')
            ->get()
            ->map(function ($adm) {
                return [
                    'id' => $adm->id,
                    'nomor_admission' => $adm->nomor_admission,
                    'tanggal_masuk' => $adm->tanggal_masuk->format('d M Y H:i'),
                    'tanggal_keluar' => $adm->tanggal_keluar_aktual?->format('d M Y H:i'),
                    'bangsal' => $adm->bangsal->nama_bangsal ?? '-',
                    'ruangan' => $adm->ruangan->nama_ruangan ?? '-',
                    'dpjp' => $adm->dpjp->nama_lengkap ?? '-',
                    'status' => $adm->status,
                    'alasan_masuk' => $adm->alasan_masuk,
                    'ringkasan_pulang' => $adm->ringkasan_pulang,
                ];
            });

        $tagihan = Tagihan::where('pasien_id', $pasien->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($t) {
                return [
                    'id' => $t->id,
                    'no_invoice' => $t->no_invoice,
                    'layanan' => $t->layanan,
                    'total_tagihan' => (int) $t->total_tagihan,
                    'jumlah_dibayar' => (int) $t->jumlah_dibayar,
                    'status' => $t->status,
                    'metode_pembayaran' => $t->metode_pembayaran,
                    'waktu_pembayaran' => $t->waktu_pembayaran?->format('d M Y H:i'),
                    'created_at' => $t->created_at->format('d M Y H:i'),
                    'rincian' => $t->rincian ?? [],
                ];
            });

        return Inertia::render('portal/riwayat', [
            'user' => session('simrs_user'),
            'role' => 'pasien',
            'pasien' => $pasien,
            'kunjunganRawatJalan' => $kunjunganRawatJalan,
            'rawatInap' => $rawatInap,
            'tagihan' => $tagihan,
        ]);
    }

    /**
     * Halaman Booking Online: daftar jadwal dokter tersedia & booking milik pasien.
     */
    public function booking(Request $request): Response
    {
        $pasien = $this->pasienSession();

        $poliList = Poli::select('id', 'nama_poli')->get();

        $poliId = $request->query('poli_id');
        $tanggal = $request->query('tanggal');

        $jadwalTersedia = JadwalDokter::with(['dokter:id,nama_lengkap,spesialisasi', 'poli:id,nama_poli', 'ruangan:id,nama_ruangan'])
            ->withCount(['antrian as antrian_aktif_count' => fn($q) => $q->where('status', '!=', 'dibatalkan')])
            ->where('status', 'tersedia')
            ->whereDate('tanggal', '>=', now()->toDateString())
            ->when($poliId, fn($q) => $q->where('poli_id', $poliId))
            ->when($tanggal, fn($q) => $q->whereDate('tanggal', $tanggal))
            ->orderBy('tanggal')
            ->orderBy('jam_mulai')
            ->get()
            ->map(function ($jadwal) {
                $jadwal->sisa_kuota = max(0, $jadwal->kuota_maksimal - $jadwal->antrian_aktif_count);
                $jadwal->tanggal_label = $jadwal->tanggal->format('d M Y');
                $jadwal->jam_label = date('H:i', strtotime($jadwal->jam_mulai)).' - '.date('H:i', strtotime($jadwal->jam_selesai));

                return $jadwal;
            })
            ->filter(fn ($jadwal) => $jadwal->sisa_kuota > 0)
            ->values();

        $bookingSaya = Antrian::with(['poli:id,nama_poli', 'dokter:id,nama_lengkap,spesialisasi', 'jadwalDokter:id,tanggal,jam_mulai,jam_selesai'])
            ->where('pasien_id', $pasien->id)
            ->where('sumber', Antrian::SUMBER_ONLINE)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($a) => $this->mapAntrian($a));

        return Inertia::render('portal/booking', [
            'user' => session('simrs_user'),
            'role' => 'pasien',
            'pasien' => $pasien,
            'poliList' => $poliList,
            'jadwalTersedia' => $jadwalTersedia,
            'bookingSaya' => $bookingSaya,
            'filters' => ['poli_id' => $poliId, 'tanggal' => $tanggal],
        ]);
    }

    /**
     * Proses membuat booking online.
     */
    public function bookingStore(Request $request): RedirectResponse
    {
        $request->validate([
            'jadwal_dokter_id' => 'required|uuid|exists:jadwal_dokter,id',
            'tipe_pasien' => 'nullable|in:umum,bpjs,prioritas',
        ]);

        $pasien = $this->pasienSession();

        try {
            $antrian = $this->antrianService->bookingAntrian([
                'jadwal_dokter_id' => $request->jadwal_dokter_id,
                'pasien_id' => $pasien->id,
                'tipe_pasien' => $request->tipe_pasien ?? 'umum',
            ]);

            AuditLog::create([
                'pembuat_id' => $pasien->id,
                'pembuat_type' => 'pasien',
                'modul' => 'booking',
                'aksi' => 'BOOKING_ANTRIAN',
                'data_sesudah' => ['description' => "Pasien {$pasien->nama_lengkap} melakukan booking online", 'nomor_antrian' => $antrian->nomor_antrian],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'target_label' => 'Antrian',
                'target_id' => $antrian->nomor_antrian,
            ]);

            return redirect()->route('portal.booking')
                ->with('success', "Booking berhasil! Nomor antrian Anda: {$antrian->nomor_antrian}");
        } catch (Exception $e) {
            return back()->withErrors(['jadwal_dokter_id' => $e->getMessage()]);
        }
    }

    /**
     * Batalkan booking online milik pasien login.
     */
    public function bookingCancel(Request $request, string $id): RedirectResponse
    {
        $pasien = $this->pasienSession();

        $antrian = Antrian::where('pasien_id', $pasien->id)
            ->where('sumber', Antrian::SUMBER_ONLINE)
            ->findOrFail($id);

        if (in_array($antrian->status, ['selesai', 'sedang_dilayani', 'dilewati', 'dibatalkan'])) {
            return back()->withErrors(['status' => 'Booking tidak dapat dibatalkan pada status saat ini.']);
        }

        $antrian->update(['status' => 'dibatalkan']);

        AuditLog::create([
            'pembuat_id' => $pasien->id,
            'pembuat_type' => 'pasien',
            'modul' => 'booking',
            'aksi' => 'CANCEL_BOOKING',
            'data_sebelum' => ['description' => 'Booking dibatalkan oleh pasien', 'nomor_antrian' => $antrian->nomor_antrian],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'target_label' => 'Antrian',
            'target_id' => $antrian->nomor_antrian,
        ]);

        return redirect()->route('portal.booking')->with('success', 'Booking berhasil dibatalkan.');
    }

    /**
     * Mapping baris antrian untuk tampilan pasien.
     *
     * @return array<string, mixed>
     */
    private function mapAntrian(Antrian $antrian): array
    {
        return [
            'id' => $antrian->id,
            'nomor_antrian' => $antrian->nomor_antrian,
            'tanggal' => $antrian->jadwalDokter?->tanggal?->format('Y-m-d') ?? $antrian->created_at->format('Y-m-d'),
            'tanggal_label' => $antrian->jadwalDokter?->tanggal?->format('d M Y') ?? $antrian->created_at->format('d M Y'),
            'jam_mulai' => $antrian->jadwalDokter?->jam_mulai,
            'jam_selesai' => $antrian->jadwalDokter?->jam_selesai,
            'poli' => $antrian->poli->nama_poli ?? '-',
            'dokter' => $antrian->dokter->nama_lengkap ?? '-',
            'spesialisasi' => $antrian->dokter->spesialisasi ?? null,
            'status' => $antrian->status,
            'sumber' => $antrian->sumber,
            'tipe_pasien' => $antrian->tipe_pasien,
            'created_at' => $antrian->created_at->format('d M Y H:i'),
        ];
    }

    /**
     * Mapping ringkasan rekam medis untuk daftar.
     *
     * @return array<string, mixed>
     */
    private function mapRekamMedis(RekamMedis $rm): array
    {
        return [
            'id' => $rm->id,
            'keluhan_utama' => $rm->keluhan_utama,
            'diagnosis_deskripsi' => $rm->diagnosis_deskripsi,
            'icd10_code' => $rm->icd10_code,
            'status' => $rm->status,
            'poli' => $rm->poli->nama_poli ?? '-',
            'dokter' => $rm->dokter->nama_lengkap ?? '-',
            'spesialisasi' => $rm->dokter->spesialisasi ?? null,
            'finalized_at' => $rm->finalized_at?->format('d M Y H:i'),
            'created_at' => $rm->created_at->format('d M Y H:i'),
        ];
    }

    /**
     * Mapping detail rekam medis termasuk resep digital.
     *
     * @return array<string, mixed>
     */
    private function mapRekamMedisDetail(RekamMedis $rm): array
    {
        $detail = $this->mapRekamMedis($rm);

        $detail['sistol'] = $rm->sistol;
        $detail['diastol'] = $rm->diastol;
        $detail['suhu_tubuh'] = $rm->suhu_tubuh !== null ? (float) $rm->suhu_tubuh : null;
        $detail['denyut_nadi'] = $rm->denyut_nadi;
        $detail['spo2'] = $rm->spo2;
        $detail['kondisi_pasien'] = $rm->kondisi_pasien;
        $detail['catatan_keperawatan'] = $rm->catatan_keperawatan;
        $detail['catatan_dokter'] = $rm->catatan_dokter;
        $detail['perawat'] = $rm->perawat->nama_lengkap ?? null;
        $detail['resep'] = null;

        if ($rm->resep) {
            $detail['resep'] = [
                'id' => $rm->resep->id,
                'no_resep' => $rm->resep->no_resep,
                'status' => $rm->resep->status,
                'items' => $rm->resep->details->map(function ($d) {
                    return [
                        'nama_obat' => $d->obat->nama_obat ?? 'Obat',
                        'bentuk_sediaan' => $d->obat->bentuk_sediaan ?? '-',
                        'aturan_pakai' => $d->aturan_pakai,
                        'jumlah_dosis' => (int) $d->jumlah_dosis,
                        'catatan' => $d->catatan,
                    ];
                }),
            ];
        }

        return $detail;
    }
}
