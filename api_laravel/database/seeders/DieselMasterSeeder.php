<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DieselMasterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->call([
            // Datos Básicos (Tipos, Proveedores, etc.)
            DieselBasicosSeeder::class,
            DieselExtrasSeeder::class,
            
            // Estructura de Menús
            DieselMenusSeeder::class,
            DieselMenusExtrasSeeder::class,
            DieselMenusMovimientosSeeder::class,
            DieselReportesMenuSeeder::class, // Menú de Reportes Diesel
            
            // Datos transaccionales o adicionales
            DieselMovimientosSeeder::class,
            
            // Asignar menús al super-admin
            AssignMenusToSuperAdminSeeder::class,
        ]);
    }
}
