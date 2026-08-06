<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Bangsal;
use App\Models\Dokter;
use App\Models\JadwalDokter;
use App\Models\Pasien;
use App\Models\Perawat;
use App\Models\Poli;
use App\Models\Ruangan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HisScheduleAndQueueTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_can_create_doctor_schedule_and_detect_conflict(): void
    {
        $admin = Admin::first() ?? Admin::create([
            'nama_lengkap' => 'Admin Test',
            'email' => 'admin@test.com',
            'password' => bcrypt('password'),
        ]);
        $adminToken = $admin->createToken('test_token')->plainTextToken;

        $poli = Poli::first() ?? Poli::create([
            'kode_poli' => 'INT',
            'nama_poli' => 'Poli Penyakit Dalam',
        ]);

        $ruangan = Ruangan::first() ?? Ruangan::create([
            'kode_ruangan' => 'R01',
            'nama_ruangan' => 'Ruang 101',
        ]);

        $dokter1 = Dokter::create([
            'nama_lengkap' => 'dr. Budi Santoso',
            'email' => 'budi@test.com',
            'password' => bcrypt('password'),
            'nomor_str' => 'STR-001',
            'poli_id' => $poli->id,
        ]);

        $dokter2 = Dokter::create([
            'nama_lengkap' => 'dr. Sarah Wijaya',
            'email' => 'sarah@test.com',
            'password' => bcrypt('password'),
            'nomor_str' => 'STR-002',
            'poli_id' => $poli->id,
        ]);

        $testDate = now()->addDays(2)->toDateString();

        // 1. Create first schedule
        $response1 = $this->withToken($adminToken)->postJson('/api/v1/admin/jadwal-dokter', [
            'dokter_id' => $dokter1->id,
            'poli_id' => $poli->id,
            'ruangan_id' => $ruangan->id,
            'tanggal' => $testDate,
            'jam_mulai' => '08:00',
            'jam_selesai' => '11:00',
            'kuota_maksimal' => 20,
        ]);

        $response1->assertStatus(201)
            ->assertJsonPath('data.ada_bentrok', false);

        // 2. Create overlapping schedule in same room to trigger conflict
        $response2 = $this->withToken($adminToken)->postJson('/api/v1/admin/jadwal-dokter', [
            'dokter_id' => $dokter2->id,
            'poli_id' => $poli->id,
            'ruangan_id' => $ruangan->id,
            'tanggal' => $testDate,
            'jam_mulai' => '09:00',
            'jam_selesai' => '12:00',
            'kuota_maksimal' => 20,
        ]);

        $response2->assertStatus(201)
            ->assertJsonPath('data.ada_bentrok', true);
    }

    public function test_leave_request_approval_updates_doctor_schedule(): void
    {
        $admin = Admin::first() ?? Admin::create([
            'nama_lengkap' => 'Admin Test',
            'email' => 'admin2@test.com',
            'password' => bcrypt('password'),
        ]);
        $adminToken = $admin->createToken('test_token')->plainTextToken;

        $poli = Poli::first() ?? Poli::create([
            'kode_poli' => 'INT',
            'nama_poli' => 'Poli Penyakit Dalam',
        ]);

        $dokter = Dokter::create([
            'nama_lengkap' => 'dr. Andi',
            'email' => 'andi@test.com',
            'password' => bcrypt('password'),
            'nomor_str' => 'STR-003',
            'poli_id' => $poli->id,
        ]);
        $dokterToken = $dokter->createToken('test_token')->plainTextToken;

        $scheduleDate = now()->addDays(3)->toDateString();

        $jadwal = JadwalDokter::create([
            'dokter_id' => $dokter->id,
            'poli_id' => $poli->id,
            'tanggal' => $scheduleDate,
            'hari' => 1,
            'jam_mulai' => '08:00',
            'jam_selesai' => '12:00',
            'status' => 'tersedia',
        ]);

        // Submit leave request
        $leaveResponse = $this->withToken($dokterToken)->postJson('/api/v1/pengajuan-cuti', [
            'pemohon_id' => $dokter->id,
            'jenis_pengajuan' => 'Cuti Tahunan',
            'tanggal_mulai' => $scheduleDate,
            'tanggal_selesai' => $scheduleDate,
            'alasan' => 'Liburan keluarga',
        ]);

        $leaveResponse->assertStatus(201);
        $leaveId = $leaveResponse->json('data.id');

        // Admin approves
        $approveResponse = $this->withToken($adminToken)->patchJson("/api/v1/admin/pengajuan-cuti/{$leaveId}/persetujuan", [
            'setuju' => true,
        ]);

        $approveResponse->assertStatus(200);

        $freshJadwal = $jadwal->fresh();
        $freshLeave = \App\Models\PengajuanCuti::find($leaveId);

        $this->assertEquals('disetujui', $freshLeave->status);
        $this->assertEquals('cuti', $freshJadwal->status);
    }

    public function test_queue_generation_and_status_flow(): void
    {
        $poli = Poli::first() ?? Poli::create([
            'kode_poli' => 'INT',
            'nama_poli' => 'Poli Penyakit Dalam',
        ]);

        $dokter = Dokter::create([
            'nama_lengkap' => 'dr. Rudy',
            'email' => 'rudy@test.com',
            'password' => bcrypt('password'),
            'nomor_str' => 'STR-004',
            'poli_id' => $poli->id,
        ]);
        $dokterToken = $dokter->createToken('test_token')->plainTextToken;

        $pasien = Pasien::first() ?? Pasien::create([
            'no_rm' => 'RM-001',
            'nik' => '1234567890123456',
            'nama_lengkap' => 'Pasien Test',
            'tanggal_lahir' => '1990-01-01',
            'jenis_kelamin' => 'L',
        ]);
        $pasienToken = $pasien->createToken('test_token')->plainTextToken;

        // Create active schedule for today
        $jadwal = JadwalDokter::create([
            'dokter_id' => $dokter->id,
            'poli_id' => $poli->id,
            'tanggal' => now()->toDateString(),
            'hari' => date('N'),
            'jam_mulai' => '07:00',
            'jam_selesai' => '22:00',
            'status' => 'tersedia',
            'kuota_maksimal' => 10,
        ]);

        // Take queue
        $queueResponse = $this->withToken($pasienToken)->postJson('/api/v1/antrian/ambil', [
            'jadwal_dokter_id' => $jadwal->id,
            'pasien_id' => $pasien->id,
            'tipe_pasien' => 'bpjs',
        ]);

        $queueResponse->assertStatus(201)
            ->assertJsonPath('data.angka_antrian', 1);

        $queueId = $queueResponse->json('data.id');

        // Nurse screening
        $screeningResponse = $this->withToken($dokterToken)->patchJson("/api/v1/antrian/{$queueId}/status", [
            'status' => 'skrining',
        ]);

        $screeningResponse->assertStatus(200)
            ->assertJsonPath('data.status', 'skrining');

        // Call queue
        $callResponse = $this->withToken($dokterToken)->patchJson("/api/v1/antrian/{$queueId}/status", [
            'status' => 'dipanggil',
        ]);

        $callResponse->assertStatus(200)
            ->assertJsonPath('data.status', 'dipanggil');
    }
}
