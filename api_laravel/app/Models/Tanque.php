<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tanque extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'tanques';

    protected $fillable = [
        'nombre',
        'codigo',
        'tipo',
        'capacidad_litros',
        'nivel_actual',
        'nivel_minimo_alerta',
        'ubicacion_fija',
        'placa_cisterna',
        'responsable_id',
        'is_active',
        'observaciones',
    ];

    protected $casts = [
        'capacidad_litros' => 'decimal:2',
        'nivel_actual' => 'decimal:2',
        'nivel_minimo_alerta' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Constantes para tipos de tanque
     */
    const TIPO_ESTATICO = 'ESTATICO';
    const TIPO_MOVIL = 'MOVIL';

    /**
     * Responsable del tanque (para móviles)
     */
    public function responsable(): BelongsTo
    {
        return $this->belongsTo(Persona::class, 'responsable_id');
    }

    /**
     * Configuraciones de alerta asociadas a este tanque
     */
    public function alertConfigurations(): BelongsToMany
    {
        return $this->belongsToMany(AlertConfiguration::class, 'tanque_alert_config')
            ->withPivot('last_alert_at');
    }

    /**
     * Despachos realizados desde este tanque
     */
    public function despachos(): HasMany
    {
        return $this->hasMany(Despacho::class, 'tanque_id');
    }

    /**
     * Recargas recibidas en este tanque
     */
    public function recargas(): HasMany
    {
        return $this->hasMany(RecargaTanque::class, 'tanque_id');
    }

    /**
     * Transferencias donde este tanque es origen
     */
    public function transferenciasOrigen(): HasMany
    {
        return $this->hasMany(Transferencia::class, 'tanque_origen_id');
    }

    /**
     * Transferencias donde este tanque es destino
     */
    public function transferenciasDestino(): HasMany
    {
        return $this->hasMany(Transferencia::class, 'tanque_destino_id');
    }

    /**
     * Porcentaje de nivel actual
     */
    public function getNivelPorcentajeAttribute(): float
    {
        if ($this->capacidad_litros <= 0) return 0;
        return round(($this->nivel_actual / $this->capacidad_litros) * 100, 2);
    }

    /**
     * Litros disponibles
     */
    public function getLitrosDisponiblesAttribute(): float
    {
        return $this->nivel_actual;
    }

    /**
     * Verifica si el nivel está por debajo del mínimo
     */
    public function getNivelBajoAttribute(): bool
    {
        return $this->nivel_actual <= $this->nivel_minimo_alerta;
    }

    /**
     * Verifica si es un tanque estático
     */
    public function getEsEstaticoAttribute(): bool
    {
        return $this->tipo === self::TIPO_ESTATICO;
    }

    /**
     * Verifica si es un tanque móvil
     */
    public function getEsMovilAttribute(): bool
    {
        return $this->tipo === self::TIPO_MOVIL;
    }

    /**
     * Descripción del tipo
     */
    public function getTipoDescripcionAttribute(): string
    {
        return $this->tipo === self::TIPO_ESTATICO ? 'Estático' : 'Móvil';
    }

    /**
     * Scope para tanques activos
     */
    public function scopeActivos($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope para tanques estáticos
     */
    public function scopeEstaticos($query)
    {
        return $query->where('tipo', self::TIPO_ESTATICO);
    }

    /**
     * Scope para tanques móviles
     */
    public function scopeMoviles($query)
    {
        return $query->where('tipo', self::TIPO_MOVIL);
    }

    /**
     * Scope para tanques con nivel bajo
     */
    public function scopeConNivelBajo($query)
    {
        return $query->whereColumn('nivel_actual', '<=', 'nivel_minimo_alerta');
    }
}
