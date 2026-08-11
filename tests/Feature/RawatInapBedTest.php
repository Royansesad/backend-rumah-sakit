<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Bangsal;
use App\Models\Bed;
use App\Models\Dokter;
use App\Models\Pasien;
use App\Models\RawatInapAdmission;
use App\Models\Ruangan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RawatInapBedTest extends TestCase
{
    use RefreshDatabase;

    protected string $token;
    protected Admin $adminUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();

        $loginRes = $this->postJson('/api/v1/admin-login', [
            'email' => 'admin@simrs.id',
            'password' => 'password123',
            'role' => 'admin',
        ]);

        $this->token = $loginRes->json('data.token') ?? '';
    }

    protected function authHeaders(): array
    {
        return [
            'Authorization' => 'Bearer ' . $this->token,
            'Accept' => 'application/json',
        ];
    }

    public function test_can_list_beds_and_occupancy_matrix(): void
    {
        $bangsal = Bangsal::create([
            'kode_bangsal' => 'B-TEST',
            'nama_bangsal' => 'Bangsal Test',
            'kapasitas' => 10,
        ]);

        $ruangan = Ruangan::create([
            'nama_ruangan' => 'Ruang Inap 101',
            'tipe_ruangan' => 'Kelas 1',
            'kapasitas_bed' => 2,
        ]);

        $bed = Bed::create([
            'nomor_bed' => 'BED-101-A',
            'ruangan_id' => $ruangan->id,
            'bangsal_id' => $bangsal->id,
            'kelas' => 'Kelas 1',
            'tarif_per_hari' => 500000,
            'status' => 'tersedia',
        ]);

        $response = $this->getJson('/api/v1/beds', $this->authHeaders());
        $response->assertStatus(200)
                 ->assertJsonPath('status', 'success');

        $matrixResponse = $this->getJson('/api/v1/beds/matrix', $this->authHeaders());
        $matrixResponse->assertStatus(200)
                       ->assertJsonPath('status', 'success');
    }

    public function test_can_check_in_patient_to_inpatient_and_auto_occupy_bed(): void
    {
        $bangsal = Bangsal::create([
            'kode_bangsal' => 'B-MAWAR-TEST',
            'nama_bangsal' => 'Bangsal Mawar Test',
            'kapasitas' => 5,
        ]);

        $bed = Bed::create([
            'nomor_bed' => 'BED-MAWAR-01-TEST',
            'bangsal_id' => $bangsal->id,
            'kelas' => 'Kelas 2',
            'tarif_per_hari' => 400000,
            'status' => 'tersedia',
        ]);

        $pasien = Pasien::create([
            'nomor_rekam_medis' => 'RM-TEST-001',
            'nama_lengkap' => 'Pasien Test Rawat Inap',
            'jenis_kelamin' => 'Laki-laki',
        ]);

        $response = $this->postJson('/api/v1/rawat-inap/check-in', [
            'pasien_id' => $pasien->id,
            'bed_id' => $bed->id,
            'diagnosa_awal' => 'Demam Berdarah Dengue (DBD)',
            'alasan_masuk' => 'Trombosit turun, butuh observasi rawat inap',
        ], $this->authHeaders());

        $response->assertStatus(201)
                 ->assertJsonPath('status', 'success');

        $this->assertDatabaseHas('beds', [
            'id' => $bed->id,
            'status' => 'terisi',
        ]);

        $this.assertDatabaseHas('rawat_inap_admissions', [
            'pasien_id' => $pasien->id,
            'bed_id' => $bed->id,
            'status' => 'aktif',
        ]);
    }

    public function test_can_transfer_patient_to_another_available_bed(): void
    {
        $bangsal = Bangsal::create([
            'kode_bangsal' => 'B-VIP-TEST',
            'nama_bangsal' => 'Bangsal VIP Test',
            'kapasitas' => 5,
        ]);

        $bedAsal = Bed::create([
            'nomor_bed' => 'BED-VIP-01-TEST',
            'bangsal_id' => $bangsal->id,
            'kelas' => 'Kelas 1',
            'status' => 'terisi',
        ]);

        $bedTujuan = Bed::create([
            'nomor_bed' => 'BED-VIP-02-TEST',
            'bangsal_id' => $bangsal->id,
            'kelas' => 'VIP',
            'status' => 'tersedia',
        ]);

        $pasien = Pasien::create([
            'nomor_rekam_medis' => 'RM-TEST-002',
            'nama_lengkap' => 'Pasien Pindah Bed',
        ]);

        $admission = RawatInapAdmission::create([
            'nomor_admission' => 'RI-20260811-TEST1',
            'pasien_id' => $pasien->id,
            'bed_id' => $bedAsal->id,
            'tanggal_masuk' => now(),
            'status' => 'aktif',
        ]);

        $response = $this->postJson("/api/v1/rawat-inap/{$admission->id}/pindah-bed", [
            'bed_tujuan_id' => $bedTujuan->id,
            'alasan_pindah' => 'Upgrade ke kelas VIP',
        ], $this->authHeaders());

        $response->assertStatus(200)
                 ->assertJsonPath('status', 'success');

        $this.assertDatabaseHas('beds', [
            'id' => $bedAsal->id,
            'status' => 'dibersihkan',
        ]);

        $this.assertDatabaseHas('beds', [
            'id' => $bedTujuan->id,
            'status' => 'terisi',
        ]);

        $this.assertDatabaseHas('riwayat_pindah_bed', [
            'admission_id' => $admission->id,
            'bed_asal_id' => $bedAsal->id,
            'bed_tujuan_id' => $bedTujuan->id,
        ]);
    }

    public function test_can_discharge_patient_and_set_bed_to_cleaning(): void
    {
        $bed = Bed::create([
            'nomor_bed' => 'BED-DC-01-TEST',
            'kelas' => 'Kelas 3',
            'status' => 'terisi',
        ]);

        $pasien = Pasien::create([
            'nomor_rekam_medis' => 'RM-TEST-003',
            'nama_lengkap' => 'Pasien Discharged',
        ]);

        $admission = RawatInapAdmission::create([
            'nomor_admission' => 'RI-20260811-TEST2',
            'pasien_id' => $pasien->id,
            'bed_id' => $bed->id,
            'tanggal_masuk' => now()->subDays(3),
            'status' => 'aktif',
        ]);

        $response = $this->postJson("/api/v1/rawat-inap/{$admission->id}/check-out", [
            'status' => 'pulang_sembuh',
            'ringkasan_pulang' => 'Pasien sembuh total dan diperbolehkan pulang.',
        ], $this->authHeaders());

        $response->assertStatus(200)
                 ->assertJsonPath('status', 'success');

        $this.assertDatabaseHas('beds', [
            'id' => $bed->id,
            'status' => 'dibersihkan',
        ]);

        $this.assertDatabaseHas('rawat_inap_admissions', [
            'id' => $admission->id,
            'status' => 'pulang_sembuh',
        ]);
    }
}
