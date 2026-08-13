<?php

use App\Models\Antrian;
use App\Models\Bangsal;
use App\Models\Bed;
use App\Models\Dokter;
use App\Models\JadwalDokter;
use App\Models\Pasien;
use App\Models\Poli;
use App\Models\RawatInapAdmission;
use App\Models\RekamMedis;
use App\Models\Ruangan;
use App\Models\Tagihan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed();
});

function patientPortalLogin(string $email = 'agus.pasien@simrs.id'): void
{
    test()->post('/login', [
        'email' => $email,
        'password' => 'password123',
        'role' => 'pasien',
    ])->assertRedirect(route('portal.index'));
}

function pasienByName(string $nama): Pasien
{
    return Pasien::where('nama_lengkap', $nama)->firstOrFail();
}

function makeJadwal(array $overrides = []): JadwalDokter
{
    $dokter = Dokter::first();
    $poli = Poli::first();

    return JadwalDokter::create(array_merge([
        'dokter_id' => $dokter->id,
        'poli_id' => $poli->id,
        'tanggal' => now()->addDays(1)->toDateString(),
        'hari' => now()->addDays(1)->dayOfWeekIso,
        'jam_mulai' => '08:00',
        'jam_selesai' => '12:00',
        'kuota_maksimal' => 10,
        'status' => 'tersedia',
        'ada_bentrok' => false,
    ], $overrides));
}

it('redirects pasien login to the patient portal', function () {
    $this->post('/login', [
        'email' => 'agus.pasien@simrs.id',
        'password' => 'password123',
        'role' => 'pasien',
    ])->assertRedirect(route('portal.index'));
});

it('renders the patient portal dashboard with patient data', function () {
    patientPortalLogin();

    $this->get('/portal')->assertInertia(fn (Assert $page) => $page
        ->component('portal/dashboard')
        ->where('role', 'pasien')
        ->where('pasien.nama_lengkap', 'Agus Setiawan')
        ->has('jumlahRekamMedis'));
});

it('blocks staff accounts from the patient portal', function () {
    $this->post('/admin-login', [
        'email' => 'budi.admin@simrs.id',
        'password' => 'password123',
        'role' => 'admin',
    ])->assertRedirect(route('dashboard'));

    $this->get('/portal')->assertRedirect(route('dashboard'));
    $this->get('/portal/booking')->assertRedirect(route('dashboard'));
});

it('lists only finalized medical records for the logged-in patient', function () {
    patientPortalLogin();

    $pasien = pasienByName('Agus Setiawan');
    expect($pasien->rekamMedis()->where('status', 'draft')->count())->toBeGreaterThan(0);

    $this->get('/portal/rekam-medis')->assertInertia(fn (Assert $page) => $page
        ->component('portal/rekam-medis')
        ->has('rekamMedis', $pasien->rekamMedis()->where('status', 'final')->count())
        ->where('rekamMedis.0.status', 'final'));
});

it('shows medical record detail including prescription items', function () {
    patientPortalLogin();

    $pasien = pasienByName('Agus Setiawan');
    $rmFinal = $pasien->rekamMedis()->where('status', 'final')->firstOrFail();

    $this->get("/portal/rekam-medis/{$rmFinal->id}")->assertInertia(fn (Assert $page) => $page
        ->component('portal/rekam-medis-detail')
        ->where('rekamMedis.status', 'final')
        ->where('rekamMedis.poli', $rmFinal->poli->nama_poli)
        ->has('rekamMedis.resep.items'));
});

it('forbids a patient from viewing another patients medical record', function () {
    patientPortalLogin();

    $maya = pasienByName('Maya Anggraeni');
    $dokter = Dokter::first();
    $poli = Poli::first();

    $foreign = RekamMedis::create([
        'pasien_id' => $maya->id,
        'dokter_id' => $dokter->id,
        'poli_id' => $poli->id,
        'keluhan_utama' => 'Rahasia medis pasien lain',
        'status' => 'final',
        'finalized_at' => now(),
    ]);

    $this->get("/portal/rekam-medis/{$foreign->id}")->assertNotFound();
});

it('shows visit history with rawat jalan, rawat inap, and tagihan', function () {
    patientPortalLogin();

    $pasien = pasienByName('Agus Setiawan');
    $dokter = Dokter::first();
    $poli = Poli::first();

    $jadwal = makeJadwal(['tanggal' => now()->toDateString(), 'hari' => now()->dayOfWeekIso]);
    Antrian::create([
        'nomor_antrian' => 'UMU-001',
        'angka_antrian' => 1,
        'poli_id' => $poli->id,
        'dokter_id' => $dokter->id,
        'jadwal_dokter_id' => $jadwal->id,
        'pasien_id' => $pasien->id,
        'tipe_pasien' => 'umum',
        'sumber' => 'walk_in',
        'status' => 'selesai',
    ]);

    $bangsal = Bangsal::first();
    $bed = Bed::first();
    RawatInapAdmission::create([
        'nomor_admission' => 'RI-'.now()->format('Ymd').'-001',
        'pasien_id' => $pasien->id,
        'bed_id' => $bed->id,
        'bangsal_id' => $bangsal->id,
        'tanggal_masuk' => now()->subDays(3),
        'tanggal_keluar_aktual' => now()->subDay(),
        'status' => 'pulang_sembuh',
        'alasan_masuk' => 'Observasi demam berdarah',
    ]);

    Tagihan::create([
        'no_invoice' => 'INV-TEST-001',
        'pasien_id' => $pasien->id,
        'layanan' => 'Poli Umum',
        'subtotal' => 100000,
        'diskon' => 0,
        'pajak' => 0,
        'total_tagihan' => 100000,
        'jumlah_dibayar' => 100000,
        'kembalian' => 0,
        'status' => 'lunas',
        'metode_pembayaran' => 'Tunai',
        'waktu_pembayaran' => now(),
        'rincian' => [],
    ]);

    $this->get('/portal/riwayat')->assertInertia(fn (Assert $page) => $page
        ->component('portal/riwayat')
        ->has('kunjunganRawatJalan', 1)
        ->has('rawatInap', 1)
        ->has('tagihan')
        ->where('tagihan.0.no_invoice', 'INV-TEST-001')
        ->where('tagihan.0.status', 'lunas'));
});

it('creates an online booking and records an audit log', function () {
    patientPortalLogin();

    $pasien = pasienByName('Agus Setiawan');
    $jadwal = makeJadwal();

    $this->post('/portal/booking', ['jadwal_dokter_id' => $jadwal->id])
        ->assertRedirect(route('portal.booking'))
        ->assertSessionHas('success');

    $this->assertDatabaseHas('antrian', [
        'pasien_id' => $pasien->id,
        'jadwal_dokter_id' => $jadwal->id,
        'sumber' => 'online',
        'status' => 'menunggu',
    ]);

    expect(\Illuminate\Support\Facades\DB::table('audit_logs')
        ->where('aksi', 'BOOKING_ANTRIAN')->exists())->toBeTrue();
});

it('rejects booking for a schedule in the past', function () {
    patientPortalLogin();

    $jadwal = makeJadwal(['tanggal' => now()->subDays(1)->toDateString(), 'hari' => now()->subDays(1)->dayOfWeekIso]);

    $this->post('/portal/booking', ['jadwal_dokter_id' => $jadwal->id])
        ->assertSessionHasErrors('jadwal_dokter_id');

    $this->assertDatabaseMissing('antrian', ['jadwal_dokter_id' => $jadwal->id]);
});

it('rejects booking when the schedule is not available', function () {
    patientPortalLogin();

    $jadwal = makeJadwal(['status' => 'tidak_tersedia']);

    $this->post('/portal/booking', ['jadwal_dokter_id' => $jadwal->id])
        ->assertSessionHasErrors('jadwal_dokter_id');
});

it('rejects booking when the quota is full', function () {
    patientPortalLogin();

    $pasien = pasienByName('Agus Setiawan');
    $other = pasienByName('Rizki Ramadhan');
    $dokter = Dokter::first();
    $poli = Poli::first();

    $jadwal = makeJadwal(['kuota_maksimal' => 1]);

    Antrian::create([
        'nomor_antrian' => 'UMU-001',
        'angka_antrian' => 1,
        'poli_id' => $poli->id,
        'dokter_id' => $dokter->id,
        'jadwal_dokter_id' => $jadwal->id,
        'pasien_id' => $other->id,
        'tipe_pasien' => 'umum',
        'sumber' => 'online',
        'status' => 'menunggu',
    ]);

    $this->post('/portal/booking', ['jadwal_dokter_id' => $jadwal->id])
        ->assertSessionHasErrors('jadwal_dokter_id');

    $this->assertDatabaseMissing('antrian', ['pasien_id' => $pasien->id, 'jadwal_dokter_id' => $jadwal->id]);
});

it('lets a patient cancel their own online booking', function () {
    patientPortalLogin();

    $pasien = pasienByName('Agus Setiawan');
    $dokter = Dokter::first();
    $poli = Poli::first();
    $jadwal = makeJadwal();

    $booking = Antrian::create([
        'nomor_antrian' => 'UMU-001',
        'angka_antrian' => 1,
        'poli_id' => $poli->id,
        'dokter_id' => $dokter->id,
        'jadwal_dokter_id' => $jadwal->id,
        'pasien_id' => $pasien->id,
        'tipe_pasien' => 'umum',
        'sumber' => 'online',
        'status' => 'menunggu',
    ]);

    $this->post("/portal/booking/{$booking->id}/batal")
        ->assertRedirect(route('portal.booking'))
        ->assertSessionHas('success');

    $this->assertDatabaseHas('antrian', ['id' => $booking->id, 'status' => 'dibatalkan']);
});

it('forbids cancelling another patients booking', function () {
    patientPortalLogin();

    $other = pasienByName('Rizki Ramadhan');
    $dokter = Dokter::first();
    $poli = Poli::first();
    $jadwal = makeJadwal();

    $booking = Antrian::create([
        'nomor_antrian' => 'UMU-001',
        'angka_antrian' => 1,
        'poli_id' => $poli->id,
        'dokter_id' => $dokter->id,
        'jadwal_dokter_id' => $jadwal->id,
        'pasien_id' => $other->id,
        'tipe_pasien' => 'umum',
        'sumber' => 'online',
        'status' => 'menunggu',
    ]);

    $this->post("/portal/booking/{$booking->id}/batal")->assertNotFound();
});

it('exposes available schedules on the booking page', function () {
    patientPortalLogin();

    $jadwal = makeJadwal();

    $this->get('/portal/booking')->assertInertia(fn (Assert $page) => $page
        ->component('portal/booking')
        ->has('jadwalTersedia', 1)
        ->where('jadwalTersedia.0.id', $jadwal->id)
        ->where('jadwalTersedia.0.sisa_kuota', 10)
        ->has('poliList'));
});
