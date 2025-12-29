<?php

namespace App\Models\Diesel;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Trabajo extends Model
{
    use HasFactory;

    protected $table = 'd_trabajos';

    protected $fillable = [
        'nombre',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    // =============================================
    // SCOPES
    // =============================================

    /**
     * Solo activos
     */
    public function scopeActivos($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Solo inactivos
     */
    public function scopeInactivos($query)
    {
        return $query->where('is_active', false);
    }

    /**
     * Ordenar por nombre
     */
    public function scopeOrdenado($query)
    {
        return $query->orderBy('nombre');
    }

    // =============================================
    // MÉTODOS ESTÁTICOS PARA COMBOS
    // =============================================

    /**
     * Lista para combo (solo activos, ordenados)
     */
    public static function comboTrabajo()
    {
        return self::activos()
            ->ordenado()
            ->get(['id', 'nombre']);
    }

    // =============================================
    // MÉTODOS DE LÓGICA
    // =============================================

    /**
     * Activar/Desactivar registro
     */
    public function toggleActivo(): bool
    {
        $this->is_active = !$this->is_active;
        return $this->save();
    }
}
