<?php

namespace App\Models\Diesel;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Movimiento extends Model
{
    protected $table = 'd_movimientos';

    public $timestamps = false;

    protected $fillable = [
        'd_tipo_movimiento_id',
        'id_origen',
        'fecha',
        'd_tanque_id',
        'litros',
        'stock_antes',
        'stock_despues',
        'estado',
        'user_id'
    ];

    protected $casts = [
        'fecha' => 'date',
        'litros' => 'decimal:2',
        'stock_antes' => 'decimal:2',
        'stock_despues' => 'decimal:2'
    ];

    // =============================================
    // SCOPES
    // =============================================

    public function scopeActivos($query)
    {
        return $query->where('estado', 'ACTIVO');
    }

    public function scopeAnulados($query)
    {
        return $query->where('estado', 'ANULADO');
    }

    public function scopePorTipo($query, $tipoNombre)
    {
        return $query->whereHas('tipoMovimiento', function ($q) use ($tipoNombre) {
            $q->where('nombre', $tipoNombre);
        });
    }

    public function scopePorTanque($query, $tanqueId)
    {
        return $query->where('d_tanque_id', $tanqueId);
    }

    public function scopePorFecha($query, $fechaInicio, $fechaFin = null)
    {
        if ($fechaFin) {
            return $query->whereBetween('fecha', [$fechaInicio, $fechaFin]);
        }
        return $query->whereDate('fecha', $fechaInicio);
    }

    // =============================================
    // RELACIONES
    // =============================================

    public function tipoMovimiento()
    {
        return $this->belongsTo(TipoMovimiento::class, 'd_tipo_movimiento_id');
    }

    public function tanque()
    {
        return $this->belongsTo(Tanque::class, 'd_tanque_id');
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
