<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\AuditLog;
use Illuminate\Support\Str;

class UserApiController extends Controller
{
    protected array $rolesMap = [
        'admin' => 'admins',
        'dokter' => 'dokters',
        'perawat' => 'perawats',
        'apoteker' => 'apotekers',
        'kasir' => 'kasirs',
        'resepsionis' => 'resepsionis',
        'manajemen' => 'manajemen',
    ];

    public function index(Request $request)
    {
        $selectedRole = $request->input('role', 'admin');

        if (!array_key_exists($selectedRole, $this->rolesMap)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Role tidak valid'
            ], 422);
        }

        $users = DB::table($this->rolesMap[$selectedRole])->get()->map(function ($u) {
            unset($u->password);
            return $u;
        });

        $counts = [];
        foreach ($this->rolesMap as $roleKey => $table) {
            $counts[$roleKey] = DB::table($table)->count();
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'selected_role' => $selectedRole,
                'users' => $users,
                'counts' => $counts,
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'role' => 'required|string',
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'password' => 'required|min:6',
        ]);

        if (!array_key_exists($validated['role'], $this->rolesMap)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Role tidak valid'
            ], 422);
        }

        $table = $this->rolesMap[$validated['role']];
        $id = Str::uuid();

        DB::table($table)->insert([
            'id' => $id,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $currentUser = session('simrs_user');
        $currentRole = session('simrs_role');

        AuditLog::create([
            'pembuat_id' => data_get($currentUser, 'id'),
            'pembuat_type' => $currentRole ?? 'api',
            'modul' => 'api_user_management',
            'aksi' => 'CREATE_USER',
            'data_sesudah' => json_encode(['role' => $validated['role'], 'user_id' => $id]),
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => "User {$validated['role']} berhasil dibuat",
            'data' => [
                'id' => $id,
                'name' => $validated['name'],
                'email' => $validated['email'],
                'role' => $validated['role'],
            ]
        ], 201);
    }

    public function update(Request $request, $role, $id)
    {
        if (!array_key_exists($role, $this->rolesMap)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Role tidak valid'
            ], 422);
        }

        $table = $this->rolesMap[$role];
        $updateData = $request->except(['id', '_token', '_method']);

        if (isset($updateData['password']) && !empty($updateData['password'])) {
            $updateData['password'] = Hash::make($updateData['password']);
        } else {
            unset($updateData['password']);
        }

        $updateData['updated_at'] = now();

        DB::table($table)->where('id', $id)->update($updateData);

        $currentUser = session('simrs_user');
        $currentRole = session('simrs_role');

        AuditLog::create([
            'pembuat_id' => data_get($currentUser, 'id'),
            'pembuat_type' => $currentRole ?? 'api',
            'modul' => 'api_user_management',
            'aksi' => 'UPDATE_USER',
            'data_sesudah' => json_encode(['role' => $role, 'user_id' => $id]),
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'User berhasil diperbarui'
        ]);
    }
}
