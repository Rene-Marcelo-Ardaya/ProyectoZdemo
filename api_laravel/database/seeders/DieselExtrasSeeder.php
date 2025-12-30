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
            ],
            [
                'nombre' => 'Proveedor Diesel Local',
                'razon_social' => 'Distribuidora de Combustibles S.R.L.',
                'nit' => '123456789',
                'telefono' => null,
                'celular' => '70012345',
                'direccion' => 'Santa Cruz, Bolivia',
            ],
        ];

        foreach ($proveedores as $prov) {
            DB::table('d_proveedores')->updateOrInsert(
                ['nombre' => $prov['nombre']],
                [
                    'razon_social' => $prov['razon_social'],
                    'nit' => $prov['nit'],
                    'telefono' => $prov['telefono'],
                    'celular' => $prov['celular'],
                    'direccion' => $prov['direccion'],
                    'is_active' => true,
                    'updated_at' => now(),
                    // created_at no es necesario actualizar si ya existe, pero updateOrInsert no lo maneja bien solo para create.
                    // Podríamos usar firstOrCreate pero queremos actualizar los datos.
                ]
            );
        }

        // =============================================
        // TIPOS DE PAGO
        // =============================================
        $tiposPago = [
            ['nombre' => 'Efectivo'],
            ['nombre' => 'Crédito'],
            ['nombre' => 'Transferencia'],
            ['nombre' => 'Cheque'],
        ];

        foreach ($tiposPago as $tipo) {
            DB::table('d_tipos_pago')->updateOrInsert(
                ['nombre' => $tipo['nombre']],
                ['is_active' => true, 'updated_at' => now()]
            );
        }

        // =============================================
        // MOTIVOS DE AJUSTE
        // =============================================
        $motivosAjuste = [
            ['nombre' => 'Reseteo de medidor'],
            ['nombre' => 'Corrección de lectura'],
            ['nombre' => 'Derrame accidental'],
            ['nombre' => 'Evaporación'],
            ['nombre' => 'Ajuste de inventario'],
        ];

        foreach ($motivosAjuste as $motivo) {
            DB::table('d_motivos_ajuste')->updateOrInsert(
                ['nombre' => $motivo['nombre']],
                ['is_active' => true, 'updated_at' => now()]
            );
        }
    }
}
