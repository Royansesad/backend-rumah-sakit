<?php

namespace App\Http\Controllers;

use App\Models\Dokter;
use App\Models\Icd10Code;
use App\Models\Obat;
use App\Models\Pasien;
use App\Models\Perawat;
use App\Models\Poli;
use App\Models\RekamMedis;
use App\Models\Resep;
use Inertia\Inertia;
use Inertia\Response;

class RmeWebController extends Controller
{
    public function index(): Response
    {
        $user = session('simrs_user', null);
        $role = session('simrs_role', 'admin');

        $pasiens = Pasien::select('id', 'nama_lengkap', 'nomor_rekam_medis', 'alergi', 'kondisi_terakhir')->get();
        $dokters = Dokter::select('id', 'nama_lengkap', 'spesialisasi')->get();
        $perawats = Perawat::select('id', 'nama_lengkap')->get();
        $polis = Poli::select('id', 'nama_poli')->get();
        $obats = Obat::with('unitFarmasi:id,nama_unit')->orderBy('nama_obat')->get();
        $icd10Codes = Icd10Code::orderBy('code')->take(50)->get();

        $rekamMedisList = RekamMedis::with([
            'pasien:id,nama_lengkap,nomor_rekam_medis,alergi,kondisi_terakhir',
            'dokter:id,nama_lengkap,spesialisasi',
            'perawat:id,nama_lengkap',
            'poli:id,nama_poli',
            'resep.details.obat',
        ])->orderByDesc('created_at')->get();

        $resepsList = Resep::with([
            'pasien:id,nama_lengkap,nomor_rekam_medis',
            'dokter:id,nama_lengkap,spesialisasi',
            'details.obat',
        ])->orderByDesc('created_at')->get();

        return Inertia::render('rme/index', [
            'user' => $user,
            'role' => $role,
            'pasiens' => $pasiens,
            'dokters' => $dokters,
            'perawats' => $perawats,
            'polis' => $polis,
            'obats' => $obats,
            'icd10Codes' => $icd10Codes,
            'rekamMedisList' => $rekamMedisList,
            'resepsList' => $resepsList,
        ]);
    }
}
