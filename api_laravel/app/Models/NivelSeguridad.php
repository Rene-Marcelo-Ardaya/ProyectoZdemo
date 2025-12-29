<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NivelSeguridad extends Model
{
    public $timestamps = false;
    protected $table = 'niveles_seguridad';

    protected $fillable = [
        'nombre',
        'nivel'
    ];

    protected $casts = [
        'nivel' => 'integer'
    ];

    // Relaciones
    public function personalPinAccesos()
    {
        return $this->hasMany(PersonalPinAcceso::class, 'nivel_seguridad_id');
    }
}
