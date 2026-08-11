<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('riwayat_pindah_bed', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('admission_id')->constrained('rawat_inap_admissions')->cascadeOnDelete();
            $table->foreignUuid('bed_asal_id')->nullable()->constrained('beds')->nullOnDelete();
            $table->foreignUuid('bed_tujuan_id')->constrained('beds')->cascadeOnDelete();
            $table->dateTime('tanggal_pindah');
            $table->text('alasan_pindah')->nullable();
            $table->uuid('petugas_id')->nullable();
            $table->timestamps();

            $table->index('tanggal_pindah');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('riwayat_pindah_bed');
    }
};
