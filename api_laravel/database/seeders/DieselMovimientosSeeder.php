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
        DB::table('d_tipo_movimientos')->insert([
            [
                'nombre' => 'INGRESO',
                'descripcion' => 'Compra de combustible de proveedores',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'nombre' => 'EGRESO',
                'descripcion' => 'Despacho de combustible a máquinas',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'nombre' => 'TRASPASO',
                'descripcion' => 'Transferencia entre tanques',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'nombre' => 'AJUSTE',
                'descripcion' => 'Corrección de stock por diferencias',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
        ]);

        $this->command->info('✓ Tipo de movimientos creados: INGRESO, EGRESO, TRASPASO, AJUSTE');
    }
}
