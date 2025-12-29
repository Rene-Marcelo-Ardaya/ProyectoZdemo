<?php

namespace App\Models\Diesel;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Division extends Model
{
    use HasFactory;

    protected $table = 'd_divisiones';

    protected $fillable = [
        'nombre',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    // =============================================
    // RELACIONES
    // =============================================

    public function ubicaciones(): HasMany
    {
        return $this->hasMany(UbicacionFisica::class, 'd_division_id');
    }

    public function maquinas(): HasMany
    {
        return $this->hasMany(Maquina::class, 'd_division_id');
    }

    // =============================================
    // SCOPES
    // =============================================

    public function scopeActivos($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeInactivos($query)
    {
        return $query->where('is_active', false);
    }

    public function scopeOrdenado($query)
    {
        return $query->orderBy('nombre');
    }

    // =============================================
    // MÉTODOS ESTÁTICOS PARA COMBOS
    // =============================================

    public static function comboDivision()
    {
        return self::activos()
            ->ordenado()
            ->get(['id', 'nombre']);
    }

    // =============================================
    // MÉTODOS DE LÓGICA
    // =============================================

    public function toggleActivo(): bool
    {
        $this->is_active = !$this->is_active;
        return $this->save();
    }
}
