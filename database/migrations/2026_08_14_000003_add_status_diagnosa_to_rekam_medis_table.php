<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Migrasi ini dikosongkan karena kolom status_diagnosa dan kategori_obat
        // telah ditambahkan langsung pada skema migrasi tabel rekam_medis dan resep_details.
        if (Schema::hasTable('rekam_medis') && !Schema::hasColumn('rekam_medis', 'status_diagnosa')) {
            Schema::table('rekam_medis', function (Blueprint $table) {
                $table->enum('status_diagnosa', ['aktif', 'sembuh', 'kronis', 'kontrol'])->default('aktif')->after('diagnosis_deskripsi');
            });
        }

        if (Schema::hasTable('resep_details') && !Schema::hasColumn('resep_details', 'kategori_obat')) {
            Schema::table('resep_details', function (Blueprint $table) {
                $table->string('kategori_obat', 50)->default('Rutin')->after('catatan');
                $table->integer('sisa_tablet')->nullable()->after('kategori_obat');
            });
        }
    }

    public function down(): void
    {
        // Safe no-op
    }
};
