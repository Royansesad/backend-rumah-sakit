<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Pasien;
use App\Models\AuditLog;
use Illuminate\Support\Str;

class PatientController extends Controller
{
    public function index(Request $request)
    {
        $query = Pasien::query();

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('no_rm', 'like', "%{$search}%");
        }

        $patients = $query->paginate(10);

        return Inertia::render('pasien/index', [
            'patients' => $patients,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            // other validation
        ]);

        $noRm = 'RM-' . date('Y') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);

        $patient = Pasien::create([
            'id' => Str::uuid(),
            'no_rm' => $noRm,
            'name' => $request->name,
            // ...
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
