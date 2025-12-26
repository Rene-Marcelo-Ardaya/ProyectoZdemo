<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DieselMenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Verificar si ya existe el menú
        $exists = DB::table('menus')->where('name', 'Control de Diésel')->exists();
        
        if ($exists) {
            $this->command->info('⚠️ El menú de Diésel ya existe');
            return;
        }

        // Obtener el orden máximo actual
        $maxOrder = DB::table('menus')->max('order') ?? 0;

        // Crear menú padre "Control de Diésel"
        $dieselMenuId = DB::table('menus')->insertGetId([
            'name' => 'Control de Diésel',
            'url' => null,
            'icon' => 'Fuel',
            'parent_id' => null,
            'order' => $maxOrder + 1,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Crear submenú "Tanques"
        $tanquesMenuId = DB::table('menus')->insertGetId([
            'name' => 'Tanques',
            'url' => '/diesel/tanques',
            'icon' => 'Container',
            'parent_id' => $dieselMenuId,
            'order' => 1,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Asignar menús al rol de Super Admin
        $superAdminRoleId = DB::table('roles')->where('name', 'Super Admin')->value('id');
        
        if ($superAdminRoleId) {
            DB::table('menu_role')->insertOrIgnore([
                ['role_id' => $superAdminRoleId, 'menu_id' => $dieselMenuId],
                ['role_id' => $superAdminRoleId, 'menu_id' => $tanquesMenuId],
            ]);
        }

        $this->command->info('✅ Menú de Control de Diésel creado correctamente');
    }
}
