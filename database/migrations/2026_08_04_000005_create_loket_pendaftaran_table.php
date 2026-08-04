<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loket_pendaftaran', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nama_loket', 100);
            $table->string('lokasi', 200)->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loket_pendaftaran');
    }
};
