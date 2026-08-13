<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('antrian', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nomor_antrian', 30);
            $table->integer('angka_antrian');
            $table->foreignUuid('poli_id')->constrained('poli')->cascadeOnDelete();
            $table->foreignUuid('dokter_id')->constrained('dokters')->cascadeOnDelete();
            $table->foreignUuid('jadwal_dokter_id')->constrained('jadwal_dokter')->cascadeOnDelete();
            $table->foreignUuid('pasien_id')->constrained('pasien')->cascadeOnDelete();
            $table->enum('tipe_pasien', ['umum', 'bpjs', 'prioritas'])->default('umum');
            $table->enum('sumber', ['walk_in', 'online'])->default('walk_in');
            $table->enum('status', [
                'menunggu',
                'skrining',
                'dipanggil',
                'sedang_dilayani',
                'selesai',
                'dilewati',
                'dibatalkan'
            ])->default('menunggu');
            $table->foreignUuid('loket_id')->nullable()->constrained('loket_antrian')->nullOnDelete();
            $table->timestamp('waktu_skrining')->nullable();
            $table->timestamp('waktu_dipanggil')->nullable();
            $table->timestamp('waktu_dilayani')->nullable();
            $table->timestamp('waktu_selesai')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['poli_id', 'dokter_id', 'created_at', 'status']);
            $table->index(['jadwal_dokter_id', 'status', 'angka_antrian']);
            $table->index('pasien_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('antrian');
    }
};
