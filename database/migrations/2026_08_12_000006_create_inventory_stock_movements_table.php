<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_stock_movements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('inventory_item_id')->constrained('inventory_items')->cascadeOnDelete();
            $table->string('tipe', 30); // masuk, keluar, transfer, penyesuaian, retur, kadaluarsa
            $table->integer('qty'); // positif = masuk, negatif = keluar
            $table->foreignUuid('warehouse_id')->nullable()->constrained('warehouses')->nullOnDelete();
            $table->string('referensi', 150)->nullable(); // No. PO / No. Resep / No. Pasien
            $table->string('keterangan', 255)->nullable();
            $table->integer('stok_setelah')->default(0);
            $table->string('operator_role', 50)->nullable();
            $table->uuid('operator_id')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('tipe');
            $table->index('referensi');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_stock_movements');
    }
};