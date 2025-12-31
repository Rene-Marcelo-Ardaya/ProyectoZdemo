<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DieselReportesMenuSeeder extends Seeder
{
    /**
     * Crear menús para la sección "Reportes Diesel"
     * - Menú padre: Reportes Diesel
     * - Submenús: Historial de Recepciones, etc.
     */
    public function run(): void
    {
        // 1. Crear menú padre 'Reportes Diesel'
        DB::table('menus')->updateOrInsert(
            ['name' => 'Reportes Diesel'],
            [
                'url' => null,
                'icon' => 'FileBarChart',
                'parent_id' => null,
                'order' => 52, // Después de Operaciones Diesel (51)
                'module' => 'DIESEL',
                'is_active' => true,
                'updated_at' => now()
            ]
        );
        
        $reportesParentId = DB::table('menus')->where('name', 'Reportes Diesel')->value('id');

        // 2. Submenú: Historial de Recepciones
        DB::table('menus')->updateOrInsert(
            ['url' => '/diesel/historial-recepciones'],
            [
                'name' => 'Historial de Recepciones',
                'icon' => 'ClipboardList',
                'parent_id' => $reportesParentId,
                'order' => 1,
                'module' => 'DIESEL',
                'is_active' => true,
                'updated_at' => now()
            ]
        );

        echo "✓ Menús de Reportes Diesel creados\n";
    }
}
