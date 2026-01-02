<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class TenantsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener el plan Pro para el tenant demo
        $proPlan = DB::table('plans')->where('slug', 'pro')->first();
        
        if (!$proPlan) {
            $this->command->error('Plan Pro no encontrado. Ejecuta PlansSeeder primero.');
            return;
        }

        // Crear tenant demo
        DB::table('tenants')->updateOrInsert(
            ['slug' => 'demo'],
            [
                'name' => 'Empresa Demo',
                'slug' => 'demo',
                'custom_domain' => null,
                'plan_id' => $proPlan->id,
                'email' => 'demo@ejemplo.com',
                'phone' => '+59170000000',
                'logo' => null,
                'settings' => json_encode([
                    'primary_color' => '#3b82f6',
                    'company_name' => 'Empresa Demo',
                    'timezone' => 'America/La_Paz',
                ]),
                'is_active' => true,
                'trial_ends_at' => now()->addDays(14),
                'subscription_ends_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        $tenant = DB::table('tenants')->where('slug', 'demo')->first();

        // Tablas a actualizar con tenant_id
        $tablesToUpdate = [
            'users',
            'personal',
            'tanques',
            'cargos',
            'roles',
            'menus',
            'permissions',
            'conversations',
            'api_credentials',
            'settings',
            'niveles_seguridad',
            'componentes_seguridad',
            'alert_configurations',
        ];

        foreach ($tablesToUpdate as $table) {
            // Verificar que la tabla existe Y tiene columna tenant_id
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'tenant_id')) {
                DB::table($table)
                    ->whereNull('tenant_id')
                    ->update(['tenant_id' => $tenant->id]);
            }
        }

        $this->command->info('Tenant demo creado y datos existentes asignados.');
    }
}
