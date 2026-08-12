<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asset_maintenances', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->date('tanggal');
            $table->string('jenis', 30); // rutin, perbaikan, kalibrasi
            $table->decimal('biaya', 15, 2)->default(0);
            $table->string('vendor', 200)->nullable();
            $table->text('keterangan')->nullable();
            $table->string('status', 20)->default('menunggu'); // menunggu, selesai
            $table->string('operator_role', 50)->nullable();
            $table->uuid('operator_id')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('tanggal');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_maintenances');
    }
};