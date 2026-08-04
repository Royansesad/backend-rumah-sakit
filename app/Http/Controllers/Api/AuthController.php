<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\AuditLog;

class AuthController extends Controller
{
    protected array $rolesMap = [
        'admin' => 'admins',
        'dokter' => 'dokters',
        'perawat' => 'perawats',
        'apoteker' => 'apotekers',
        'kasir' => 'kasirs',
        'resepsionis' => 'resepsionis',
        'manajemen' => 'manajemen',
        'pasien' => 'pasien',
    ];

    /**
     * REST API Login Tamu / Pasien (/api/v1/login)
     */
    public function loginGuest(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        return $this->processLogin($validated['email'], $validated['password'], 'pasien', $request);
    }

    /**
     * REST API Login Admin / Staff (/api/v1/admin-login) - dengan Role dari Dropdown
     */
    public function loginAdmin(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'role' => 'required|string|in:admin,dokter,perawat,apoteker,kasir,resepsionis,manajemen',
        ]);

        return $this->processLogin($validated['email'], $validated['password'], $validated['role'], $request);
    }

    /**
     * General REST API Login
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'role' => 'required|string',
        ]);

        return $this->processLogin($validated['email'], $validated['password'], $validated['role'], $request);
    }

    protected function processLogin(string $email, string $password, string $role, Request $request)
    {
        if (!array_key_exists($role, $this->rolesMap)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Role tidak valid.',
                'available_roles' => array_keys($this->rolesMap)
            ], 422);
        }

        $table = $this->rolesMap[$role];
        $user = DB::table($table)->where('email', $email)->first();

        if ($user && Hash::check($password, $user->password)) {
            $userArray = (array) $user;
            unset($userArray['password']); // Mask password

            session(['simrs_user' => $userArray, 'simrs_role' => $role]);

            AuditLog::create([
                'pembuat_id' => data_get($userArray, 'id'),
                'pembuat_type' => $role,
                'modul' => 'api_auth',
                'aksi' => 'API_LOGIN',
                'data_sesudah' => json_encode(['description' => "API login successful as {$role}"]),
                'ip_address' => $request->ip(),
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Login berhasil.',
                'data' => [
                    'user' => $userArray,
                    'role' => $role,
                    'session_id' => session()->getId(),
                ]
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Kredensial email atau password tidak cocok untuk role tersebut.'
        ], 401);
    }

    /**
     * Profile User Aktif
     */
    public function me(Request $request)
    {
        $user = session('simrs_user');
        $role = session('simrs_role');

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthenticated.'
            ], 401);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'user' => $user,
                'role' => $role,
            ]
        ]);
    }

    /**
     * API Logout
     */
    public function logout(Request $request)
    {
        $user = session('simrs_user');
        $role = session('simrs_role');

        if ($user) {
            AuditLog::create([
                'pembuat_id' => data_get($user, 'id'),
                'pembuat_type' => $role ?? 'guest',
                'modul' => 'api_auth',
                'aksi' => 'API_LOGOUT',
                'data_sesudah' => json_encode(['description' => 'API Logout']),
                'ip_address' => $request->ip(),
            ]);
        }

        session()->forget(['simrs_user', 'simrs_role']);

        return response()->json([
            'status' => 'success',
            'message' => 'Logout berhasil.'
        ]);
    }
}
