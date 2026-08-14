<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pemeriksaan_radiologi', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('pasien_id')->constrained('pasien')->cascadeOnDelete();
            $table->foreignUuid('dokter_id')->nullable()->constrained('dokters')->nullOnDelete();
            $table->foreignUuid('rekam_medis_id')->nullable()->constrained('rekam_medis')->nullOnDelete();
            $table->string('judul_pemeriksaan', 200); // e.g. "CT Scan Kepala (Non-Contrast)"
            $table->string('kategori', 100)->default('CT Scan'); // CT Scan, Rontgen Thorax, USG, MRI
            $table->date('tanggal_pemeriksaan');
            $table->string('dokter_radiologi', 150); // e.g. "Dr. Siska Radiologi" / "dr. Siska Amelia, Sp.Rad"
            $table->text('indikasi_klinis')->nullable();
            $table->text('temuan')->nullable();
            $table->text('kesimpulan')->nullable();
            $table->string('file_path')->nullable();
            $table->string('status', 50)->default('selesai');
            $table->timestamps();

            $table->index('pasien_id');
            $table->index('tanggal_pemeriksaan');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pemeriksaan_radiologi');
    }
};
