<?php

namespace Database\Seeders;

use App\Models\ApiCredential;
use Illuminate\Database\Seeder;

class ApiCredentialSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $pusherCredentials = [
            [
                'provider' => 'pusher',
                'key_name' => 'app_id',
                'value' => '2092299',
                'is_secret' => false,
                'label' => 'App ID',
                'description' => 'ID de la aplicación en Pusher',
            ],
            [
                'provider' => 'pusher',
                'key_name' => 'app_key',
                'value' => '92e89cd6afe7b32940f3',
                'is_secret' => false,
                'label' => 'App Key',
                'description' => 'Clave pública de la aplicación (visible para clientes)',
            ],
            [
                'provider' => 'pusher',
                'key_name' => 'app_secret',
                'value' => '07ad98dc1bb8204b523a',
                'is_secret' => true,
                'label' => 'App Secret',
                'description' => 'Clave secreta de la aplicación (solo backend)',
            ],
            [
                'provider' => 'pusher',
                'key_name' => 'app_cluster',
                'value' => 'sa1',
                'is_secret' => false,
                'label' => 'Cluster',
                'description' => 'Región del cluster de Pusher (ej: sa1, us2, eu)',
            ],
            // Puerto (443) y Esquema (https) son fijos para Pusher en la nube
            // No se exponen como configurables
        ];

        foreach ($pusherCredentials as $cred) {
            ApiCredential::updateOrCreate(
                ['provider' => $cred['provider'], 'key_name' => $cred['key_name']],
                [
                    'value' => $cred['value'],
                    'is_secret' => $cred['is_secret'],
                    'label' => $cred['label'],
                    'description' => $cred['description'],
                ]
            );
        }
    }
}
