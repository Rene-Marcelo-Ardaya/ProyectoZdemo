<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Módulo Diesel - Tablas base
     * Prefijo: d_ para identificar tablas del sistema diesel
     */
    public function up(): void
    {
        // =============================================
        // 1. CATÁLOGOS BASE (sin FKs)
        // =============================================

        // Divisiones de la empresa
        Schema::create('d_divisiones', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Tipos de trabajo
        Schema::create('d_trabajos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // =============================================
        // 2. UBICACIONES (depende de divisiones)
        // =============================================

        Schema::create('d_ubicaciones_fisicas', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100);
            $table->unsignedBigInteger('d_division_id')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('d_division_id')
                ->references('id')
                ->on('d_divisiones')
                ->nullOnDelete();
        });

        // =============================================
        // 3. ACTIVOS
        // =============================================

        // Tanques de combustible
        Schema::create('d_tanques', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100);
            $table->enum('tipo', ['FIJO', 'MOVIL']);
            $table->unsignedBigInteger('d_ubicacion_fisica_id');
            $table->decimal('capacidad_maxima', 12, 2);
            $table->decimal('stock_actual', 12, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('d_ubicacion_fisica_id')
                ->references('id')
                ->on('d_ubicaciones_fisicas')
                ->cascadeOnDelete();
        });

        // Máquinas
        Schema::create('d_maquinas', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 50)->unique();
            $table->unsignedBigInteger('d_division_id');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('d_division_id')
                ->references('id')
                ->on('d_divisiones')
                ->cascadeOnDelete();
        });
    }

    /**
     * Rollback - eliminar en orden inverso por FKs
     */
    public function down(): void
    {
        Schema::dropIfExists('d_maquinas');
        Schema::dropIfExists('d_tanques');
        Schema::dropIfExists('d_ubicaciones_fisicas');
        Schema::dropIfExists('d_trabajos');
        Schema::dropIfExists('d_divisiones');
    }
};
