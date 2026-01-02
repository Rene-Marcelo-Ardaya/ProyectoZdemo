<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * TenantMiddleware
 * 
 * Identifica el tenant actual basándose en:
 * 1. Dominio personalizado (custom_domain)
 * 2. Subdominio (slug)
 * 3. Header X-Tenant-ID (para desarrollo/testing)
 * 4. Usuario autenticado (su tenant_id)
 */
class TenantMiddleware
{
    /**
     * Dominios centrales (sin tenant)
     */
    private array $centralDomains = [
        'localhost',
        '127.0.0.1',
        // Agregar tu dominio principal aquí, ej: 'tuapp.com', 'www.tuapp.com'
    ];

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $tenant = $this->resolveTenant($request);

        if ($tenant) {
            // Verificar que el tenant esté activo
            if (!$tenant->is_active) {
                return response()->json([
                    'error' => 'Tenant desactivado',
                    'message' => 'Esta cuenta ha sido desactivada. Contacte soporte.',
                ], 403);
            }

            // Verificar suscripción activa (si no está en trial y no tiene suscripción)
            if (!$tenant->hasActiveSubscription()) {
                return response()->json([
                    'error' => 'Suscripción expirada',
                    'message' => 'Tu período de prueba o suscripción ha expirado.',
                ], 402); // 402 Payment Required
            }

            // Registrar el tenant en el contenedor de servicios
            app()->instance('currentTenant', $tenant);
        }

        return $next($request);
    }

    /**
     * Resolver el tenant desde la solicitud
     */
    private function resolveTenant(Request $request): ?Tenant
    {
        // 1. Intentar por header (para desarrollo/API)
        if ($tenantId = $request->header('X-Tenant-ID')) {
            return Tenant::find($tenantId);
        }

        // 2. Si el usuario está autenticado, usar su tenant
        if ($request->user() && $request->user()->tenant_id) {
            return Tenant::find($request->user()->tenant_id);
        }

        $host = $request->getHost();

        // 3. Verificar si es un dominio central (sin tenant)
        if ($this->isCentralDomain($host)) {
            return null;
        }

        // 4. Intentar por dominio personalizado
        $tenant = Tenant::where('custom_domain', $host)->first();
        if ($tenant) {
            return $tenant;
        }

        // 5. Intentar por subdominio
        $subdomain = $this->extractSubdomain($host);
        if ($subdomain) {
            return Tenant::where('slug', $subdomain)->first();
        }

        return null;
    }

    /**
     * Verificar si es un dominio central
     */
    private function isCentralDomain(string $host): bool
    {
        // Remover puerto si existe
        $host = explode(':', $host)[0];

        return in_array($host, $this->centralDomains);
    }

    /**
     * Extraer subdominio del host
     */
    private function extractSubdomain(string $host): ?string
    {
        // Remover puerto si existe
        $host = explode(':', $host)[0];

        $parts = explode('.', $host);

        // Si tiene al menos 3 partes (subdomain.domain.tld)
        if (count($parts) >= 3) {
            return $parts[0];
        }

        return null;
    }
}
