<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Agregar 'RECEPCIONADO' al ENUM de accion en d_bitacora_ingresos.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE d_bitacora_ingresos MODIFY accion ENUM('CREADO', 'ANULADO', 'RECEPCIONADO') NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE d_bitacora_ingresos MODIFY accion ENUM('CREADO', 'ANULADO') NOT NULL");
    }
};
