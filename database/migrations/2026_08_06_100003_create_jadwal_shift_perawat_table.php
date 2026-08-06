<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jadwal_shift_perawat', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('perawat_id')->constrained('perawats')->cascadeOnDelete();
            $table->foreignUuid('bangsal_id')->constrained('bangsal')->cascadeOnDelete();
            $table->date('tanggal');
            $table->enum('jenis_shift', ['pagi', 'siang', 'malam']);
            $table->time('jam_mulai');
            $table->time('jam_selesai');
            $table->enum('status', ['dijadwalkan', 'ditukar', 'cuti'])->default('dijadwalkan');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['bangsal_id', 'tanggal']);
            $table->index(['perawat_id', 'tanggal']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jadwal_shift_perawat');
    }
};
