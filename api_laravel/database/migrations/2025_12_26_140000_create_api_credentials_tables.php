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
        // Tabla principal de credenciales de APIs
        Schema::create('api_credentials', function (Blueprint $table) {
            $table->id();
            $table->string('provider');        // 'pusher', 'twilio', 'stripe', etc.
            $table->string('key_name');        // 'app_id', 'app_key', 'app_secret', etc.
            $table->text('value_encrypted');   // Valor encriptado con Crypt::encrypt()
            $table->boolean('is_secret')->default(false); // Si es un secret (mostrar enmascarado)
            $table->boolean('is_active')->default(true);
            $table->string('label')->nullable(); // Etiqueta legible
            $table->text('description')->nullable(); // Descripción de ayuda
            $table->timestamps();
            $table->unique(['provider', 'key_name']);
        });

        // Tabla de auditoría para cambios en credenciales
        Schema::create('api_credentials_audit_log', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('user_name');       // Nombre para referencia rápida
            $table->string('provider');        // pusher, twilio, etc.
            $table->string('key_name');        // Qué key se modificó
            $table->enum('action', ['create', 'update', 'delete', 'view']);
            $table->string('old_value_hash')->nullable();  // Hash SHA256 del valor anterior
            $table->string('new_value_hash')->nullable();  // Hash SHA256 del nuevo valor
            $table->string('ip_address');
            $table->string('user_agent')->nullable();
            $table->timestamp('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('api_credentials_audit_log');
        Schema::dropIfExists('api_credentials');
    }
};
