<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * SuperAdminMiddleware
 * 
 * Protege las rutas del panel de Super Admin.
 * Solo permite acceso a usuarios que:
 * 1. Estén autenticados
 * 2. NO tengan tenant_id (usuarios globales)
 * 3. Tengan el rol 'super-admin'
 */
class SuperAdminMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // 1. Debe estar autenticado
        if (!$user) {
            return response()->json([
                'error' => 'No autenticado',
                'message' => 'Debes iniciar sesión para acceder.',
            ], 401);
        }

        // 2. Debe NO tener tenant_id (usuario global/super admin)
        if ($user->tenant_id !== null) {
            return response()->json([
                'error' => 'Acceso denegado',
                'message' => 'No tienes permisos para acceder a esta área.',
            ], 403);
        }

        // TODO: Agregar verificación de rol 'super-admin' cuando esté configurado
        // Por ahora, cualquier usuario sin tenant_id puede acceder

        // Limpiar el tenant actual para que el super admin vea todo
        app()->forgetInstance('currentTenant');

        return $next($request);
    }
}
