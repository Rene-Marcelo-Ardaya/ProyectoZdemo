<?php

namespace App\Http\Controllers;

use App\Models\Diesel\Egreso;
use App\Models\Diesel\Tanque;
use App\Models\Diesel\Maquina;
use App\Models\Diesel\Trabajo;
use App\Models\Personal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class DieselEgresoController extends Controller
{
    /**
     * Listar egresos
     */
    public function index(Request $request)
    {
        $query = Egreso::with([
            'tanque',
            'maquina.division',
            'trabajo',
            'personalEntrega',
            'personalRecibe',
            'usuario'
        ])->recientes();

        $userId = Auth::id() ?? 1;

        // SEGURIDAD: Si no es SuperAdmin, filtrar por tanques asignados
        if ($userId !== 1) {
            $personal = Personal::where('user_id', $userId)->first();
            if ($personal) {
                $tanquesIds = $personal->tanques()->pluck('d_tanques.id')->toArray();
                $query->whereIn('d_tanque_id', $tanquesIds);
            } else {
                return response()->json(['success' => true, 'data' => []]);
            }
        }

        // Filtro por estado
        if ($request->has('estado') && $request->estado) {
            $query->where('estado', $request->estado);
        }

        // Filtro por tanque
        if ($request->has('d_tanque_id') && $request->d_tanque_id) {
            $query->where('d_tanque_id', $request->d_tanque_id);
        }

        // Filtro por máquina
        if ($request->has('d_maquina_id') && $request->d_maquina_id) {
            $query->where('d_maquina_id', $request->d_maquina_id);
        }

        // Filtro por trabajo
        if ($request->has('d_trabajo_id') && $request->d_trabajo_id) {
            $query->where('d_trabajo_id', $request->d_trabajo_id);
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
     * Obtener un egreso con detalles
     */
    public function show($id)
    {
        $egreso = Egreso::with([
            'tanque',
            'maquina.division',
            'trabajo',
            'personalEntrega',
            'personalRecibe',
            'usuario',
            'bitacora.usuario',
            'movimiento'
        ])->find($id);

        if (!$egreso) {
            return response()->json([
                'success' => false,
                'message' => 'Egreso no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $egreso
        ]);
    }

    /**
     * Crear egreso (despacho de combustible)
     * - Valida PINs de entrega y recibo
     * - Descuenta stock del tanque
     * - Crea movimiento tipo EGRESO
     * - Registra en bitácora
     */
    public function store(Request $request)
    {
        $request->validate([
            'd_tanque_id' => 'required|exists:d_tanques,id',
            'd_maquina_id' => 'required|exists:d_maquinas,id',
            'd_trabajo_id' => 'required|exists:d_trabajos,id',
            'personal_entrega_id' => 'required|exists:personal,id',
            'personal_recibe_id' => 'required|exists:personal,id',
            'pin_entrega' => 'required|string',
            'pin_recibo' => 'required|string',
            'inicio_tanque' => 'required|numeric|min:0',
            'fin_tanque' => 'required|numeric|min:0',
            'observaciones' => 'nullable|string'
        ]);

        $userId = Auth::id() ?? 1;

        // Validar que inicio > fin (ya que estamos sacando combustible)
        if ($request->inicio_tanque <= $request->fin_tanque) {
            return response()->json([
                'success' => false,
                'message' => 'El inicio del tanque debe ser mayor que el fin (se está sacando combustible)'
            ], 400);
        }

        DB::beginTransaction();

        try {
            $egreso = Egreso::crearEgreso([
                'fecha' => now()->toDateString(),
                'd_tanque_id' => $request->d_tanque_id,
                'd_maquina_id' => $request->d_maquina_id,
                'd_trabajo_id' => $request->d_trabajo_id,
                'personal_entrega_id' => $request->personal_entrega_id,
                'personal_recibe_id' => $request->personal_recibe_id,
                'pin_entrega' => $request->pin_entrega,
                'pin_recibo' => $request->pin_recibo,
                'inicio_tanque' => $request->inicio_tanque,
                'fin_tanque' => $request->fin_tanque,
                'observaciones' => $request->observaciones
            ], $userId, $request->ip());

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Egreso registrado correctamente',
                'data' => $egreso->load([
                    'tanque',
                    'maquina',
                    'trabajo',
                    'personalEntrega',
                    'personalRecibe'
                ])
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
     * Anular egreso
     * Devuelve el stock al tanque
     */
    public function anular(Request $request, $id)
    {
        $egreso = Egreso::find($id);

        if (!$egreso) {
            return response()->json([
                'success' => false,
                'message' => 'Egreso no encontrado'
            ], 404);
        }

        if ($egreso->estado === 'ANULADO') {
            return response()->json([
                'success' => false,
                'message' => 'Este egreso ya está anulado'
            ], 400);
        }

        $userId = Auth::id() ?? 1;

        DB::beginTransaction();

        try {
            $egreso->anular($userId, $request->ip());

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Egreso anulado correctamente',
                'data' => $egreso
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
     * Validar PIN de un personal (endpoint auxiliar)
     */
    public function validarPin(Request $request)
    {
        $request->validate([
            'personal_id' => 'required|exists:personal,id',
            'pin' => 'required|string'
        ]);

        $valido = Egreso::validarPin($request->personal_id, $request->pin);

        return response()->json([
            'success' => true,
            'valido' => $valido
        ]);
    }

    /**
     * Obtener datos para el formulario de egreso
     * - Tanques activos con stock
     * - Máquinas activas
     * - Trabajos activos
     * - Personal activo
     */
    public function getDatosFormulario()
    {
        $userId = Auth::id() ?? 1;

        // Obtener tanques según permisos
        if ($userId === 1) {
            $tanques = Tanque::where('is_active', true)
                ->where('stock_actual', '>', 0)
                ->with('ubicacion')
                ->get();
        } else {
            $personal = Personal::where('user_id', $userId)->first();
            if ($personal) {
                $tanques = $personal->tanques()
                    ->where('is_active', true)
                    ->where('stock_actual', '>', 0)
                    ->with('ubicacion')
                    ->get();
            } else {
                $tanques = collect();
            }
        }

        $maquinas = Maquina::where('is_active', true)
            ->with('division')
            ->get();

        $trabajos = Trabajo::where('is_active', true)->get();

        $personal = Personal::where('estado', 'activo')
            ->whereNotNull('pin')
            ->select('id', 'nombre', 'apellido_paterno', 'apellido_materno', 'ci')
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'nombre_completo' => $p->nombre_completo,
                    'ci' => $p->ci
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'tanques' => $tanques,
                'maquinas' => $maquinas,
                'trabajos' => $trabajos,
                'personal' => $personal
            ]
        ]);
    }

    /**
     * Obtener stock actual de un tanque
     */
    public function getStockTanque($tanqueId)
    {
        $tanque = Tanque::find($tanqueId);

        if (!$tanque) {
            return response()->json([
                'success' => false,
                'message' => 'Tanque no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $tanque->id,
                'nombre' => $tanque->nombre,
                'stock_actual' => $tanque->stock_actual,
                'capacidad_maxima' => $tanque->capacidad_maxima
            ]
        ]);
    }
}
