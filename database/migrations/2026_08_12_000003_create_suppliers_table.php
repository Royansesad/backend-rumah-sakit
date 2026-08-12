<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('suppliers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nama_supplier', 200)->unique();
            $table->string('kontak', 150)->nullable();
            $table->string('telepon', 50)->nullable();
            $table->string('email', 150)->nullable();
            $table->text('alamat')->nullable();
            $table->string('npwp', 50)->nullable();
            $table->boolean('is_aktif')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('suppliers');
    }
};