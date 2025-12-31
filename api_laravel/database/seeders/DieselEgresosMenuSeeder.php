<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DieselEgresosMenuSeeder extends Seeder
{
    /**
     * Menú para Egresos de Combustible
     * Se agrega bajo 'Operaciones Diesel'
     */
    public function run(): void
    {
        // 1. Obtener menú padre 'Operaciones Diesel'
        $operacionesParent = DB::table('menus')
            ->where('name', 'Operaciones Diesel')
            ->where('module', 'DIESEL')
            ->first();

        // Si no existe el padre, crearlo
        if (!$operacionesParent) {
            DB::table('menus')->updateOrInsert(
                ['name' => 'Operaciones Diesel'],
                [
                    'url' => null,
                    'icon' => 'Activity',
                    'parent_id' => null,
                    'order' => 51,
                    'module' => 'DIESEL',
                    'is_active' => true,
                    'updated_at' => now()
                ]
            );
            
            $operacionesParentId = DB::table('menus')->where('name', 'Operaciones Diesel')->value('id');
        } else {
            $operacionesParentId = $operacionesParent->id;
        }

        // 2. Agregar 'Egresos de Combustible' a 'Operaciones Diesel'
        DB::table('menus')->updateOrInsert(
            ['url' => '/diesel/egresos'],
            [
                'name' => 'Egresos de Combustible',
                'icon' => 'Upload', // Icono de subida/salida
                'parent_id' => $operacionesParentId,
                'order' => 3, // Después de Ingresos (1) y Recepción (2)
                'module' => 'DIESEL',
                'is_active' => true,
                'updated_at' => now()
            ]
        );

        // 3. Asignar el menú al rol Administrador (ID 1)
        $menuId = DB::table('menus')->where('url', '/diesel/egresos')->value('id');
        
        if ($menuId) {
            // Verificar si ya existe la asignación
            $exists = DB::table('menu_role')
                ->where('menu_id', $menuId)
                ->where('role_id', 1)
                ->exists();

            if (!$exists) {
                DB::table('menu_role')->insert([
                    'menu_id' => $menuId,
                    'role_id' => 1, // Administrador
                ]);
            }
        }
    }
}
