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
        // Obtener el rol de super-admin
        $adminRoleId = DB::table('roles')->where('slug', 'super-admin')->value('id');

        // Crear módulo RRHH
        $rrhhMenuId = DB::table('menus')->insertGetId([
            'name' => 'RRHH',
            'icon' => 'Users',
            'order' => 20,
            'module' => 'RRHH',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Submenú: Cargos
        $cargosMenuId = DB::table('menus')->insertGetId([
            'name' => 'Cargos',
            'url' => '/rrhh/cargos',
            'icon' => 'Briefcase',
            'parent_id' => $rrhhMenuId,
            'order' => 1,
            'module' => 'RRHH',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Submenú: Personal (para futuro)
        $personalMenuId = DB::table('menus')->insertGetId([
            'name' => 'Personal',
            'url' => '/rrhh/personal',
            'icon' => 'UserCircle',
            'parent_id' => $rrhhMenuId,
            'order' => 2,
            'module' => 'RRHH',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Asignar menús al rol admin si existe
        if ($adminRoleId) {
            DB::table('menu_role')->insertOrIgnore([
                ['role_id' => $adminRoleId, 'menu_id' => $rrhhMenuId],
                ['role_id' => $adminRoleId, 'menu_id' => $cargosMenuId],
                ['role_id' => $adminRoleId, 'menu_id' => $personalMenuId],
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Eliminar menús RRHH
        $rrhhMenuId = DB::table('menus')->where('module', 'RRHH')->whereNull('parent_id')->value('id');
        
        if ($rrhhMenuId) {
            // Eliminar asignaciones de roles
            DB::table('menu_role')
                ->whereIn('menu_id', DB::table('menus')->where('module', 'RRHH')->pluck('id'))
                ->delete();
            
            // Eliminar submenús
            DB::table('menus')->where('parent_id', $rrhhMenuId)->delete();
            
            // Eliminar menú padre
            DB::table('menus')->where('id', $rrhhMenuId)->delete();
        }
    }
};
