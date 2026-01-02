<?php

namespace App\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

/**
 * TenantScope - Filtra automáticamente las consultas por tenant_id
 * 
 * Este scope se aplica a todos los modelos que usan el trait BelongsToTenant.
 * Asegura que cada tenant solo vea sus propios datos.
 */
class TenantScope implements Scope
{
    /**
     * Aplicar el scope a las consultas del modelo
     */
    public function apply(Builder $builder, Model $model): void
    {
        // Obtener el tenant actual del contenedor de servicios
        $currentTenant = app()->bound('currentTenant') ? app('currentTenant') : null;

        // Si hay un tenant actual, filtrar por su ID
        if ($currentTenant) {
            $builder->where($model->getTable() . '.tenant_id', $currentTenant->id);
        }
    }
}
