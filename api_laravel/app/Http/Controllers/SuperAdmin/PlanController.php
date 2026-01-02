<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Module;
use App\Models\SuperAdminAuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * PlanController
 * 
 * Controller para gestionar planes de suscripción desde el panel de Super Admin.
 */
class PlanController extends Controller
{
    /**
     * Listar todos los planes con sus módulos
     */
    public function index(Request $request): JsonResponse
    {
        $query = Plan::with('modules:id,name,slug,icon,is_addon')
            ->withCount(['tenants', 'modules']);

        // Ordenamiento
        $sortBy = $request->get('sort_by', 'sort_order');
        $sortDir = $request->get('sort_dir', 'asc');
        $query->orderBy($sortBy, $sortDir);

        $plans = $query->get();

        return response()->json([
            'success' => true,
            'data' => $plans,
        ]);
    }

    /**
     * Ver detalle de un plan
     */
    public function show(int $id): JsonResponse
    {
        $plan = Plan::with('modules')
            ->withCount('tenants')
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $plan,
        ]);
    }

    /**
     * Crear nuevo plan
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'slug' => 'required|string|max:50|unique:plans,slug|regex:/^[a-z0-9-]+$/',
            'description' => 'nullable|string|max:500',
            'price_monthly' => 'required|numeric|min:0',
            'price_yearly' => 'nullable|numeric|min:0',
            'max_users' => 'required|integer|min:-1',
            'max_whatsapp_instances' => 'required|integer|min:-1',
            'storage_gb' => 'required|integer|min:-1',
            'features' => 'nullable|array',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'sort_order' => 'nullable|integer|min:0',
            'module_ids' => 'nullable|array',
            'module_ids.*' => 'exists:modules,id',
        ]);

        $plan = Plan::create([
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'description' => $validated['description'] ?? null,
            'price_monthly' => $validated['price_monthly'],
            'price_yearly' => $validated['price_yearly'] ?? ($validated['price_monthly'] * 10),
            'max_users' => $validated['max_users'],
            'max_whatsapp_instances' => $validated['max_whatsapp_instances'],
            'storage_gb' => $validated['storage_gb'],
            'features' => $validated['features'] ?? [],
            'is_active' => $validated['is_active'] ?? true,
            'is_featured' => $validated['is_featured'] ?? false,
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        // Sincronizar módulos
        if (isset($validated['module_ids'])) {
            $plan->modules()->sync($validated['module_ids']);
        }

        // Log de auditoría
        SuperAdminAuditLog::logCreate($plan);

        return response()->json([
            'success' => true,
            'message' => 'Plan creado exitosamente',
            'data' => $plan->load('modules'),
        ], 201);
    }

    /**
     * Actualizar plan
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $plan = Plan::findOrFail($id);
        $oldValues = $plan->toArray();

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:100',
            'slug' => 'sometimes|required|string|max:50|unique:plans,slug,' . $id . '|regex:/^[a-z0-9-]+$/',
            'description' => 'nullable|string|max:500',
            'price_monthly' => 'sometimes|required|numeric|min:0',
            'price_yearly' => 'nullable|numeric|min:0',
            'max_users' => 'sometimes|required|integer|min:-1',
            'max_whatsapp_instances' => 'sometimes|required|integer|min:-1',
            'storage_gb' => 'sometimes|required|integer|min:-1',
            'features' => 'nullable|array',
            'is_active' => 'sometimes|boolean',
            'is_featured' => 'sometimes|boolean',
            'sort_order' => 'nullable|integer|min:0',
            'module_ids' => 'nullable|array',
            'module_ids.*' => 'exists:modules,id',
        ]);

        // Extraer module_ids antes de update
        $moduleIds = $validated['module_ids'] ?? null;
        unset($validated['module_ids']);

        $plan->update($validated);

        // Sincronizar módulos si se enviaron
        if ($moduleIds !== null) {
            $plan->modules()->sync($moduleIds);
        }

        // Log de auditoría
        SuperAdminAuditLog::logUpdate($plan->fresh(), $oldValues);

        return response()->json([
            'success' => true,
            'message' => 'Plan actualizado exitosamente',
            'data' => $plan->fresh()->load('modules'),
        ]);
    }

    /**
     * Activar/Desactivar plan
     */
    public function toggleActive(int $id): JsonResponse
    {
        $plan = Plan::findOrFail($id);
        $oldValues = $plan->toArray();

        $plan->is_active = !$plan->is_active;
        $plan->save();

        // Log de auditoría
        SuperAdminAuditLog::logUpdate($plan, $oldValues);

        return response()->json([
            'success' => true,
            'message' => $plan->is_active ? 'Plan activado' : 'Plan desactivado',
            'data' => $plan->load('modules'),
        ]);
    }

    /**
     * Eliminar plan
     */
    public function destroy(int $id): JsonResponse
    {
        $plan = Plan::withCount('tenants')->findOrFail($id);

        // Verificar que no tenga tenants activos
        if ($plan->tenants_count > 0) {
            return response()->json([
                'success' => false,
                'error' => "No se puede eliminar el plan porque tiene {$plan->tenants_count} cliente(s) activo(s)",
            ], 400);
        }

        // Desvincular módulos
        $plan->modules()->detach();

        // Log de auditoría antes de eliminar
        $planForLog = clone $plan;
        $plan->delete();
        SuperAdminAuditLog::logDelete($planForLog);

        return response()->json([
            'success' => true,
            'message' => 'Plan eliminado exitosamente',
        ]);
    }
}
