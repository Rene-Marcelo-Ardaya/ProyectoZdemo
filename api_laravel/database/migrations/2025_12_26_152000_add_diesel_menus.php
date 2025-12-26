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
        // Obtener el orden máximo actual
        $maxOrder = DB::table('menus')->max('order') ?? 0;

        // Crear menú padre "Control de Diésel"
        $dieselMenuId = DB::table('menus')->insertGetId([
            'name' => 'Control de Diésel',
            'route' => null,
            'icon' => 'Fuel',
            'parent_id' => null,
            'order' => $maxOrder + 1,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Crear submenú "Tanques"
        DB::table('menus')->insert([
            'name' => 'Tanques',
            'route' => '/diesel/tanques',
            'icon' => 'Container',
            'parent_id' => $dieselMenuId,
            'order' => 1,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Asignar menús al rol de Administrador (role_id = 1)
        $adminRoleId = DB::table('roles')->where('name', 'Administrador')->value('id') ?? 1;
        
        // Obtener los IDs de los menús creados
        $menuIds = DB::table('menus')
            ->where('id', $dieselMenuId)
            ->orWhere('parent_id', $dieselMenuId)
            ->pluck('id');

        foreach ($menuIds as $menuId) {
            DB::table('menu_role')->insertOrIgnore([
                'role_id' => $adminRoleId,
                'menu_id' => $menuId,
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Obtener el menú padre
        $dieselMenu = DB::table('menus')->where('name', 'Control de Diésel')->first();
        
        if ($dieselMenu) {
            // Eliminar relaciones con roles
            DB::table('menu_role')
                ->where('menu_id', $dieselMenu->id)
                ->orWhereIn('menu_id', function ($query) use ($dieselMenu) {
                    $query->select('id')
                        ->from('menus')
                        ->where('parent_id', $dieselMenu->id);
                })
                ->delete();

            // Eliminar submenús
            DB::table('menus')->where('parent_id', $dieselMenu->id)->delete();
            
            // Eliminar menú padre
            DB::table('menus')->where('id', $dieselMenu->id)->delete();
        }
    }
};
