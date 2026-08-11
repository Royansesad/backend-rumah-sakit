<?php

namespace App\Http\Controllers;

use App\Models\Bangsal;
use App\Models\Bed;
use App\Models\Dokter;
use App\Models\Pasien;
use App\Models\RawatInapAdmission;
use App\Models\Ruangan;
use Inertia\Inertia;
use Inertia\Response;

class RawatInapWebController extends Controller
{
    public function index(): Response
    {
        $user = session('simrs_user', null);
        $role = session('simrs_role', 'admin');

        $pasiens = Pasien::select('id', 'nama_lengkap', 'nomor_rekam_medis', 'jenis_layanan', 'nik')
            ->orderBy('nama_lengkap')
            ->get();

        $dokters = Dokter::select('id', 'nama_lengkap', 'spesialisasi')
            ->orderBy('nama_lengkap')
            ->get();

        $bangsals = Bangsal::with(['beds' => function ($q) {
            $q->with(['ruangan', 'activeAdmission.pasien', 'activeAdmission.dpjp']);
        }])->where('is_aktif', true)->get();

        $ruangans = Ruangan::with(['beds' => function ($q) {
            $q->with(['bangsal', 'activeAdmission.pasien', 'activeAdmission.dpjp']);
        }])->get();

        $beds = Bed::with(['ruangan', 'bangsal', 'activeAdmission.pasien', 'activeAdmission.dpjp'])
            ->orderBy('nomor_bed')
            ->get();

        $admissions = RawatInapAdmission::with([
            'pasien',
            'bed.ruangan',
            'bed.bangsal',
            'ruangan',
            'bangsal',
            'dpjp',
            'riwayatPindah.bedAsal',
            'riwayatPindah.bedTujuan',
        ])
        ->orderByDesc('created_at')
        ->get();

        $totalBeds = $beds->count();
        $tersedia = $beds->where('status', 'tersedia')->count();
        $terisi = $beds->where('status', 'terisi')->count();
        $dibersihkan = $beds->where('status', 'dibersihkan')->count();
        $pemeliharaan = $beds->where('status', 'pemeliharaan')->count();
        $bor = $totalBeds > 0 ? round(($terisi / $totalBeds) * 100, 2) : 0;

        $statistik = [
            'total_bed' => $totalBeds,
            'tersedia' => $tersedia,
            'terisi' => $terisi,
            'dibersihkan' => $dibersihkan,
            'pemeliharaan' => $pemeliharaan,
            'bor_percentage' => $bor,
            'pasien_aktif' => $admissions->where('status', 'aktif')->count(),
        ];

        return Inertia::render('rawat-inap', [
            'user' => $user,
            'role' => $role,
            'pasiens' => $pasiens,
            'dokters' => $dokters,
            'bangsals' => $bangsals,
            'ruangans' => $ruangans,
            'beds' => $beds,
            'admissions' => $admissions,
            'statistik' => $statistik,
        ]);
    }
}
