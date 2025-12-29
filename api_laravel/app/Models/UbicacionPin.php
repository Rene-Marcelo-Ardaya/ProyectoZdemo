<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UbicacionPin extends Model
{
    public $timestamps = false;
    protected $table = 'ubicaciones_pin';

    protected $fillable = [
        'nombre',
        'codigo'
    ];

    // Relaciones
    public function personalPinAccesos()
    {
        return $this->hasMany(PersonalPinAcceso::class, 'ubicacion_pin_id');
    }

    public function bitacoraFormularios()
    {
        return $this->hasMany(BitacoraFormulario::class, 'ubicacion_pin_id');
    }
}
