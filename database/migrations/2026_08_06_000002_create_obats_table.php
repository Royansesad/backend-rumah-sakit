<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('obats', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('unit_farmasi_id')->nullable()->constrained('unit_farmasi')->nullOnDelete();
            $table->string('kode_obat', 100)->unique();
            $table->string('nie', 100)->nullable()->index();
            $table->string('nama_obat', 255)->index();
            $table->string('bentuk_sediaan', 255)->nullable();
            $table->text('kemasan')->nullable();
            $table->text('komposisi')->nullable();
            $table->string('pendaftar', 255)->nullable();
            $table->date('tanggal_terbit')->nullable();
            $table->date('masa_berlaku')->nullable();
            $table->string('diterbitkan_oleh', 255)->nullable();
            $table->integer('stok')->default(0);
            $table->decimal('harga', 12, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('obats');
    }
};
