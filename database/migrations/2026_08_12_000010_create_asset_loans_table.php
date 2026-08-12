<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asset_loans', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->string('unit_peminjam', 200);
            $table->string('penanggung_jawab', 150)->nullable();
            $table->date('tanggal_pinjam');
            $table->date('tanggal_kembali')->nullable();
            $table->text('keterangan')->nullable();
            $table->string('status', 20)->default('dipinjam'); // dipinjam, dikembalikan
            $table->string('operator_role', 50)->nullable();
            $table->uuid('operator_id')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('tanggal_pinjam');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_loans');
    }
};