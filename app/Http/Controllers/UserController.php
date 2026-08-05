<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /** @var array<string, string> */
    protected array $rolesMap = [
        'admin' => 'admins',
        'dokter' => 'dokters',
        'perawat' => 'perawats',
        'apoteker' => 'apotekers',
        'kasir' => 'kasirs',
        'resepsionis' => 'resepsionis',
        'manajemen' => 'manajemen',
    ];

    public function index(Request $request): Response
    {
        $selectedRole = $request->input('role', 'admin');

        if (! array_key_exists($selectedRole, $this->rolesMap)) {
            $selectedRole = 'admin';
        }

        $users = DB::table($this->rolesMap[$selectedRole])->get();

        $counts = [];
        foreach ($this->rolesMap as $roleKey => $table) {
            $counts[$roleKey] = DB::table($table)->count();
        }

        return Inertia::render('users/index', [
            'users' => $users,
            'selectedRole' => $selectedRole,
            'counts' => $counts,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'role' => 'required|string|in:'.implode(',', array_keys($this->rolesMap)),
            'nama_lengkap' => 'required|string|max:150',
            'email' => 'required|email|max:150',
            'password' => 'required|min:6',
        ]);

        foreach ($this->rolesMap as $table) {
            if (DB::table($table)->where('email', $request->email)->exists()) {
                return back()->withErrors(['email' => 'Email sudah digunakan.']);
            }
        }

        $table = $this->rolesMap[$request->role];

        DB::table($table)->insert([
            'id' => (string) Str::uuid(),
            'nama_lengkap' => $request->nama_lengkap,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $currentUser = session('simrs_user');
        $currentRole = session('simrs_role');

        AuditLog::create([
            'pembuat_id' => data_get($currentUser, 'id'),
            'pembuat_type' => $currentRole,
            'modul' => 'user_management',
            'aksi' => 'CREATE_USER',
            'data_sesudah' => json_encode(['description' => "Created new {$request->role}"]),
            'ip_address' => $request->ip(),
        ]);

        return redirect()->back();
    }

    public function update(Request $request, string $role, string $id): RedirectResponse
    {
        if (! array_key_exists($role, $this->rolesMap)) {
            return back();
        }

        $table = $this->rolesMap[$role];

        $data = $request->only(['nama_lengkap', 'email', 'password', 'status_akun', 'shift']);

        if (isset($data['password']) && $data['password'] !== '') {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        if (isset($data['email'])) {
            foreach ($this->rolesMap as $otherTable) {
                if (
                    DB::table($otherTable)->where('email', $data['email'])->where('id', '!=', $id)->exists()
                ) {
                    return back()->withErrors(['email' => 'Email sudah digunakan.']);
                }
            }
        }

        $data['updated_at'] = now();

        DB::table($table)->where('id', $id)->update($data);

        $currentUser = session('simrs_user');
        $currentRole = session('simrs_role');

        AuditLog::create([
            'pembuat_id' => data_get($currentUser, 'id'),
            'pembuat_type' => $currentRole,
            'modul' => 'user_management',
            'aksi' => 'UPDATE_USER',
            'data_sesudah' => json_encode(['description' => "Updated {$role} ({$id})"]),
            'ip_address' => $request->ip(),
        ]);

        return redirect()->back();
    }
}
