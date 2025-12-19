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
        // Obtener el ID del menú padre "Sistemas"
        $sistemasMenu = DB::table('menus')
            ->where('name', 'Sistemas')
            ->whereNull('parent_id')
            ->first();

        if (!$sistemasMenu) {
            return; // No se puede agregar sin menú padre
        }

        // Verificar si ya existe el menú
        $exists = DB::table('menus')
            ->where('url', '/sistemas/menus')
            ->exists();

        if ($exists) {
            return; // Ya existe
        }

        // Crear el nuevo menú
        $menuId = DB::table('menus')->insertGetId([
            'name' => 'Administración de Menús',
            'url' => '/sistemas/menus',
            'icon' => 'FolderTree',
            'parent_id' => $sistemasMenu->id,
            'order' => 4,
            'module' => 'Sistemas',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Obtener el rol super-admin
        $superAdminRole = DB::table('roles')
            ->where('slug', 'super-admin')
            ->first();

        if ($superAdminRole) {
            // Asignar solo al rol super-admin
            DB::table('menu_role')->insertOrIgnore([
                'role_id' => $superAdminRole->id,
                'menu_id' => $menuId
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Eliminar la asignación y el menú
        $menu = DB::table('menus')
            ->where('url', '/sistemas/menus')
            ->first();

        if ($menu) {
            DB::table('menu_role')->where('menu_id', $menu->id)->delete();
            DB::table('menus')->where('id', $menu->id)->delete();
        }
    }
};

