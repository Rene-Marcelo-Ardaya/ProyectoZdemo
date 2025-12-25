<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cargo extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre',
        'descripcion',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Personal con este cargo
     */
    public function personal(): HasMany
    {
        return $this->hasMany(Persona::class, 'cargo_id');
    }

    /**
     * Scope para cargos activos
     */
    public function scopeActivos($query)
    {
        return $query->where('is_active', true);
    }
}
