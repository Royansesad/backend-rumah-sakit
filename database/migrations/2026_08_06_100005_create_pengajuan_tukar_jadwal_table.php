<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pengajuan_tukar_jadwal', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->enum('kategori_tukar', ['jadwal_dokter', 'shift_perawat']);
            $table->uuid('pemohon_id');
            $table->uuid('target_pengganti_id');
            $table->uuid('jadwal_pemohon_id');
            $table->uuid('jadwal_target_id')->nullable();
            $table->text('alasan')->nullable();
            $table->enum('status_persetujuan_target', ['menunggu', 'disetujui', 'ditolak'])->default('menunggu');
            $table->timestamp('waktu_persetujuan_target')->nullable();
            $table->enum('status_persetujuan_admin', ['menunggu', 'disetujui', 'ditolak'])->default('menunggu');
            $table->foreignUuid('disetujui_oleh_admin_id')->nullable()->constrained('admins')->nullOnDelete();
            $table->text('alasan_penolakan')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['kategori_tukar', 'pemohon_id']);
            $table->index(['kategori_tukar', 'target_pengganti_id']);
            $table->index('status_persetujuan_target');
            $table->index('status_persetujuan_admin');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pengajuan_tukar_jadwal');
    }
};
