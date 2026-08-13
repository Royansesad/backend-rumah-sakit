<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
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
        'pasien' => 'pasien',
    ];

    /**
     * Portal Login Tamu / Pasien (/login)
     */
    public function showGuestLogin(): Response
    {
        return Inertia::render('auth/login-pasien');
    }

    /**
     * Portal Login Admin / Pegawai / Staff (/admin-login)
     */
    public function showAdminLogin(): Response
    {
        return Inertia::render('auth/login-staff');
    }

    /**
     * Handler Login Tamu / Pasien
     */
    public function loginGuest(Request $request): RedirectResponse
    {
        $request->merge(['role' => 'pasien']);

        return $this->login($request);
    }

    /**
     * Handler Login Admin / Pegawai / Staff (dengan Role Dropdown)
     */
    public function loginAdmin(Request $request): RedirectResponse
    {
        $request->validate([
            'role' => 'required|string|in:admin,dokter,perawat,apoteker,kasir,resepsionis,manajemen',
        ]);

        return $this->login($request);
    }

    /**
     * Core Login Processing
     */
    public function login(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'role' => 'required|string',
        ]);

        if (! array_key_exists($request->role, $this->rolesMap)) {
            return back()->withErrors(['role' => 'Role tidak valid.']);
        }

        $table = $this->rolesMap[$request->role];
        $user = DB::table($table)->where('email', $request->email)->first();

        if ($user && \Hash::check($request->password, $user->password)) {
            $userArray = (array) $user;

            $request->session()->regenerate();

            session(['simrs_user' => $userArray, 'simrs_role' => $request->role]);

            AuditLog::create([
                'pembuat_id' => data_get($userArray, 'id'),
                'pembuat_type' => $request->role,
                'modul' => 'auth',
                'aksi' => 'LOGIN',
                'data_sesudah' => json_encode(['description' => "User logged in as {$request->role}"]),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'target_label' => 'Sistem',
            ]);

            if ($request->role === 'pasien') {
                return redirect()->route('portal.index');
            }

            return redirect()->route('dashboard');
        }

        return back()->withErrors(['email' => 'Email atau password tidak cocok untuk role yang dipilih.']);
    }

    /**
     * Logout Handler
     */
    public function logout(Request $request): RedirectResponse
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
                'user_agent' => $request->userAgent(),
                'target_label' => 'Sistem',
            ]);
        }

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        if ($role !== null && $role !== 'pasien') {
            return redirect()->route('login.admin');
        }

        return redirect()->route('login');
    }
}
