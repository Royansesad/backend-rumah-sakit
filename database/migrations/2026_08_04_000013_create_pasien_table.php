<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pasien', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nomor_rekam_medis', 50)->unique();
            $table->string('nama_lengkap', 150);
            $table->string('nik', 20)->unique()->nullable();
            $table->date('tanggal_lahir')->nullable();
            $table->enum('jenis_kelamin', ['Laki-laki', 'Perempuan'])->nullable();
            $table->enum('golongan_darah', ['A', 'B', 'AB', 'O', '-'])->nullable();
            $table->text('alamat')->nullable();
            $table->string('no_hp', 20)->nullable();
            $table->string('password')->nullable();
            $table->string('email', 150)->nullable();
            $table->string('nama_kontak_darurat', 150)->nullable();
            $table->string('no_hp_kontak_darurat', 20)->nullable();
            $table->text('alergi')->nullable();
            $table->text('riwayat_penyakit')->nullable();
            $table->string('kondisi_terakhir')->nullable();
            $table->enum('status_akun', ['aktif', 'nonaktif'])->default('aktif');
            $table->string('status_aktif', 20)->default('aktif');

            // --- Kolom Pendaftaran ---
            $table->string('nomor_pendaftaran', 50)->unique()->nullable();
            $table->enum('jenis_layanan', ['rawat_jalan', 'rawat_inap', 'igd'])->nullable();
            $table->enum('status_pendaftaran', ['belum_daftar', 'menunggu', 'diperiksa', 'selesai', 'batal'])->default('belum_daftar');
            $table->foreignUuid('dokter_id')->nullable()->constrained('dokters')->nullOnDelete();
            $table->foreignUuid('poli_id')->nullable()->constrained('poli')->nullOnDelete();
            $table->foreignUuid('ruangan_id')->nullable()->constrained('ruangan')->nullOnDelete();
            $table->date('tanggal_pendaftaran')->nullable();
            $table->text('keluhan')->nullable();
            $table->enum('penjamin', ['umum', 'bpjs', 'asuransi'])->nullable();
            $table->string('nomor_penjamin', 50)->nullable();
            $table->enum('prioritas', ['normal', 'urgent', 'emergency'])->nullable();
            $table->text('catatan_pendaftaran')->nullable();
            $table->uuid('didaftarkan_oleh')->nullable();
            $table->string('tipe_pendaftar', 30)->nullable();

            $table->timestamps();

            $table->index('nomor_rekam_medis');
            $table->index('nik');
            $table->index('nomor_pendaftaran');
            $table->index('jenis_layanan');
            $table->index('status_pendaftaran');
            $table->index('tanggal_pendaftaran');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pasien');
    }
};
