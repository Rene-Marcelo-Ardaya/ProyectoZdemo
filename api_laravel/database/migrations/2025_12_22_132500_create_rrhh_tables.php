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
        // 1. Tabla de Cargos
        Schema::create('cargos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100);
            $table->text('descripcion')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Tabla de Personal
        Schema::create('personal', function (Blueprint $table) {
            $table->id();
            $table->string('codigo_empleado', 20)->unique();
            $table->string('nombre', 100);
            $table->string('apellido_paterno', 100);
            $table->string('apellido_materno', 100)->nullable();
            $table->string('ci', 20)->unique();
            $table->date('fecha_nacimiento')->nullable();
            $table->enum('genero', ['M', 'F', 'O'])->nullable();
            $table->text('direccion')->nullable();
            $table->string('telefono', 20)->nullable();
            $table->string('email')->nullable();
            $table->foreignId('cargo_id')->constrained('cargos')->restrictOnDelete();
            $table->date('fecha_ingreso');
            $table->date('fecha_salida')->nullable();
            $table->decimal('salario', 12, 2)->nullable();
            $table->string('tipo_contrato', 50)->nullable();
            $table->enum('estado', ['activo', 'inactivo', 'licencia', 'vacaciones'])->default('activo');
            $table->text('observaciones')->nullable();
            // Relación 1:1 con users (unique constraint)
            $table->foreignId('user_id')->nullable()->unique()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('personal');
        Schema::dropIfExists('cargos');
    }
};
