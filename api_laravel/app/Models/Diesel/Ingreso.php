<?php

namespace App\Models\Diesel;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Ingreso extends Model
{
    protected $table = 'd_ingresos';

    public $timestamps = false;

    protected $fillable = [
        'fecha',
        'd_proveedor_id',
        'd_tipo_pago_id',
        'numero_factura',
        'numero_factura_dia',
        'nombre_chofer',
        'placa_vehiculo',
        'total_litros',
        'precio_unitario',
        'total',
        'observaciones',
        'estado',
        'user_id'
    ];

    protected $casts = [
        'fecha' => 'date',
        'total_litros' => 'decimal:2',
        'precio_unitario' => 'decimal:4',
        'total' => 'decimal:2'
    ];

    // =============================================
    // SCOPES
    // =============================================

    public function scopePendientes($query)
    {
        return $query->where('estado', 'PENDIENTE');
    }

    public function scopeFinalizados($query)
    {
        return $query->where('estado', 'FINALIZADO');
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

    // =============================================
    // RELACIONES
    // =============================================

    public function proveedor()
    {
        return $this->belongsTo(Proveedor::class, 'd_proveedor_id');
    }

    public function tipoPago()
    {
        return $this->belongsTo(TipoPago::class, 'd_tipo_pago_id');
    }

    public function detalles()
    {
        return $this->hasMany(IngresoDetalle::class, 'd_ingreso_id');
    }

    public function movimientos()
    {
        return $this->hasMany(Movimiento::class, 'id_origen')
            ->where('d_tipo_movimiento_id', function ($query) {
                $query->select('id')
                    ->from('d_tipo_movimientos')
                    ->where('nombre', 'INGRESO')
                    ->limit(1);
            });
    }

    public function bitacora()
    {
        return $this->hasMany(BitacoraIngreso::class, 'd_ingreso_id');
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // =============================================
    // MÉTODOS
    // =============================================

    public function anular($userId, $ip = null)
    {
        if ($this->estado === 'ANULADO') {
            return false;
        }

        // Anular el ingreso
        $this->estado = 'ANULADO';
        $this->save();

        // Registrar en bitácora
        BitacoraIngreso::create([
            'd_ingreso_id' => $this->id,
            'accion' => 'ANULADO',
            'user_id' => $userId,
            'ip' => $ip
        ]);

        // Revertir stock en tanques
        foreach ($this->detalles as $detalle) {
            $tanque = $detalle->tanque;
            $tanque->stock_actual -= $detalle->litros;
            $tanque->save();
        }

        // Anular movimientos relacionados
        Movimiento::where('id_origen', $this->id)
            ->whereHas('tipoMovimiento', function ($q) {
                $q->where('nombre', 'INGRESO');
            })
            ->update(['estado' => 'ANULADO']);

        return true;
    }

    public function calcularTotales()
    {
        $this->total_litros = $this->detalles()->sum('litros');
        $this->total = $this->total_litros * $this->precio_unitario;
        $this->save();
    }
}
