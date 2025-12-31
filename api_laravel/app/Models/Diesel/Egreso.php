<?php

namespace App\Models\Diesel;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Personal;

class Egreso extends Model
{
    protected $table = 'd_egresos';

    public $timestamps = false;

    protected $fillable = [
        'fecha',
        'd_tanque_id',
        'd_maquina_id',
        'd_trabajo_id',
        'personal_entrega_id',
        'personal_recibe_id',
        'pin_entrega_validado',
        'pin_recibo_validado',
        'inicio_tanque_sistema',
        'inicio_tanque',
        'fin_tanque',
        'litros',
        'observaciones',
        'estado',
        'user_id'
    ];

    protected $casts = [
        'fecha' => 'date',
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

    public function scopeActivos($query)
    {
        return $query->where('estado', 'ACTIVO');
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

    public function scopePorTanque($query, $tanqueId)
    {
        return $query->where('d_tanque_id', $tanqueId);
    }

    public function scopePorMaquina($query, $maquinaId)
    {
        return $query->where('d_maquina_id', $maquinaId);
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

    public function movimiento()
    {
        return $this->hasOne(Movimiento::class, 'id_origen')
            ->whereHas('tipoMovimiento', function ($q) {
                $q->where('nombre', 'EGRESO');
            });
    }

    public function bitacora()
    {
        return $this->hasMany(BitacoraEgreso::class, 'd_egreso_id');
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // =============================================
    // MÉTODOS ESTÁTICOS
    // =============================================

    /**
     * Validar PIN de un personal
     * @param int $personalId ID del personal
     * @param string $pin PIN ingresado
     * @return bool
     */
    public static function validarPin($personalId, $pin)
    {
        $personal = Personal::find($personalId);
        
        if (!$personal || !$personal->pin) {
            return false;
        }

        return Hash::check($pin, $personal->pin);
    }

    /**
     * Crear egreso con validaciones
     * @param array $data Datos del egreso
     * @param int $userId Usuario que crea
     * @param string|null $ip IP del cliente
     * @return Egreso
     * @throws \Exception
     */
    public static function crearEgreso(array $data, $userId, $ip = null)
    {
        // Obtener tanque y validar stock
        $tanque = Tanque::find($data['d_tanque_id']);
        
        if (!$tanque) {
            throw new \Exception('Tanque no encontrado');
        }

        if (!$tanque->is_active) {
            throw new \Exception('El tanque no está activo');
        }

        // Guardar stock del sistema antes de modificar
        $stockSistema = $tanque->stock_actual;

        // Calcular litros: inicio - fin
        $litros = $data['inicio_tanque'] - $data['fin_tanque'];

        if ($litros <= 0) {
            throw new \Exception('Los litros calculados deben ser mayores a 0 (inicio debe ser mayor que fin)');
        }

        // Validar que haya suficiente stock
        if ($litros > $tanque->stock_actual) {
            throw new \Exception("Stock insuficiente en el tanque. Disponible: {$tanque->stock_actual} L, Solicitado: {$litros} L");
        }

        // Validar PINs
        if (!self::validarPin($data['personal_entrega_id'], $data['pin_entrega'])) {
            throw new \Exception('PIN de entrega inválido');
        }

        if (!self::validarPin($data['personal_recibe_id'], $data['pin_recibo'])) {
            throw new \Exception('PIN de recibo inválido');
        }

        // Crear el egreso
        $egreso = self::create([
            'fecha' => $data['fecha'] ?? now()->toDateString(),
            'd_tanque_id' => $data['d_tanque_id'],
            'd_maquina_id' => $data['d_maquina_id'],
            'd_trabajo_id' => $data['d_trabajo_id'],
            'personal_entrega_id' => $data['personal_entrega_id'],
            'personal_recibe_id' => $data['personal_recibe_id'],
            'pin_entrega_validado' => true,
            'pin_recibo_validado' => true,
            'inicio_tanque_sistema' => $stockSistema,
            'inicio_tanque' => $data['inicio_tanque'],
            'fin_tanque' => $data['fin_tanque'],
            'litros' => $litros,
            'observaciones' => $data['observaciones'] ?? null,
            'estado' => 'ACTIVO',
            'user_id' => $userId
        ]);

        // Descontar stock del tanque
        $tanque->stock_actual -= $litros;
        $tanque->save();

        // Crear movimiento
        $tipoEgreso = TipoMovimiento::where('nombre', 'EGRESO')->first();
        
        if ($tipoEgreso) {
            Movimiento::create([
                'd_tipo_movimiento_id' => $tipoEgreso->id,
                'id_origen' => $egreso->id,
                'fecha' => $egreso->fecha,
                'd_tanque_id' => $tanque->id,
                'litros' => $litros,
                'stock_antes' => $stockSistema,
                'stock_despues' => $tanque->stock_actual,
                'estado' => 'ACTIVO',
                'user_id' => $userId
            ]);
        }

        // Registrar en bitácora
        BitacoraEgreso::create([
            'd_egreso_id' => $egreso->id,
            'accion' => 'CREADO',
            'user_id' => $userId,
            'ip' => $ip
        ]);

        return $egreso;
    }

    // =============================================
    // MÉTODOS DE INSTANCIA
    // =============================================

    /**
     * Anular el egreso (devuelve stock al tanque)
     * @param int $userId Usuario que anula
     * @param string|null $ip IP del cliente
     * @return bool
     * @throws \Exception
     */
    public function anular($userId, $ip = null)
    {
        if ($this->estado === 'ANULADO') {
            throw new \Exception('Este egreso ya está anulado');
        }

        // Devolver stock al tanque
        $tanque = $this->tanque;
        
        if (!$tanque) {
            throw new \Exception('Tanque no encontrado');
        }

        // Validar que no exceda capacidad al devolver
        if (($tanque->stock_actual + $this->litros) > $tanque->capacidad_maxima) {
            throw new \Exception("No se puede anular: el tanque excedería su capacidad máxima");
        }

        $tanque->stock_actual += $this->litros;
        $tanque->save();

        // Anular movimiento relacionado
        Movimiento::where('id_origen', $this->id)
            ->whereHas('tipoMovimiento', function ($q) {
                $q->where('nombre', 'EGRESO');
            })
            ->update(['estado' => 'ANULADO']);

        // Anular egreso
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

    /**
     * Obtener diferencia entre stock sistema y lectura real
     * @return float
     */
    public function getDiferenciaStockAttribute()
    {
        return $this->inicio_tanque_sistema - $this->inicio_tanque;
    }
}
