<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reseps', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('no_resep', 50)->unique();
            $table->foreignUuid('pasien_id')->constrained('pasien')->cascadeOnDelete();
            $table->foreignUuid('dokter_id')->nullable()->constrained('dokters')->nullOnDelete();
            $table->foreignUuid('rekam_medis_id')->nullable()->constrained('rekam_medis')->nullOnDelete();
            $table->enum('status', ['menunggu_ditebus', 'sudah_ditebus'])->default('menunggu_ditebus');
            $table->timestamps();
        });

        Schema::create('resep_details', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('resep_id')->constrained('reseps')->cascadeOnDelete();
            $table->foreignId('obat_id')->constrained('obats')->cascadeOnDelete();
            $table->string('aturan_pakai');
            $table->integer('jumlah_dosis');
            $table->string('catatan')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resep_details');
        Schema::dropIfExists('reseps');
    }
};
