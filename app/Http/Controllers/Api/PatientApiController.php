<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Pasien;
use App\Models\AuditLog;
use Illuminate\Support\Str;

class PatientApiController extends Controller
{
    public function index(Request $request)
    {
        $query = Pasien::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('no_rm', 'like', "%{$search}%");
        }

        $patients = $query->paginate($request->input('per_page', 15));

        return response()->json([
            'status' => 'success',
            'data' => $patients
        ]);
    }

    public function show($id)
    {
        $patient = Pasien::find($id);

        if (!$patient) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pasien tidak ditemukan'
            ], 4404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $patient
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'nik' => 'nullable|string|max:20',
            'jenis_kelamin' => 'nullable|string',
            'golongan_darah' => 'nullable|string',
            'no_hp' => 'nullable|string',
            'alamat' => 'nullable|string',
        ]);

        $noRm = 'RM-' . date('Y') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);

        $patient = Pasien::create(array_merge($validated, [
            'id' => Str::uuid(),
            'no_rm' => $noRm,
        ]));

        $currentUser = session('simrs_user');
        $currentRole = session('simrs_role');

        AuditLog::create([
            'pembuat_id' => data_get($currentUser, 'id'),
            'pembuat_type' => $currentRole ?? 'api',
            'modul' => 'api_pasien',
            'aksi' => 'CREATE_PATIENT',
            'data_sesudah' => json_encode(['patient_id' => $patient->id, 'no_rm' => $noRm]),
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Data pasien berhasil ditambahkan',
            'data' => $patient
        ], 201);
    }
}
