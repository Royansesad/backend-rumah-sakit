<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('pembuat_type', 50);
            $table->uuid('pembuat_id');
            $table->string('modul', 100);
            $table->string('aksi', 100);
            $table->text('data_sebelum')->nullable();
            $table->text('data_sesudah')->nullable();
            $table->string('ip_address', 50)->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->string('user_agent', 255)->nullable();
            $table->string('target_label', 100)->nullable();
            $table->string('target_id', 100)->nullable();
            $table->text('alasan')->nullable();

            $table->index(['pembuat_type', 'pembuat_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
