<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Módulo Diesel - Tablas de Egresos (Salidas de combustible)
     */
    public function up(): void
    {
        // =============================================
        // TABLA PRINCIPAL: EGRESOS
        // =============================================
        Schema::create('d_egresos', function (Blueprint $table) {
            $table->id();
            $table->date('fecha');
            
            // Relación con tanque
            $table->unsignedBigInteger('d_tanque_id');
            $table->foreign('d_tanque_id')
                ->references('id')
                ->on('d_tanques')
                ->cascadeOnDelete();
            
            // Tipo de egreso
            $table->enum('tipo', ['INTERNO', 'EXTERNO']);
            
            // Relación con máquina (solo INTERNO)
            $table->unsignedBigInteger('d_maquina_id')->nullable();
            $table->foreign('d_maquina_id')
                ->references('id')
                ->on('d_maquinas')
                ->nullOnDelete();
            
            // Relación con trabajo (obligatorio)
            $table->unsignedBigInteger('d_trabajo_id');
            $table->foreign('d_trabajo_id')
                ->references('id')
                ->on('d_trabajos')
                ->cascadeOnDelete();
            
            // Horómetro de la máquina al momento del despacho (solo INTERNO)
            $table->decimal('horometro', 10, 2)->nullable();
            
            // Personal que entrega (asignado al tanque)
            $table->unsignedBigInteger('personal_entrega_id')->nullable();
            $table->foreign('personal_entrega_id')
                ->references('id')
                ->on('personal')
                ->nullOnDelete();
            
            // Personal que recibe (solo INTERNO)
            $table->unsignedBigInteger('personal_recibe_id')->nullable();
            $table->foreign('personal_recibe_id')
                ->references('id')
                ->on('personal')
                ->nullOnDelete();
            
            // Validación de PINs
            $table->boolean('pin_entrega_validado')->default(false);
            $table->boolean('pin_recibo_validado')->default(false);
            
            // Lecturas del tanque
            $table->decimal('inicio_tanque_sistema', 12, 2)->nullable(); // Stock del sistema al momento
            $table->decimal('inicio_tanque', 12, 2)->nullable();         // Lectura inicial digitada
            $table->decimal('fin_tanque', 12, 2)->nullable();            // Lectura final digitada
            $table->decimal('litros', 12, 2)->nullable();                // Calculado: inicio - fin
            
            // Datos para EXTERNO
            $table->string('nombre_chofer', 150)->nullable();
            $table->string('carnet_chofer', 50)->nullable();
            $table->string('placa_vehiculo', 20)->nullable();
            
            // Foto y observaciones
            $table->string('foto', 255)->nullable();
            $table->text('observaciones')->nullable();
            
            // Estado
            $table->enum('estado', ['PENDIENTE', 'COMPLETADO', 'ANULADO'])->default('PENDIENTE');
            
            // Usuario que crea
            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();
            
            $table->timestamps();
            
            // Índices
            $table->index(['fecha', 'tipo']);
            $table->index('estado');
        });

        // =============================================
        // TABLA DE BITÁCORA (AUDITORÍA)
        // =============================================
        Schema::create('d_bitacora_egresos', function (Blueprint $table) {
            $table->id();
            
            $table->unsignedBigInteger('d_egreso_id');
            $table->foreign('d_egreso_id')
                ->references('id')
                ->on('d_egresos')
                ->cascadeOnDelete();
            
            $table->enum('accion', ['CREADO', 'COMPLETADO', 'ANULADO']);
            
            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();
            
            $table->string('ip', 45)->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Rollback
     */
    public function down(): void
    {
        Schema::dropIfExists('d_bitacora_egresos');
        Schema::dropIfExists('d_egresos');
    }
};
