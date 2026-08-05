<?php

use App\Models\Dokter;
use App\Models\Pasien;
use App\Models\Poli;
use App\Models\Ruangan;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed();
});

function getStaffToken(string $role = 'resepsionis', string $email = 'lina.sari@simrs.id'): string
{
    $response = test()->postJson('/api/v1/admin-login', [
        'email' => $email,
        'password' => 'password123',
        'role' => $role,
    ]);

    $response->assertOk();

    return $response->json('data.token');
}

it('creates a new patient with rawat_jalan and bpjs penjamin via API with dummy data', function () {
    $token = getStaffToken('resepsionis', 'lina.sari@simrs.id');

    $dummyPayload = [
        'nama_lengkap' => 'Pasien BPJS Rawat Jalan Dummy',
        'nik' => '3174099988887777',
        'no_hp' => '081234567890',
        'jenis_kelamin' => 'Laki-laki',
        'golongan_darah' => 'B',
        'alamat' => 'Jl. Kesehatan No. 123',
        'jenis_layanan' => 'rawat_jalan',
        'penjamin' => 'bpjs',
        'nomor_penjamin' => '0001234567899',
        'keluhan' => 'Keluhan sesak napas ringan',
    ];

    $response = $this->withToken($token)->postJson('/api/v1/pasien', $dummyPayload);

    $response->assertStatus(201)
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.nama_lengkap', 'Pasien BPJS Rawat Jalan Dummy')
        ->assertJsonPath('data.jenis_layanan', 'rawat_jalan')
        ->assertJsonPath('data.status_pendaftaran', 'menunggu')
        ->assertJsonPath('data.penjamin', 'bpjs')
        ->assertJsonPath('data.nomor_penjamin', '0001234567899');

    expect($response->json('data.nomor_pendaftaran'))->toContain('RJ-');

    $this->assertDatabaseHas('pasien', [
        'nama_lengkap' => 'Pasien BPJS Rawat Jalan Dummy',
        'jenis_layanan' => 'rawat_jalan',
        'penjamin' => 'bpjs',
        'nomor_penjamin' => '0001234567899',
    ]);
});

it('creates a new patient with rawat_jalan and bpjs penjamin via Web flow with dummy data', function () {
    test()->post('/admin-login', [
        'email' => 'lina.sari@simrs.id',
        'password' => 'password123',
        'role' => 'resepsionis',
    ]);

    $dummyPayload = [
        'nama_lengkap' => 'Pasien Web BPJS Dummy',
        'nik' => '3273011122233344',
        'no_hp' => '089876543210',
        'jenis_layanan' => 'rawat_jalan',
        'penjamin' => 'bpjs',
        'nomor_penjamin' => '0009988776655',
        'keluhan' => 'Kontrol rutin rawat jalan',
    ];

    $response = $this->post('/pasien', $dummyPayload);

    $response->assertRedirect(route('pasien.index'));

    $this->assertDatabaseHas('pasien', [
        'nama_lengkap' => 'Pasien Web BPJS Dummy',
        'jenis_layanan' => 'rawat_jalan',
        'penjamin' => 'bpjs',
        'nomor_penjamin' => '0009988776655',
    ]);
});

it('allows authorized staff to register patient for rawat jalan', function () {
    $token = getStaffToken('resepsionis', 'lina.sari@simrs.id');
    $pasien = Pasien::first();
    $poli = Poli::first();
    $dokter = Dokter::first();

    $response = $this->withToken($token)->postJson('/api/v1/pendaftaran', [
        'pasien_id' => $pasien->id,
        'jenis_layanan' => 'rawat_jalan',
        'poli_id' => $poli->id,
        'dokter_id' => $dokter->id,
        'penjamin' => 'umum',
        'keluhan' => 'Pusing dan demam',
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.jenis_layanan', 'rawat_jalan')
        ->assertJsonPath('data.status_pendaftaran', 'menunggu')
        ->assertJsonPath('data.poli_id', $poli->id)
        ->assertJsonPath('data.dokter_id', $dokter->id);

    expect($response->json('data.nomor_pendaftaran'))->toContain('RJ-');

    $this->assertDatabaseHas('pasien', [
        'id' => $pasien->id,
        'jenis_layanan' => 'rawat_jalan',
        'status_pendaftaran' => 'menunggu',
    ]);
});

it('allows authorized staff to register patient for rawat inap', function () {
    $token = getStaffToken('admin', 'budi.admin@simrs.id');
    $pasien = Pasien::first();
    $ruangan = Ruangan::first();

    $response = $this->withToken($token)->postJson('/api/v1/pendaftaran', [
        'pasien_id' => $pasien->id,
        'jenis_layanan' => 'rawat_inap',
        'ruangan_id' => $ruangan->id,
        'penjamin' => 'bpjs',
        'nomor_penjamin' => '0001234567890',
        'keluhan' => 'Perlu perawatan pasca operatif',
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.jenis_layanan', 'rawat_inap')
        ->assertJsonPath('data.ruangan_id', $ruangan->id)
        ->assertJsonPath('data.penjamin', 'bpjs');

    expect($response->json('data.nomor_pendaftaran'))->toContain('RI-');
});

it('allows authorized staff to register patient for igd', function () {
    $token = getStaffToken('manajemen', 'hendra.wijaya@simrs.id');
    $pasien = Pasien::first();

    $response = $this->withToken($token)->postJson('/api/v1/pendaftaran', [
        'pasien_id' => $pasien->id,
        'jenis_layanan' => 'igd',
        'prioritas' => 'emergency',
        'penjamin' => 'umum',
        'keluhan' => 'Kecelakaan lalu lintas',
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.jenis_layanan', 'igd')
        ->assertJsonPath('data.prioritas', 'emergency');

    expect($response->json('data.nomor_pendaftaran'))->toContain('IGD-');
});

it('validates conditional rules for registration', function () {
    $token = getStaffToken();
    $pasien = Pasien::first();

    // Rawat jalan requires poli_id
    $this->withToken($token)->postJson('/api/v1/pendaftaran', [
        'pasien_id' => $pasien->id,
        'jenis_layanan' => 'rawat_jalan',
        'penjamin' => 'umum',
    ])->assertStatus(422)->assertJsonValidationErrors(['poli_id']);

    // Rawat inap requires ruangan_id
    $this->withToken($token)->postJson('/api/v1/pendaftaran', [
        'pasien_id' => $pasien->id,
        'jenis_layanan' => 'rawat_inap',
        'penjamin' => 'umum',
    ])->assertStatus(422)->assertJsonValidationErrors(['ruangan_id']);

    // IGD requires prioritas
    $this->withToken($token)->postJson('/api/v1/pendaftaran', [
        'pasien_id' => $pasien->id,
        'jenis_layanan' => 'igd',
        'penjamin' => 'umum',
    ])->assertStatus(422)->assertJsonValidationErrors(['prioritas']);

    // BPJS requires nomor_penjamin
    $this->withToken($token)->postJson('/api/v1/pendaftaran', [
        'pasien_id' => $pasien->id,
        'jenis_layanan' => 'igd',
        'prioritas' => 'normal',
        'penjamin' => 'bpjs',
    ])->assertStatus(422)->assertJsonValidationErrors(['nomor_penjamin']);
});

it('prevents double registration for an active patient', function () {
    $token = getStaffToken();
    $pasien = Pasien::first();
    $poli = Poli::first();

    // Register once
    $this->withToken($token)->postJson('/api/v1/pendaftaran', [
        'pasien_id' => $pasien->id,
        'jenis_layanan' => 'rawat_jalan',
        'poli_id' => $poli->id,
        'penjamin' => 'umum',
    ])->assertStatus(201);

    // Try registering again while active
    $this->withToken($token)->postJson('/api/v1/pendaftaran', [
        'pasien_id' => $pasien->id,
        'jenis_layanan' => 'igd',
        'prioritas' => 'urgent',
        'penjamin' => 'umum',
    ])->assertStatus(422)->assertJsonPath('status', 'error');
});

it('allows updating status of pendaftaran', function () {
    $token = getStaffToken();
    $pasien = Pasien::first();
    $poli = Poli::first();

    $this->withToken($token)->postJson('/api/v1/pendaftaran', [
        'pasien_id' => $pasien->id,
        'jenis_layanan' => 'rawat_jalan',
        'poli_id' => $poli->id,
        'penjamin' => 'umum',
    ]);

    // Update status to diperiksa
    $this->withToken($token)->patchJson("/api/v1/pendaftaran/{$pasien->id}/status", [
        'status_pendaftaran' => 'diperiksa',
    ])->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.status_pendaftaran', 'diperiksa');

    // Update status to selesai
    $this->withToken($token)->patchJson("/api/v1/pendaftaran/{$pasien->id}/status", [
        'status_pendaftaran' => 'selesai',
    ])->assertOk()
        ->assertJsonPath('data.status_pendaftaran', 'selesai');
});

it('allows cancelling a pendaftaran', function () {
    $token = getStaffToken();
    $pasien = Pasien::first();
    $poli = Poli::first();

    $this->withToken($token)->postJson('/api/v1/pendaftaran', [
        'pasien_id' => $pasien->id,
        'jenis_layanan' => 'rawat_jalan',
        'poli_id' => $poli->id,
        'penjamin' => 'umum',
    ]);

    $this->withToken($token)->deleteJson("/api/v1/pendaftaran/{$pasien->id}/batalkan")
        ->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.status_pendaftaran', 'belum_daftar')
        ->assertJsonPath('data.jenis_layanan', null);
});

it('lists registered patients with filters', function () {
    $token = getStaffToken();
    $pasienList = Pasien::take(2)->get();
    $poli = Poli::first();

    // Register patient 1 as rawat jalan
    $this->withToken($token)->postJson('/api/v1/pendaftaran', [
        'pasien_id' => $pasienList[0]->id,
        'jenis_layanan' => 'rawat_jalan',
        'poli_id' => $poli->id,
        'penjamin' => 'umum',
    ]);

    // Register patient 2 as igd
    $this->withToken($token)->postJson('/api/v1/pendaftaran', [
        'pasien_id' => $pasienList[1]->id,
        'jenis_layanan' => 'igd',
        'prioritas' => 'emergency',
        'penjamin' => 'umum',
    ]);

    // Filter by rawat_jalan
    $this->withToken($token)->getJson('/api/v1/pendaftaran?jenis_layanan=rawat_jalan')
        ->assertOk()
        ->assertJsonPath('data.total', 1)
        ->assertJsonPath('data.data.0.id', $pasienList[0]->id);

    // Filter by igd
    $this->withToken($token)->getJson('/api/v1/pendaftaran?jenis_layanan=igd')
        ->assertOk()
        ->assertJsonPath('data.total', 1)
        ->assertJsonPath('data.data.0.id', $pasienList[1]->id);
});

it('returns registration statistics', function () {
    $token = getStaffToken();
    $pasienList = Pasien::take(2)->get();
    $poli = Poli::first();

    $this->withToken($token)->postJson('/api/v1/pendaftaran', [
        'pasien_id' => $pasienList[0]->id,
        'jenis_layanan' => 'rawat_jalan',
        'poli_id' => $poli->id,
        'penjamin' => 'umum',
    ]);

    $this->withToken($token)->postJson('/api/v1/pendaftaran', [
        'pasien_id' => $pasienList[1]->id,
        'jenis_layanan' => 'igd',
        'prioritas' => 'urgent',
        'penjamin' => 'umum',
    ]);

    $this->withToken($token)->getJson('/api/v1/pendaftaran/statistik')
        ->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.total', 2)
        ->assertJsonPath('data.per_jenis_layanan.rawat_jalan', 1)
        ->assertJsonPath('data.per_jenis_layanan.igd', 1);
});

it('restricts registration endpoints from unauthorized roles', function () {
    // Dokter token
    $dokterToken = test()->postJson('/api/v1/admin-login', [
        'email' => 'siti.rahayu@simrs.id',
        'password' => 'password123',
        'role' => 'dokter',
    ])->json('data.token');

    // Pasien token
    $pasienToken = test()->postJson('/api/v1/login', [
        'email' => 'agus.pasien@simrs.id',
        'password' => 'password123',
    ])->json('data.token');

    $pasien = Pasien::first();
    $poli = Poli::first();

    $payload = [
        'pasien_id' => $pasien->id,
        'jenis_layanan' => 'rawat_jalan',
        'poli_id' => $poli->id,
        'penjamin' => 'umum',
    ];

    // Dokter denied
    $this->withToken($dokterToken)->postJson('/api/v1/pendaftaran', $payload)
        ->assertStatus(403);

    // Pasien denied
    $this->withToken($pasienToken)->postJson('/api/v1/pendaftaran', $payload)
        ->assertStatus(403);
});
