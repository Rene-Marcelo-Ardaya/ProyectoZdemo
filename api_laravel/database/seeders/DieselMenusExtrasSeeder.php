<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DieselMenusExtrasSeeder extends Seeder
{
    /**
     * Menús adicionales para Diesel: Ubicaciones, Tanques, Máquinas
     * Solo inserta los que no existen
     */
    public function run(): void
    {
        // Buscar el menú padre "Configuraciones Diesel"
        $parent = DB::table('menus')
            ->where('name', 'Configuraciones Diesel')
            ->where('module', 'DIESEL')
            ->first();

        if (!$parent) {
            $this->command->error('No se encontró el menú padre "Configuraciones Diesel"');
            return;
        }

        $parentId = $parent->id;

        // Menús a agregar
        $nuevosMenus = [
            [
                'name' => 'Ubicaciones Físicas',
                'url' => '/diesel/ubicaciones',
                'icon' => 'MapPin',
                'order' => 6
            ],
            [
                'name' => 'Tanques',
                'url' => '/diesel/tanques',
                'icon' => 'Container',
                'order' => 7
            ],
            [
                'name' => 'Máquinas',
                'url' => '/diesel/maquinas',
                'icon' => 'Cog',
                'order' => 8
            ],
        ];

        foreach ($nuevosMenus as $menu) {
            // Verificar si ya existe
            $existe = DB::table('menus')
                ->where('url', $menu['url'])
                ->where('parent_id', $parentId)
                ->exists();

            if (!$existe) {
                DB::table('menus')->insert([
                    'name' => $menu['name'],
                    'url' => $menu['url'],
                    'icon' => $menu['icon'],
                    'parent_id' => $parentId,
                    'order' => $menu['order'],
                    'module' => 'DIESEL',
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
                $this->command->info("✓ Menú '{$menu['name']}' creado");
            } else {
                $this->command->info("- Menú '{$menu['name']}' ya existe, omitido");
            }
        }
    }
}
