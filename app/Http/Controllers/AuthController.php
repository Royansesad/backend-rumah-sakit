<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
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
     * Portal Login Tamu / Pasien (/login)
     */
    public function showGuestLogin()
    {
        return Inertia::render('auth/login-pasien');
    }

    /**
     * Portal Login Admin / Pegawai / Staff (/admin-login)
     */
    public function showAdminLogin()
    {
        return Inertia::render('auth/login-staff');
    }

    /**
     * Handler Login Tamu / Pasien
     */
    public function loginGuest(Request $request)
    {
        $request->merge(['role' => 'pasien']);
        return $this->login($request);
    }

    /**
     * Handler Login Admin / Pegawai / Staff (dengan Role Dropdown)
     */
    public function loginAdmin(Request $request)
    {
        $request->validate([
            'role' => 'required|string|in:admin,dokter,perawat,apoteker,kasir,resepsionis,manajemen',
        ]);
        return $this->login($request);
    }

    /**
     * Core Login Processing
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'role' => 'required|string',
        ]);

        if (!array_key_exists($request->role, $this->rolesMap)) {
            return back()->withErrors(['role' => 'Role tidak valid.']);
        }

        $table = $this->rolesMap[$request->role];
        $user = DB::table($table)->where('email', $request->email)->first();

        if ($user && \Hash::check($request->password, $user->password)) {
            $userArray = (array) $user;
            session(['simrs_user' => $userArray, 'simrs_role' => $request->role]);

            AuditLog::create([
                'pembuat_id' => data_get($userArray, 'id'),
                'pembuat_type' => $request->role,
                'modul' => 'auth',
                'aksi' => 'LOGIN',
                'data_sesudah' => json_encode(['description' => "User logged in as {$request->role}"]),
                'ip_address' => $request->ip(),
            ]);

            return redirect()->route('dashboard');
        }

        return back()->withErrors(['email' => 'Email atau password tidak cocok untuk role yang dipilih.']);
    }

    /**
     * Logout Handler
     */
    public function logout(Request $request)
    {
        $user = session('simrs_user');
        $role = session('simrs_role');

        if ($user) {
            AuditLog::create([
                'pembuat_id' => data_get($user, 'id'),
                'pembuat_type' => $role ?? 'guest',
                'modul' => 'auth',
                'aksi' => 'LOGOUT',
                'data_sesudah' => json_encode(['description' => 'User logged out']),
                'ip_address' => $request->ip(),
            ]);
        }

        session()->forget(['simrs_user', 'simrs_role']);

        return redirect()->route('login');
    }
}
