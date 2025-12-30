<?php

namespace App\Http\Controllers;

use App\Models\Diesel\Ingreso;
use App\Models\Diesel\IngresoDetalle;
use App\Models\Diesel\Movimiento;
use App\Models\Diesel\BitacoraIngreso;
use App\Models\Diesel\Tanque;
use App\Models\Diesel\TipoMovimiento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class DieselIngresoController extends Controller
{
    /**
     * Listar ingresos
     */
    public function index(Request $request)
    {
        $query = Ingreso::with(['proveedor', 'tipoPago', 'usuario', 'detalles.tanque'])
            ->recientes();

        // Filtro por estado
        if ($request->has('estado') && $request->estado) {
            $query->where('estado', $request->estado);
        }

        // Filtro por proveedor
        if ($request->has('d_proveedor_id') && $request->d_proveedor_id) {
            $query->where('d_proveedor_id', $request->d_proveedor_id);
        }

        // Filtro por tipo de pago
        if ($request->has('d_tipo_pago_id') && $request->d_tipo_pago_id) {
            $query->where('d_tipo_pago_id', $request->d_tipo_pago_id);
        }

        // Filtro por tanque (busca en detalles)
        if ($request->has('d_tanque_id') && $request->d_tanque_id) {
            $query->whereHas('detalles', function ($q) use ($request) {
                $q->where('d_tanque_id', $request->d_tanque_id);
            });
        }

        // Filtro por rango de fechas
        if ($request->has('fecha_inicio') && $request->fecha_inicio) {
            $query->where('fecha', '>=', $request->fecha_inicio);
        }
        if ($request->has('fecha_fin') && $request->fecha_fin) {
            $query->where('fecha', '<=', $request->fecha_fin);
        }

        return response()->json([
            'success' => true,
            'data' => $query->get()
        ]);
    }

    /**
     * Obtener un ingreso con detalles
     */
    public function show($id)
    {
        $ingreso = Ingreso::with([
            'proveedor',
            'tipoPago',
            'detalles.tanque',
            'usuario',
            'bitacora.usuario'
        ])->find($id);

        if (!$ingreso) {
            return response()->json([
                'success' => false,
                'message' => 'Ingreso no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $ingreso
        ]);
    }

    /**
     * FASE 1: Dueño crea ingreso
     * - Crea cabecera d_ingresos (estado PENDIENTE)
     * - Crea detalles d_ingreso_detalles (sin inicio/final tanque)
     * - NO mueve stock
     * - NO crea movimientos
     * - Registra en bitácora
     */
    public function store(Request $request)
    {
        $request->validate([
            'fecha' => 'required|date',
            'd_proveedor_id' => 'required|exists:d_proveedores,id',
            'd_tipo_pago_id' => 'required|exists:d_tipos_pago,id',
            'precio_unitario' => 'required|numeric|min:0',
            'observaciones' => 'nullable|string',
            'detalles' => 'required|array|min:1',
            'detalles.*.d_tanque_id' => 'required|exists:d_tanques,id',
            'detalles.*.litros' => 'required|numeric|min:0.01'
        ]);

        $userId = Auth::id() ?? 1;

        DB::beginTransaction();

        try {
            // Calcular total de litros
            $totalLitros = collect($request->detalles)->sum('litros');
            $total = $totalLitros * $request->precio_unitario;

            // Calcular números de factura correlativos
            $numeroFacturaGlobal = Ingreso::max('numero_factura') + 1;
            $numeroFacturaDia = Ingreso::whereDate('fecha', $request->fecha)->max('numero_factura_dia') + 1;

            // 1. Crear cabecera (estado PENDIENTE)
            $ingreso = Ingreso::create([
                'fecha' => $request->fecha,
                'd_proveedor_id' => $request->d_proveedor_id,
                'd_tipo_pago_id' => $request->d_tipo_pago_id,
                'numero_factura' => $numeroFacturaGlobal,
                'numero_factura_dia' => $numeroFacturaDia,
                'total_litros' => $totalLitros,
                'precio_unitario' => $request->precio_unitario,
                'total' => $total,
                'observaciones' => $request->observaciones,
                'estado' => 'PENDIENTE',
                'user_id' => $userId
            ]);

            // 2. Crear detalles (sin inicio/final tanque todavía)
            foreach ($request->detalles as $detalle) {
                $tanque = Tanque::find($detalle['d_tanque_id']);
                
                // Validar que no exceda capacidad
                if (($tanque->stock_actual + $detalle['litros']) > $tanque->capacidad_maxima) {
                    throw new \Exception("El tanque {$tanque->nombre} excedería su capacidad máxima");
                }

                IngresoDetalle::create([
                    'd_ingreso_id' => $ingreso->id,
                    'd_tanque_id' => $tanque->id,
                    'litros' => $detalle['litros']
                ]);
            }

            // 3. Registrar en bitácora
            BitacoraIngreso::create([
                'd_ingreso_id' => $ingreso->id,
                'accion' => 'CREADO',
                'user_id' => $userId,
                'ip' => $request->ip()
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Ingreso creado (pendiente de recepción)',
                'data' => $ingreso->load(['proveedor', 'tipoPago', 'detalles.tanque'])
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * FASE 2: Surtidor confirma recepción
     * - Actualiza detalles con inicio_tanque y final_tanque
     * - Mueve stock de tanques
     * - Crea movimientos
     * - Cambia estado a FINALIZADO
     */
    public function recepcionar(Request $request, $id)
    {
        $ingreso = Ingreso::with('detalles')->find($id);

        if (!$ingreso) {
            return response()->json([
                'success' => false,
                'message' => 'Ingreso no encontrado'
            ], 404);
        }

        if ($ingreso->estado !== 'PENDIENTE') {
            return response()->json([
                'success' => false,
                'message' => 'Solo se pueden recepcionar ingresos PENDIENTES'
            ], 400);
        }

        $request->validate([
            'nombre_chofer' => 'nullable|string|max:150',
            'placa_vehiculo' => 'nullable|string|max:20',
            'detalles' => 'required|array|min:1',
            'detalles.*.id' => 'required|exists:d_ingreso_detalles,id',
            'detalles.*.inicio_tanque' => 'required|numeric|min:0',
            'detalles.*.final_tanque' => 'required|numeric|min:0'
        ]);

        $userId = Auth::id() ?? 1;
        $tipoIngreso = TipoMovimiento::where('nombre', 'INGRESO')->first();

        if (!$tipoIngreso) {
            return response()->json([
                'success' => false,
                'message' => 'Tipo de movimiento INGRESO no configurado'
            ], 500);
        }

        DB::beginTransaction();

        try {
            // Actualizar datos del chofer/vehículo
            $ingreso->nombre_chofer = $request->nombre_chofer;
            $ingreso->placa_vehiculo = $request->placa_vehiculo;

            // Procesar cada detalle
            foreach ($request->detalles as $detalleData) {
                $detalle = IngresoDetalle::find($detalleData['id']);
                
                if ($detalle->d_ingreso_id !== $ingreso->id) {
                    throw new \Exception('Detalle no pertenece a este ingreso');
                }

                // Validar que final >= inicio
                if ($detalleData['final_tanque'] < $detalleData['inicio_tanque']) {
                    throw new \Exception('El final del tanque debe ser mayor o igual al inicio');
                }

                // Actualizar detalle con inicio/final
                $detalle->inicio_tanque = $detalleData['inicio_tanque'];
                $detalle->final_tanque = $detalleData['final_tanque'];
                $detalle->save();

                // Obtener tanque y actualizar stock
                $tanque = Tanque::find($detalle->d_tanque_id);
                $stockAntes = $tanque->stock_actual;
                $litros = $detalle->litros;

                $tanque->stock_actual += $litros;
                $tanque->save();

                // Crear movimiento
                Movimiento::create([
                    'd_tipo_movimiento_id' => $tipoIngreso->id,
                    'id_origen' => $ingreso->id,
                    'fecha' => $ingreso->fecha,
                    'd_tanque_id' => $tanque->id,
                    'litros' => $litros,
                    'stock_antes' => $stockAntes,
                    'stock_despues' => $tanque->stock_actual,
                    'estado' => 'ACTIVO',
                    'user_id' => $userId
                ]);
            }

            // Cambiar estado a FINALIZADO
            $ingreso->estado = 'FINALIZADO';
            $ingreso->save();

            // Registrar en bitácora
            BitacoraIngreso::create([
                'd_ingreso_id' => $ingreso->id,
                'accion' => 'RECEPCIONADO',
                'user_id' => $userId,
                'ip' => $request->ip()
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Ingreso recepcionado correctamente',
                'data' => $ingreso->load(['proveedor', 'tipoPago', 'detalles.tanque'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Anular ingreso
     * Revierte el stock de los tanques y marca como ANULADO
     */
    public function anular(Request $request, $id)
    {
        $ingreso = Ingreso::with('detalles.tanque')->find($id);

        if (!$ingreso) {
            return response()->json([
                'success' => false,
                'message' => 'Ingreso no encontrado'
            ], 404);
        }

        if ($ingreso->estado === 'ANULADO') {
            return response()->json([
                'success' => false,
                'message' => 'Este ingreso ya está anulado'
            ], 400);
        }

        $userId = Auth::id() ?? 1;

        DB::beginTransaction();

        try {
            // Revertir stock de tanques
            foreach ($ingreso->detalles as $detalle) {
                $tanque = $detalle->tanque;
                $tanque->stock_actual -= $detalle->litros;

                if ($tanque->stock_actual < 0) {
                    throw new \Exception("No se puede anular: el tanque {$tanque->nombre} quedaría con stock negativo");
                }

                $tanque->save();
            }

            // Anular movimientos relacionados
            Movimiento::where('id_origen', $ingreso->id)
                ->whereHas('tipoMovimiento', function ($q) {
                    $q->where('nombre', 'INGRESO');
                })
                ->update(['estado' => 'ANULADO']);

            // Anular ingreso
            $ingreso->estado = 'ANULADO';
            $ingreso->save();

            // Registrar en bitácora
            BitacoraIngreso::create([
                'd_ingreso_id' => $ingreso->id,
                'accion' => 'ANULADO',
                'user_id' => $userId,
                'ip' => $request->ip()
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Ingreso anulado correctamente',
                'data' => $ingreso
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
