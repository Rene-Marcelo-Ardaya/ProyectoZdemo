<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DieselBasicosSeeder extends Seeder
{
    /**
     * Datos iniciales para el módulo Diesel
     */
    public function run(): void
    {
        // =============================================
        // 1. DIVISIONES
        // =============================================
        // =============================================
        // 1. DIVISIONES
        // =============================================
        $divisiones = [
            ['nombre' => 'Agrícola'],
            ['nombre' => 'Ganadería'],
            ['nombre' => 'Maquinaria'],
            ['nombre' => 'Administración'],
        ];
        
        foreach ($divisiones as $div) {
            DB::table('d_divisiones')->updateOrInsert(
                ['nombre' => $div['nombre']],
                ['is_active' => true, 'updated_at' => now()]
            );
        }

        // Obtener IDs
        $divAgricola = DB::table('d_divisiones')->where('nombre', 'Agrícola')->value('id');
        $divMaquinaria = DB::table('d_divisiones')->where('nombre', 'Maquinaria')->value('id');
        $divAdmin = DB::table('d_divisiones')->where('nombre', 'Administración')->value('id');

        // =============================================
        // 2. TRABAJOS
        // =============================================
        $trabajos = [
            ['nombre' => 'Agricultura'],
            ['nombre' => 'Ganaderia'],
            ['nombre' => 'Desmonte'],
            ['nombre' => 'Caminos'],
            ['nombre' => 'Madera'],
        ];

        foreach ($trabajos as $trabajo) {
             DB::table('d_trabajos')->updateOrInsert(
                ['nombre' => $trabajo['nombre']],
                ['is_active' => true, 'updated_at' => now()]
            );
        }

        // =============================================
        // 3. UBICACIONES FÍSICAS
        // =============================================
        $ubicaciones = [
            ['nombre' => 'Surtidor Central', 'd_division_id' => $divMaquinaria],
            ['nombre' => 'Surtidor 2 Central', 'd_division_id' => $divMaquinaria],
        ];

        foreach ($ubicaciones as $ubic) {
            DB::table('d_ubicaciones_fisicas')->updateOrInsert(
                ['nombre' => $ubic['nombre']],
                [
                    'd_division_id' => $ubic['d_division_id'], 
                    'is_active' => true, 
                    'updated_at' => now()
                ]
            );
        }

        // Obtener IDs de ubicaciones
        $ubicCentral = DB::table('d_ubicaciones_fisicas')->where('nombre', 'Surtidor Central')->value('id');
        $ubicCentral2 = DB::table('d_ubicaciones_fisicas')->where('nombre', 'Surtidor 2 Central')->value('id');

        // =============================================
        // 4. TANQUES
        // =============================================
        $tanques = [
            [
                'nombre' => 'Tanque Estacionario 1',
                'tipo' => 'FIJO',
                'd_ubicacion_fisica_id' => $ubicCentral,
                'capacidad_maxima' => 10000.00,
            ],
            [
                'nombre' => 'Cisterna Reparto 01',
                'tipo' => 'MOVIL',
                'd_ubicacion_fisica_id' => $ubicCentral2,
                'capacidad_maxima' => 3000.00,
            ],
        ];

        foreach ($tanques as $tanque) {
            DB::table('d_tanques')->updateOrInsert(
                ['nombre' => $tanque['nombre']],
                [
                    'tipo' => $tanque['tipo'],
                    'd_ubicacion_fisica_id' => $tanque['d_ubicacion_fisica_id'],
                    'capacidad_maxima' => $tanque['capacidad_maxima'],
                    // No sobreescribir stock_actual si ya existe
                    // 'stock_actual' => 0, 
                    'is_active' => true,
                    'updated_at' => now()
                ]
            );
        }

        // =============================================
        // 5. MÁQUINAS
        // =============================================
        $maquinas = [
            ['codigo' => 'D6M', 'd_division_id' => $divMaquinaria],
            ['codigo' => 'JD-6155', 'd_division_id' => $divAgricola],
            ['codigo' => 'HILUX-01', 'd_division_id' => $divAdmin],
        ];

        foreach ($maquinas as $maq) {
             DB::table('d_maquinas')->updateOrInsert(
                ['codigo' => $maq['codigo']],
                [
                    'd_division_id' => $maq['d_division_id'],
                    'is_active' => true,
                    'updated_at' => now()
                ]
            );
        }
    }
}
