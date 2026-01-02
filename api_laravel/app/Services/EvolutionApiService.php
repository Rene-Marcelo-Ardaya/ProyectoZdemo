<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * EvolutionApiService
 * 
 * Servicio para comunicarse con Evolution API y gestionar instancias de WhatsApp.
 */
class EvolutionApiService
{
    private string $baseUrl;
    private string $apiKey;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('services.evolution.url', env('EVOLUTION_API_URL', 'http://evolution_api:8080')), '/');
        $this->apiKey = config('services.evolution.key', env('EVOLUTION_API_KEY', ''));
    }

    /**
     * Headers por defecto para las peticiones
     */
    private function headers(): array
    {
        return [
            'apikey' => $this->apiKey,
            'Content-Type' => 'application/json',
        ];
    }

    /**
     * Crear una nueva instancia de WhatsApp
     */
    public function createInstance(string $instanceName, array $options = []): array
    {
        $payload = array_merge([
            'instanceName' => $instanceName,
            'integration' => 'WHATSAPP-BAILEYS',
            'qrcode' => true,
            'reject_call' => false,
            'always_online' => true,
        ], $options);

        try {
            $response = Http::withHeaders($this->headers())
                ->post("{$this->baseUrl}/instance/create", $payload);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            return [
                'success' => false,
                'error' => $response->json()['message'] ?? 'Error al crear instancia',
                'status' => $response->status(),
            ];
        } catch (\Exception $e) {
            Log::error('Evolution API - Error creating instance', [
                'instanceName' => $instanceName,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Obtener estado de una instancia
     */
    public function getInstanceState(string $instanceName): array
    {
        try {
            $response = Http::withHeaders($this->headers())
                ->get("{$this->baseUrl}/instance/connectionState/{$instanceName}");

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            return [
                'success' => false,
                'error' => $response->json()['message'] ?? 'Error al obtener estado',
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Obtener QR Code para conectar
     */
    public function getQRCode(string $instanceName): array
    {
        try {
            $response = Http::withHeaders($this->headers())
                ->get("{$this->baseUrl}/instance/connect/{$instanceName}");

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            return [
                'success' => false,
                'error' => $response->json()['message'] ?? 'Error al obtener QR',
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Desconectar una instancia
     */
    public function logout(string $instanceName): array
    {
        try {
            $response = Http::withHeaders($this->headers())
                ->delete("{$this->baseUrl}/instance/logout/{$instanceName}");

            return [
                'success' => $response->successful(),
                'data' => $response->json(),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Eliminar una instancia completamente
     */
    public function deleteInstance(string $instanceName): array
    {
        try {
            $response = Http::withHeaders($this->headers())
                ->delete("{$this->baseUrl}/instance/delete/{$instanceName}");

            return [
                'success' => $response->successful(),
                'data' => $response->json(),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Listar todas las instancias
     */
    public function listInstances(): array
    {
        try {
            $response = Http::withHeaders($this->headers())
                ->get("{$this->baseUrl}/instance/fetchInstances");

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            return [
                'success' => false,
                'error' => 'Error al listar instancias',
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Reiniciar una instancia
     */
    public function restartInstance(string $instanceName): array
    {
        try {
            $response = Http::withHeaders($this->headers())
                ->put("{$this->baseUrl}/instance/restart/{$instanceName}");

            return [
                'success' => $response->successful(),
                'data' => $response->json(),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Enviar mensaje de texto
     */
    public function sendTextMessage(string $instanceName, string $number, string $message): array
    {
        $payload = [
            'number' => $number,
            'text' => $message,
        ];

        try {
            $response = Http::withHeaders($this->headers())
                ->post("{$this->baseUrl}/message/sendText/{$instanceName}", $payload);

            return [
                'success' => $response->successful(),
                'data' => $response->json(),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
}
