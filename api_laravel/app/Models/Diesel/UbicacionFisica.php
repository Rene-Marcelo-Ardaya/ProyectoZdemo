<?php

namespace App\Models\Diesel;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UbicacionFisica extends Model
{
    use HasFactory;

    protected $table = 'd_ubicaciones_fisicas';

    protected $fillable = [
        'nombre',
        'd_division_id',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    // =============================================
    // RELACIONES
    // =============================================

    public function division(): BelongsTo
    {
        return $this->belongsTo(Division::class, 'd_division_id');
    }

    public function tanques(): HasMany
    {
        return $this->hasMany(Tanque::class, 'd_ubicacion_fisica_id');
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

    public function scopeConDivision($query)
    {
        return $query->with('division');
    }

    // =============================================
    // MÉTODOS ESTÁTICOS PARA COMBOS
    // =============================================

    public static function comboUbicacion($divisionId = null)
    {
        $query = self::activos()->ordenado();

        if ($divisionId) {
            $query->where('d_division_id', $divisionId);
        }

        return $query->get(['id', 'nombre', 'd_division_id']);
    }

    // =============================================
    // MÉTODOS DE LÓGICA
    // =============================================

    public function toggleActivo(): bool
    {
        $this->is_active = !$this->is_active;
        return $this->save();
    }
}
