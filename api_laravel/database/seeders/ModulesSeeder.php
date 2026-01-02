<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ModulesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $modules = [
            [
                'name' => 'Core',
                'slug' => 'core',
                'description' => 'Funcionalidades básicas del sistema (usuarios, roles, menús)',
                'icon' => 'Settings',
                'price_monthly' => 0,
                'is_addon' => false,  // Incluido en todos los planes
                'is_active' => true,
                'sort_order' => 0,
            ],
            [
                'name' => 'Personal',
                'slug' => 'personal',
                'description' => 'Gestión de empleados y personal',
                'icon' => 'Users',
                'price_monthly' => 0,
                'is_addon' => false,
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Tanques',
                'slug' => 'tanques',
                'description' => 'Gestión y monitoreo de tanques de combustible',
                'icon' => 'Gauge',
                'price_monthly' => 25.00,
                'is_addon' => true,  // Comprable por separado
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'WhatsApp Notifications',
                'slug' => 'whatsapp',
                'description' => 'Envío de notificaciones por WhatsApp',
                'icon' => 'MessageCircle',
                'price_monthly' => 0,
                'is_addon' => false,
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'WhatsApp Extra Instance',
                'slug' => 'whatsapp-extra',
                'description' => 'Instancia adicional de WhatsApp (+1)',
                'icon' => 'MessageSquarePlus',
                'price_monthly' => 15.00,
                'is_addon' => true,
                'is_active' => true,
                'sort_order' => 4,
            ],
            [
                'name' => 'Alertas',
                'slug' => 'alerts',
                'description' => 'Sistema de alertas y notificaciones automáticas',
                'icon' => 'Bell',
                'price_monthly' => 20.00,
                'is_addon' => true,
                'is_active' => true,
                'sort_order' => 5,
            ],
            [
                'name' => 'Automatización n8n',
                'slug' => 'n8n',
                'description' => 'Acceso a workflows de automatización con n8n',
                'icon' => 'Workflow',
                'price_monthly' => 35.00,
                'is_addon' => true,
                'is_active' => true,
                'sort_order' => 6,
            ],
            [
                'name' => 'API Access',
                'slug' => 'api-access',
                'description' => 'Acceso a la API para integraciones externas',
                'icon' => 'Code',
                'price_monthly' => 45.00,
                'is_addon' => true,
                'is_active' => true,
                'sort_order' => 7,
            ],
        ];

        foreach ($modules as $module) {
            DB::table('modules')->updateOrInsert(
                ['slug' => $module['slug']],
                array_merge($module, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }

        // Asignar módulos a planes
        $this->assignModulesToPlans();
    }

    /**
     * Asignar módulos a cada plan
     */
    private function assignModulesToPlans(): void
    {
        $planModules = [
            'trial' => ['core', 'personal'],
            'basic' => ['core', 'personal', 'whatsapp'],
            'pro' => ['core', 'personal', 'whatsapp', 'tanques', 'alerts', 'api-access'],
            'enterprise' => ['core', 'personal', 'whatsapp', 'tanques', 'alerts', 'api-access', 'n8n'],
        ];

        foreach ($planModules as $planSlug => $moduleSlugs) {
            $plan = DB::table('plans')->where('slug', $planSlug)->first();
            if (!$plan) continue;

            foreach ($moduleSlugs as $moduleSlug) {
                $module = DB::table('modules')->where('slug', $moduleSlug)->first();
                if (!$module) continue;

                DB::table('plan_module')->updateOrInsert([
                    'plan_id' => $plan->id,
                    'module_id' => $module->id,
                ]);
            }
        }
    }
}
