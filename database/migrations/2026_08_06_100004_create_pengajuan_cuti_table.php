<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pengajuan_cuti', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->enum('peran_pemohon', ['dokter', 'perawat']);
            $table->uuid('pemohon_id');
            $table->string('jenis_pengajuan', 100);
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai');
            $table->text('alasan')->nullable();
            $table->enum('status', ['menunggu', 'disetujui', 'ditolak'])->default('menunggu');
            $table->foreignUuid('disetujui_oleh_admin_id')->nullable()->constrained('admins')->nullOnDelete();
            $table->text('alasan_penolakan')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['peran_pemohon', 'pemohon_id']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pengajuan_cuti');
    }
};
