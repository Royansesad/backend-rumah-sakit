<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rekam_medis', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('pasien_id')->constrained('pasien')->cascadeOnDelete();
            $table->foreignUuid('dokter_id')->nullable()->constrained('dokters')->nullOnDelete();
            $table->foreignUuid('perawat_id')->nullable()->constrained('perawats')->nullOnDelete();
            $table->foreignUuid('poli_id')->nullable()->constrained('poli')->nullOnDelete();

            // Vital Signs
            $table->integer('sistol')->nullable();
            $table->integer('diastol')->nullable();
            $table->decimal('suhu_tubuh', 4, 1)->nullable();
            $table->integer('denyut_nadi')->nullable();
            $table->integer('spo2')->nullable();
            $table->enum('kondisi_pasien', ['stabil', 'perlu_perhatian', 'kritis'])->nullable();

            // Catatan Perawat
            $table->text('catatan_keperawatan')->nullable();

            // Pemeriksaan Dokter
            $table->text('keluhan_utama');
            $table->string('icd10_code', 10)->nullable();
            $table->text('diagnosis_deskripsi')->nullable();
            $table->text('catatan_dokter')->nullable();

            // File Upload
            $table->string('lampiran_path')->nullable();

            // Status
            $table->enum('status', ['draft', 'final'])->default('draft');
            $table->timestamp('finalized_at')->nullable();

            $table->timestamps();

            $table->index('icd10_code');
            $table->foreign('icd10_code')->references('code')->on('icd10_codes')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rekam_medis');
    }
};
