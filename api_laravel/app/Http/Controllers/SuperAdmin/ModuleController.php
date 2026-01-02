<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\SuperAdminAuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * ModuleController
 * 
 * Controller para gestionar módulos/features desde el panel de Super Admin.
 */
class ModuleController extends Controller
{
    /**
     * Listar todos los módulos
     */
    public function index(Request $request): JsonResponse
    {
        $query = Module::withCount('plans', 'tenants');

        // Filtro por tipo
        if ($request->filled('is_addon')) {
            $query->where('is_addon', $request->boolean('is_addon'));
        }

        // Ordenamiento
        $sortBy = $request->get('sort_by', 'sort_order');
        $sortDir = $request->get('sort_dir', 'asc');
        $query->orderBy($sortBy, $sortDir);

        $modules = $query->get();

        return response()->json([
            'success' => true,
            'data' => $modules,
        ]);
    }

    /**
     * Ver detalle de un módulo
     */
    public function show(int $id): JsonResponse
    {
        $module = Module::with(['plans', 'tenants'])
            ->withCount('plans', 'tenants')
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $module,
        ]);
    }

    /**
     * Crear nuevo módulo
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'slug' => 'required|string|max:50|unique:modules,slug|regex:/^[a-z0-9_]+$/',
            'description' => 'nullable|string|max:500',
            'icon' => 'nullable|string|max:50',
            'price_monthly' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
            'is_addon' => 'boolean',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $module = Module::create([
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'description' => $validated['description'] ?? null,
            'icon' => $validated['icon'] ?? null,
            'price_monthly' => $validated['price_monthly'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'is_addon' => $validated['is_addon'] ?? false,
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        // Log de auditoría
        SuperAdminAuditLog::logCreate($module);

        return response()->json([
            'success' => true,
            'message' => 'Módulo creado exitosamente',
            'data' => $module,
        ], 201);
    }

    /**
     * Actualizar módulo
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $module = Module::findOrFail($id);
        $oldValues = $module->toArray();

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:100',
            'slug' => 'sometimes|required|string|max:50|unique:modules,slug,' . $id . '|regex:/^[a-z0-9_]+$/',
            'description' => 'nullable|string|max:500',
            'icon' => 'nullable|string|max:50',
            'price_monthly' => 'nullable|numeric|min:0',
            'is_active' => 'sometimes|boolean',
            'is_addon' => 'sometimes|boolean',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $module->update($validated);

        // Log de auditoría
        SuperAdminAuditLog::logUpdate($module->fresh(), $oldValues);

        return response()->json([
            'success' => true,
            'message' => 'Módulo actualizado exitosamente',
            'data' => $module->fresh(),
        ]);
    }

    /**
     * Activar/Desactivar módulo
     */
    public function toggleActive(int $id): JsonResponse
    {
        $module = Module::findOrFail($id);
        $oldValues = $module->toArray();

        $module->is_active = !$module->is_active;
        $module->save();

        // Log de auditoría
        SuperAdminAuditLog::logUpdate($module, $oldValues);

        return response()->json([
            'success' => true,
            'message' => $module->is_active ? 'Módulo activado' : 'Módulo desactivado',
            'data' => $module,
        ]);
    }

    /**
     * Eliminar módulo
     */
    public function destroy(int $id): JsonResponse
    {
        $module = Module::withCount('plans', 'tenants')->findOrFail($id);

        // Verificar que no esté en uso
        if ($module->plans_count > 0 || $module->tenants_count > 0) {
            return response()->json([
                'success' => false,
                'error' => "No se puede eliminar: está asignado a {$module->plans_count} plan(es) y {$module->tenants_count} cliente(s)",
            ], 400);
        }

        // Log de auditoría antes de eliminar
        $moduleForLog = clone $module;
        $module->delete();
        SuperAdminAuditLog::logDelete($moduleForLog);

        return response()->json([
            'success' => true,
            'message' => 'Módulo eliminado exitosamente',
        ]);
    }
}
