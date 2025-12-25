<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Persona extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'personal';

    protected $fillable = [
        // Identificación
        'codigo_empleado',
        
        // Datos personales
        'nombre',
        'apellido_paterno',
        'apellido_materno',
        'ci',
        'fecha_nacimiento',
        'genero',
        
        // Contacto
        'codigo_pais',
        'celular',
        'email_personal',
        'direccion',
        'ciudad',
        
        // Datos laborales
        'cargo_id',
        'nivel_seguridad_id',
        'fecha_ingreso',
        'fecha_salida',
        'salario',
        'tipo_contrato',
        'estado_laboral',
        
        // Estado
        'is_active',
        'notas',
    ];

    protected $casts = [
        'fecha_nacimiento' => 'date',
        'fecha_ingreso' => 'date',
        'fecha_salida' => 'date',
        'salario' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Cargo del empleado
     */
    public function cargo(): BelongsTo
    {
        return $this->belongsTo(Cargo::class);
    }

    /**
     * Nivel de seguridad del empleado
     */
    public function nivelSeguridad(): BelongsTo
    {
        return $this->belongsTo(NivelSeguridad::class, 'nivel_seguridad_id');
    }

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
        $apellidos = trim("{$this->apellido_paterno} {$this->apellido_materno}");
        return "{$this->nombre} {$apellidos}";
    }

    /**
     * Apellidos completos
     */
    public function getApellidosAttribute(): string
    {
        return trim("{$this->apellido_paterno} {$this->apellido_materno}");
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

    /**
     * Antigüedad en años
     */
    public function getAntiguedadAttribute(): ?int
    {
        if (!$this->fecha_ingreso) return null;
        return $this->fecha_ingreso->diffInYears(now());
    }

    /**
     * Relación WhatsApp verification
     */
    public function whatsapp(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(PersonaWhatsapp::class, 'personal_id');
    }
}

