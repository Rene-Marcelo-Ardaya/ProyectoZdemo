<?php

namespace App\Traits;

use App\Models\Tenant;
use App\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Trait BelongsToTenant
 * 
 * Aplica este trait a cualquier modelo que deba estar aislado por tenant.
 * Automáticamente:
 * - Aplica el TenantScope para filtrar consultas
 * - Asigna el tenant_id al crear nuevos registros
 * - Proporciona la relación tenant()
 */
trait BelongsToTenant
{
    /**
     * Boot del trait
     */
    public static function bootBelongsToTenant(): void
    {
        // Aplicar scope global para filtrar por tenant
        static::addGlobalScope(new TenantScope);

        // Al crear un registro, asignar automáticamente el tenant_id
        static::creating(function ($model) {
            if (!$model->tenant_id && app()->bound('currentTenant')) {
                $currentTenant = app('currentTenant');
                if ($currentTenant) {
                    $model->tenant_id = $currentTenant->id;
                }
            }
        });
    }

    /**
     * Relación con el tenant
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Desactivar temporalmente el scope de tenant
     * Útil para consultas de super-admin
     */
    public static function withoutTenantScope()
    {
        return static::withoutGlobalScope(TenantScope::class);
    }
}
