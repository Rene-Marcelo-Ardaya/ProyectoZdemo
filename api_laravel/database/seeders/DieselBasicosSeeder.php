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
        $divisiones = [
            ['nombre' => 'Agrícola', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Ganadería', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Maquinaria', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Administración', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ];
        DB::table('d_divisiones')->insert($divisiones);

        // Obtener IDs
        $divAgricola = DB::table('d_divisiones')->where('nombre', 'Agrícola')->value('id');
        $divMaquinaria = DB::table('d_divisiones')->where('nombre', 'Maquinaria')->value('id');
        $divAdmin = DB::table('d_divisiones')->where('nombre', 'Administración')->value('id');

        // =============================================
        // 2. TRABAJOS
        // =============================================
        $trabajos = [
            ['nombre' => 'Agricultura', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Ganaderia', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Desmonte', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Caminos', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Madera', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ];
        DB::table('d_trabajos')->insert($trabajos);

        // =============================================
        // 3. UBICACIONES FÍSICAS
        // =============================================
        $ubicaciones = [
            ['nombre' => 'Surtidor Central', 'd_division_id' => $divMaquinaria, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Surtidor 2 Central', 'd_division_id' => $divMaquinaria, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ];
        DB::table('d_ubicaciones_fisicas')->insert($ubicaciones);

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
                'stock_actual' => 0,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'nombre' => 'Cisterna Reparto 01',
                'tipo' => 'MOVIL',
                'd_ubicacion_fisica_id' => $ubicCentral2,
                'capacidad_maxima' => 3000.00,
                'stock_actual' => 0,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
        ];
        DB::table('d_tanques')->insert($tanques);

        // =============================================
        // 5. MÁQUINAS
        // =============================================
        $maquinas = [
            ['codigo' => 'D6M', 'd_division_id' => $divMaquinaria, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['codigo' => 'JD-6155', 'd_division_id' => $divAgricola, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['codigo' => 'HILUX-01', 'd_division_id' => $divAdmin, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ];
        DB::table('d_maquinas')->insert($maquinas);
    }
}
