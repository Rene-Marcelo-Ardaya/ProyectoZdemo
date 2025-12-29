<?php

namespace App\Models\Diesel;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Tanque extends Model
{
    use HasFactory;

    protected $table = 'd_tanques';

    protected $fillable = [
        'nombre',
        'tipo',
        'd_ubicacion_fisica_id',
        'capacidad_maxima',
        'stock_actual',
        'is_active'
    ];

    protected $casts = [
        'capacidad_maxima' => 'decimal:2',
        'stock_actual' => 'decimal:2',
        'is_active' => 'boolean'
    ];

    // =============================================
    // CONSTANTES
    // =============================================

    const TIPO_FIJO = 'FIJO';
    const TIPO_MOVIL = 'MOVIL';

    // =============================================
    // RELACIONES
    // =============================================

    public function ubicacion(): BelongsTo
    {
        return $this->belongsTo(UbicacionFisica::class, 'd_ubicacion_fisica_id');
    }

    // =============================================
    // SCOPES
    // =============================================

    public function scopeActivos($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeInactivos($query)
    {
        return $query->where('is_active', false);
    }

    public function scopeOrdenado($query)
    {
        return $query->orderBy('nombre');
    }

    public function scopeFijos($query)
    {
        return $query->where('tipo', self::TIPO_FIJO);
    }

    public function scopeMoviles($query)
    {
        return $query->where('tipo', self::TIPO_MOVIL);
    }

    public function scopeConUbicacion($query)
    {
        return $query->with('ubicacion');
    }

    // =============================================
    // MÉTODOS ESTÁTICOS PARA COMBOS
    // =============================================

    /**
     * Combo de tanques (filtrable por ubicación)
     */
    public static function comboTanque($ubicacionId = null)
    {
        $query = self::activos()->ordenado();

        if ($ubicacionId) {
            $query->where('d_ubicacion_fisica_id', $ubicacionId);
        }

        return $query->get(['id', 'nombre', 'tipo', 'd_ubicacion_fisica_id', 'stock_actual', 'capacidad_maxima']);
    }

    // =============================================
    // MÉTODOS DE LÓGICA
    // =============================================

    public function toggleActivo(): bool
    {
        $this->is_active = !$this->is_active;
        return $this->save();
    }

    /**
     * Verificar si tiene stock suficiente
     */
    public function tieneStock(float $cantidad): bool
    {
        return $this->stock_actual >= $cantidad;
    }

    /**
     * Agregar stock (ingreso)
     */
    public function agregarStock(float $cantidad): bool
    {
        $nuevoStock = $this->stock_actual + $cantidad;

        if ($nuevoStock > $this->capacidad_maxima) {
            return false;
        }

        $this->stock_actual = $nuevoStock;
        return $this->save();
    }

    /**
     * Descontar stock (egreso)
     */
    public function descontarStock(float $cantidad): bool
    {
        if (!$this->tieneStock($cantidad)) {
            return false;
        }

        $this->stock_actual -= $cantidad;
        return $this->save();
    }

    /**
     * Porcentaje de llenado
     */
    public function getPorcentajeLlenadoAttribute(): float
    {
        if ($this->capacidad_maxima <= 0) return 0;
        return round(($this->stock_actual / $this->capacidad_maxima) * 100, 2);
    }
}
