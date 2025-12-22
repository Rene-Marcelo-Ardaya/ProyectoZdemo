<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cargo extends Model
{
    use HasFactory;

    protected $table = 'cargos';

    protected $fillable = ['nombre', 'descripcion', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Relación: Un cargo tiene muchos empleados
     */
    public function personal(): HasMany
    {
        return $this->hasMany(Personal::class);
    }
}
