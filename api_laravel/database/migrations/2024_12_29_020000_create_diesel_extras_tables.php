<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Módulo Diesel - Tablas adicionales
     * Proveedores, Tipos de Pago, Motivos de Ajuste
     */
    public function up(): void
    {
        // =============================================
        // PROVEEDORES
        // =============================================
        Schema::create('d_proveedores', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100);
            $table->string('razon_social', 150)->nullable();
            $table->string('nit', 50)->nullable();
            $table->string('telefono', 50)->nullable();
            $table->string('celular', 50)->nullable();
            $table->text('direccion')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // =============================================
        // TIPOS DE PAGO
        // =============================================
        Schema::create('d_tipos_pago', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 50);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // =============================================
        // MOTIVOS DE AJUSTE
        // =============================================
        Schema::create('d_motivos_ajuste', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Rollback
     */
    public function down(): void
    {
        Schema::dropIfExists('d_motivos_ajuste');
        Schema::dropIfExists('d_tipos_pago');
        Schema::dropIfExists('d_proveedores');
    }
};
