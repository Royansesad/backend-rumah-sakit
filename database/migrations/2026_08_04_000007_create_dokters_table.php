<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dokters', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nama_lengkap', 150);
            $table->string('email', 150)->unique();
            $table->string('password', 255);
            $table->string('no_hp', 20)->nullable();
            $table->string('foto_profil', 255)->nullable();
            $table->string('nomor_str', 50)->unique();
            $table->string('spesialisasi', 100)->nullable();
            $table->foreignUuid('poli_id')->nullable()->constrained('poli')->nullOnDelete();
            $table->enum('jk', ['Laki-laki', 'Perempuan'])->nullable();
            $table->text('kondisi_kontrak_digital')->nullable();
            $table->enum('status_praktik', ['aktif', 'cuti', 'nonaktif'])->default('aktif');
            $table->enum('status_akun', ['aktif', 'nonaktif'])->default('aktif');
            $table->timestamp('last_login_at')->nullable();
            $table->timestamps();

            $table->index('email');
            $table->index('nomor_str');
            $table->index('poli_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dokters');
    }
};
