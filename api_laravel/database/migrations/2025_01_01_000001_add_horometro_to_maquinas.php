<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Agregar campo horómetro a máquinas
     */
    public function up(): void
    {
        Schema::table('d_maquinas', function (Blueprint $table) {
            $table->decimal('horometro_actual', 10, 2)->default(0)->after('d_division_id');
        });
    }

    /**
     * Quitar campo horómetro
     */
    public function down(): void
    {
        Schema::table('d_maquinas', function (Blueprint $table) {
            $table->dropColumn('horometro_actual');
        });
    }
};
