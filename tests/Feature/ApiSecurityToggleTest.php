<?php

use App\Models\Pasien;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed();
});

it('blocks unauthenticated requests when API security is ENABLED', function () {
    Config::set('app.api_security', true);

    $response = $this->getJson('/api/v1/pasien');

    $response->assertStatus(401)
        ->assertJsonPath('status', 'error')
        ->assertJsonPath('message', 'Unauthenticated.');
});

it('allows unauthenticated requests when API security is DISABLED', function () {
    Config::set('app.api_security', false);

    $response = $this->getJson('/api/v1/pasien');

    $response->assertOk()
        ->assertJsonPath('status', 'success');
});

it('bypasses role restrictions when API security is DISABLED', function () {
    Config::set('app.api_security', false);

    $pasien = Pasien::first();

    // POST /api/v1/pasien would normally require admin/resepsionis role, but with security OFF it passes
    $response = $this->postJson('/api/v1/pasien', [
        'nama_lengkap' => 'Pasien Tanpa Auth',
        'nik' => '3174000000000099',
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('status', 'success');
});
