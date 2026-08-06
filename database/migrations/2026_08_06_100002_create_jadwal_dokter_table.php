<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jadwal_dokter', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('dokter_id')->constrained('dokters')->cascadeOnDelete();
            $table->foreignUuid('poli_id')->constrained('poli')->cascadeOnDelete();
            $table->foreignUuid('ruangan_id')->nullable()->constrained('ruangan')->nullOnDelete();
            $table->date('tanggal');
            $table->unsignedTinyInteger('hari')->comment('1=Senin..7=Minggu');
            $table->time('jam_mulai');
            $table->time('jam_selesai');
            $table->integer('kuota_maksimal')->default(30);
            $table->enum('status', ['tersedia', 'tidak_tersedia', 'cuti', 'dibatalkan'])->default('tersedia');
            $table->boolean('ada_bentrok')->default(false);
            $table->text('catatan_bentrok')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tanggal', 'dokter_id']);
            $table->index(['tanggal', 'ruangan_id', 'jam_mulai', 'jam_selesai']);
            $table->index(['poli_id', 'tanggal', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jadwal_dokter');
    }
};
