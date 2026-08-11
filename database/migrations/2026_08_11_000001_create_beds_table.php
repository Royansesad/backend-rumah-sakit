<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('beds', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nomor_bed', 50);
            $table->foreignUuid('ruangan_id')->nullable()->constrained('ruangan')->nullOnDelete();
            $table->foreignUuid('bangsal_id')->nullable()->constrained('bangsal')->nullOnDelete();
            $table->enum('kelas', ['VIP', 'Kelas 1', 'Kelas 2', 'Kelas 3', 'ICU', 'HCU', 'Isolasi'])->default('Kelas 3');
            $table->decimal('tarif_per_hari', 12, 2)->default(0);
            $table->enum('status', ['tersedia', 'terisi', 'pemeliharaan', 'dibersihkan'])->default('tersedia');
            $table->text('catatan')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['ruangan_id', 'nomor_bed']);
            $table->index('status');
            $table->index('kelas');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('beds');
    }
};
