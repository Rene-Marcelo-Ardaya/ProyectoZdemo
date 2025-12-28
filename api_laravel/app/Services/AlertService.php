<?php

namespace App\Services;

use App\Models\Tanque;
use App\Models\AlertConfiguration;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AlertService
{
    protected string $evolutionApiUrl;
    protected string $evolutionApiKey;

    public function __construct()
    {
        $this->evolutionApiUrl = config('services.evolution.url', env('EVOLUTION_API_URL', 'http://evolution_api:8080'));
        $this->evolutionApiKey = config('services.evolution.key', env('EVOLUTION_API_KEY', ''));
    }

    /**
     * Verificar y enviar alertas para un tanque si su nivel está bajo
     */
    public function checkAndSendAlerts(Tanque $tanque): array
    {
        $results = [];

        // Solo verificar si el nivel está bajo
        if (!$tanque->nivel_bajo) {
            return $results;
        }

        // Obtener configuraciones de alerta activas para este tanque
        $alertConfigs = AlertConfiguration::activas()
            ->whereHas('tanques', function ($query) use ($tanque) {
                $query->where('tanque_id', $tanque->id);
            })
            ->get();

        foreach ($alertConfigs as $config) {
            // Verificar si se puede enviar (respetando intervalo mínimo)
            if (!$config->canSendAlertForTanque($tanque)) {
                $results[] = [
                    'config_id' => $config->id,
                    'sent' => false,
                    'reason' => 'Intervalo mínimo no cumplido',
                ];
                continue;
            }

            // Enviar según el tipo
            $sent = match ($config->type) {
                AlertConfiguration::TYPE_WHATSAPP => $this->sendWhatsAppAlert($tanque, $config),
                default => false,
            };

            if ($sent) {
                $config->markAlertSent($tanque);
            }

            $results[] = [
                'config_id' => $config->id,
                'type' => $config->type,
                'sent' => $sent,
            ];
        }

        return $results;
    }

    /**
     * Enviar alerta por WhatsApp usando Evolution API
     */
    public function sendWhatsAppAlert(Tanque $tanque, AlertConfiguration $config): bool
    {
        $instance = $config->getEvolutionInstance();
        $destination = $config->getDestination();

        if (!$instance || !$destination) {
            Log::warning("AlertService: Configuración incompleta para alerta WhatsApp", [
                'config_id' => $config->id,
                'instance' => $instance,
                'destination' => $destination,
            ]);
            return false;
        }

        // Construir mensaje
        $porcentaje = $tanque->capacidad_litros > 0 
            ? round(($tanque->nivel_actual / $tanque->capacidad_litros) * 100) 
            : 0;

        $message = $this->buildAlertMessage($tanque, $porcentaje);

        Log::info("AlertService: Intentando enviar WhatsApp", [
            'instance' => $instance,
            'destination' => $destination,
            'url' => "{$this->evolutionApiUrl}/message/sendText/{$instance}",
        ]);

        try {
            $response = Http::timeout(30)
                ->withHeaders([
                    'apikey' => $this->evolutionApiKey,
                    'Content-Type' => 'application/json',
                ])
                ->post("{$this->evolutionApiUrl}/message/sendText/{$instance}", [
                    'number' => $destination,
                    'text' => $message,
                ]);

            Log::info("AlertService: Respuesta de Evolution API", [
                'status' => $response->status(),
                'body' => substr($response->body(), 0, 500),
            ]);

            if ($response->successful()) {
                Log::info("AlertService: Alerta WhatsApp enviada exitosamente", [
                    'tanque' => $tanque->nombre,
                    'destination' => $destination,
                ]);
                return true;
            }

            Log::error("AlertService: Error enviando WhatsApp", [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return false;

        } catch (\Exception $e) {
            Log::error("AlertService: Excepción enviando WhatsApp", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return false;
        }
    }

    /**
     * Construir mensaje de alerta
     */
    protected function buildAlertMessage(Tanque $tanque, int $porcentaje): string
    {
        $tipoEmoji = $tanque->tipo === 'MOVIL' ? '🚚' : '🏭';
        
        return "⚠️ *ALERTA DE NIVEL BAJO*\n\n"
            . "{$tipoEmoji} *Tanque:* {$tanque->nombre}\n"
            . "📍 *Código:* {$tanque->codigo}\n"
            . "📊 *Nivel actual:* {$tanque->nivel_actual} L ({$porcentaje}%)\n"
            . "⚡ *Nivel mínimo:* {$tanque->nivel_minimo_alerta} L\n\n"
            . "Se requiere reabastecimiento.";
    }

    /**
     * Obtener instancias disponibles de Evolution API
     */
    public function getEvolutionInstances(): array
    {
        try {
            $response = Http::withHeaders([
                'apikey' => $this->evolutionApiKey,
            ])->get("{$this->evolutionApiUrl}/instance/fetchInstances");

            if ($response->successful()) {
                $instances = $response->json();
                return collect($instances)->map(function ($item) {
                    return [
                        'name' => $item['name'] ?? $item['instance']['instanceName'] ?? 'Sin nombre',
                        'id' => $item['id'] ?? $item['instance']['instanceId'] ?? null,
                        'status' => $item['connectionStatus'] ?? $item['instance']['status'] ?? 'unknown',
                        'profileName' => $item['profileName'] ?? null,
                    ];
                })->toArray();
            }

            return [];
        } catch (\Exception $e) {
            Log::error("AlertService: Error obteniendo instancias Evolution", [
                'error' => $e->getMessage(),
            ]);
            return [];
        }
    }

    /**
     * Obtener lista de grupos de WhatsApp de una instancia
     */
    public function getWhatsAppGroups(string $instance): array
    {
        try {
            $response = Http::withHeaders([
                'apikey' => $this->evolutionApiKey,
            ])->get("{$this->evolutionApiUrl}/group/fetchAllGroups/{$instance}", [
                'getParticipants' => 'false',
            ]);

            if ($response->successful()) {
                $groups = $response->json();
                return collect($groups)
                    ->filter(fn($g) => !($g['isCommunity'] ?? false) && !($g['isCommunityAnnounce'] ?? false))
                    ->map(fn($g) => [
                        'id' => $g['id'] ?? '',
                        'name' => $g['subject'] ?? 'Sin nombre',
                        'size' => $g['size'] ?? 0,
                    ])
                    ->values()
                    ->toArray();
            }

            return [];
        } catch (\Exception $e) {
            Log::error("AlertService: Error obteniendo grupos WhatsApp", [
                'error' => $e->getMessage(),
            ]);
            return [];
        }
    }
}


