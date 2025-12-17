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
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // Clave única para cada configuración
            $table->text('value')->nullable(); // Valor (puede ser URL, texto, JSON, etc.)
            $table->string('type')->default('text'); // Tipo: text, image, json, boolean
            $table->string('group')->default('general'); // Agrupación: branding, general, etc.
            $table->string('label')->nullable(); // Etiqueta legible para mostrar
            $table->text('description')->nullable(); // Descripción de ayuda
            $table->boolean('is_public')->default(false); // Si se puede acceder sin auth
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
