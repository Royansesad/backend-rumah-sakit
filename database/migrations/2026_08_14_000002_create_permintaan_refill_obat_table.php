<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('permintaan_refill_obat', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('pasien_id')->constrained('pasien')->cascadeOnDelete();
            $table->foreignUuid('resep_id')->nullable()->constrained('reseps')->nullOnDelete();
            $table->foreignId('obat_id')->nullable()->constrained('obats')->nullOnDelete();
            $table->string('nama_obat', 200);
            $table->integer('dosis_diminta')->default(30);
            $table->text('catatan')->nullable();
            $table->enum('status', ['menunggu_konfirmasi', 'disetujui', 'siap_diambil', 'ditolak'])->default('menunggu_konfirmasi');
            $table->text('catatan_apoteker')->nullable();
            $table->timestamps();

            $table->index('pasien_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('permintaan_refill_obat');
    }
};
