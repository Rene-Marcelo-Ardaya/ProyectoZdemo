<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('personal', function (Blueprint $table) {
            // Eliminar codigo_empleado si existe
            if (Schema::hasColumn('personal', 'codigo_empleado')) {
                // Eliminar índice único si existe (usando try-catch para Laravel 11+)
                try {
                    $table->dropUnique(['codigo_empleado']);
                } catch (\Exception $e) {
                    // El índice no existe, continuamos
                }
                $table->dropColumn('codigo_empleado');
            }
            
            // Agregar PIN si no existe (hasheado, por eso 255 caracteres)
            if (!Schema::hasColumn('personal', 'pin')) {
                $table->string('pin', 255)->nullable()->after('ci');
            }
        });

        // Actualizar enum estado a solo activo/inactivo
        // Primero convertir valores existentes
        DB::table('personal')->where('estado', 'licencia')->update(['estado' => 'inactivo']);
        DB::table('personal')->where('estado', 'vacaciones')->update(['estado' => 'inactivo']);
        DB::table('personal')->where('estado', 'baja_medica')->update(['estado' => 'inactivo']);

        // Cambiar el enum (MySQL)
        DB::statement("ALTER TABLE personal MODIFY estado ENUM('activo','inactivo') DEFAULT 'activo'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Restaurar enum original
        DB::statement("ALTER TABLE personal MODIFY estado ENUM('activo','inactivo','licencia','vacaciones','baja_medica') DEFAULT 'activo'");

        Schema::table('personal', function (Blueprint $table) {
            // Quitar PIN
            $table->dropColumn('pin');
            
            // Restaurar codigo_empleado
            $table->string('codigo_empleado', 20)->unique()->after('id');
        });
    }
};
