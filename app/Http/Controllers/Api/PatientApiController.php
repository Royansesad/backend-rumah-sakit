<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Pasien;
use App\Models\AuditLog;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

class PatientApiController extends Controller
{
    /**
     * GET /api/v1/pasien
     * Returns paginated list of patients with search filtering across ERD fields.
     */
    public function index(Request $request)
    {
        $query = Pasien::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('nama_lengkap', 'like', "%{$search}%")
                  ->orWhere('nomor_rekam_medis', 'like', "%{$search}%")
                  ->orWhere('nik', 'like', "%{$search}%")
                  ->orWhere('no_hp', 'like', "%{$search}%");
            });
        }

        $patients = $query->paginate($request->input('per_page', 15));

        return response()->json([
            'status' => 'success',
            'data' => $patients
        ]);
    }

    /**
     * GET /api/v1/pasien/{id}
     * Returns full patient record details.
     */
    public function show($id)
    {
        $patient = Pasien::find($id);

        if (!$patient) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pasien tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $patient
        ]);
    }

    /**
     * POST /api/v1/pasien
     * Creates new patient record with all ERD attributes.
     */
    public function store(Request $request)
    {
        $namaLengkap = $request->input('nama_lengkap', $request->input('name'));

        if (empty($namaLengkap)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Field nama_lengkap wajib diisi.'
            ], 422);
        }

        $noRm = $request->input('nomor_rekam_medis', $request->input('no_rm', 'RM-' . date('Y') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT)));

        $data = $request->except(['name', 'no_rm', '_token', '_method']);
        $data['id'] = (string) Str::uuid();
        $data['nama_lengkap'] = $namaLengkap;
        $data['nomor_rekam_medis'] = $noRm;

        if ($request->has('password') && !empty($request->password)) {
            $data['password'] = Hash::make($request->password);
        }

        $patient = Pasien::create($data);

        $currentUser = session('simrs_user');
        $currentRole = session('simrs_role');

        AuditLog::create([
            'pembuat_id' => data_get($currentUser, 'id'),
            'pembuat_type' => $currentRole ?? 'api',
            'modul' => 'api_pasien',
            'aksi' => 'CREATE_PATIENT',
            'data_sesudah' => json_encode(['patient_id' => $patient->id, 'no_rm' => $noRm, 'nama_lengkap' => $namaLengkap]),
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Data pasien berhasil ditambahkan',
            'data' => $patient
        ], 201);
    }
}
