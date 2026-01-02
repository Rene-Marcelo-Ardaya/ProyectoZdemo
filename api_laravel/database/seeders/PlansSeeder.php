<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PlansSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Trial',
                'slug' => 'trial',
                'description' => 'Plan de prueba gratuito por tiempo limitado',
                'price_monthly' => 0,
                'price_yearly' => 0,
                'max_users' => 3,
                'max_whatsapp_instances' => 1,
                'max_storage_mb' => 512,
                'features' => json_encode([
                    'basic_reports',
                    'email_support',
                ]),
                'is_active' => true,
                'sort_order' => 0,
            ],
            [
                'name' => 'Basic',
                'slug' => 'basic',
                'description' => 'Plan básico para pequeños negocios',
                'price_monthly' => 29.00,
                'price_yearly' => 290.00,
                'max_users' => 5,
                'max_whatsapp_instances' => 1,
                'max_storage_mb' => 1024,
                'features' => json_encode([
                    'basic_reports',
                    'email_support',
                    'whatsapp_notifications',
                ]),
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Pro',
                'slug' => 'pro',
                'description' => 'Plan profesional con más funcionalidades',
                'price_monthly' => 79.00,
                'price_yearly' => 790.00,
                'max_users' => 15,
                'max_whatsapp_instances' => 3,
                'max_storage_mb' => 5120,
                'features' => json_encode([
                    'advanced_reports',
                    'priority_support',
                    'whatsapp_notifications',
                    'api_access',
                    'custom_branding',
                ]),
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Enterprise',
                'slug' => 'enterprise',
                'description' => 'Plan empresarial con todas las funcionalidades',
                'price_monthly' => 199.00,
                'price_yearly' => 1990.00,
                'max_users' => 999,  // Sin límite práctico
                'max_whatsapp_instances' => 10,
                'max_storage_mb' => 51200,
                'features' => json_encode([
                    'advanced_reports',
                    'dedicated_support',
                    'whatsapp_notifications',
                    'api_access',
                    'custom_branding',
                    'sla_guarantee',
                    'custom_integrations',
                ]),
                'is_active' => true,
                'sort_order' => 3,
            ],
        ];

        foreach ($plans as $plan) {
            DB::table('plans')->updateOrInsert(
                ['slug' => $plan['slug']],
                array_merge($plan, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
    }
}
