<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Personal extends Model
{
    use HasFactory;

    protected $table = 'personal';

    protected $fillable = [
        'nombre',
        'apellido_paterno',
        'apellido_materno',
        'ci',
        'pin',
        'fecha_nacimiento',
        'genero',
        'direccion',
        'telefono',
        'email',
        'cargo_id',
        'nivel_seguridad_id',
        'fecha_ingreso',
        'fecha_salida',
        'salario',
        'tipo_contrato',
        'estado',
        'observaciones',
        'user_id',
    ];

    protected $hidden = ['pin'];

    protected $casts = [
        'fecha_nacimiento' => 'date',
        'fecha_ingreso' => 'date',
        'fecha_salida' => 'date',
        'salario' => 'decimal:2',
    ];

    /**
     * Relación: El empleado pertenece a un cargo
     */
    public function cargo(): BelongsTo
    {
        return $this->belongsTo(Cargo::class);
    }

    /**
     * Relación 1:1: El empleado puede tener un usuario asociado
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Nombre completo del empleado
     */
    public function getNombreCompletoAttribute(): string
    {
        return trim("{$this->nombre} {$this->apellido_paterno} {$this->apellido_materno}");
    }

    /**
     * Permisos de PIN en ubicaciones diesel
     */
    public function dieselPinPermissions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(DieselPinPermission::class, 'personal_id');
    }

    /**
     * Movimientos autorizados por este personal (con PIN)
     */
    public function dieselMovementsAuthorized(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(DieselMovement::class, 'authorized_by_pin_id');
    }

    /**
     * Movimientos como chofer
     */
    public function dieselMovementsAsDriver(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(DieselMovement::class, 'driver_id');
    }

    /**
     * Movimientos como receptor
     */
    public function dieselMovementsAsReceiver(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(DieselMovement::class, 'receiver_id');
    }
}
