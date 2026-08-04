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
            $table->enum('status_akun', ['aktif', 'nonaktif'])->default('aktif');
            $table->string('status_aktif', 20)->default('aktif');
            $table->timestamps();

            $table->index('nomor_rekam_medis');
            $table->index('nik');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pasien');
    }
};
