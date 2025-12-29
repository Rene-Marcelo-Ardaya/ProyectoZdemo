<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NivelesSeguridadSeeder extends Seeder
{
    /**
     * Seed initial security levels
     */
    public function run(): void
    {
        $niveles = [
            [
                'nombre' => 'Administración',
                'color' => '#3b82f6',  // blue
                'descripcion' => 'Grupo de administración general',
                'is_active' => true,
            ],
            [
                'nombre' => 'Operaciones',
                'color' => '#10b981',  // green
                'descripcion' => 'Personal de operaciones',
                'is_active' => true,
            ],
            [
                'nombre' => 'Supervisores',
                'color' => '#f59e0b',  // amber
                'descripcion' => 'Supervisores de campo',
                'is_active' => true,
            ],
        ];

        foreach ($niveles as $nivel) {
            DB::table('niveles_seguridad')->updateOrInsert(
                ['nombre' => $nivel['nombre']],
                array_merge($nivel, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }

        $this->command->info('✓ Niveles de seguridad iniciales creados');
    }
}
