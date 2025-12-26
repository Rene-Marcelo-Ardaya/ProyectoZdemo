<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Tanque;

class TanquesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tanques = [
            // Tanques Estáticos
            [
                'nombre' => 'Tanque Principal Base',
                'codigo' => 'TP-001',
                'tipo' => 'ESTATICO',
                'capacidad_litros' => 10000,
                'nivel_actual' => 7500,
                'nivel_minimo_alerta' => 2000,
                'ubicacion_fija' => 'Planta Central - Zona de Despacho',
                'is_active' => true,
                'observaciones' => 'Tanque principal para abastecimiento de vehículos en planta',
            ],
            [
                'nombre' => 'Tanque Reserva',
                'codigo' => 'TR-001',
                'tipo' => 'ESTATICO',
                'capacidad_litros' => 5000,
                'nivel_actual' => 3200,
                'nivel_minimo_alerta' => 1000,
                'ubicacion_fija' => 'Planta Central - Sector Norte',
                'is_active' => true,
                'observaciones' => 'Tanque de reserva para emergencias',
            ],
            // Tanques Móviles (Cisternas)
            [
                'nombre' => 'Cisterna Campo 01',
                'codigo' => 'CM-001',
                'tipo' => 'MOVIL',
                'capacidad_litros' => 2000,
                'nivel_actual' => 1800,
                'nivel_minimo_alerta' => 300,
                'placa_cisterna' => 'ABC-1234',
                'is_active' => true,
                'observaciones' => 'Cisterna para abastecimiento en campo - Zona Norte',
            ],
            [
                'nombre' => 'Cisterna Campo 02',
                'codigo' => 'CM-002',
                'tipo' => 'MOVIL',
                'capacidad_litros' => 3000,
                'nivel_actual' => 500,
                'nivel_minimo_alerta' => 500,
                'placa_cisterna' => 'DEF-5678',
                'is_active' => true,
                'observaciones' => 'Cisterna para abastecimiento en campo - Zona Sur',
            ],
            [
                'nombre' => 'Cisterna Maquinaria',
                'codigo' => 'CM-003',
                'tipo' => 'MOVIL',
                'capacidad_litros' => 1500,
                'nivel_actual' => 1200,
                'nivel_minimo_alerta' => 200,
                'placa_cisterna' => 'GHI-9012',
                'is_active' => true,
                'observaciones' => 'Cisterna dedicada para maquinaria pesada',
            ],
        ];

        foreach ($tanques as $tanque) {
            Tanque::updateOrCreate(
                ['codigo' => $tanque['codigo']],
                $tanque
            );
        }

        $this->command->info('✅ Tanques de prueba creados correctamente');
    }
}
