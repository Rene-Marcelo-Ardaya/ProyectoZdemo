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
        // Tabla de módulos disponibles
        Schema::create('modules', function (Blueprint $table) {
            $table->id();
            $table->string('name');                    // "Tanques", "Notificaciones", etc.
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('icon')->nullable();        // Icono para mostrar en UI
            $table->decimal('price_monthly', 10, 2)->default(0);
            $table->boolean('is_addon')->default(false); // true = comprable por separado
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // Módulos incluidos en cada plan
        Schema::create('plan_module', function (Blueprint $table) {
            $table->foreignId('plan_id')->constrained('plans')->onDelete('cascade');
            $table->foreignId('module_id')->constrained('modules')->onDelete('cascade');
            $table->primary(['plan_id', 'module_id']);
        });

        // Módulos adicionales comprados por tenant (add-ons)
        Schema::create('tenant_module', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('module_id')->constrained('modules')->onDelete('cascade');
            $table->timestamp('purchased_at')->useCurrent();
            $table->timestamp('expires_at')->nullable();
            $table->decimal('price_paid', 10, 2)->default(0);
            $table->timestamps();
            
            $table->unique(['tenant_id', 'module_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenant_module');
        Schema::dropIfExists('plan_module');
        Schema::dropIfExists('modules');
    }
};
