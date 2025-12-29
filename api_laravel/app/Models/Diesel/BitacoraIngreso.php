<?php

namespace App\Models\Diesel;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class BitacoraIngreso extends Model
{
    protected $table = 'd_bitacora_ingresos';

    public $timestamps = false;

    protected $fillable = [
        'd_ingreso_id',
        'accion',
        'user_id',
        'ip'
    ];

    // =============================================
    // RELACIONES
    // =============================================

    public function ingreso()
    {
        return $this->belongsTo(Ingreso::class, 'd_ingreso_id');
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
