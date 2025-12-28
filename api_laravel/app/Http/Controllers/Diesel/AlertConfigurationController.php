<?php

namespace App\Http\Controllers\Diesel;

use App\Http\Controllers\Controller;
use App\Models\AlertConfiguration;
use App\Models\Tanque;
use App\Services\AlertService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AlertConfigurationController extends Controller
{
    protected AlertService $alertService;

    public function __construct(AlertService $alertService)
    {
        $this->alertService = $alertService;
    }

    /**
     * Listar todas las configuraciones de alerta
     */
    public function index(): JsonResponse
    {
        $configs = AlertConfiguration::with('tanques:id,nombre,codigo')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($config) {
                return [
                    'id' => $config->id,
                    'name' => $config->name,
                    'type' => $config->type,
                    'is_enabled' => $config->is_enabled,
                    'config' => $config->config,
                    'min_interval_minutes' => $config->min_interval_minutes,
                    'tanques' => $config->tanques->pluck('id'),
                    'tanques_nombres' => $config->tanques->pluck('nombre')->join(', '),
                    'created_at' => $config->created_at->format('Y-m-d H:i'),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $configs,
        ]);
    }

    /**
     * Crear nueva configuración de alerta
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:whatsapp,email,sms,webhook',
            'is_enabled' => 'boolean',
            'config' => 'required|array',
            'config.instance' => 'required_if:type,whatsapp|string',
            'config.destination' => 'required|string',
            'min_interval_minutes' => 'integer|min:1|max:1440',
            'tanque_ids' => 'required|array|min:1',
            'tanque_ids.*' => 'exists:tanques,id',
        ]);

        $config = AlertConfiguration::create([
            'name' => $validated['name'],
            'type' => $validated['type'],
            'is_enabled' => $validated['is_enabled'] ?? true,
            'config' => $validated['config'],
            'min_interval_minutes' => $validated['min_interval_minutes'] ?? 30,
        ]);

        // Asociar tanques
        $config->tanques()->attach($validated['tanque_ids']);

        return response()->json([
            'success' => true,
            'message' => 'Configuración de alerta creada',
            'data' => $config,
        ], 201);
    }

    /**
     * Obtener una configuración específica
     */
    public function show($id): JsonResponse
    {
        $config = AlertConfiguration::with('tanques:id,nombre,codigo')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $config->id,
                'name' => $config->name,
                'type' => $config->type,
                'is_enabled' => $config->is_enabled,
                'config' => $config->config,
                'min_interval_minutes' => $config->min_interval_minutes,
                'tanque_ids' => $config->tanques->pluck('id'),
            ],
        ]);
    }

    /**
     * Actualizar configuración de alerta
     */
    public function update(Request $request, $id): JsonResponse
    {
        $config = AlertConfiguration::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:whatsapp,email,sms,webhook',
            'is_enabled' => 'boolean',
            'config' => 'required|array',
            'config.instance' => 'required_if:type,whatsapp|string',
            'config.destination' => 'required|string',
            'min_interval_minutes' => 'integer|min:1|max:1440',
            'tanque_ids' => 'required|array|min:1',
            'tanque_ids.*' => 'exists:tanques,id',
        ]);

        $config->update([
            'name' => $validated['name'],
            'type' => $validated['type'],
            'is_enabled' => $validated['is_enabled'] ?? $config->is_enabled,
            'config' => $validated['config'],
            'min_interval_minutes' => $validated['min_interval_minutes'] ?? $config->min_interval_minutes,
        ]);

        // Sincronizar tanques (sin tocar last_alert_at existentes)
        $config->tanques()->sync($validated['tanque_ids']);

        return response()->json([
            'success' => true,
            'message' => 'Configuración actualizada',
        ]);
    }

    /**
     * Eliminar configuración de alerta
     */
    public function destroy($id): JsonResponse
    {
        $config = AlertConfiguration::findOrFail($id);
        $config->tanques()->detach();
        $config->delete();

        return response()->json([
            'success' => true,
            'message' => 'Configuración eliminada',
        ]);
    }

    /**
     * Obtener instancias de Evolution API disponibles
     */
    public function getEvolutionInstances(): JsonResponse
    {
        $instances = $this->alertService->getEvolutionInstances();

        return response()->json([
            'success' => true,
            'data' => $instances,
        ]);
    }

    /**
     * Probar envío de alerta (para testing)
     */
    public function testAlert(Request $request, $id): JsonResponse
    {
        $config = AlertConfiguration::findOrFail($id);
        
        $validated = $request->validate([
            'tanque_id' => 'required|exists:tanques,id',
        ]);

        $tanque = Tanque::findOrFail($validated['tanque_id']);
        
        $sent = match ($config->type) {
            'whatsapp' => $this->alertService->sendWhatsAppAlert($tanque, $config),
            default => false,
        };

        return response()->json([
            'success' => $sent,
            'message' => $sent ? 'Alerta de prueba enviada' : 'Error enviando alerta',
        ]);
    }
    /**
     * Obtener grupos de WhatsApp de una instancia
     */
    public function getWhatsAppGroups(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'instance' => 'required|string',
        ]);

        $groups = $this->alertService->getWhatsAppGroups($validated['instance']);

        return response()->json([
            'success' => true,
            'data' => $groups,
        ]);
    }

    /**
     * Prueba rápida de envío de mensaje (para debug)
     */
    public function testSendMessage(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'instance' => 'required|string',
            'destination' => 'required|string',
            'message' => 'nullable|string',
        ]);

        $message = $validated['message'] ?? '🔔 Prueba de alerta - ' . now()->format('H:i:s');
        $destination = $validated['destination'];
        
        // Formato correcto para Evolution API v2.2.3
        $payload = [
            'number' => $destination,
            'text' => $message,
        ];
        
        try {
            $response = \Illuminate\Support\Facades\Http::timeout(30)
                ->withHeaders([
                    'apikey' => config('services.evolution.key', env('EVOLUTION_API_KEY', '')),
                    'Content-Type' => 'application/json',
                ])
                ->post(config('services.evolution.url', env('EVOLUTION_API_URL', 'http://evolution_api:8080')) . "/message/sendText/{$validated['instance']}", $payload);

            return response()->json([
                'success' => $response->successful(),
                'status' => $response->status(),
                'response' => $response->json() ?? $response->body(),
                'payload_sent' => $payload,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
