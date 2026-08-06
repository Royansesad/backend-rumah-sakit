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
            $table->string('kode_obat', 50)->unique();
            $table->string('nama_obat', 150);
            $table->string('bentuk_sediaan', 50);
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
