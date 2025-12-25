<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NivelSeguridad extends Model
{
    use HasFactory;

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

    public function personal(): HasMany
    {
        return $this->hasMany(Persona::class, 'nivel_seguridad_id');
    }

    public function componentes(): HasMany
    {
        return $this->hasMany(ComponenteSeguridad::class, 'nivel_seguridad_id');
    }

    /**
     * Scope para obtener solo niveles activos
     */
    public function scopeActivos($query)
    {
        return $query->where('is_active', true);
    }
}
