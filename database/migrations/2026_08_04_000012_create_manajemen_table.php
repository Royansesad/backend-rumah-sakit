<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('manajemen', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nama_lengkap', 150);
            $table->string('email', 150)->unique();
            $table->string('password', 255);
            $table->string('no_hp', 20)->nullable();
            $table->string('foto_profil', 255)->nullable();
            $table->string('jabatan', 100)->nullable();
            $table->string('lingkup_laporan', 100)->nullable();
            $table->enum('status_akun', ['aktif', 'nonaktif'])->default('aktif');
            $table->timestamp('last_login_at')->nullable();
            $table->timestamps();

            $table->index('email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('manajemen');
    }
};
