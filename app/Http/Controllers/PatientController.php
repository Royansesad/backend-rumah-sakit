<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Pasien;
use App\Models\Poli;
use App\Models\Ruangan;
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
                    ->orWhere('nomor_rekam_medis', 'like', "%{$search}%")
                    ->orWhere('nomor_pendaftaran', 'like', "%{$search}%");
            });
        }

        $patients = $query->orderByDesc('created_at')->paginate(10);
        $poliList = Poli::select('id', 'nama_poli')->get();
        $ruanganList = Ruangan::select('id', 'nama_ruangan', 'tipe_ruangan')->get();

        return Inertia::render('pasien/index', [
            'patients' => $patients,
            'filters' => $request->only(['search']),
            'poliList' => $poliList,
            'ruanganList' => $ruanganList,
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
            'jenis_layanan' => 'nullable|in:rawat_jalan,rawat_inap,igd',
            'poli_id' => 'nullable|exists:poli,id',
            'ruangan_id' => 'nullable|exists:ruangan,id',
            'dokter_id' => 'nullable|exists:dokters,id',
            'penjamin' => 'nullable|in:umum,bpjs,asuransi',
            'nomor_penjamin' => 'nullable|string|max:50',
            'prioritas' => 'nullable|in:normal,urgent,emergency',
            'keluhan' => 'nullable|string',
        ]);

        $noRm = 'RM-'.date('Y').'-'.str_pad((string) rand(1, 9999), 4, '0', STR_PAD_LEFT);

        $currentUser = session('simrs_user');
        $currentRole = session('simrs_role');

        $data = [
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
        ];

        if ($request->filled('jenis_layanan')) {
            $jenisLayanan = $request->jenis_layanan;
            $data['jenis_layanan'] = $jenisLayanan;
            $data['status_pendaftaran'] = 'menunggu';
            $data['nomor_pendaftaran'] = $this->generateNomorPendaftaran($jenisLayanan);
            $data['tanggal_pendaftaran'] = now()->toDateString();

            // Auto-assign Poli jika rawat jalan & poli_id kosong
            if ($jenisLayanan === 'rawat_jalan') {
                $data['poli_id'] = $request->poli_id ?? Poli::first()?->id;
            } else {
                $data['poli_id'] = $request->poli_id;
            }

            // Auto-assign Ruangan jika rawat inap & ruangan_id kosong
            if ($jenisLayanan === 'rawat_inap') {
                $data['ruangan_id'] = $request->ruangan_id ?? Ruangan::first()?->id;
            } else {
                $data['ruangan_id'] = $request->ruangan_id;
            }

            $data['dokter_id'] = $request->dokter_id;
            $data['penjamin'] = $request->penjamin ?? 'umum';
            $data['nomor_penjamin'] = $request->nomor_penjamin;
            $data['prioritas'] = $jenisLayanan === 'igd' ? ($request->prioritas ?? 'normal') : null;
            $data['keluhan'] = $request->keluhan;
            $data['didaftarkan_oleh'] = data_get($currentUser, 'id');
            $data['tipe_pendaftar'] = $currentRole;
        }

        $patient = Pasien::create($data);

        AuditLog::create([
            'pembuat_id' => data_get($currentUser, 'id'),
            'pembuat_type' => $currentRole,
            'modul' => 'pasien',
            'aksi' => 'CREATE_PATIENT',
            'data_sesudah' => json_encode(['description' => "Created patient {$noRm}", 'patient' => $patient]),
            'ip_address' => $request->ip(),
        ]);

        return redirect()->route('pasien.index');
    }

    private function generateNomorPendaftaran(string $jenisLayanan): string
    {
        $prefixMap = [
            'rawat_jalan' => 'RJ',
            'rawat_inap' => 'RI',
            'igd' => 'IGD',
        ];

        $prefix = $prefixMap[$jenisLayanan] ?? 'REG';
        $tanggal = now()->format('Ymd');
        $pattern = "{$prefix}-{$tanggal}-%";

        $lastNumber = Pasien::where('nomor_pendaftaran', 'like', $pattern)
            ->selectRaw('MAX(nomor_pendaftaran) as last_nomor')
            ->value('last_nomor');

        if ($lastNumber) {
            $parts = explode('-', $lastNumber);
            $sequence = (int) end($parts) + 1;
        } else {
            $sequence = 1;
        }

        return sprintf('%s-%s-%04d', $prefix, $tanggal, $sequence);
    }
}
