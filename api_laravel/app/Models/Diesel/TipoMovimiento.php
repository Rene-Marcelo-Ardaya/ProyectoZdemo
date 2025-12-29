<?php

namespace App\Models\Diesel;

use Illuminate\Database\Eloquent\Model;

class TipoMovimiento extends Model
{
    protected $table = 'd_tipo_movimientos';

    protected $fillable = [
        'nombre',
        'descripcion',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

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
        return $query->orderBy('nombre', 'asc');
    }

    // =============================================
    // RELACIONES
    // =============================================

    public function movimientos()
    {
        return $this->hasMany(Movimiento::class, 'd_tipo_movimiento_id');
    }

    // =============================================
    // MÉTODOS
    // =============================================

    public static function comboTipoMovimiento()
    {
        return self::activos()
            ->ordenado()
            ->get(['id', 'nombre']);
    }

    public function toggleActivo()
    {
        $this->is_active = !$this->is_active;
        $this->save();
        return $this;
    }
}
