<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NivelSeguridad extends Model
{
    protected $table = 'niveles_seguridad';

    protected $fillable = [
        'nombre',
        'color',
        'descripcion',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Relación con empleados
    public function personal(): HasMany
    {
        return $this->hasMany(Personal::class, 'nivel_seguridad_id');
    }

    // Relación con componentes protegidos
    public function componentes(): HasMany
    {
        return $this->hasMany(ComponenteSeguridad::class, 'nivel_seguridad_id');
    }

    // Scope para obtener solo niveles activos
    public function scopeActivos($query)
    {
        return $query->where('is_active', true);
    }
}
