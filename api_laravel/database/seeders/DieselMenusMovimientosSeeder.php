<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DieselMenusMovimientosSeeder extends Seeder
{
    /**
     * Menús para Movimientos Diesel
     * - Tipo de Movimientos (Configuración)
     * - Ingresos (Operación)
     */
    public function run(): void
    {
        // 1. Agregar 'Tipo de Movimientos' a 'Configuraciones Diesel'
        $configParent = DB::table('menus')
            ->where('name', 'Configuraciones Diesel')
            ->where('module', 'DIESEL')
            ->first();

        if ($configParent) {
            DB::table('menus')->updateOrInsert(
                ['url' => '/diesel/tipos-movimiento'],
                [
                    'name' => 'Tipos de Movimiento',
                    'icon' => 'Settings2',
                    'parent_id' => $configParent->id,
                    'order' => 9,
                    'module' => 'DIESEL',
                    'is_active' => true,
                    'updated_at' => now()
                ]
            );
        }

        // 2. Crear menú padre 'Operaciones Diesel' para Ingresos
        DB::table('menus')->updateOrInsert(
            ['name' => 'Operaciones Diesel'],
            [
                'url' => null,
                'icon' => 'Activity',
                'parent_id' => null,
                'order' => 51, // Después de Configuraciones Diesel
                'module' => 'DIESEL',
                'is_active' => true,
                'updated_at' => now()
            ]
        );
        
        $operacionesParentId = DB::table('menus')->where('name', 'Operaciones Diesel')->value('id');

        // 3. Agregar 'Ingresos' a 'Operaciones Diesel'
        DB::table('menus')->updateOrInsert(
            ['url' => '/diesel/ingresos'],
            [
                'name' => 'Ingresos de Combustible',
                'icon' => 'Download', // Icono de bajada/ingreso
                'parent_id' => $operacionesParentId,
                'order' => 1,
                'module' => 'DIESEL',
                'is_active' => true,
                'updated_at' => now()
            ]
        );
    }
}
