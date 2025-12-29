<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ingreso extends Model
{
    protected $table = 'ingresos';

    protected $fillable = [
        'fecha',
        'proveedor',
        'nro_factura',
        'chofer_externo',
        'usuario_registro_id',
        'estado'
    ];

    protected $casts = [
        'fecha' => 'datetime'
    ];

    // Relaciones
    public function detalles()
    {
        return $this->hasMany(DetalleIngreso::class, 'ingreso_id');
    }

    public function usuarioRegistro()
    {
        return $this->belongsTo(User::class, 'usuario_registro_id');
    }

    public function bitacoras()
    {
        return $this->hasMany(BitacoraFormulario::class, 'formulario_id')
                    ->where('tipo_formulario', 'INGRESO');
    }

    // Scopes
    public function scopeValido($query)
    {
        return $query->where('estado', 'VALIDO');
    }

    public function scopeAnulado($query)
    {
        return $query->where('estado', 'ANULADO');
    }

    public function scopeByFecha($query, $desde, $hasta)
    {
        if ($desde) {
            $query->whereDate('fecha', '>=', $desde);
        }
        if ($hasta) {
            $query->whereDate('fecha', '<=', $hasta);
        }
        return $query;
    }

    // Métodos
    public function getTotalLitrosAttribute()
    {
        return $this->detalles()->sum('litros');
    }

    public function getTotalMontoAttribute()
    {
        return $this->detalles()->selectRaw('SUM(litros * precio_unitario) as total')->value('total') ?? 0;
    }
}
