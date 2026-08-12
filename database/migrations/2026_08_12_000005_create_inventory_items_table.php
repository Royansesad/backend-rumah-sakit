<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('kode_barang', 100)->unique();
            $table->string('nama_barang', 255)->index();
            $table->foreignUuid('inventory_category_id')->nullable()->constrained('inventory_categories')->nullOnDelete();
            $table->string('satuan', 50)->default('pcs');
            $table->integer('stok_minimum')->default(0);
            $table->integer('stok_saat_ini')->default(0);
            $table->decimal('harga_beli', 12, 2)->default(0);
            $table->decimal('harga_jual', 12, 2)->default(0);
            $table->foreignUuid('warehouse_id')->nullable()->constrained('warehouses')->nullOnDelete();
            $table->foreignUuid('supplier_id')->nullable()->constrained('suppliers')->nullOnDelete();
            $table->date('masa_berlaku')->nullable();
            $table->text('deskripsi')->nullable();
            $table->boolean('is_aktif')->default(true);
            $table->timestamps();

            $table->index('stok_saat_ini');
            $table->index(['masa_berlaku', 'is_aktif']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_items');
    }
};