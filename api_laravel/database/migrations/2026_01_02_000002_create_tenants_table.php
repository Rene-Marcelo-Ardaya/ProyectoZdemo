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
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->string('name');                    // Nombre de la empresa
            $table->string('slug')->unique();          // Identificador único (para subdomain)
            $table->string('custom_domain')->nullable()->unique(); // Dominio personalizado
            $table->foreignId('plan_id')->constrained('plans')->onDelete('restrict');
            $table->string('email')->nullable();       // Email de contacto principal
            $table->string('phone')->nullable();       // Teléfono de contacto
            $table->string('logo')->nullable();        // Path al logo
            $table->json('settings')->nullable();      // Config personalizada (colores, etc.)
            $table->boolean('is_active')->default(true);
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('subscription_ends_at')->nullable();
            $table->timestamps();
            
            // Índices para búsqueda rápida
            $table->index('slug');
            $table->index('custom_domain');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
