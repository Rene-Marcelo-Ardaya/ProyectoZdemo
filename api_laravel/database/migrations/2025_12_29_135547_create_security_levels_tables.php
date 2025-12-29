<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tabla de Niveles/Grupos de Seguridad
        Schema::create('niveles_seguridad', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 50)->unique(); // "Administración", "Ventas", "RRHH"
            $table->string('color', 7)->default('#6b7280'); // Hex color
            $table->text('descripcion')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Tabla de Componentes protegidos
        Schema::create('componente_seguridad', function (Blueprint $table) {
            $table->id();
            $table->string('componente_id', 100);   // ID único del botón: "usuarios.crear"
            $table->string('pagina', 100);          // Ruta: "/sistemas/usuarios"
            $table->string('descripcion')->nullable();
            $table->foreignId('nivel_seguridad_id')->constrained('niveles_seguridad')->cascadeOnDelete();
            $table->timestamps();

            $table->unique('componente_id'); // Cada componente solo tiene un nivel asignado
        });

        // 3. Agregar FK en tabla personal (empleados)
        if (Schema::hasTable('personal')) {
            if (!Schema::hasColumn('personal', 'nivel_seguridad_id')) {
                Schema::table('personal', function (Blueprint $table) {
                    $table->foreignId('nivel_seguridad_id')
                          ->nullable()
                          ->after('cargo_id')
                          ->constrained('niveles_seguridad')
                          ->nullOnDelete();
                });
            }
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('personal', 'nivel_seguridad_id')) {
            Schema::table('personal', function (Blueprint $table) {
                $table->dropForeign(['nivel_seguridad_id']);
                $table->dropColumn('nivel_seguridad_id');
            });
        }
        Schema::dropIfExists('componente_seguridad');
        Schema::dropIfExists('niveles_seguridad');
    }
};
