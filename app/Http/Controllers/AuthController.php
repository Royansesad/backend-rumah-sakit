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
     * Halaman Ajukan Permintaan Akses (/admin-request-access)
     */
    public function showRequestAccess(): Response
    {
        return Inertia::render('auth/request-access');
    }

    /**
     * Submit Permintaan Akses Akun Baru
     */
    public function submitRequestAccess(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama_lengkap' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'role' => 'required|string|max:100',
            'nomor_hp' => 'required|string|max:30',
            'catatan' => 'nullable|string|max:1000',
        ]);

        AuditLog::create([
            'pembuat_id' => null,
            'pembuat_type' => 'guest',
            'modul' => 'auth',
            'aksi' => 'REQUEST_ACCESS',
            'data_sesudah' => json_encode([
                'nama' => $validated['nama_lengkap'],
                'email' => $validated['email'],
                'role' => $validated['role'],
                'nomor_hp' => $validated['nomor_hp'],
                'catatan' => $validated['catatan'] ?? null,
            ]),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'target_label' => 'Permintaan Akses: ' . $validated['nama_lengkap'],
        ]);

        return back()->with('success', 'Permintaan akses berhasil dikirimkan ke Admin IT.');
    }

    /**
     * Halaman Reset Kata Sandi Staf (/admin-forgot-password)
     */
    public function showForgotPassword(): Response
    {
        return Inertia::render('auth/forgot-password');
    }

    /**
     * Submit Request OTP untuk Reset Password
     */
    public function submitForgotPassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'identifier' => 'required|string|max:255',
        ]);

        AuditLog::create([
            'pembuat_id' => null,
            'pembuat_type' => 'guest',
            'modul' => 'auth',
            'aksi' => 'REQUEST_PASSWORD_RESET_OTP',
            'data_sesudah' => json_encode(['identifier' => $validated['identifier']]),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'target_label' => 'Reset Kata Sandi: ' . $validated['identifier'],
        ]);

        return back()->with([
            'success' => 'Kode OTP berhasil dikirimkan ke email/WhatsApp terdaftar.',
            'step' => 2,
            'identifier' => $validated['identifier'],
        ]);
    }

    /**
     * Reset Password Baru
     */
    public function resetPassword(Request $request): RedirectResponse
    {
        $request->validate([
            'identifier' => 'required|string',
            'otp' => 'required|string|min:4',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $tables = ['admins', 'dokters', 'perawats', 'apotekers', 'kasirs', 'resepsionis', 'manajemen'];
        $updated = false;

        foreach ($tables as $table) {
            $user = DB::table($table)
                ->where('email', $request->identifier)
                ->first();

            if ($user) {
                DB::table($table)->where('id', $user->id)->update([
                    'password' => \Hash::make($request->password),
                ]);
                $updated = true;
                break;
            }
        }

        if ($updated) {
            AuditLog::create([
                'pembuat_id' => null,
                'pembuat_type' => 'guest',
                'modul' => 'auth',
                'aksi' => 'PASSWORD_RESET_SUCCESS',
                'data_sesudah' => json_encode(['identifier' => $request->identifier]),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'target_label' => 'Reset Kata Sandi Sukses',
            ]);

            return redirect()->route('login.admin')->with('success', 'Kata sandi berhasil diperbarui. Silakan login kembali.');
        }

        return back()->withErrors(['identifier' => 'Akun dengan email tersebut tidak ditemukan dalam sistem.']);
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
