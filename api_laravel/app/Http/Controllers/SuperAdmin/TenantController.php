<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\Plan;
use App\Models\SuperAdminAuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * TenantController
 * 
 * Controller para gestionar tenants desde el panel de Super Admin.
 */
class TenantController extends Controller
{
    /**
     * Listar todos los tenants con estadísticas
     */
    public function index(Request $request): JsonResponse
    {
        $query = Tenant::with(['plan'])
            ->withCount(['users', 'whatsappInstances']);

        // Búsqueda
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filtro por estado
        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            } elseif ($request->status === 'trial') {
                $query->where('is_active', true)
                    ->whereNotNull('trial_ends_at')
                    ->where('trial_ends_at', '>', now());
            }
        }

        // Ordenamiento
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDir = $request->get('sort_dir', 'desc');
        $query->orderBy($sortBy, $sortDir);

        $tenants = $query->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $tenants,
        ]);
    }

    /**
     * Ver detalle de un tenant
     */
    public function show(int $id): JsonResponse
    {
        $tenant = Tenant::with(['plan', 'modules', 'users', 'whatsappInstances'])
            ->withCount(['users', 'whatsappInstances'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $tenant,
        ]);
    }

    /**
     * Crear nuevo tenant
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:100|unique:tenants,slug|regex:/^[a-z0-9-]+$/',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'plan_id' => 'required|exists:plans,id',
            'is_active' => 'boolean',
            'trial_days' => 'nullable|integer|min:0|max:90',
        ]);

        // Calcular fecha de fin de trial
        $trialEndsAt = null;
        if ($request->filled('trial_days') && $request->trial_days > 0) {
            $trialEndsAt = now()->addDays($request->trial_days);
        }

        $tenant = Tenant::create([
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'plan_id' => $validated['plan_id'],
            'is_active' => $validated['is_active'] ?? true,
            'trial_ends_at' => $trialEndsAt,
        ]);

        // Log de auditoría
        SuperAdminAuditLog::logCreate($tenant);

        return response()->json([
            'success' => true,
            'message' => 'Tenant creado exitosamente',
            'data' => $tenant->load('plan'),
        ], 201);
    }

    /**
     * Actualizar tenant
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $tenant = Tenant::findOrFail($id);
        $oldValues = $tenant->toArray();

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|required|string|max:100|unique:tenants,slug,' . $id . '|regex:/^[a-z0-9-]+$/',
            'email' => 'sometimes|required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'plan_id' => 'sometimes|required|exists:plans,id',
            'is_active' => 'sometimes|boolean',
            'custom_domain' => 'nullable|string|max:255',
        ]);

        $tenant->update($validated);

        // Log de auditoría
        SuperAdminAuditLog::logUpdate($tenant->fresh(), $oldValues);

        return response()->json([
            'success' => true,
            'message' => 'Tenant actualizado exitosamente',
            'data' => $tenant->load('plan'),
        ]);
    }

    /**
     * Eliminar tenant
     */
    public function destroy(int $id): JsonResponse
    {
        $tenant = Tenant::findOrFail($id);
        $tenantData = $tenant->toArray();

        // Verificar que no tenga usuarios activos
        if ($tenant->users()->count() > 0) {
            return response()->json([
                'success' => false,
                'error' => 'No se puede eliminar un tenant con usuarios activos',
            ], 400);
        }

        // Log de auditoría - guardar datos antes de eliminar
        $tenantForLog = clone $tenant;
        $tenant->delete();
        SuperAdminAuditLog::logDelete($tenantForLog);

        return response()->json([
            'success' => true,
            'message' => 'Tenant eliminado exitosamente',
        ]);
    }

    /**
     * Obtener estadísticas generales para el dashboard
     */
    public function stats(): JsonResponse
    {
        $stats = [
            'total_tenants' => Tenant::count(),
            'active_tenants' => Tenant::where('is_active', true)->count(),
            'trial_tenants' => Tenant::where('is_active', true)
                ->whereNotNull('trial_ends_at')
                ->where('trial_ends_at', '>', now())
                ->count(),
            'total_users' => \App\Models\User::whereNotNull('tenant_id')->count(),
            'total_whatsapp_instances' => \App\Models\WhatsappInstance::count(),
        ];

        // Tenants recientes
        $stats['recent_tenants'] = Tenant::with('plan')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Listar planes disponibles
     */
    public function plans(): JsonResponse
    {
        $plans = Plan::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $plans,
        ]);
    }
}
