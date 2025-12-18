<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            // === BRANDING ===
            [
                'key' => 'app_name',
                'value' => 'Zdemo01',
                'type' => 'text',
                'group' => 'branding',
                'label' => 'Nombre de la Aplicación',
                'description' => 'Nombre que aparece en el título del navegador y manifest',
                'is_public' => true,
            ],
            [
                'key' => 'app_short_name',
                'value' => 'Zdemo',
                'type' => 'text',
                'group' => 'branding',
                'label' => 'Nombre Corto',
                'description' => 'Nombre corto para PWA y dispositivos móviles',
                'is_public' => true,
            ],
            [
                'key' => 'app_description',
                'value' => 'Sistema de Gestión Empresarial',
                'type' => 'text',
                'group' => 'branding',
                'label' => 'Descripción',
                'description' => 'Descripción de la aplicación para SEO y manifest',
                'is_public' => true,
            ],
            [
                'key' => 'logo_sidebar',
                'value' => null,
                'type' => 'image',
                'group' => 'branding',
                'label' => 'Logo del Sidebar',
                'description' => 'Logo que aparece en el menú lateral. Tamaño recomendado: 180x50px',
                'is_public' => true,
            ],
            [
                'key' => 'logo_sidebar_collapsed',
                'value' => null,
                'type' => 'image',
                'group' => 'branding',
                'label' => 'Logo Sidebar (Colapsado)',
                'description' => 'Logo pequeño cuando el sidebar está cerrado. Tamaño: 40x40px',
                'is_public' => true,
            ],
            [
                'key' => 'logo_login',
                'value' => null,
                'type' => 'image',
                'group' => 'branding',
                'label' => 'Logo del Login (Principal)',
                'description' => 'Logo grande que aparece en la página de login',
                'is_public' => true,
            ],
            [
                'key' => 'logo_login_secondary',
                'value' => null,
                'type' => 'image',
                'group' => 'branding',
                'label' => 'Logo del Login (Secundario)',
                'description' => 'Logo o imagen que aparece a la derecha del login',
                'is_public' => true,
            ],
            [
                'key' => 'login_title',
                'value' => 'Bienvenido',
                'type' => 'text',
                'group' => 'branding',
                'label' => 'Título del Login',
                'description' => 'Texto grande que aparece en la página de login',
                'is_public' => true,
            ],
            [
                'key' => 'favicon',
                'value' => null,
                'type' => 'image',
                'group' => 'branding',
                'label' => 'Favicon',
                'description' => 'Icono que aparece en la pestaña del navegador. Formato: .ico, .png o .svg',
                'is_public' => true,
            ],
            [
                'key' => 'primary_color',
                'value' => '#15428b',
                'type' => 'text',
                'group' => 'branding',
                'label' => 'Color Primario',
                'description' => 'Color principal del tema (hexadecimal)',
                'is_public' => true,
            ],
            [
                'key' => 'secondary_color',
                'value' => '#4388cf',
                'type' => 'text',
                'group' => 'branding',
                'label' => 'Color Secundario',
                'description' => 'Color secundario del tema (hexadecimal)',
                'is_public' => true,
            ],
            
            // === GENERAL ===
            [
                'key' => 'company_name',
                'value' => 'Mi Empresa',
                'type' => 'text',
                'group' => 'general',
                'label' => 'Nombre de la Empresa',
                'description' => 'Razón social o nombre comercial',
                'is_public' => false,
            ],
            [
                'key' => 'company_rif',
                'value' => null,
                'type' => 'text',
                'group' => 'general',
                'label' => 'RIF / NIT',
                'description' => 'Identificación fiscal de la empresa',
                'is_public' => false,
            ],
            [
                'key' => 'company_address',
                'value' => null,
                'type' => 'text',
                'group' => 'general',
                'label' => 'Dirección',
                'description' => 'Dirección física de la empresa',
                'is_public' => false,
            ],
            [
                'key' => 'company_phone',
                'value' => null,
                'type' => 'text',
                'group' => 'general',
                'label' => 'Teléfono',
                'description' => 'Teléfono principal de contacto',
                'is_public' => false,
            ],
            [
                'key' => 'company_email',
                'value' => null,
                'type' => 'text',
                'group' => 'general',
                'label' => 'Correo Electrónico',
                'description' => 'Email principal de la empresa',
                'is_public' => false,
            ],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
