<?php

namespace App\Models\Diesel;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class BitacoraEgreso extends Model
{
    protected $table = 'd_bitacora_egresos';

    public $timestamps = false;

    protected $fillable = [
        'd_egreso_id',
        'accion',
        'user_id',
        'ip'
    ];

    // =============================================
    // RELACIONES
    // =============================================

    public function egreso()
    {
        return $this->belongsTo(Egreso::class, 'd_egreso_id');
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
