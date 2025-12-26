<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Obtener el menú padre "Sistemas"
        $sistemasMenu = DB::table('menus')
            ->where('name', 'Sistemas')
            ->first();

        if ($sistemasMenu) {
            // Calcular el siguiente orden
            $maxOrder = DB::table('menus')
                ->where('parent_id', $sistemasMenu->id)
                ->max('order') ?? 0;

            // Insertar menú de APIs
            // Columnas disponibles: id, name, url, icon, parent_id, order, module, is_active, created_at, updated_at
            $menuId = DB::table('menus')->insertGetId([
                'parent_id' => $sistemasMenu->id,
                'name' => 'Configuración de APIs',
                'url' => '/sistemas/apis',
                'icon' => 'Key',
                'module' => 'sistemas',
                'order' => $maxOrder + 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Asignar al rol SuperAdmin
            $superAdminRole = DB::table('roles')
                ->where('slug', 'super-admin')
                ->first();

            if ($superAdminRole) {
                DB::table('menu_role')->insert([
                    'menu_id' => $menuId,
                    'role_id' => $superAdminRole->id,
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $menu = DB::table('menus')
            ->where('url', '/sistemas/apis')
            ->first();

        if ($menu) {
            // Eliminar asignaciones de roles
            DB::table('menu_role')->where('menu_id', $menu->id)->delete();
            
            // Eliminar menú
            DB::table('menus')->where('id', $menu->id)->delete();
        }
    }
};
