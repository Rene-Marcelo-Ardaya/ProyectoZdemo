<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AssignMenusToSuperAdminSeeder extends Seeder
{
    /**
     * Asigna todos los menús al rol super-admin
     */
    public function run(): void
    {
        $adminRoleId = DB::table('roles')->where('slug', 'super-admin')->value('id');
        
        if (!$adminRoleId) {
            $this->command->error('No se encontró el rol super-admin');
            return;
        }

        $menus = DB::table('menus')->pluck('id');
        $count = 0;

        foreach ($menus as $menuId) {
            $exists = DB::table('menu_role')
                ->where('role_id', $adminRoleId)
                ->where('menu_id', $menuId)
                ->exists();
            
            if (!$exists) {
                DB::table('menu_role')->insert([
                    'role_id' => $adminRoleId,
                    'menu_id' => $menuId
                ]);
                $count++;
            }
        }

        $this->command->info("✓ Asignados {$count} menús nuevos al super-admin (Total menús: " . count($menus) . ")");
    }
}
