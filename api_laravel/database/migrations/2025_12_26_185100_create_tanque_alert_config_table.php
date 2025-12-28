<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tanque_alert_config', function (Blueprint $table) {
            $table->foreignId('tanque_id')->constrained()->cascadeOnDelete();
            $table->foreignId('alert_configuration_id')->constrained()->cascadeOnDelete();
            $table->timestamp('last_alert_at')->nullable(); // Para controlar frecuencia
            $table->primary(['tanque_id', 'alert_configuration_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tanque_alert_config');
    }
};
