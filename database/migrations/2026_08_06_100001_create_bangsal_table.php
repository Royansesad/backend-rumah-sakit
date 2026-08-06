<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bangsal', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('kode_bangsal', 20)->unique();
            $table->string('nama_bangsal', 100);
            $table->integer('kapasitas')->default(0);
            $table->boolean('is_aktif')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bangsal');
    }
};
