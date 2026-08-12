<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('kode_aset', 100)->unique();
            $table->string('nama_aset', 255)->index();
            $table->foreignUuid('asset_category_id')->nullable()->constrained('asset_categories')->nullOnDelete();
            $table->string('merk', 150)->nullable();
            $table->string('model', 150)->nullable();
            $table->string('nomor_seri', 150)->nullable();
            $table->date('tanggal_perolehan')->nullable();
            $table->decimal('nilai_perolehan', 15, 2)->default(0);
            $table->integer('umur_ekonomis_tahun')->default(5);
            $table->decimal('nilai_residu', 15, 2)->default(0);
            $table->foreignUuid('ruangan_id')->nullable()->constrained('ruangan')->nullOnDelete();
            $table->string('lokasi', 255)->nullable();
            $table->string('status', 30)->default('aktif'); // aktif, rusak, maintenance, dipinjam, dihapuskan
            $table->string('penanggung_jawab', 150)->nullable();
            $table->foreignUuid('supplier_id')->nullable()->constrained('suppliers')->nullOnDelete();
            $table->date('garansi_sampai')->nullable();
            $table->text('deskripsi')->nullable();
            $table->boolean('is_aktif')->default(true);
            $table->timestamps();

            $table->index('status');
            $table->index('tanggal_perolehan');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};