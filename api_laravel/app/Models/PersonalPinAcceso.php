<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PersonalPinAcceso extends Model
{
    public $timestamps = false;
    protected $table = 'personal_pin_acceso';

    protected $fillable = [
        'personal_id',
        'ubicacion_pin_id',
        'nivel_seguridad_id',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    // Relaciones
    public function personal()
    {
        return $this->belongsTo(Personal::class, 'personal_id');
    }

    public function ubicacionPin()
    {
        return $this->belongsTo(UbicacionPin::class, 'ubicacion_pin_id');
    }

    public function nivelSeguridad()
    {
        return $this->belongsTo(NivelSeguridad::class, 'nivel_seguridad_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
