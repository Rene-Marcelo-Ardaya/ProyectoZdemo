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
     * Crear ingreso con detalles
     * Flujo:
     * 1. Crear cabecera d_ingresos
     * 2. Crear detalles d_ingreso_detalles
     * 3. Actualizar stock de tanques
     * 4. Crear registros en d_movimientos (trazabilidad)
     * 5. Crear registro en d_bitacora_ingresos
     */
    public function store(Request $request)
    {
        $request->validate([
            'fecha' => 'required|date',
            'd_proveedor_id' => 'required|exists:d_proveedores,id',
            'd_tipo_pago_id' => 'required|exists:d_tipos_pago,id',
            'nombre_chofer' => 'nullable|string|max:150',
            'placa_vehiculo' => 'nullable|string|max:20',
            'precio_unitario' => 'required|numeric|min:0',
            'observaciones' => 'nullable|string',
            'detalles' => 'required|array|min:1',
            'detalles.*.d_tanque_id' => 'required|exists:d_tanques,id',
            'detalles.*.litros' => 'required|numeric|min:0.01'
        ]);

        $userId = Auth::id() ?? 1; // Fallback para pruebas
        $tipoIngreso = TipoMovimiento::where('nombre', 'INGRESO')->first();

        if (!$tipoIngreso) {
            return response()->json([
                'success' => false,
                'message' => 'Tipo de movimiento INGRESO no configurado'
            ], 500);
        }

        DB::beginTransaction();

        try {
            // Calcular total de litros
            $totalLitros = collect($request->detalles)->sum('litros');
            $total = $totalLitros * $request->precio_unitario;

            // Calcular números de factura correlativos
            $numeroFacturaGlobal = Ingreso::max('numero_factura') + 1;
            $numeroFacturaDia = Ingreso::whereDate('fecha', $request->fecha)->max('numero_factura_dia') + 1;

            // 1. Crear cabecera
            $ingreso = Ingreso::create([
                'fecha' => $request->fecha,
                'd_proveedor_id' => $request->d_proveedor_id,
                'd_tipo_pago_id' => $request->d_tipo_pago_id,
                'numero_factura' => $numeroFacturaGlobal,
                'numero_factura_dia' => $numeroFacturaDia,
                'nombre_chofer' => $request->nombre_chofer,
                'placa_vehiculo' => $request->placa_vehiculo,
                'total_litros' => $totalLitros,
                'precio_unitario' => $request->precio_unitario,
                'total' => $total,
                'observaciones' => $request->observaciones,
                'estado' => 'ACTIVO',
                'user_id' => $userId
            ]);

            // 2. Procesar detalles
            foreach ($request->detalles as $detalle) {
                $tanque = Tanque::find($detalle['d_tanque_id']);
                $stockAntes = $tanque->stock_actual;
                $litros = $detalle['litros'];

                // Validar que no exceda capacidad
                if (($stockAntes + $litros) > $tanque->capacidad_maxima) {
                    throw new \Exception("El tanque {$tanque->nombre} excedería su capacidad máxima");
                }

                // Crear detalle
                IngresoDetalle::create([
                    'd_ingreso_id' => $ingreso->id,
                    'd_tanque_id' => $tanque->id,
                    'litros' => $litros
                ]);

                // Actualizar stock del tanque
                $tanque->stock_actual += $litros;
                $tanque->save();

                // Crear registro de movimiento (trazabilidad)
                Movimiento::create([
                    'd_tipo_movimiento_id' => $tipoIngreso->id,
                    'id_origen' => $ingreso->id,
                    'fecha' => $request->fecha,
                    'd_tanque_id' => $tanque->id,
                    'litros' => $litros,
                    'stock_antes' => $stockAntes,
                    'stock_despues' => $tanque->stock_actual,
                    'estado' => 'ACTIVO',
                    'user_id' => $userId
                ]);
            }

            // 5. Registrar en bitácora
            BitacoraIngreso::create([
                'd_ingreso_id' => $ingreso->id,
                'accion' => 'CREADO',
                'user_id' => $userId,
                'ip' => $request->ip()
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Ingreso registrado correctamente',
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
