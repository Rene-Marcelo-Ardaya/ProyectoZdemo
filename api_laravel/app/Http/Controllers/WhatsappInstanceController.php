<?php

namespace App\Http\Controllers;

use App\Models\WhatsappInstance;
use App\Models\SuperAdminAuditLog;
use App\Services\EvolutionApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WhatsappInstanceController extends Controller
{
    private EvolutionApiService $evolutionApi;

    public function __construct(EvolutionApiService $evolutionApi)
    {
        $this->evolutionApi = $evolutionApi;
    }

    /**
     * Listar instancias del tenant actual
     */
    public function index(): JsonResponse
    {
        $tenant = app('currentTenant');

        if (!$tenant) {
            return response()->json([
                'error' => 'Tenant no identificado',
            ], 403);
        }

        $instances = WhatsappInstance::where('tenant_id', $tenant->id)
            ->orderBy('created_at', 'desc')
            ->get();

        // Actualizar estado desde Evolution API
        foreach ($instances as $instance) {
            $state = $this->evolutionApi->getInstanceState($instance->instance_name);
            if ($state['success'] && isset($state['data']['instance']['state'])) {
                $newStatus = strtolower($state['data']['instance']['state']);
                if (in_array($newStatus, ['connected', 'connecting', 'disconnected'])) {
                    $instance->status = $newStatus;
                    $instance->save();
                }
            }
        }

        return response()->json([
            'instances' => $instances,
            'can_add_more' => $tenant->canAddWhatsappInstance(),
            'max_allowed' => $tenant->plan->max_whatsapp_instances ?? 1,
            'current_count' => $instances->count(),
        ]);
    }

    /**
     * Crear nueva instancia
     */
    public function store(Request $request): JsonResponse
    {
        $tenant = app('currentTenant');

        if (!$tenant) {
            return response()->json([
                'error' => 'Tenant no identificado',
            ], 403);
        }

        // Verificar límite de instancias
        if (!$tenant->canAddWhatsappInstance()) {
            return response()->json([
                'error' => 'Límite de instancias alcanzado',
                'message' => 'Tu plan permite un máximo de ' . ($tenant->plan->max_whatsapp_instances ?? 1) . ' instancias de WhatsApp.',
                'upgrade_required' => true,
            ], 403);
        }

        $request->validate([
            'display_name' => 'required|string|max:100',
        ]);

        // Generar nombre único de instancia
        $instanceName = WhatsappInstance::generateInstanceName($tenant->id);

        // Crear en Evolution API
        $result = $this->evolutionApi->createInstance($instanceName);

        if (!$result['success']) {
            return response()->json([
                'error' => 'Error al crear instancia en Evolution API',
                'message' => $result['error'] ?? 'Error desconocido',
            ], 500);
        }

        // Guardar en base de datos
        $instance = WhatsappInstance::create([
            'tenant_id' => $tenant->id,
            'instance_name' => $instanceName,
            'display_name' => $request->display_name,
            'status' => 'disconnected',
            'api_key' => $result['data']['hash'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'instance' => $instance,
            'evolution_data' => $result['data'],
        ], 201);
    }

    /**
     * Ver detalle de una instancia
     */
    public function show(int $id): JsonResponse
    {
        $tenant = app('currentTenant');
        $instance = WhatsappInstance::where('tenant_id', $tenant->id)
            ->findOrFail($id);

        // Obtener estado actual desde Evolution
        $state = $this->evolutionApi->getInstanceState($instance->instance_name);

        return response()->json([
            'instance' => $instance,
            'state' => $state['data'] ?? null,
        ]);
    }

    /**
     * Obtener QR Code para conectar
     */
    public function getQRCode(int $id): JsonResponse
    {
        $tenant = app('currentTenant');
        $instance = WhatsappInstance::where('tenant_id', $tenant->id)
            ->findOrFail($id);

        $result = $this->evolutionApi->getQRCode($instance->instance_name);

        if (!$result['success']) {
            return response()->json([
                'error' => 'Error al obtener QR Code',
                'message' => $result['error'] ?? 'Instancia posiblemente ya conectada',
            ], 400);
        }

        // Actualizar estado
        $instance->status = 'connecting';
        $instance->save();

        return response()->json([
            'success' => true,
            'qrcode' => $result['data']['qrcode'] ?? null,
            'base64' => $result['data']['base64'] ?? null,
        ]);
    }

    /**
     * Desconectar instancia
     */
    public function logout(int $id): JsonResponse
    {
        $tenant = app('currentTenant');
        $instance = WhatsappInstance::where('tenant_id', $tenant->id)
            ->findOrFail($id);

        $result = $this->evolutionApi->logout($instance->instance_name);

        $instance->status = 'disconnected';
        $instance->save();

        return response()->json([
            'success' => true,
            'message' => 'Instancia desconectada',
        ]);
    }

    /**
     * Eliminar instancia
     */
    public function destroy(int $id): JsonResponse
    {
        $tenant = app('currentTenant');
        $instance = WhatsappInstance::where('tenant_id', $tenant->id)
            ->findOrFail($id);

        // Eliminar de Evolution API
        $this->evolutionApi->deleteInstance($instance->instance_name);

        // Eliminar de base de datos
        $instance->delete();

        return response()->json([
            'success' => true,
            'message' => 'Instancia eliminada',
        ]);
    }

    /**
     * Reiniciar instancia
     */
    public function restart(int $id): JsonResponse
    {
        $tenant = app('currentTenant');
        $instance = WhatsappInstance::where('tenant_id', $tenant->id)
            ->findOrFail($id);

        $result = $this->evolutionApi->restartInstance($instance->instance_name);

        return response()->json([
            'success' => $result['success'],
            'message' => $result['success'] ? 'Instancia reiniciada' : 'Error al reiniciar',
        ]);
    }
}
