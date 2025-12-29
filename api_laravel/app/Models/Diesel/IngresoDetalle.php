<?php

namespace App\Models\Diesel;

use Illuminate\Database\Eloquent\Model;

class IngresoDetalle extends Model
{
    protected $table = 'd_ingreso_detalles';

    public $timestamps = false;

    protected $fillable = [
        'd_ingreso_id',
        'd_tanque_id',
        'litros'
    ];

    protected $casts = [
        'litros' => 'decimal:2'
    ];

    // =============================================
    // RELACIONES
    // =============================================

    public function ingreso()
    {
        return $this->belongsTo(Ingreso::class, 'd_ingreso_id');
    }

    public function tanque()
    {
        return $this->belongsTo(Tanque::class, 'd_tanque_id');
    }
}
