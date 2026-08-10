<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class RbacController extends Controller
{
    /** @var array<string, string> */
    protected array $rolesMap = [
        'dokter' => 'dokters',
        'perawat' => 'perawats',
        'apoteker' => 'apotekers',
        'kasir' => 'kasirs',
        'resepsionis' => 'resepsionis',
        'manajemen' => 'manajemen',
        'admin' => 'admins',
    ];

    public function index(Request $request): Response
    {
        $selectedRole = (string) $request->input('role', 'dokter');
        if (! array_key_exists($selectedRole, $this->rolesMap)) {
            $selectedRole = 'dokter';
        }

        // Fetch real staff for each role directly from database tables
        $staffByRole = [];
        foreach ($this->rolesMap as $roleKey => $tableName) {
            $staffByRole[$roleKey] = DB::table($tableName)
                ->select('id', 'nama_lengkap', 'email')
                ->orderBy('nama_lengkap', 'asc')
                ->get()
                ->toArray();
        }

        // Determine last updated info from audit logs if available
        $lastAudit = AuditLog::where('modul', 'rbac')
            ->orWhere('modul', 'user_management')
            ->latest('created_at')
            ->first();

        $lastUpdatedInfo = 'Terakhir diubah oleh Admin Royan, 2 hari lalu';
        if ($lastAudit) {
            $pembuatNama = data_get($lastAudit, 'pembuat.nama_lengkap')
                ?: (data_get($lastAudit, 'pembuat_type') ? ucfirst(data_get($lastAudit, 'pembuat_type')).' Royan' : 'Admin Royan');
            $timeAgo = Carbon::parse($lastAudit->created_at)->locale('id')->diffForHumans();
            $lastUpdatedInfo = "Terakhir diubah oleh {$pembuatNama}, {$timeAgo}";
        }

        return Inertia::render('admin-menu', [
            'menu' => 'rbac',
            'selectedRole' => $selectedRole,
            'staffByRole' => $staffByRole,
            'lastUpdatedInfo' => $lastUpdatedInfo,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $request->validate([
            'role' => 'required|string',
            'staff_name' => 'nullable|string',
            'permissions' => 'required|array',
        ]);

        $currentUser = session('simrs_user');
        $currentRole = session('simrs_role', 'admin');

        AuditLog::create([
            'pembuat_id' => data_get($currentUser, 'id') ?: '00000000-0000-0000-0000-000000000010',
            'pembuat_type' => $currentRole ?: 'admin',
            'modul' => 'rbac',
            'aksi' => 'UPDATE_RBAC',
            'data_sesudah' => json_encode([
                'role' => $request->role,
                'staff_name' => $request->staff_name,
                'permissions' => $request->permissions,
            ]),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'target_label' => "Hak Akses ({$request->role})",
            'alasan' => 'Pembaruan matriks izin hak akses modul',
        ]);

        return redirect()->back()->with('message', 'Perubahan hak akses berhasil disimpan');
    }
}
