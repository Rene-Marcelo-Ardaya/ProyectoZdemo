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
        Schema::create('alert_configurations', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Nombre descriptivo: "Alertas WhatsApp Gerencia"
            $table->enum('type', ['whatsapp', 'email', 'sms', 'webhook'])->default('whatsapp');
            $table->boolean('is_enabled')->default(true);
            $table->json('config'); // {instance, destination, message_template, etc}
            $table->integer('min_interval_minutes')->default(30); // Mínimo entre alertas
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alert_configurations');
    }
};
