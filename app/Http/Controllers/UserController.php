<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\AuditLog;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $selectedRole = $request->input('role', 'admin');
        
        $rolesMap = [
            'admin' => 'admins',
            'dokter' => 'dokters',
            'perawat' => 'perawats',
            'apoteker' => 'apotekers',
            'kasir' => 'kasirs',
            'resepsionis' => 'resepsionis',
            'manajemen' => 'manajemen',
        ];

        if (!array_key_exists($selectedRole, $rolesMap)) {
            $selectedRole = 'admin';
        }

        $users = DB::table($rolesMap[$selectedRole])->get();
        
        $counts = [];
        foreach($rolesMap as $roleKey => $table) {
            $counts[$roleKey] = DB::table($table)->count();
        }

        return Inertia::render('users/index', [
            'users' => $users,
            'selectedRole' => $selectedRole,
            'counts' => $counts,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'role' => 'required|string',
            'name' => 'required|string',
            'email' => 'required|email|unique:admins|unique:dokters', // Simplified validation
            'password' => 'required|min:6',
        ]);

        $rolesMap = [
            'admin' => 'admins',
            'dokter' => 'dokters',
            'perawat' => 'perawats',
            'apoteker' => 'apotekers',
            'kasir' => 'kasirs',
            'resepsionis' => 'resepsionis',
            'manajemen' => 'manajemen',
        ];

        $table = $rolesMap[$request->role];

        $id = Str::uuid();
        DB::table($table)->insert([
            'id' => $id,
            'name' => $request->name,
            'email' => $request->email,
            'password' => \Hash::make($request->password),
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

    public function update(Request $request, $role, $id)
    {
        $rolesMap = [
            'admin' => 'admins',
            'dokter' => 'dokters',
            'perawat' => 'perawats',
            'apoteker' => 'apotekers',
            'kasir' => 'kasirs',
            'resepsionis' => 'resepsionis',
            'manajemen' => 'manajemen',
        ];

        if (!array_key_exists($role, $rolesMap)) {
            return back();
        }

        $table = $rolesMap[$role];
        DB::table($table)->where('id', $id)->update($request->except(['_token', '_method']));

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
