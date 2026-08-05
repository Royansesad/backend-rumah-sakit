<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Contracts\HasSimrsRole;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserApiController extends Controller
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

    /**
     * GET /api/v1/users?role={role}
     * Returns list of staff users for specified role including all ERD columns.
     */
    public function index(Request $request): JsonResponse
    {
        $selectedRole = $request->input('role', 'admin');

        if (! array_key_exists($selectedRole, $this->rolesMap)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Role tidak valid',
                'available_roles' => array_keys($this->rolesMap),
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
            ],
        ]);
    }

    /**
     * POST /api/v1/users
     * Creates new staff user with role-specific ERD columns.
     */
    public function store(Request $request): JsonResponse
    {
        $role = $request->input('role', 'admin');

        if (! array_key_exists($role, $this->rolesMap)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Role tidak valid',
            ], 422);
        }

        $request->validate([
            'email' => 'required|email',
            'password' => 'required|min:6',
        ]);

        $table = $this->rolesMap[$role];
        $id = (string) Str::uuid();

        // Support both 'nama_lengkap' and 'name'
        $namaLengkap = $request->input('nama_lengkap', $request->input('name', 'User '.ucfirst($role)));

        $insertData = array_merge($request->except(['role', 'name', '_token', '_method']), [
            'id' => $id,
            'nama_lengkap' => $namaLengkap,
            'email' => $request->input('email'),
            'password' => Hash::make($request->input('password')),
            'status_akun' => $request->input('status_akun', 'aktif'),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table($table)->insert($insertData);

        $currentUser = $request->user();

        if ($currentUser instanceof HasSimrsRole) {
            AuditLog::create([
                'pembuat_id' => $currentUser->getAuthIdentifier(),
                'pembuat_type' => $currentUser->getRoleAttribute(),
                'modul' => 'api_user_management',
                'aksi' => 'CREATE_USER',
                'data_sesudah' => json_encode(['role' => $role, 'user_id' => $id, 'nama_lengkap' => $namaLengkap]),
                'ip_address' => $request->ip(),
            ]);
        }

        unset($insertData['password']);

        return response()->json([
            'status' => 'success',
            'message' => "User {$role} berhasil dibuat",
            'data' => $insertData,
        ], 201);
    }

    /**
     * PUT /api/v1/users/{role}/{id}
     * Updates staff user data (supports all role-specific columns).
     */
    public function update(Request $request, string $role, string $id): JsonResponse
    {
        if (! array_key_exists($role, $this->rolesMap)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Role tidak valid',
            ], 422);
        }

        $table = $this->rolesMap[$role];
        $existing = DB::table($table)->where('id', $id)->first();

        if (! $existing) {
            return response()->json([
                'status' => 'error',
                'message' => 'User tidak ditemukan',
            ], 404);
        }

        $updateData = $request->except(['id', '_token', '_method']);

        if ($request->has('name') && ! $request->has('nama_lengkap')) {
            $updateData['nama_lengkap'] = $request->input('name');
            unset($updateData['name']);
        }

        if (isset($updateData['password']) && ! empty($updateData['password'])) {
            $updateData['password'] = Hash::make($updateData['password']);
        } else {
            unset($updateData['password']);
        }

        $updateData['updated_at'] = now();

        DB::table($table)->where('id', $id)->update($updateData);

        $currentUser = $request->user();

        if ($currentUser instanceof HasSimrsRole) {
            AuditLog::create([
                'pembuat_id' => $currentUser->getAuthIdentifier(),
                'pembuat_type' => $currentUser->getRoleAttribute(),
                'modul' => 'api_user_management',
                'aksi' => 'UPDATE_USER',
                'data_sesudah' => json_encode(['role' => $role, 'user_id' => $id, 'updated_fields' => array_keys($updateData)]),
                'ip_address' => $request->ip(),
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'User berhasil diperbarui',
        ]);
    }
}
