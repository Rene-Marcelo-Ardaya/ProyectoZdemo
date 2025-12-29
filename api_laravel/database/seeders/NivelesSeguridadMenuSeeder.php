<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NivelesSeguridadMenuSeeder extends Seeder
{
    /**
     * Add menu entry for Niveles de Seguridad page
     */
    public function run(): void
    {
        // Get Sistemas parent menu ID
        $sysMenuId = DB::table('menus')
            ->where('name', 'Sistemas')
            ->whereNull('parent_id')
            ->value('id');

        if (!$sysMenuId) {
            $this->command->error('No se encontró el menú Sistemas');
            return;
        }

        // Create or update menu entry
        DB::table('menus')->updateOrInsert(
            ['url' => '/sistemas/niveles-seguridad'],
            [
                'name' => 'Grupos de Seguridad',
                'icon' => 'Shield',
                'parent_id' => $sysMenuId,
                'order' => 5,
                'module' => 'Sistemas',
                'is_active' => true,
                'updated_at' => now(),
            ]
        );

        $menuId = DB::table('menus')
            ->where('url', '/sistemas/niveles-seguridad')
            ->value('id');

        // Assign to super-admin role
        $adminRoleId = DB::table('roles')
            ->where('slug', 'super-admin')
            ->value('id');

        if ($adminRoleId && $menuId) {
            DB::table('menu_role')->insertOrIgnore([
                'role_id' => $adminRoleId,
                'menu_id' => $menuId
            ]);
        }

        $this->command->info('✓ Menú "Grupos de Seguridad" creado y asignado a super-admin');
    }
}
