<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DieselMovimientosSeeder extends Seeder
{
    /**
     * Datos iniciales para el sistema de movimientos
     * - Tipo de movimientos (catálogo)
     * - NO incluye datos de prueba para bitácora (se genera automáticamente)
     */
    public function run(): void
    {
        // =============================================
        // TIPO DE MOVIMIENTOS
        // =============================================
        $tipos = [
            [
                'nombre' => 'INGRESO',
                'descripcion' => 'Compra de combustible de proveedores',
            ],
            [
                'nombre' => 'EGRESO',
                'descripcion' => 'Despacho de combustible a máquinas',
            ],
            [
                'nombre' => 'TRASPASO',
                'descripcion' => 'Transferencia entre tanques',
            ],
            [
                'nombre' => 'AJUSTE',
                'descripcion' => 'Corrección de stock por diferencias',
            ],
        ];

        foreach ($tipos as $tipo) {
             DB::table('d_tipo_movimientos')->updateOrInsert(
                ['nombre' => $tipo['nombre']],
                [
                    'descripcion' => $tipo['descripcion'],
                    'is_active' => true,
                    'updated_at' => now()
                ]
            );
        }

        $this->command->info('✓ Tipo de movimientos creados: INGRESO, EGRESO, TRASPASO, AJUSTE');
    }
}
