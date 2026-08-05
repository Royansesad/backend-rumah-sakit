<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\Apoteker;
use App\Models\AuditLog;
use App\Models\Contracts\HasSimrsRole;
use App\Models\Dokter;
use App\Models\Kasir;
use App\Models\Manajemen;
use App\Models\Pasien;
use App\Models\Perawat;
use App\Models\Resepsionis;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /** @var array<string, class-string<Model&HasSimrsRole>> */
    protected array $roles = [
        'admin' => Admin::class,
        'dokter' => Dokter::class,
        'perawat' => Perawat::class,
        'apoteker' => Apoteker::class,
        'kasir' => Kasir::class,
        'resepsionis' => Resepsionis::class,
        'manajemen' => Manajemen::class,
        'pasien' => Pasien::class,
    ];

    /**
     * REST API Login Tamu / Pasien (/api/v1/login)
     */
    public function loginGuest(Request $request): JsonResponse
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
    public function loginAdmin(Request $request): JsonResponse
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
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'role' => 'required|string',
        ]);

        return $this->processLogin($validated['email'], $validated['password'], $validated['role'], $request);
    }

    protected function processLogin(string $email, string $password, string $role, Request $request): JsonResponse
    {
        if (! array_key_exists($role, $this->roles)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Role tidak valid.',
                'available_roles' => array_keys($this->roles),
            ], 422);
        }

        $user = $this->roles[$role]::query()->where('email', $email)->first();

        if (! $user instanceof HasSimrsRole || ! Hash::check($password, $user->getAuthPassword())) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kredensial email atau password tidak cocok untuk role tersebut.',
            ], 401);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        AuditLog::create([
            'pembuat_id' => $user->getAuthIdentifier(),
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
                'user' => $user,
                'role' => $role,
                'token' => $token,
                'token_type' => 'Bearer',
            ],
        ]);
    }

    /**
     * Profile User Aktif
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user instanceof HasSimrsRole) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthenticated.',
            ], 401);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'user' => $user,
                'role' => $user->getRoleAttribute(),
            ],
        ]);
    }

    /**
     * API Logout
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user instanceof HasSimrsRole) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthenticated.',
            ], 401);
        }

        AuditLog::create([
            'pembuat_id' => $user->getAuthIdentifier(),
            'pembuat_type' => $user->getRoleAttribute(),
            'modul' => 'api_auth',
            'aksi' => 'API_LOGOUT',
            'data_sesudah' => json_encode(['description' => 'API Logout']),
            'ip_address' => $request->ip(),
        ]);

        $user->currentAccessToken()?->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Logout berhasil.',
        ]);
    }
}
