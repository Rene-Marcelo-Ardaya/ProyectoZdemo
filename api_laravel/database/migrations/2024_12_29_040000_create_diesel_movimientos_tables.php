<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tablas para el sistema de movimientos de Diesel
     * 1. d_tipo_movimientos - Catálogo de tipos
     * 2. d_movimientos - Trazabilidad central
     * 3. d_ingresos - Cabecera de compras
     * 4. d_ingreso_detalles - Distribución a tanques
     * 5. d_bitacora_ingresos - Auditoría
     */
    public function up(): void
    {
        // =============================================
        // 1. TIPO DE MOVIMIENTOS (catálogo dinámico)
        // =============================================
        Schema::create('d_tipo_movimientos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 50);
            $table->string('descripcion')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // =============================================
        // 2. MOVIMIENTOS (trazabilidad central)
        // =============================================
        Schema::create('d_movimientos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('d_tipo_movimiento_id')->constrained('d_tipo_movimientos');
            $table->unsignedBigInteger('id_origen')->comment('ID del registro origen (ingreso, egreso, etc.)');
            $table->date('fecha');
            $table->foreignId('d_tanque_id')->constrained('d_tanques');
            $table->decimal('litros', 12, 2);
            $table->decimal('stock_antes', 12, 2);
            $table->decimal('stock_despues', 12, 2);
            $table->enum('estado', ['ACTIVO', 'ANULADO'])->default('ACTIVO');
            $table->foreignId('user_id')->constrained('users');
            $table->timestamp('created_at')->useCurrent();

            $table->index(['d_tipo_movimiento_id', 'id_origen']);
            $table->index('fecha');
        });

        // =============================================
        // 3. INGRESOS (cabecera de compras)
        // =============================================
        Schema::create('d_ingresos', function (Blueprint $table) {
            $table->id();
            $table->date('fecha');
            $table->foreignId('d_proveedor_id')->constrained('d_proveedores');
            $table->foreignId('d_tipo_pago_id')->constrained('d_tipos_pago');
            $table->unsignedInteger('numero_factura')->nullable()->comment('Correlativo global');
            $table->unsignedInteger('numero_factura_dia')->nullable()->comment('Correlativo diario');
            $table->string('nombre_chofer', 150)->nullable();
            $table->string('placa_vehiculo', 20)->nullable();
            $table->decimal('total_litros', 12, 2);
            $table->decimal('precio_unitario', 12, 4);
            $table->decimal('total', 14, 2);
            $table->text('observaciones')->nullable();
            $table->enum('estado', ['ACTIVO', 'ANULADO'])->default('ACTIVO');
            $table->foreignId('user_id')->constrained('users');
            $table->timestamp('created_at')->useCurrent();

            $table->index('fecha');
            $table->index('estado');
        });

        // =============================================
        // 4. DETALLE DE INGRESOS (distribución a tanques)
        // =============================================
        Schema::create('d_ingreso_detalles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('d_ingreso_id')->constrained('d_ingresos')->cascadeOnDelete();
            $table->foreignId('d_tanque_id')->constrained('d_tanques');
            $table->decimal('litros', 12, 2);
            $table->timestamp('created_at')->useCurrent();
        });

        // =============================================
        // 5. BITÁCORA DE INGRESOS (auditoría)
        // =============================================
        Schema::create('d_bitacora_ingresos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('d_ingreso_id')->constrained('d_ingresos')->cascadeOnDelete();
            $table->enum('accion', ['CREADO', 'ANULADO']);
            $table->foreignId('user_id')->constrained('users');
            $table->string('ip', 45)->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('d_bitacora_ingresos');
        Schema::dropIfExists('d_ingreso_detalles');
        Schema::dropIfExists('d_ingresos');
        Schema::dropIfExists('d_movimientos');
        Schema::dropIfExists('d_tipo_movimientos');
    }
};
