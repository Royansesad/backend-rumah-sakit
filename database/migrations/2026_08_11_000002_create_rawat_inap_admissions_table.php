<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rawat_inap_admissions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nomor_admission', 50)->unique();
            $table->foreignUuid('pasien_id')->constrained('pasien')->cascadeOnDelete();
            $table->foreignUuid('bed_id')->constrained('beds')->cascadeOnDelete();
            $table->foreignUuid('ruangan_id')->nullable()->constrained('ruangan')->nullOnDelete();
            $table->foreignUuid('bangsal_id')->nullable()->constrained('bangsal')->nullOnDelete();
            $table->foreignUuid('dpjp_id')->nullable()->constrained('dokters')->nullOnDelete(); // Dokter Penanggung Jawab Pelayanan
            $table->dateTime('tanggal_masuk');
            $table->dateTime('tanggal_keluar_rencana')->nullable();
            $table->dateTime('tanggal_keluar_aktual')->nullable();
            $table->enum('status', ['aktif', 'pulang_sembuh', 'pulang_paksa', 'dirujuk', 'meninggal'])->default('aktif');
            $table->text('alasan_masuk')->nullable();
            $table->text('diagnosa_awal')->nullable();
            $table->text('ringkasan_pulang')->nullable();
            $table->uuid('didaftarkan_oleh')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('tanggal_masuk');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rawat_inap_admissions');
    }
};
