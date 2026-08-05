<?php

use App\Models\Pasien;
use App\Models\Poli;
use App\Models\Ruangan;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed();
});

// Helper login
function loginStaff(string $email, string $role): string
{
    $res = test()->postJson('/api/v1/admin-login', [
        'email' => $email,
        'password' => 'password123',
        'role' => $role,
    ]);
    $res->assertOk();

    return $res->json('data.token');
}

// 1. API Login Admin
it('1. POST /api/v1/admin-login - Login Staff (Admin)', function () {
    $response = $this->postJson('/api/v1/admin-login', [
        'email' => 'budi.admin@simrs.id',
        'password' => 'password123',
        'role' => 'admin',
    ]);

    $response->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.role', 'admin');

    expect($response->json('data.token'))->not->toBeEmpty();
});

// 2. API Login Resepsionis
it('2. POST /api/v1/admin-login - Login Staff (Resepsionis)', function () {
    $response = $this->postJson('/api/v1/admin-login', [
        'email' => 'lina.sari@simrs.id',
        'password' => 'password123',
        'role' => 'resepsionis',
    ]);

    $response->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.role', 'resepsionis');

    expect($response->json('data.token'))->not->toBeEmpty();
});

// 3. API Login Pasien
it('3. POST /api/v1/login - Login Tamu / Pasien', function () {
    $response = $this->postJson('/api/v1/login', [
        'email' => 'agus.pasien@simrs.id',
        'password' => 'password123',
    ]);

    $response->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.role', 'pasien');

    expect($response->json('data.token'))->not->toBeEmpty();
});

// 4. API Profile Me
it('4. GET /api/v1/auth/me - Profile User Aktif', function () {
    $token = loginStaff('lina.sari@simrs.id', 'resepsionis');

    $response = $this->withToken($token)->getJson('/api/v1/auth/me');

    $response->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.role', 'resepsionis')
        ->assertJsonPath('data.user.email', 'lina.sari@simrs.id');
});

// 5. API Tambah Pasien + Rawat Jalan
it('5. POST /api/v1/pasien - Tambah Pasien Baru (Rawat Jalan)', function () {
    $token = loginStaff('lina.sari@simrs.id', 'resepsionis');
    $poli = Poli::first();

    $response = $this->withToken($token)->postJson('/api/v1/pasien', [
        'nama_lengkap' => 'Pasien Testing RJ',
        'nik' => '3174098765430001',
        'no_hp' => '081211112222',
        'jenis_layanan' => 'rawat_jalan',
        'poli_id' => $poli->id,
        'penjamin' => 'umum',
        'keluhan' => 'Pusing dan demam tinggi',
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.nama_lengkap', 'Pasien Testing RJ')
        ->assertJsonPath('data.jenis_layanan', 'rawat_jalan')
        ->assertJsonPath('data.status_pendaftaran', 'menunggu');

    expect($response->json('data.nomor_pendaftaran'))->toContain('RJ-');
});

// 6. API Tambah Pasien + Rawat Inap
it('6. POST /api/v1/pasien - Tambah Pasien Baru (Rawat Inap)', function () {
    $token = loginStaff('budi.admin@simrs.id', 'admin');
    $ruangan = Ruangan::first();

    $response = $this->withToken($token)->postJson('/api/v1/pasien', [
        'nama_lengkap' => 'Pasien Testing RI',
        'nik' => '3174098765430002',
        'jenis_layanan' => 'rawat_inap',
        'ruangan_id' => $ruangan->id,
        'penjamin' => 'bpjs',
        'nomor_penjamin' => '0009876543210',
        'keluhan' => 'Observasi pasca operasi',
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.jenis_layanan', 'rawat_inap')
        ->assertJsonPath('data.penjamin', 'bpjs');

    expect($response->json('data.nomor_pendaftaran'))->toContain('RI-');
});

// 7. API Tambah Pasien + IGD
it('7. POST /api/v1/pasien - Tambah Pasien Baru (IGD)', function () {
    $token = loginStaff('lina.sari@simrs.id', 'resepsionis');

    $response = $this->withToken($token)->postJson('/api/v1/pasien', [
        'nama_lengkap' => 'Pasien Testing IGD',
        'nik' => '3174098765430003',
        'jenis_layanan' => 'igd',
        'prioritas' => 'emergency',
        'penjamin' => 'umum',
        'keluhan' => 'Nyeri dada hebat',
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.jenis_layanan', 'igd')
        ->assertJsonPath('data.prioritas', 'emergency');

    expect($response->json('data.nomor_pendaftaran'))->toContain('IGD-');
});

// 8. API List Pasien
it('8. GET /api/v1/pasien - List Data Pasien (Filter & Search)', function () {
    $token = loginStaff('lina.sari@simrs.id', 'resepsionis');

    $response = $this->withToken($token)->getJson('/api/v1/pasien?search=Agus');

    $response->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.total', 1)
        ->assertJsonPath('data.data.0.nama_lengkap', 'Agus Setiawan');
});

// 9. API Detail Pasien
it('9. GET /api/v1/pasien/{id} - Detail Data Pasien', function () {
    $token = loginStaff('lina.sari@simrs.id', 'resepsionis');
    $pasien = Pasien::first();

    $response = $this->withToken($token)->getJson("/api/v1/pasien/{$pasien->id}");

    $response->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.id', $pasien->id);
});

// 10. API Update Pasien
it('10. PUT /api/v1/pasien/{id} - Update Data Pasien', function () {
    $token = loginStaff('budi.admin@simrs.id', 'admin');
    $pasien = Pasien::first();

    $response = $this->withToken($token)->putJson("/api/v1/pasien/{$pasien->id}", [
        'nama_lengkap' => 'Nama Pasien Terupdate via API',
        'no_hp' => '081299998888',
    ]);

    $response->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.nama_lengkap', 'Nama Pasien Terupdate via API');
});

// 11. API List Pendaftaran
it('11. GET /api/v1/pendaftaran - List Pendaftaran (Filter jenis_layanan)', function () {
    $token = loginStaff('lina.sari@simrs.id', 'resepsionis');
    $pasien = Pasien::first();
    $poli = Poli::first();

    // Daftarkan pasien
    $this->withToken($token)->postJson('/api/v1/pendaftaran', [
        'pasien_id' => $pasien->id,
        'jenis_layanan' => 'rawat_jalan',
        'poli_id' => $poli->id,
        'penjamin' => 'umum',
    ])->assertStatus(201);

    $response = $this->withToken($token)->getJson('/api/v1/pendaftaran?jenis_layanan=rawat_jalan');

    $response->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.total', 1);
});

// 12. API Detail Pendaftaran
it('12. GET /api/v1/pendaftaran/{id} - Detail Pendaftaran Pasien', function () {
    $token = loginStaff('lina.sari@simrs.id', 'resepsionis');
    $pasien = Pasien::first();
    $poli = Poli::first();

    $this->withToken($token)->postJson('/api/v1/pendaftaran', [
        'pasien_id' => $pasien->id,
        'jenis_layanan' => 'rawat_jalan',
        'poli_id' => $poli->id,
        'penjamin' => 'umum',
    ]);

    $response = $this->withToken($token)->getJson("/api/v1/pendaftaran/{$pasien->id}");

    $response->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.id', $pasien->id);
});

// 13. API Update Pendaftaran
it('13. PUT /api/v1/pendaftaran/{id} - Update Data Pendaftaran', function () {
    $token = loginStaff('lina.sari@simrs.id', 'resepsionis');
    $pasien = Pasien::first();
    $poli = Poli::first();

    $this->withToken($token)->postJson('/api/v1/pendaftaran', [
        'pasien_id' => $pasien->id,
        'jenis_layanan' => 'rawat_jalan',
        'poli_id' => $poli->id,
        'penjamin' => 'umum',
    ]);

    $response = $this->withToken($token)->putJson("/api/v1/pendaftaran/{$pasien->id}", [
        'keluhan' => 'Keluhan diupdate via API',
        'penjamin' => 'bpjs',
        'nomor_penjamin' => '123456789',
    ]);

    $response->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.keluhan', 'Keluhan diupdate via API');
});

// 14. API Update Status Pendaftaran
it('14. PATCH /api/v1/pendaftaran/{id}/status - Ubah Status Pendaftaran', function () {
    $token = loginStaff('lina.sari@simrs.id', 'resepsionis');
    $pasien = Pasien::first();
    $poli = Poli::first();

    $this->withToken($token)->postJson('/api/v1/pendaftaran', [
        'pasien_id' => $pasien->id,
        'jenis_layanan' => 'rawat_jalan',
        'poli_id' => $poli->id,
        'penjamin' => 'umum',
    ]);

    $response = $this->withToken($token)->patchJson("/api/v1/pendaftaran/{$pasien->id}/status", [
        'status_pendaftaran' => 'diperiksa',
    ]);

    $response->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.status_pendaftaran', 'diperiksa');
});

// 15. API Statistik Pendaftaran
it('15. GET /api/v1/pendaftaran/statistik - Statistik Pendaftaran Harian', function () {
    $token = loginStaff('lina.sari@simrs.id', 'resepsionis');

    $response = $this->withToken($token)->getJson('/api/v1/pendaftaran/statistik');

    $response->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonStructure(['data' => ['tanggal', 'total', 'per_jenis_layanan', 'per_status']]);
});

// 16. API Batalkan Pendaftaran
it('16. DELETE /api/v1/pendaftaran/{id}/batalkan - Pembatalan Pendaftaran', function () {
    $token = loginStaff('lina.sari@simrs.id', 'resepsionis');
    $pasien = Pasien::first();
    $poli = Poli::first();

    $this->withToken($token)->postJson('/api/v1/pendaftaran', [
        'pasien_id' => $pasien->id,
        'jenis_layanan' => 'rawat_jalan',
        'poli_id' => $poli->id,
        'penjamin' => 'umum',
    ]);

    $response = $this->withToken($token)->deleteJson("/api/v1/pendaftaran/{$pasien->id}/batalkan");

    $response->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.status_pendaftaran', 'belum_daftar');
});

// 17. API Hapus Pasien
it('17. DELETE /api/v1/pasien/{id} - Hapus Data Pasien', function () {
    $token = loginStaff('budi.admin@simrs.id', 'admin');
    $pasien = Pasien::first();

    $response = $this->withToken($token)->deleteJson("/api/v1/pasien/{$pasien->id}");

    $response->assertOk()
        ->assertJsonPath('status', 'success');

    $this->assertDatabaseMissing('pasien', ['id' => $pasien->id]);
});

// 18. API Audit Logs
it('18. GET /api/v1/audit-logs - Riwayat Audit Log', function () {
    $token = loginStaff('budi.admin@simrs.id', 'admin');

    $response = $this->withToken($token)->getJson('/api/v1/audit-logs');

    $response->assertOk()
        ->assertJsonPath('status', 'success');
});

// 19. API RBAC Matrix
it('19. GET /api/v1/rbac - Matriks Hak Akses RBAC', function () {
    $token = loginStaff('budi.admin@simrs.id', 'admin');

    $response = $this->withToken($token)->getJson('/api/v1/rbac');

    $response->assertOk()
        ->assertJsonPath('status', 'success');
});

// 20. API Logout
it('20. POST /api/v1/auth/logout - Revoke Bearer Token', function () {
    $token = loginStaff('lina.sari@simrs.id', 'resepsionis');

    $response = $this->withToken($token)->postJson('/api/v1/auth/logout');

    $response->assertOk()
        ->assertJsonPath('status', 'success');
});
