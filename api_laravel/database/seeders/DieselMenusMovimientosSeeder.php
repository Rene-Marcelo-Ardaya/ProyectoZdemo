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
            $exists = DB::table('menus')
                ->where('url', '/diesel/tipos-movimiento')
                ->where('parent_id', $configParent->id)
                ->exists();

            if (!$exists) {
                DB::table('menus')->insert([
                    'name' => 'Tipos de Movimiento',
                    'url' => '/diesel/tipos-movimiento',
                    'icon' => 'Settings2',
                    'parent_id' => $configParent->id,
                    'order' => 9,
                    'module' => 'DIESEL',
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
                $this->command->info("✓ Menú 'Tipos de Movimiento' agregado a Configuraciones");
            }
        }

        // 2. Crear menú padre 'Operaciones Diesel' para Ingresos
        $operacionesParent = DB::table('menus')
            ->where('name', 'Operaciones Diesel')
            ->where('module', 'DIESEL')
            ->first();

        if (!$operacionesParent) {
            $operacionesParentId = DB::table('menus')->insertGetId([
                'name' => 'Operaciones Diesel',
                'url' => null,
                'icon' => 'Activity',
                'parent_id' => null,
                'order' => 51, // Después de Configuraciones Diesel
                'module' => 'DIESEL',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            $this->command->info("✓ Menú padre 'Operaciones Diesel' creado");
        } else {
            $operacionesParentId = $operacionesParent->id;
        }

        // 3. Agregar 'Ingresos' a 'Operaciones Diesel'
        $existsIngreso = DB::table('menus')
            ->where('url', '/diesel/ingresos')
            ->where('parent_id', $operacionesParentId)
            ->exists();

        if (!$existsIngreso) {
            DB::table('menus')->insert([
                'name' => 'Ingresos de Combustible',
                'url' => '/diesel/ingresos',
                'icon' => 'Download', // Icono de bajada/ingreso
                'parent_id' => $operacionesParentId,
                'order' => 1,
                'module' => 'DIESEL',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            $this->command->info("✓ Menú 'Ingresos de Combustible' agregado a Operaciones");
        }
    }
}
