<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('personal', function (Blueprint $table) {
            // ==========================================
            // MODIFICACIONES DE NOMBRE
            // ==========================================
            // Renombrar apellidos a apellido_paterno
            $table->renameColumn('apellidos', 'apellido_paterno');
        });

        Schema::table('personal', function (Blueprint $table) {
            // Limitar apellido_paterno a 100 caracteres y añadir apellido_materno
            $table->string('apellido_paterno', 100)->change();
            $table->string('apellido_materno', 100)->nullable()->after('apellido_paterno');
            
            // ==========================================
            // NUEVOS CAMPOS LABORALES
            // ==========================================
            // Código identificador único
            $table->string('codigo_empleado', 20)->unique()->nullable()->after('id');
            
            // Relación con cargo
            $table->foreignId('cargo_id')->nullable()->after('notas')
                  ->constrained('cargos')->nullOnDelete();
            
            // Datos laborales
            $table->date('fecha_ingreso')->nullable()->after('cargo_id');
            $table->date('fecha_salida')->nullable()->after('fecha_ingreso');
            $table->decimal('salario', 12, 2)->nullable()->after('fecha_salida');
            $table->string('tipo_contrato', 50)->nullable()->after('salario');
            $table->enum('estado_laboral', ['activo', 'inactivo'])->default('activo')->after('tipo_contrato');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('personal', function (Blueprint $table) {
            // Eliminar campos laborales
            $table->dropForeign(['cargo_id']);
            $table->dropColumn([
                'codigo_empleado',
                'cargo_id',
                'fecha_ingreso',
                'fecha_salida',
                'salario',
                'tipo_contrato',
                'estado_laboral',
                'apellido_materno',
            ]);
        });

        Schema::table('personal', function (Blueprint $table) {
            // Revertir apellido_paterno a apellidos
            $table->renameColumn('apellido_paterno', 'apellidos');
        });

        Schema::table('personal', function (Blueprint $table) {
            $table->string('apellidos', 150)->change();
        });
    }
};
