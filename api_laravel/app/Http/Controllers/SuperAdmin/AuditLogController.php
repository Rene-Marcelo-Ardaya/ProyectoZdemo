<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\SuperAdminAuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * AuditLogController
 * 
 * Controller para ver los logs de auditoría del Super Admin.
 */
class AuditLogController extends Controller
{
    /**
     * Listar logs de auditoría con filtros y paginación
     */
    public function index(Request $request): JsonResponse
    {
        $query = SuperAdminAuditLog::with('user:id,name,email')
            ->orderBy('created_at', 'desc');

        // Filtro por acción
        if ($request->has('action') && $request->action) {
            $query->where('action', $request->action);
        }

        // Filtro por tipo de entidad
        if ($request->has('entity_type') && $request->entity_type) {
            $query->where('entity_type', $request->entity_type);
        }

        // Filtro por fecha desde
        if ($request->has('from') && $request->from) {
            $query->whereDate('created_at', '>=', $request->from);
        }

        // Filtro por fecha hasta
        if ($request->has('to') && $request->to) {
            $query->whereDate('created_at', '<=', $request->to);
        }

        // Búsqueda por usuario
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Paginación
        $perPage = $request->get('per_page', 25);
        $logs = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $logs->items(),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
            ],
        ]);
    }

    /**
     * Ver detalle de un log específico
     */
    public function show(int $id): JsonResponse
    {
        $log = SuperAdminAuditLog::with('user:id,name,email')
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $log,
        ]);
    }

    /**
     * Obtener estadísticas de auditoría
     */
    public function stats(): JsonResponse
    {
        $today = now()->startOfDay();
        $thisWeek = now()->startOfWeek();
        $thisMonth = now()->startOfMonth();

        return response()->json([
            'success' => true,
            'data' => [
                'total' => SuperAdminAuditLog::count(),
                'today' => SuperAdminAuditLog::where('created_at', '>=', $today)->count(),
                'this_week' => SuperAdminAuditLog::where('created_at', '>=', $thisWeek)->count(),
                'this_month' => SuperAdminAuditLog::where('created_at', '>=', $thisMonth)->count(),
                'by_action' => [
                    'create' => SuperAdminAuditLog::where('action', 'create')->count(),
                    'update' => SuperAdminAuditLog::where('action', 'update')->count(),
                    'delete' => SuperAdminAuditLog::where('action', 'delete')->count(),
                ],
                'by_entity' => SuperAdminAuditLog::selectRaw('entity_type, count(*) as count')
                    ->groupBy('entity_type')
                    ->pluck('count', 'entity_type'),
            ],
        ]);
    }
}
