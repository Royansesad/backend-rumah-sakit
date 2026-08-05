<?php

use App\Models\Pasien;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed();
});

function apiLogin(string $email, string $password = 'password123', ?string $role = null): string
{
    $payload = ['email' => $email, 'password' => $password];
    $endpoint = '/api/v1/login';

    if ($role !== null) {
        $payload['role'] = $role;
        $endpoint = '/api/v1/admin-login';
    }

    $response = test()->postJson($endpoint, $payload);

    $response->assertOk();

    return $response->json('data.token');
}

it('logs in a pasien and returns a bearer token', function () {
    $response = $this->postJson('/api/v1/login', [
        'email' => 'agus.pasien@simrs.id',
        'password' => 'password123',
    ]);

    $response->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.role', 'pasien')
        ->assertJsonStructure(['data' => ['token', 'token_type', 'user', 'role']]);

    expect($response->json('data.token'))->toBeString()->not->toBeEmpty();
    $this->assertDatabaseCount('personal_access_tokens', 1);
});

it('logs in staff with a role and issues a token', function () {
    $response = $this->postJson('/api/v1/admin-login', [
        'email' => 'budi.admin@simrs.id',
        'password' => 'password123',
        'role' => 'admin',
    ]);

    $response->assertOk()
        ->assertJsonPath('data.role', 'admin')
        ->assertJsonStructure(['data' => ['token', 'token_type']]);
});

it('rejects invalid credentials', function () {
    $this->postJson('/api/v1/login', [
        'email' => 'agus.pasien@simrs.id',
        'password' => 'wrong-password',
    ])->assertStatus(401)->assertJsonPath('status', 'error');
});

it('rejects an invalid role', function () {
    $this->postJson('/api/v1/admin-login', [
        'email' => 'budi.admin@simrs.id',
        'password' => 'password123',
        'role' => 'superadmin',
    ])->assertStatus(422);
});

it('requires a bearer token for protected endpoints', function () {
    $this->getJson('/api/v1/pasien')
        ->assertStatus(401)
        ->assertJsonPath('status', 'error')
        ->assertJsonPath('message', 'Unauthenticated.');
});

it('returns the authenticated profile', function () {
    $token = apiLogin('agus.pasien@simrs.id', role: null);

    $this->withToken($token)->getJson('/api/v1/auth/me')
        ->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.role', 'pasien')
        ->assertJsonPath('data.user.email', 'agus.pasien@simrs.id');
});

it('enforces role based authorization on user management', function () {
    $pasienToken = apiLogin('agus.pasien@simrs.id');

    $this->withToken($pasienToken)->getJson('/api/v1/users')
        ->assertStatus(403)
        ->assertJsonPath('status', 'error');

    $adminToken = apiLogin('budi.admin@simrs.id', role: 'admin');

    $this->withToken($adminToken)->getJson('/api/v1/users?role=admin')
        ->assertOk()
        ->assertJsonPath('status', 'success');
});

it('enforces role based authorization on patient creation', function () {
    $pasienToken = apiLogin('agus.pasien@simrs.id');

    $this->withToken($pasienToken)->postJson('/api/v1/pasien', [
        'nama_lengkap' => 'Bambang Tri',
        'nik' => '3174098765432100',
    ])->assertStatus(403);

    $resepsionisToken = apiLogin('lina.sari@simrs.id', role: 'resepsionis');

    $this->withToken($resepsionisToken)->postJson('/api/v1/pasien', [
        'nama_lengkap' => 'Bambang Tri',
        'nik' => '3174098765432100',
    ])->assertStatus(201)->assertJsonPath('status', 'success');

    $adminToken = apiLogin('budi.admin@simrs.id', role: 'admin');

    $this->withToken($adminToken)->postJson('/api/v1/pasien', [
        'nama_lengkap' => 'Bambang Tri',
        'nik' => '3174098765432101',
    ])->assertStatus(201)->assertJsonPath('status', 'success');
});

it('supports specifying jenis_layanan directly during patient creation', function () {
    $token = apiLogin('budi.admin@simrs.id', role: 'admin');

    $response = $this->withToken($token)->postJson('/api/v1/pasien', [
        'nama_lengkap' => 'Dewi Anggraini',
        'jenis_layanan' => 'rawat_jalan',
        'penjamin' => 'bpjs',
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.jenis_layanan', 'rawat_jalan')
        ->assertJsonPath('data.status_pendaftaran', 'menunggu');

    expect($response->json('data.nomor_pendaftaran'))->toContain('RJ-');
});

it('restricts patients to their own records only', function () {
    $token = apiLogin('agus.pasien@simrs.id');

    $this->withToken($token)->getJson('/api/v1/pasien')
        ->assertOk()
        ->assertJsonPath('data.total', 1)
        ->assertJsonPath('data.data.0.id', '00000000-0000-0000-0000-000000000021')
        ->assertJsonPath('data.data.0.nama_lengkap', 'Agus Setiawan');

    $this->withToken($token)->getJson('/api/v1/pasien/00000000-0000-0000-0000-000000000021')
        ->assertOk()
        ->assertJsonPath('data.nama_lengkap', 'Agus Setiawan');

    $this->withToken($token)->getJson('/api/v1/pasien/00000000-0000-0000-0000-000000000022')
        ->assertStatus(403);

    $this->withToken($token)->getJson('/api/v1/audit-logs')
        ->assertStatus(403);
});

it('lets staff view the full patient list', function () {
    $token = apiLogin('lina.sari@simrs.id', role: 'resepsionis');

    $this->withToken($token)->getJson('/api/v1/pasien')
        ->assertOk()
        ->assertJsonPath('data.total', 3);
});

it('revokes the token on logout', function () {
    $token = apiLogin('agus.pasien@simrs.id');

    $this->withToken($token)->postJson('/api/v1/auth/logout')
        ->assertOk()
        ->assertJsonPath('status', 'success');

    $this->assertDatabaseCount('personal_access_tokens', 0);

    $this->withToken($token)->getJson('/api/v1/auth/me')
        ->assertStatus(401);
});

it('never exposes passwords in responses', function () {
    $token = apiLogin('budi.admin@simrs.id', role: 'admin');

    $me = $this->withToken($token)->getJson('/api/v1/auth/me');

    expect($me->json('data.user'))->not->toHaveKey('password');
    expect(Pasien::first()->makeVisible('password')->password)->not->toBeNull();
});

it('rejects staff login when the role does not match the account', function () {
    $this->postJson('/api/v1/admin-login', [
        'email' => 'budi.admin@simrs.id',
        'password' => 'password123',
        'role' => 'dokter',
    ])->assertStatus(401)->assertJsonPath('status', 'error');
});

it('rejects unauthenticated user management requests', function () {
    $this->postJson('/api/v1/users', ['role' => 'kasir'])
        ->assertStatus(401);
});

it('returns 404 for an unknown patient', function () {
    $token = apiLogin('budi.admin@simrs.id', role: 'admin');

    $this->withToken($token)->getJson('/api/v1/pasien/00000000-0000-0000-0000-000000000099')
        ->assertStatus(404)
        ->assertJsonPath('status', 'error');
});

it('sanitizes api user updates and blocks id changes', function () {
    $token = apiLogin('budi.admin@simrs.id', role: 'admin');

    $this->withToken($token)->putJson('/api/v1/users/kasir/00000000-0000-0000-0000-000000000016', [
        'nama_lengkap' => 'Mega Putri Baru',
        'id' => '00000000-0000-0000-0000-000000000099',
    ])->assertOk();

    $this->assertDatabaseHas('kasirs', [
        'id' => '00000000-0000-0000-0000-000000000016',
        'nama_lengkap' => 'Mega Putri Baru',
    ]);

    $this->assertDatabaseMissing('kasirs', ['id' => '00000000-0000-0000-0000-000000000099']);
});

it('blocks patient creation for roles outside the whitelist', function () {
    $apotekerToken = apiLogin('andi.pratama@simrs.id', role: 'apoteker');

    $this->withToken($apotekerToken)->postJson('/api/v1/pasien', [
        'nama_lengkap' => 'Bambang Tri',
    ])->assertStatus(403);

    $this->assertDatabaseCount('pasien', 3);
});

it('allows manajemen to view audit logs', function () {
    $token = apiLogin('hendra.wijaya@simrs.id', role: 'manajemen');

    $this->withToken($token)->getJson('/api/v1/audit-logs')
        ->assertOk()
        ->assertJsonPath('status', 'success');
});

it('restricts the rbac matrix to admins only', function () {
    $pasienToken = apiLogin('agus.pasien@simrs.id');

    $this->withToken($pasienToken)->getJson('/api/v1/rbac')
        ->assertStatus(403);

    $adminToken = apiLogin('budi.admin@simrs.id', role: 'admin');

    $this->withToken($adminToken)->getJson('/api/v1/rbac')
        ->assertOk()
        ->assertJsonPath('status', 'success');
});

it('allows authorized staff to update and delete patient records via API', function () {
    $adminToken = apiLogin('budi.admin@simrs.id', role: 'admin');
    $pasien = Pasien::first();

    // Update patient
    $this->withToken($adminToken)->putJson("/api/v1/pasien/{$pasien->id}", [
        'nama_lengkap' => 'Nama Pasien Terupdate',
        'no_hp' => '089988776655',
    ])->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.nama_lengkap', 'Nama Pasien Terupdate');

    $this->assertDatabaseHas('pasien', [
        'id' => $pasien->id,
        'nama_lengkap' => 'Nama Pasien Terupdate',
    ]);

    // Delete patient
    $this->withToken($adminToken)->deleteJson("/api/v1/pasien/{$pasien->id}")
        ->assertOk()
        ->assertJsonPath('status', 'success');

    $this->assertDatabaseMissing('pasien', [
        'id' => $pasien->id,
    ]);
});
