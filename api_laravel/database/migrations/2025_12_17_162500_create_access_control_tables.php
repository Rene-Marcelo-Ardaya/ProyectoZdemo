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
        // 1. Modificar users para agregar estado (Update Users Table)
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                if (!Schema::hasColumn('users', 'is_active')) {
                    $table->boolean('is_active')->default(true)->after('password');
                }
            });
        }

        // 2. Roles (Tabla de Roles)
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique(); // admin, soporte, usuario
            $table->string('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 3. Permisos (Tabla de Permisos)
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Crear Usuario
            $table->string('slug')->unique(); // users.create
            $table->string('module')->comment('Modulo al que pertenece: Sistemas, Ventas, etc');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 4. Pivot: Role - User (Relación Muchos a Muchos)
        Schema::create('role_user', function (Blueprint $table) {
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->primary(['role_id', 'user_id']);
        });

        // 5. Pivot: Permission - Role (Relación Muchos a Muchos)
        Schema::create('permission_role', function (Blueprint $table) {
            $table->foreignId('permission_id')->constrained()->cascadeOnDelete();
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->primary(['permission_id', 'role_id']);
        });

        // 6. Menus (Tabla de Menús Dinámicos y Jerárquicos)
        Schema::create('menus', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('url')->nullable();
            $table->string('icon')->nullable(); // Para referenciar iconos de Lucide/FontAwesome
            $table->foreignId('parent_id')->nullable()->constrained('menus')->nullOnDelete();
            $table->integer('order')->default(0);
            $table->string('module')->nullable()->comment('Agrupador principal del sistema');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 7. Pivot: Menu - Role (Visibilidad de menús por Rol)
        Schema::create('menu_role', function (Blueprint $table) {
            $table->foreignId('menu_id')->constrained()->cascadeOnDelete();
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->primary(['menu_id', 'role_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Eliminar tablas en orden inverso a su creación (por las Foreign Keys)
        Schema::dropIfExists('menu_role');
        Schema::dropIfExists('menus');
        Schema::dropIfExists('permission_role');
        Schema::dropIfExists('role_user');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('roles');

        // Revertir cambios en tabla users
        if (Schema::hasColumn('users', 'is_active')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('is_active');
            });
        }
    }
};
