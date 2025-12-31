<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Agregar columnas para registrar lecturas de tanque en recepción.
     */
    public function up(): void
    {
        Schema::table('d_ingreso_detalles', function (Blueprint $table) {
            $table->decimal('inicio_tanque', 12, 2)->nullable()->after('litros')
                ->comment('Lectura inicial del tanque al momento de recepción');
            $table->decimal('final_tanque', 12, 2)->nullable()->after('inicio_tanque')
                ->comment('Lectura final del tanque después de recepción');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('d_ingreso_detalles', function (Blueprint $table) {
            $table->dropColumn(['inicio_tanque', 'final_tanque']);
        });
    }
};
