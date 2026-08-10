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

        if ($request->has('search') && !empty($request->input('search'))) {
            $search = trim((string) $request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('nama_lengkap', 'like', "%{$search}%")
                    ->orWhere('nomor_rekam_medis', 'like', "%{$search}%")
                    ->orWhere('nomor_pendaftaran', 'like', "%{$search}%")
                    ->orWhere('nik', 'like', "%{$search}%")
                    ->orWhere('alamat', 'like', "%{$search}%");
            });
        }

        if ($request->has('asuransi') && !empty($request->input('asuransi'))) {
            $asuransi = trim((string) $request->input('asuransi'));
            if ($asuransi === 'bpjs') {
                $query->where('penjamin', 'bpjs');
            } elseif ($asuransi === 'asuransi') {
                $query->where('penjamin', 'asuransi');
            } elseif ($asuransi === 'umum') {
                $query->where('penjamin', 'umum');
            }
        }

        if ($request->has('tanggal') && !empty($request->input('tanggal'))) {
            $tanggal = trim((string) $request->input('tanggal'));
            $query->whereDate('created_at', $tanggal);
        }

        $patients = $query->orderByDesc('created_at')->paginate(10)->withQueryString();
        $totalCount = Pasien::count();
        $poliList = Poli::select('id', 'nama_poli')->get();
        $ruanganList = Ruangan::select('id', 'nama_ruangan', 'tipe_ruangan')->get();

        return Inertia::render('pasien/index', [
            'patients' => $patients,
            'totalCount' => $totalCount,
            'filters' => $request->only(['search', 'asuransi', 'tanggal']),
            'poliList' => $poliList,
            'ruanganList' => $ruanganList,
        ]);
    }

    public function create(Request $request): Response
    {
        $poliList = Poli::select('id', 'nama_poli')->get();
        $ruanganList = Ruangan::select('id', 'nama_ruangan', 'tipe_ruangan')->get();

        return Inertia::render('pasien/pendaftaran', [
            'poliList' => $poliList,
            'ruanganList' => $ruanganList,
        ]);
    }

    public function checkNik(Request $request)
    {
        $nik = trim((string) $request->input('nik'));
        if (empty($nik)) {
            return response()->json(['exists' => false, 'patient' => null]);
        }

        $patient = Pasien::where('nik', $nik)->first(['id', 'nama_lengkap', 'nik', 'nomor_rekam_medis']);

        if ($patient) {
            return response()->json([
                'exists' => true,
                'patient' => $patient,
            ]);
        }

        return response()->json(['exists' => false, 'patient' => null]);
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
            'provinsi' => 'nullable|string|max:100',
            'kota_kabupaten' => 'nullable|string|max:100',
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
            'nama_kontak_darurat' => 'nullable|string|max:150',
            'no_hp_kontak_darurat' => 'nullable|string|max:20',
            'alergi' => 'nullable|string',
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
            'provinsi' => $request->provinsi,
            'kota_kabupaten' => $request->kota_kabupaten,
            'no_hp' => $request->no_hp,
            'email' => $request->email,
            'nama_kontak_darurat' => $request->nama_kontak_darurat,
            'no_hp_kontak_darurat' => $request->no_hp_kontak_darurat,
            'alergi' => $request->alergi,
            'status_aktif' => 'aktif',
        ];

        $jenisLayanan = $request->input('jenis_layanan') ?: 'rawat_jalan';
        $data['jenis_layanan'] = $jenisLayanan;
        $data['status_pendaftaran'] = 'menunggu';
        $data['nomor_pendaftaran'] = $this->generateNomorPendaftaran($jenisLayanan);
        $data['tanggal_pendaftaran'] = now()->toDateString();

        if ($jenisLayanan === 'rawat_jalan') {
            $data['poli_id'] = $request->poli_id ?? Poli::first()?->id;
        } else {
            $data['poli_id'] = $request->poli_id;
        }

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

        $patient = Pasien::create($data);

        AuditLog::create([
            'pembuat_id' => data_get($currentUser, 'id'),
            'pembuat_type' => $currentRole,
            'modul' => 'pasien',
            'aksi' => 'CREATE_PATIENT',
            'data_sesudah' => json_encode(['description' => "Created patient {$noRm}", 'patient' => $patient]),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'target_label' => 'Pasien',
            'target_id' => $noRm,
        ]);

        return redirect()->route('pasien.index');
    }

    public function update(Request $request, string $id): RedirectResponse
    {
        $patient = Pasien::findOrFail($id);

        $request->validate([
            'nama_lengkap' => 'required|string|max:150',
            'nik' => 'nullable|string|max:20',
            'tanggal_lahir' => 'nullable|date',
            'jenis_kelamin' => 'nullable|in:Laki-laki,Perempuan',
            'golongan_darah' => 'nullable|in:A,B,AB,O,-',
            'alamat' => 'nullable|string',
            'provinsi' => 'nullable|string|max:100',
            'kota_kabupaten' => 'nullable|string|max:100',
            'no_hp' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:150',
            'penjamin' => 'nullable|in:umum,bpjs,asuransi',
            'nomor_penjamin' => 'nullable|string|max:50',
            'nama_kontak_darurat' => 'nullable|string|max:150',
            'no_hp_kontak_darurat' => 'nullable|string|max:20',
            'alergi' => 'nullable|string',
            'status_aktif' => 'nullable|in:aktif,tidak_aktif',
        ]);

        $currentUser = session('simrs_user');
        $currentRole = session('simrs_role');

        $dataSebelum = $patient->toArray();

        $patient->update([
            'nama_lengkap' => $request->nama_lengkap,
            'nik' => $request->nik,
            'tanggal_lahir' => $request->tanggal_lahir,
            'jenis_kelamin' => $request->jenis_kelamin,
            'golongan_darah' => $request->golongan_darah,
            'alamat' => $request->alamat,
            'provinsi' => $request->provinsi,
            'kota_kabupaten' => $request->kota_kabupaten,
            'no_hp' => $request->no_hp,
            'email' => $request->email,
            'penjamin' => $request->penjamin ?? 'umum',
            'nomor_penjamin' => $request->nomor_penjamin,
            'nama_kontak_darurat' => $request->nama_kontak_darurat,
            'no_hp_kontak_darurat' => $request->no_hp_kontak_darurat,
            'alergi' => $request->alergi,
            'status_aktif' => $request->status_aktif ?? 'aktif',
        ]);

        AuditLog::create([
            'pembuat_id' => data_get($currentUser, 'id'),
            'pembuat_type' => $currentRole,
            'modul' => 'pasien',
            'aksi' => 'UPDATE_PATIENT',
            'data_sebelum' => json_encode($dataSebelum),
            'data_sesudah' => json_encode($patient->toArray()),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'target_label' => 'Pasien',
            'target_id' => $patient->nomor_rekam_medis ?? $id,
        ]);

        return redirect()->route('pasien.index');
    }

    public function destroy(string $id): RedirectResponse
    {
        $patient = Pasien::findOrFail($id);
        $noRm = $patient->nomor_rekam_medis;
        $currentUser = session('simrs_user');
        $currentRole = session('simrs_role');

        $patient->delete();

        AuditLog::create([
            'pembuat_id' => data_get($currentUser, 'id'),
            'pembuat_type' => $currentRole,
            'modul' => 'pasien',
            'aksi' => 'DELETE_PATIENT',
            'data_sebelum' => json_encode(['description' => "Deleted patient {$noRm}"]),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'target_label' => 'Pasien',
            'target_id' => $noRm,
        ]);

        return redirect()->route('pasien.index');
    }

    public function exportExcel(Request $request)
    {
        $query = Pasien::query();

        if ($request->has('search') && !empty($request->input('search'))) {
            $search = trim((string) $request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('nama_lengkap', 'like', "%{$search}%")
                    ->orWhere('nomor_rekam_medis', 'like', "%{$search}%")
                    ->orWhere('nomor_pendaftaran', 'like', "%{$search}%")
                    ->orWhere('nik', 'like', "%{$search}%")
                    ->orWhere('alamat', 'like', "%{$search}%");
            });
        }

        if ($request->has('asuransi') && !empty($request->input('asuransi'))) {
            $asuransi = trim((string) $request->input('asuransi'));
            if ($asuransi === 'bpjs') {
                $query->where('penjamin', 'bpjs');
            } elseif ($asuransi === 'asuransi') {
                $query->where('penjamin', 'asuransi');
            } elseif ($asuransi === 'umum') {
                $query->where('penjamin', 'umum');
            }
        }

        if ($request->has('tanggal') && !empty($request->input('tanggal'))) {
            $tanggal = trim((string) $request->input('tanggal'));
            $query->whereDate('created_at', $tanggal);
        }

        $patients = $query->orderByDesc('created_at')->get();

        $filename = 'data_pasien_'.date('Y-m-d_His').'.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($patients) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            fputcsv($file, [
                'No. RM',
                'Nama Pasien',
                'NIK',
                'Jenis Kelamin',
                'Tanggal Lahir',
                'No. HP',
                'Email',
                'Alamat',
                'Penjamin',
                'No. Penjamin',
                'Status Aktif',
                'Tanggal Registrasi',
            ]);

            foreach ($patients as $p) {
                $penjaminLabel = match ($p->penjamin) {
                    'bpjs' => 'BPJS Kesehatan',
                    'asuransi' => 'Asuransi Swasta',
                    default => 'Umum',
                };

                fputcsv($file, [
                    $p->nomor_rekam_medis ?? '-',
                    $p->nama_lengkap ?? '-',
                    $p->nik ? "'".$p->nik : '-',
                    $p->jenis_kelamin ?? '-',
                    $p->tanggal_lahir ? $p->tanggal_lahir->format('Y-m-d') : '-',
                    $p->no_hp ?? '-',
                    $p->email ?? '-',
                    $p->alamat ?? '-',
                    $penjaminLabel,
                    $p->nomor_penjamin ?? '-',
                    ucfirst($p->status_aktif ?? 'aktif'),
                    $p->created_at ? $p->created_at->format('Y-m-d H:i') : '-',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
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
