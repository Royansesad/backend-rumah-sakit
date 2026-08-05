<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed();
});

function portalLogin(string $email, string $role): void
{
    $endpoint = $role === 'pasien' ? '/login' : '/admin-login';

    test()->post($endpoint, [
        'email' => $email,
        'password' => 'password123',
        'role' => $role,
    ])->assertRedirect(route('dashboard'));
}

it('renders both login portals with their own components', function () {
    $this->get('/')->assertInertia(fn (Assert $page) => $page->component('auth/login-pasien'));
    $this->get('/login')->assertInertia(fn (Assert $page) => $page->component('auth/login-pasien'));
    $this->get('/admin-login')->assertInertia(fn (Assert $page) => $page->component('auth/login-staff'));
});

it('stores the correct user and role in the session on staff login', function () {
    $this->post('/admin-login', [
        'email' => 'budi.admin@simrs.id',
        'password' => 'password123',
        'role' => 'admin',
    ])->assertRedirect(route('dashboard'));

    expect(session('simrs_user.email'))->toBe('budi.admin@simrs.id')
        ->and(session('simrs_role'))->toBe('admin');
});

it('requires a role on the staff portal', function () {
    $this->post('/admin-login', [
        'email' => 'budi.admin@simrs.id',
        'password' => 'password123',
    ])->assertSessionHasErrors('role')
        ->assertSessionMissing('simrs_user');
});

it('rejects an unknown role value on the staff portal', function () {
    $this->post('/admin-login', [
        'email' => 'budi.admin@simrs.id',
        'password' => 'password123',
        'role' => 'superadmin',
    ])->assertSessionHasErrors('role')
        ->assertSessionMissing('simrs_user');
});

it('rejects an email that does not exist in the chosen role table', function () {
    $this->post('/admin-login', [
        'email' => 'nonexistent@simrs.id',
        'password' => 'password123',
        'role' => 'admin',
    ])->assertSessionHasErrors('email')
        ->assertSessionMissing('simrs_user');
});

it('rejects an account whose role does not match the staff portal selection', function () {
    $this->post('/admin-login', [
        'email' => 'budi.admin@simrs.id',
        'password' => 'password123',
        'role' => 'dokter',
    ])->assertSessionHasErrors('email')
        ->assertSessionMissing('simrs_user');
});

it('rejects an empty password on the staff portal', function () {
    $this->post('/admin-login', [
        'email' => 'budi.admin@simrs.id',
        'password' => '',
        'role' => 'admin',
    ])->assertSessionHasErrors('password')
        ->assertSessionMissing('simrs_user');
});

it('rejects a password sent as a nested array instead of crashing', function () {
    $this->post('/admin-login', [
        'email' => 'budi.admin@simrs.id',
        'password' => ['secret'],
        'role' => 'admin',
    ])->assertSessionHasErrors('password')
        ->assertSessionMissing('simrs_user');
});

it('rejects an email sent as a nested array instead of crashing', function () {
    $this->post('/admin-login', [
        'email' => ['budi.admin@simrs.id'],
        'password' => 'password123',
        'role' => 'admin',
    ])->assertSessionHasErrors('email')
        ->assertSessionMissing('simrs_user');
});

it('rejects a malformed email on the staff portal', function () {
    $this->post('/admin-login', [
        'email' => 'bukan-email',
        'password' => 'password123',
        'role' => 'admin',
    ])->assertSessionHasErrors('email')
        ->assertSessionMissing('simrs_user');
});

it('ignores extra payload fields during login', function () {
    $this->post('/admin-login', [
        'email' => 'budi.admin@simrs.id',
        'password' => 'password123',
        'role' => 'admin',
        'id' => '00000000-0000-0000-0000-000000000099',
        'is_admin' => '1',
    ])->assertRedirect(route('dashboard'));

    $expectedId = DB::table('admins')->where('email', 'budi.admin@simrs.id')->value('id');

    expect(session('simrs_user.id'))->toBe($expectedId);
});

it('regenerates the session id on successful staff login', function () {
    $this->get('/admin-login');
    $idBefore = session()->getId();
    expect($idBefore)->toBeString();

    $this->post('/admin-login', [
        'email' => 'budi.admin@simrs.id',
        'password' => 'password123',
        'role' => 'admin',
    ])->assertRedirect(route('dashboard'));

    expect(session()->getId())->toBeString()
        ->not->toBe($idBefore);
});

it('writes an auth LOGIN audit entry on staff login', function () {
    $this->post('/admin-login', [
        'email' => 'budi.admin@simrs.id',
        'password' => 'password123',
        'role' => 'admin',
    ]);

    $this->assertDatabaseHas('audit_logs', [
        'pembuat_type' => 'admin',
        'modul' => 'auth',
        'aksi' => 'LOGIN',
    ]);
});

it('forces the pasien role on the guest portal and ignores a supplied role', function () {
    $this->post('/login', [
        'email' => 'budi.admin@simrs.id',
        'password' => 'password123',
        'role' => 'admin',
    ])->assertSessionMissing('simrs_user');

    $this->post('/login', [
        'email' => 'agus.pasien@simrs.id',
        'password' => 'password123',
        'role' => 'pasien',
    ])->assertRedirect(route('dashboard'));

    expect(session('simrs_role'))->toBe('pasien');
});

it('rejects wrong pasien credentials on the guest portal', function () {
    $this->post('/login', [
        'email' => 'agus.pasien@simrs.id',
        'password' => 'password-salah',
    ])->assertSessionHasErrors('email')
        ->assertSessionMissing('simrs_user');
});

it('writes an auth LOGIN audit entry on guest login', function () {
    $this->post('/login', [
        'email' => 'agus.pasien@simrs.id',
        'password' => 'password123',
    ]);

    $this->assertDatabaseHas('audit_logs', [
        'pembuat_type' => 'pasien',
        'modul' => 'auth',
        'aksi' => 'LOGIN',
    ]);
});

it('lets a guest logout land on the pasien portal without errors', function () {
    $this->post('/logout')
        ->assertRedirect(route('login'))
        ->assertSessionMissing('simrs_user')
        ->assertSessionMissing('simrs_role');
});

it('writes a LOGOUT audit entry and clears the session', function () {
    portalLogin('budi.admin@simrs.id', 'admin');

    $this->post('/logout')->assertRedirect(route('login.admin'));

    $this->assertDatabaseHas('audit_logs', [
        'pembuat_type' => 'admin',
        'modul' => 'auth',
        'aksi' => 'LOGOUT',
    ]);

    $this->get('/dashboard')->assertRedirect(route('login'));
});

it('allows a fresh login after logout', function () {
    portalLogin('budi.admin@simrs.id', 'admin');
    $this->post('/logout')->assertRedirect(route('login.admin'));

    $this->post('/admin-login', [
        'email' => 'budi.admin@simrs.id',
        'password' => 'password123',
        'role' => 'admin',
    ])->assertRedirect(route('dashboard'));

    $this->get('/dashboard')->assertOk();
});

it('lets an already-authenticated user revisit the login portal safely', function () {
    portalLogin('budi.admin@simrs.id', 'admin');

    $this->get('/login')->assertOk();
    $this->get('/admin-login')->assertOk();
});

it('logs in every staff role through the rest api', function () {
    $this->withoutMiddleware(ThrottleRequests::class);

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
        $response = $this->postJson('/api/v1/admin-login', [
            'email' => $email,
            'password' => 'password123',
            'role' => $role,
        ]);

        $response->assertOk()
            ->assertJsonPath('data.role', $role)
            ->assertJsonPath('data.user.email', $email);
    }
});

it('rejects missing fields on the rest api with 422', function () {
    $this->postJson('/api/v1/login', [])->assertStatus(422);
});

it('rejects a malformed email on the rest api with 422', function () {
    $this->postJson('/api/v1/login', [
        'email' => 'bukan-email',
        'password' => 'password123',
    ])->assertStatus(422);
});

it('rejects a password sent as an array on the rest api with 422', function () {
    $this->postJson('/api/v1/login', [
        'email' => 'agus.pasien@simrs.id',
        'password' => ['secret'],
    ])->assertStatus(422);
});

it('rejects an unknown email on the rest api with 401', function () {
    $this->postJson('/api/v1/login', [
        'email' => 'hacker@simrs.id',
        'password' => 'password123',
    ])->assertStatus(401)->assertJsonPath('status', 'error');
});

it('rate limits repeated rest api login attempts', function () {
    for ($i = 0; $i < 5; $i++) {
        $this->postJson('/api/v1/login', [
            'email' => 'hacker@simrs.id',
            'password' => 'wrong',
        ])->assertStatus(401);
    }

    $this->postJson('/api/v1/login', [
        'email' => 'hacker@simrs.id',
        'password' => 'wrong',
    ])->assertStatus(429);
});

it('returns 401 when logging out of the rest api without a token', function () {
    $this->postJson('/api/v1/auth/logout')
        ->assertStatus(401)
        ->assertJsonPath('message', 'Unauthenticated.');
});

it('issues a fresh usable token after logout and re-login', function () {
    $first = $this->postJson('/api/v1/login', [
        'email' => 'agus.pasien@simrs.id',
        'password' => 'password123',
    ])->assertOk()->json('data.token');

    $this->withToken($first)->postJson('/api/v1/auth/logout')->assertOk();

    $second = $this->postJson('/api/v1/login', [
        'email' => 'agus.pasien@simrs.id',
        'password' => 'password123',
    ])->assertOk()->json('data.token');

    expect($second)->toBeString()->not->toBe($first);

    $this->withToken($second)->getJson('/api/v1/auth/me')
        ->assertOk()
        ->assertJsonPath('data.user.email', 'agus.pasien@simrs.id');

    $this->withToken($first)->getJson('/api/v1/auth/me')->assertStatus(401);
});
