<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Pasien;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PatientController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Pasien::query();

        if ($request->has('search')) {
            $search = trim((string) $request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('nama_lengkap', 'like', "%{$search}%")
                    ->orWhere('nomor_rekam_medis', 'like', "%{$search}%");
            });
        }

        $patients = $query->paginate(10);

        return Inertia::render('pasien/index', [
            'patients' => $patients,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'nama_lengkap' => 'required|string|max:150',
            'nik' => 'nullable|string|max:20',
            'tanggal_lahir' => 'nullable|date',
            'jenis_kelamin' => 'nullable|in:Laki-laki,Perempuan',
            'golongan_darah' => 'nullable|in:A,B,AB,O,-',
            'alamat' => 'nullable|string',
            'no_hp' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:150',
        ]);

        $noRm = 'RM-'.date('Y').'-'.str_pad((string) rand(1, 9999), 4, '0', STR_PAD_LEFT);

        $patient = Pasien::create([
            'nomor_rekam_medis' => $noRm,
            'nama_lengkap' => $request->nama_lengkap,
            'nik' => $request->nik,
            'tanggal_lahir' => $request->tanggal_lahir,
            'jenis_kelamin' => $request->jenis_kelamin,
            'golongan_darah' => $request->golongan_darah,
            'alamat' => $request->alamat,
            'no_hp' => $request->no_hp,
            'email' => $request->email,
            'status_aktif' => 'aktif',
        ]);

        $currentUser = session('simrs_user');
        $currentRole = session('simrs_role');

        AuditLog::create([
            'pembuat_id' => data_get($currentUser, 'id'),
            'pembuat_type' => $currentRole,
            'modul' => 'pasien',
            'aksi' => 'CREATE_PATIENT',
            'data_sesudah' => json_encode(['description' => "Created patient {$noRm}"]),
            'ip_address' => $request->ip(),
        ]);

        return redirect()->back();
    }
}
