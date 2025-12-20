<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Persona extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'personal';

    protected $fillable = [
        // Datos personales
        'nombre',
        'apellidos',
        'ci',
        'fecha_nacimiento',
        'genero',
        
        // Contacto
        'codigo_pais',
        'celular',
        'email_personal',
        'direccion',
        'ciudad',
        
        // Estado
        'is_active',
        'notas',
    ];

    protected $casts = [
        'fecha_nacimiento' => 'date',
        'is_active' => 'boolean',
    ];

    /**
     * Usuarios asociados a esta persona
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'personal_user', 'personal_id', 'user_id')
            ->withTimestamps();
    }

    /**
     * Nombre completo
     */
    public function getNombreCompletoAttribute(): string
    {
        return "{$this->nombre} {$this->apellidos}";
    }

    /**
     * Celular con código de país
     */
    public function getCelularCompletoAttribute(): ?string
    {
        if (!$this->celular) return null;
        return "+{$this->codigo_pais}{$this->celular}";
    }

    /**
     * Edad calculada
     */
    public function getEdadAttribute(): ?int
    {
        if (!$this->fecha_nacimiento) return null;
        return $this->fecha_nacimiento->age;
    }
}
