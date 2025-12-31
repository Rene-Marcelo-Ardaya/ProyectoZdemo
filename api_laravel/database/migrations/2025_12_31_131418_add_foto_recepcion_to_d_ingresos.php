<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Agregar columna para almacenar foto de recepción.
     */
    public function up(): void
    {
        Schema::table('d_ingresos', function (Blueprint $table) {
            $table->string('foto_recepcion')->nullable()->after('observaciones')
                ->comment('Ruta de la foto del camión/chofer en la recepción');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('d_ingresos', function (Blueprint $table) {
            $table->dropColumn('foto_recepcion');
        });
    }
};
