<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Agregar estado 'PENDIENTE' y 'FINALIZADO' al ENUM de d_ingresos
     * para soportar el flujo de recepción de combustible.
     */
    public function up(): void
    {
        // Modificar el ENUM para incluir PENDIENTE y FINALIZADO
        DB::statement("ALTER TABLE d_ingresos MODIFY estado ENUM('ACTIVO', 'ANULADO', 'PENDIENTE', 'FINALIZADO') DEFAULT 'PENDIENTE'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revertir al ENUM original
        DB::statement("ALTER TABLE d_ingresos MODIFY estado ENUM('ACTIVO', 'ANULADO') DEFAULT 'ACTIVO'");
    }
};
