<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DieselExtrasSeeder extends Seeder
{
    /**
     * Datos iniciales para tablas adicionales del módulo Diesel
     */
    public function run(): void
    {
        // =============================================
        // PROVEEDORES
        // =============================================
        $proveedores = [
            [
                'nombre' => 'YPFB',
                'razon_social' => 'Yacimientos Petrolíferos Fiscales Bolivianos',
                'nit' => '1023287029',
                'telefono' => '800-10-1001',
                'celular' => null,
                'direccion' => 'La Paz, Bolivia',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'nombre' => 'Proveedor Diesel Local',
                'razon_social' => 'Distribuidora de Combustibles S.R.L.',
                'nit' => '123456789',
                'telefono' => null,
                'celular' => '70012345',
                'direccion' => 'Santa Cruz, Bolivia',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
        ];
        DB::table('d_proveedores')->insert($proveedores);

        // =============================================
        // TIPOS DE PAGO
        // =============================================
        $tiposPago = [
            ['nombre' => 'Efectivo', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Crédito', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Transferencia', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Cheque', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ];
        DB::table('d_tipos_pago')->insert($tiposPago);

        // =============================================
        // MOTIVOS DE AJUSTE
        // =============================================
        $motivosAjuste = [
            ['nombre' => 'Reseteo de medidor', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Corrección de lectura', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Derrame accidental', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Evaporación', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Ajuste de inventario', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ];
        DB::table('d_motivos_ajuste')->insert($motivosAjuste);
    }
}
