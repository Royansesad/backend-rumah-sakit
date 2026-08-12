<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tagihans', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('no_invoice')->unique();
            $table->foreignUuid('pasien_id')->constrained('pasien')->cascadeOnDelete();
            $table->string('layanan')->default('Poli Umum');
            $table->unsignedBigInteger('subtotal')->default(0);
            $table->unsignedBigInteger('diskon')->default(0);
            $table->unsignedBigInteger('pajak')->default(0);
            $table->unsignedBigInteger('total_tagihan')->default(0);
            $table->unsignedBigInteger('jumlah_dibayar')->default(0);
            $table->unsignedBigInteger('kembalian')->default(0);
            $table->string('status')->default('belum_lunas'); // belum_lunas, lunas, dibatalkan
            $table->string('metode_pembayaran')->nullable(); // tunai, kartu, qris, bpjs, asuransi
            $table->dateTime('waktu_pembayaran')->nullable();
            $table->uuid('kasir_id')->nullable();
            $table->json('rincian')->nullable();
            $table->text('catatan')->nullable();
            $table->timestamps();

            $table->index('no_invoice');
            $table->index('status');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tagihans');
    }
};
