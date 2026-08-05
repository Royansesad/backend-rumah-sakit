<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed();
});

function webLogin(string $email, string $role): void
{
    $endpoint = $role === 'pasien' ? '/login' : '/admin-login';

    test()->post($endpoint, [
        'email' => $email,
        'password' => 'password123',
        'role' => $role,
    ])->assertRedirect(route('dashboard'));
}

it('redirects guests away from authenticated pages', function () {
    $this->get('/dashboard')->assertRedirect(route('login'));
    $this->get('/users')->assertRedirect(route('login'));
    $this->get('/pasien')->assertRedirect(route('login'));
    $this->get('/rbac')->assertRedirect(route('login'));
    $this->get('/audit-logs')->assertRedirect(route('login'));
});

it('shows the administrator role on the dashboard after admin login', function () {
    webLogin('budi.admin@simrs.id', 'admin');

    $this->get('/dashboard')->assertInertia(fn (Assert $page) => $page
        ->component('dashboard')
        ->where('role', 'admin')
        ->where('user.nama_lengkap', 'Budi Santoso'));
});

it('shows the pasien role on the dashboard after pasien login', function () {
    webLogin('agus.pasien@simrs.id', 'pasien');

    $this->get('/dashboard')->assertInertia(fn (Assert $page) => $page
        ->component('dashboard')
        ->where('role', 'pasien')
        ->where('user.nama_lengkap', 'Agus Setiawan'));
});

it('enforces role authorization on the users page', function () {
    webLogin('agus.pasien@simrs.id', 'pasien');
    $this->get('/users')->assertRedirect(route('dashboard'));

    webLogin('hendra.wijaya@simrs.id', 'manajemen');
    $this->get('/users')->assertOk();

    webLogin('budi.admin@simrs.id', 'admin');
    $this->get('/users')->assertOk();
});

it('enforces role authorization on the pasien page', function () {
    webLogin('agus.pasien@simrs.id', 'pasien');
    $this->get('/pasien')->assertRedirect(route('dashboard'));

    webLogin('lina.sari@simrs.id', 'resepsionis');
    $this->get('/pasien')->assertOk();

    webLogin('budi.admin@simrs.id', 'admin');
    $this->get('/pasien')->assertOk();
});

it('enforces role authorization on the rbac page', function () {
    webLogin('hendra.wijaya@simrs.id', 'manajemen');
    $this->get('/rbac')->assertRedirect(route('dashboard'));

    webLogin('budi.admin@simrs.id', 'admin');
    $this->get('/rbac')->assertOk();
});

it('enforces role authorization on the audit-logs page', function () {
    webLogin('siti.rahayu@simrs.id', 'dokter');
    $this->get('/audit-logs')->assertRedirect(route('dashboard'));

    webLogin('budi.admin@simrs.id', 'admin');
    $this->get('/audit-logs')->assertOk();
});

it('searches patients by the correct columns', function () {
    webLogin('budi.admin@simrs.id', 'admin');

    $this->get('/pasien?search=Agus')->assertInertia(fn (Assert $page) => $page
        ->component('pasien/index')
        ->has('patients.data', 1)
        ->where('patients.data.0.nama_lengkap', 'Agus Setiawan')
        ->where('patients.data.0.nomor_rekam_medis', 'RM-2024-0001'));

    $this->get('/pasien?search=RM-2024-0002')->assertInertia(fn (Assert $page) => $page
        ->component('pasien/index')
        ->has('patients.data', 1)
        ->where('patients.data.0.nama_lengkap', 'Maya Anggraeni'));
});

it('creates a staff user with the correct columns', function () {
    webLogin('budi.admin@simrs.id', 'admin');

    $this->post('/users', [
        'role' => 'kasir',
        'nama_lengkap' => 'Susi Susanti',
        'email' => 'susi.kasir@simrs.id',
        'password' => 'password123',
    ])->assertRedirect();

    $this->assertDatabaseHas('kasirs', [
        'nama_lengkap' => 'Susi Susanti',
        'email' => 'susi.kasir@simrs.id',
    ]);
});

it('logs out staff to the staff login portal', function () {
    webLogin('budi.admin@simrs.id', 'admin');

    $this->post('/logout')
        ->assertRedirect(route('login.admin'))
        ->assertSessionMissing('simrs_user')
        ->assertSessionMissing('simrs_role');

    $this->get('/dashboard')->assertRedirect(route('login'));
});

it('logs out a pasien to the pasien login portal', function () {
    webLogin('agus.pasien@simrs.id', 'pasien');

    $this->post('/logout')
        ->assertRedirect(route('login'))
        ->assertSessionMissing('simrs_user')
        ->assertSessionMissing('simrs_role');

    $this->get('/dashboard')->assertRedirect(route('login'));
});

it('shows the correct role on the dashboard for every staff role', function () {
    $staff = [
        'budi.admin@simrs.id' => 'admin',
        'siti.rahayu@simrs.id' => 'dokter',
        'dewi.lestari@simrs.id' => 'perawat',
        'andi.pratama@simrs.id' => 'apoteker',
        'mega.putri@simrs.id' => 'kasir',
        'lina.sari@simrs.id' => 'resepsionis',
        'hendra.wijaya@simrs.id' => 'manajemen',
    ];

    foreach ($staff as $email => $role) {
        webLogin($email, $role);

        $this->get('/dashboard')->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('role', $role)
            ->where('user.email', $email));

        $this->post('/logout')->assertRedirect(route('login.admin'));
    }
});

it('rejects wrong credentials without creating a session', function () {
    $this->post('/admin-login', [
        'email' => 'budi.admin@simrs.id',
        'password' => 'password-salah',
        'role' => 'admin',
    ])->assertRedirect()
        ->assertSessionMissing('simrs_user')
        ->assertSessionMissing('simrs_role');
});

it('rejects the pasien role on the staff login portal', function () {
    $this->post('/admin-login', [
        'email' => 'agus.pasien@simrs.id',
        'password' => 'password123',
        'role' => 'pasien',
    ])->assertRedirect()
        ->assertSessionMissing('simrs_user');
});

it('does not match a staff account to the pasien portal', function () {
    $this->post('/login', [
        'email' => 'budi.admin@simrs.id',
        'password' => 'password123',
    ])->assertRedirect()
        ->assertSessionMissing('simrs_user');
});

it('sanitizes staff user updates and ignores id changes', function () {
    webLogin('budi.admin@simrs.id', 'admin');

    $this->put('/users/kasir/00000000-0000-0000-0000-000000000016', [
        'nama_lengkap' => 'Mega Putri Utami',
        'id' => '00000000-0000-0000-0000-000000000099',
        'evil_field' => 'x',
    ])->assertRedirect();

    $this->assertDatabaseHas('kasirs', [
        'id' => '00000000-0000-0000-0000-000000000016',
        'nama_lengkap' => 'Mega Putri Utami',
    ]);

    $this->assertDatabaseMissing('kasirs', ['id' => '00000000-0000-0000-0000-000000000099']);
});

it('filters audit logs by module', function () {
    webLogin('budi.admin@simrs.id', 'admin');

    $this->get('/audit-logs?modul=auth')->assertInertia(fn (Assert $page) => $page
        ->component('audit-logs/index')
        ->has('logs.data')
        ->where('logs.data.0.modul', 'auth'));
});

it('creates a patient through the web flow', function () {
    webLogin('budi.admin@simrs.id', 'admin');

    $this->post('/pasien', [
        'nama_lengkap' => 'Budi Test',
        'nik' => '3174098765432100',
        'no_hp' => '081122334455',
    ])->assertRedirect();

    $this->assertDatabaseHas('pasien', [
        'nama_lengkap' => 'Budi Test',
        'nik' => '3174098765432100',
    ]);

    expect(DB::table('audit_logs')->where('aksi', 'CREATE_PATIENT')->exists())->toBeTrue();
});

it('serves inertia navigations to logged-in users', function () {
    webLogin('budi.admin@simrs.id', 'admin');

    $version = file_exists(public_path('build/manifest.json'))
        ? hash_file('xxh128', public_path('build/manifest.json'))
        : '';

    $this->get('/dashboard', [
        'X-Inertia' => 'true',
        'X-Inertia-Version' => $version,
    ])->assertOk();
});

it('redirects guests even for inertia requests', function () {
    $version = file_exists(public_path('build/manifest.json'))
        ? hash_file('xxh128', public_path('build/manifest.json'))
        : '';

    $this->get('/dashboard', [
        'X-Inertia' => 'true',
        'X-Inertia-Version' => $version,
    ])->assertRedirect(route('login'));
});
