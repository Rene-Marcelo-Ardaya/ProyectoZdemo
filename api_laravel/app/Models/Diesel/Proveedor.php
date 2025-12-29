<?php

namespace App\Models\Diesel;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Proveedor extends Model
{
    use HasFactory;

    protected $table = 'd_proveedores';

    protected $fillable = [
        'nombre',
        'razon_social',
        'nit',
        'telefono',
        'celular',
        'direccion',
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
        return $query->orderBy('nombre');
    }

    // =============================================
    // MÉTODOS ESTÁTICOS PARA COMBOS
    // =============================================

    public static function comboProveedor()
    {
        return self::activos()
            ->ordenado()
            ->get(['id', 'nombre', 'nit']);
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
