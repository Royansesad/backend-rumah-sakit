<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loket_antrian', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('poli_id')->constrained('poli')->cascadeOnDelete();
            $table->string('nomor_loket', 20);
            $table->string('nama_loket', 100);
            $table->boolean('is_aktif')->default(true);
            $table->timestamps();

            $table->index('poli_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loket_antrian');
    }
};
