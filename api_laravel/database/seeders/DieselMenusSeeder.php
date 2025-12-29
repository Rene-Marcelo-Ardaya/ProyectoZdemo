<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DieselMenusSeeder extends Seeder
{
    /**
     * Menús para el módulo Diesel
     */
    public function run(): void
    {
        // =============================================
        // MENÚ PADRE: Configuraciones Diesel
        // =============================================
        $parentId = DB::table('menus')->insertGetId([
            'name' => 'Configuraciones Diesel',
            'url' => null,
            'icon' => 'Fuel',
            'parent_id' => null,
            'order' => 50, // Después de otros módulos
            'module' => 'DIESEL',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        // =============================================
        // SUBMENÚS
        // =============================================
        $submenus = [
            [
                'name' => 'Trabajos',
                'url' => '/diesel/trabajos',
                'icon' => 'Hammer',
                'order' => 1
            ],
            [
                'name' => 'Divisiones',
                'url' => '/diesel/divisiones',
                'icon' => 'Building2',
                'order' => 2
            ],
            [
                'name' => 'Proveedores',
                'url' => '/diesel/proveedores',
                'icon' => 'Truck',
                'order' => 3
            ],
            [
                'name' => 'Tipos de Pago',
                'url' => '/diesel/tipos-pago',
                'icon' => 'CreditCard',
                'order' => 4
            ],
            [
                'name' => 'Motivos de Ajuste',
                'url' => '/diesel/motivos-ajuste',
                'icon' => 'ClipboardList',
                'order' => 5
            ],
        ];

        foreach ($submenus as $submenu) {
            DB::table('menus')->insert([
                'name' => $submenu['name'],
                'url' => $submenu['url'],
                'icon' => $submenu['icon'],
                'parent_id' => $parentId,
                'order' => $submenu['order'],
                'module' => 'DIESEL',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
    }
}
