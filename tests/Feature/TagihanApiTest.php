<?php

namespace Tests\Feature;

use App\Models\Pasien;
use App\Models\Tagihan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class TagihanApiTest extends TestCase
{
    use RefreshDatabase;

    private function createDummyPasien(): Pasien
    {
        return Pasien::create([
            'id' => (string) Str::uuid(),
            'nomor_rekam_medis' => 'RM-' . rand(1000, 9999),
            'nama_lengkap' => 'Pasien Uji Coba',
            'nik' => (string) rand(1000000000000000, 9999999999999999),
        ]);
    }

    public function test_can_list_tagihans(): void
    {
        $pasien = $this->createDummyPasien();
        Tagihan::create([
            'id' => (string) Str::uuid(),
            'no_invoice' => 'INV-TEST-001',
            'pasien_id' => $pasien->id,
            'layanan' => 'Poli Umum',
            'total_tagihan' => 150000,
            'status' => 'belum_lunas',
        ]);

        $response = $this->withoutMiddleware()->getJson('/api/v1/tagihan');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success');
    }

    public function test_can_show_tagihan_detail(): void
    {
        $pasien = $this->createDummyPasien();
        $tagihan = Tagihan::create([
            'id' => (string) Str::uuid(),
            'no_invoice' => 'INV-TEST-002',
            'pasien_id' => $pasien->id,
            'layanan' => 'IGD',
            'total_tagihan' => 500000,
            'status' => 'belum_lunas',
        ]);

        $response = $this->withoutMiddleware()->getJson('/api/v1/tagihan/' . $tagihan->id);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.no_invoice', 'INV-TEST-002');
    }

    public function test_can_process_payment(): void
    {
        $pasien = $this->createDummyPasien();
        $tagihan = Tagihan::create([
            'id' => (string) Str::uuid(),
            'no_invoice' => 'INV-TEST-003',
            'pasien_id' => $pasien->id,
            'layanan' => 'Poli Gigi',
            'total_tagihan' => 300000,
            'status' => 'belum_lunas',
        ]);

        $response = $this->withoutMiddleware()->postJson("/api/v1/tagihan/{$tagihan->id}/bayar", [
            'metode_pembayaran' => 'Tunai',
            'jumlah_dibayar' => 350000,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.status', 'lunas')
            ->assertJsonPath('data.kembalian', 50000);

        $this->assertDatabaseHas('tagihans', [
            'id' => $tagihan->id,
            'status' => 'lunas',
            'metode_pembayaran' => 'Tunai',
            'kembalian' => 50000,
        ]);
    }
}
