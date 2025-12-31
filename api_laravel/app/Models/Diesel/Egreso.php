<?php

namespace App\Models\Diesel;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Personal;

class Egreso extends Model
{
    protected $table = 'd_egresos';

    protected $fillable = [
        'fecha',
        'd_tanque_id',
        'tipo',
        'd_maquina_id',
        'd_trabajo_id',
        'horometro',
        'personal_entrega_id',
        'personal_recibe_id',
        'pin_entrega_validado',
        'pin_recibo_validado',
        'inicio_tanque_sistema',
        'inicio_tanque',
        'fin_tanque',
        'litros',
        'nombre_chofer',
        'carnet_chofer',
        'placa_vehiculo',
        'foto',
        'observaciones',
        'estado',
        'user_id'
    ];

    protected $casts = [
        'fecha' => 'date',
        'horometro' => 'decimal:2',
        'inicio_tanque_sistema' => 'decimal:2',
        'inicio_tanque' => 'decimal:2',
        'fin_tanque' => 'decimal:2',
        'litros' => 'decimal:2',
        'pin_entrega_validado' => 'boolean',
        'pin_recibo_validado' => 'boolean'
    ];

    // =============================================
    // SCOPES
    // =============================================

    public function scopePendientes($query)
    {
        return $query->where('estado', 'PENDIENTE');
    }

    public function scopeCompletados($query)
    {
        return $query->where('estado', 'COMPLETADO');
    }

    public function scopeAnulados($query)
    {
        return $query->where('estado', 'ANULADO');
    }

    public function scopeRecientes($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    public function scopePorFecha($query, $fechaInicio, $fechaFin = null)
    {
        if ($fechaFin) {
            return $query->whereBetween('fecha', [$fechaInicio, $fechaFin]);
        }
        return $query->whereDate('fecha', $fechaInicio);
    }

    public function scopePorTipo($query, $tipo)
    {
        return $query->where('tipo', $tipo);
    }

    public function scopeInternos($query)
    {
        return $query->where('tipo', 'INTERNO');
    }

    public function scopeExternos($query)
    {
        return $query->where('tipo', 'EXTERNO');
    }

    // =============================================
    // RELACIONES
    // =============================================

    public function tanque()
    {
        return $this->belongsTo(Tanque::class, 'd_tanque_id');
    }

    public function maquina()
    {
        return $this->belongsTo(Maquina::class, 'd_maquina_id');
    }

    public function trabajo()
    {
        return $this->belongsTo(Trabajo::class, 'd_trabajo_id');
    }

    public function personalEntrega()
    {
        return $this->belongsTo(Personal::class, 'personal_entrega_id');
    }

    public function personalRecibe()
    {
        return $this->belongsTo(Personal::class, 'personal_recibe_id');
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function bitacora()
    {
        return $this->hasMany(BitacoraEgreso::class, 'd_egreso_id');
    }

    // =============================================
    // ACCESSORS
    // =============================================

    /**
     * Calcula los litros basándose en las lecturas del tanque
     */
    public function getLitrosCalculadosAttribute()
    {
        if ($this->inicio_tanque && $this->fin_tanque) {
            return $this->inicio_tanque - $this->fin_tanque;
        }
        return null;
    }

    // =============================================
    // MÉTODOS
    // =============================================

    /**
     * Completar el egreso y actualizar stock
     */
    public function completar($litros, $finTanque, $horometro = null, $userId = null, $ip = null)
    {
        if ($this->estado !== 'PENDIENTE') {
            return false;
        }

        $this->fin_tanque = $finTanque;
        $this->litros = $litros;
        $this->estado = 'COMPLETADO';
        $this->save();

        // Actualizar stock del tanque
        $tanque = $this->tanque;
        $tanque->stock_actual -= $litros;
        $tanque->save();

        // Si es INTERNO, actualizar horómetro de la máquina
        if ($this->tipo === 'INTERNO' && $horometro && $this->maquina) {
            $this->maquina->horometro_actual = $horometro;
            $this->maquina->save();
        }

        // Registrar en bitácora
        BitacoraEgreso::create([
            'd_egreso_id' => $this->id,
            'accion' => 'COMPLETADO',
            'user_id' => $userId ?? $this->user_id,
            'ip' => $ip
        ]);

        return true;
    }

    /**
     * Anular el egreso y revertir stock
     */
    public function anular($userId, $ip = null)
    {
        if ($this->estado === 'ANULADO') {
            return false;
        }

        // Si estaba COMPLETADO, revertir el stock
        if ($this->estado === 'COMPLETADO' && $this->litros) {
            $tanque = $this->tanque;
            $tanque->stock_actual += $this->litros;
            $tanque->save();
        }

        $this->estado = 'ANULADO';
        $this->save();

        // Registrar en bitácora
        BitacoraEgreso::create([
            'd_egreso_id' => $this->id,
            'accion' => 'ANULADO',
            'user_id' => $userId,
            'ip' => $ip
        ]);

        return true;
    }
}
