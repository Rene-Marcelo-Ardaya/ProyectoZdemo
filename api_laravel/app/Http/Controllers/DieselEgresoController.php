<?php

namespace App\Http\Controllers;

use App\Models\Diesel\Egreso;
use App\Models\Diesel\BitacoraEgreso;
use App\Models\Diesel\Movimiento;
use App\Models\Diesel\Tanque;
use App\Models\Diesel\TipoMovimiento;
use App\Models\Personal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class DieselEgresoController extends Controller
{
    /**
     * Listar egresos con filtros
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

        // Filtro por tipo
        if ($request->has('tipo') && $request->tipo) {
            $query->where('tipo', $request->tipo);
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

        // ORDENAMIENTO: Pendientes primero, luego por fecha descendente
        $query->orderByRaw("CASE WHEN estado = 'PENDIENTE' THEN 0 ELSE 1 END")
              ->orderBy('fecha', 'desc')
              ->orderBy('id', 'desc');

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
            'bitacora.usuario'
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
     * Crear nuevo egreso (inicia despacho)
     * Se valida PIN de quien entrega (personal asignado al tanque)
     */
    public function store(Request $request)
    {
        // Validación base
        $rules = [
            'fecha' => 'required|date',
            'd_tanque_id' => 'required|exists:d_tanques,id',
            'tipo' => 'required|in:INTERNO,EXTERNO',
            'inicio_tanque' => 'required|numeric|min:0',
            'pin_entrega' => 'required|string|size:4',
            'observaciones' => 'nullable|string'
        ];

        // Validación específica por tipo
        if ($request->tipo === 'INTERNO') {
            $rules['d_trabajo_id'] = 'required|exists:d_trabajos,id';
            $rules['d_maquina_id'] = 'required|exists:d_maquinas,id';
            $rules['personal_recibe_id'] = 'nullable|exists:personal,id';
        } else {
            $rules['d_trabajo_id'] = 'nullable|exists:d_trabajos,id';
            $rules['nombre_chofer'] = 'required|string|max:150';
            $rules['carnet_chofer'] = 'required|string|max:50';
            $rules['placa_vehiculo'] = 'required|string|max:20';
        }

        $request->validate($rules);

        $userId = Auth::id() ?? 1;

        // Obtener tanque y verificar stock
        $tanque = Tanque::with('personal')->find($request->d_tanque_id);
        
        if (!$tanque) {
            return response()->json([
                'success' => false,
                'message' => 'Tanque no encontrado'
            ], 404);
        }

        // Validar PIN del personal asignado al tanque
        $personalEntrega = null;
        $pinValido = false;

        // Cargar el PIN explícitamente (está en $hidden)
        $personalConPin = $tanque->personal()->get(['personal.id', 'personal.pin', 'personal.nombre', 'personal.apellido_paterno']);
        
        foreach ($personalConPin as $persona) {
            if ($persona->pin && Hash::check($request->pin_entrega, $persona->pin)) {
                $personalEntrega = $persona;
                $pinValido = true;
                break;
            }
        }

        if (!$pinValido) {
            return response()->json([
                'success' => false,
                'message' => 'PIN de entrega incorrecto. Solo el personal asignado al tanque puede despachar.'
            ], 403);
        }

        DB::beginTransaction();

        try {
            // Crear egreso
            $egreso = Egreso::create([
                'fecha' => $request->fecha,
                'd_tanque_id' => $request->d_tanque_id,
                'tipo' => $request->tipo,
                'd_maquina_id' => $request->tipo === 'INTERNO' ? $request->d_maquina_id : null,
                'd_trabajo_id' => $request->d_trabajo_id,
                'personal_entrega_id' => $personalEntrega->id,
                'personal_recibe_id' => $request->tipo === 'INTERNO' ? $request->personal_recibe_id : null,
                'pin_entrega_validado' => true,
                'pin_recibo_validado' => false,
                'inicio_tanque_sistema' => $tanque->stock_actual,
                'inicio_tanque' => $request->inicio_tanque,
                'nombre_chofer' => $request->tipo === 'EXTERNO' ? $request->nombre_chofer : null,
                'carnet_chofer' => $request->tipo === 'EXTERNO' ? $request->carnet_chofer : null,
                'placa_vehiculo' => $request->tipo === 'EXTERNO' ? $request->placa_vehiculo : null,
                'observaciones' => $request->observaciones,
                'estado' => 'PENDIENTE',
                'user_id' => $userId
            ]);

            // Registrar en bitácora
            BitacoraEgreso::create([
                'd_egreso_id' => $egreso->id,
                'accion' => 'CREADO',
                'user_id' => $userId,
                'ip' => $request->ip()
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Egreso iniciado correctamente. Pendiente de completar.',
                'data' => $egreso->load(['tanque', 'maquina', 'trabajo', 'personalEntrega'])
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
     * Completar egreso (finalizar despacho)
     * - Registra lectura final
     * - Calcula litros despachados
     * - Actualiza stock del tanque
     * - Si es INTERNO, valida PIN de recibo y actualiza horómetro
     */
    public function completar(Request $request, $id)
    {
        $egreso = Egreso::with(['tanque', 'maquina'])->find($id);

        if (!$egreso) {
            return response()->json([
                'success' => false,
                'message' => 'Egreso no encontrado'
            ], 404);
        }

        if ($egreso->estado !== 'PENDIENTE') {
            return response()->json([
                'success' => false,
                'message' => 'Solo se pueden completar egresos PENDIENTES'
            ], 400);
        }

        // Validación base
        $rules = [
            'fin_tanque' => 'required|numeric|min:0',
            'litros' => 'required|numeric|min:0.01'
        ];

        // Si es INTERNO, requiere PIN de recibo y horómetro
        if ($egreso->tipo === 'INTERNO') {
            $rules['pin_recibo'] = 'required|string|size:4';
            $rules['horometro_final'] = 'required|numeric|min:0';
        }

        $request->validate($rules);

        // Validar que horómetro_final >= horómetro_actual de la máquina
        if ($egreso->tipo === 'INTERNO' && $egreso->maquina) {
            $horometroActual = floatval($egreso->maquina->horometro_actual ?? 0);
            if ($request->horometro_final < $horometroActual) {
                return response()->json([
                    'success' => false,
                    'message' => "El horómetro no puede ser menor al actual ({$horometroActual})"
                ], 400);
            }
        }

        $userId = Auth::id() ?? 1;

        // Validar PIN de recibo si es INTERNO
        if ($egreso->tipo === 'INTERNO') {
            // Si hay personal_recibe_id, validar ese PIN
            // Si no, el PIN de recibo puede ser del mismo que entrega
            $pinValido = false;
            
            if ($egreso->personal_recibe_id) {
                // Cargar PIN explícitamente (está en $hidden)
                $personalRecibe = Personal::select('id', 'pin', 'nombre')->find($egreso->personal_recibe_id);
                if ($personalRecibe && $personalRecibe->pin && Hash::check($request->pin_recibo, $personalRecibe->pin)) {
                    $pinValido = true;
                }
            } else {
                // Si no hay personal asignado para recibir, validar contra cualquier personal activo
                $personalActivos = Personal::select('id', 'pin', 'nombre')
                    ->where('estado', 'activo')
                    ->get();
                    
                foreach ($personalActivos as $persona) {
                    if ($persona->pin && Hash::check($request->pin_recibo, $persona->pin)) {
                        $pinValido = true;
                        $egreso->personal_recibe_id = $persona->id;
                        break;
                    }
                }
            }

            if (!$pinValido) {
                return response()->json([
                    'success' => false,
                    'message' => 'PIN de recibo incorrecto'
                ], 403);
            }
        }

        // Validar que litros no excedan stock disponible
        $tanque = $egreso->tanque;
        if ($request->litros > $tanque->stock_actual) {
            return response()->json([
                'success' => false,
                'message' => "Stock insuficiente. Disponible: {$tanque->stock_actual} L"
            ], 400);
        }

        DB::beginTransaction();

        try {
            // Actualizar egreso
            $egreso->fin_tanque = $request->fin_tanque;
            $egreso->litros = $request->litros;
            $egreso->pin_recibo_validado = $egreso->tipo === 'INTERNO';
            $egreso->estado = 'COMPLETADO';
            // Guardar horómetro final en el egreso si es INTERNO
            if ($egreso->tipo === 'INTERNO') {
                $egreso->horometro = $request->horometro_final;
            }
            $egreso->save();

            // Actualizar stock del tanque
            $stockAntes = $tanque->stock_actual;
            $tanque->stock_actual -= $request->litros;
            $tanque->save();

            // Si es INTERNO, actualizar horómetro de la máquina
            if ($egreso->tipo === 'INTERNO' && $egreso->maquina) {
                $horometroFinal = $request->horometro_final ?? $egreso->horometro;
                $egreso->maquina->horometro_actual = $horometroFinal;
                $egreso->maquina->save();
            }

            // Crear movimiento de salida
            $tipoEgreso = TipoMovimiento::where('nombre', 'EGRESO')->first();
            if ($tipoEgreso) {
                Movimiento::create([
                    'd_tipo_movimiento_id' => $tipoEgreso->id,
                    'id_origen' => $egreso->id,
                    'fecha' => $egreso->fecha,
                    'd_tanque_id' => $tanque->id,
                    'litros' => -$request->litros, // Negativo porque es salida
                    'stock_antes' => $stockAntes,
                    'stock_despues' => $tanque->stock_actual,
                    'estado' => 'ACTIVO',
                    'user_id' => $userId
                ]);
            }

            // Registrar en bitácora
            BitacoraEgreso::create([
                'd_egreso_id' => $egreso->id,
                'accion' => 'COMPLETADO',
                'user_id' => $userId,
                'ip' => $request->ip()
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Egreso completado. Stock del tanque actualizado.',
                'data' => $egreso->load(['tanque', 'maquina', 'trabajo'])
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
     * Anular egreso
     * Si estaba completado, revierte el stock del tanque
     */
    public function anular(Request $request, $id)
    {
        $egreso = Egreso::with('tanque')->find($id);

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
            // Si estaba COMPLETADO, revertir stock
            if ($egreso->estado === 'COMPLETADO' && $egreso->litros) {
                $tanque = $egreso->tanque;
                
                // Validar que no exceda capacidad máxima al revertir
                if (($tanque->stock_actual + $egreso->litros) > $tanque->capacidad_maxima) {
                    throw new \Exception("No se puede anular: el tanque excedería su capacidad máxima");
                }
                
                $tanque->stock_actual += $egreso->litros;
                $tanque->save();

                // Anular movimientos relacionados
                Movimiento::where('id_origen', $egreso->id)
                    ->whereHas('tipoMovimiento', function ($q) {
                        $q->where('nombre', 'EGRESO');
                    })
                    ->update(['estado' => 'ANULADO']);
            }

            // Anular egreso
            $egreso->estado = 'ANULADO';
            $egreso->save();

            // Registrar en bitácora
            BitacoraEgreso::create([
                'd_egreso_id' => $egreso->id,
                'accion' => 'ANULADO',
                'user_id' => $userId,
                'ip' => $request->ip()
            ]);

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
     * Subir foto del egreso
     */
    public function uploadFoto(Request $request, $id)
    {
        $egreso = Egreso::find($id);

        if (!$egreso) {
            return response()->json([
                'success' => false,
                'message' => 'Egreso no encontrado'
            ], 404);
        }

        $request->validate([
            'foto' => 'required|image|mimes:jpeg,png,jpg|max:5120' // 5MB máximo
        ]);

        try {
            $file = $request->file('foto');
            $filename = 'egreso_' . $egreso->id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('egresos', $filename, 'public');
            
            $egreso->foto = $path;
            $egreso->save();

            return response()->json([
                'success' => true,
                'message' => 'Foto subida correctamente',
                'data' => ['foto' => $path]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Servir foto del egreso
     */
    public function getFoto($id)
    {
        $egreso = Egreso::find($id);

        if (!$egreso || !$egreso->foto) {
            return response()->json([
                'success' => false,
                'message' => 'Foto no encontrada'
            ], 404);
        }

        $path = storage_path('app/public/' . $egreso->foto);

        if (!file_exists($path)) {
            return response()->json([
                'success' => false,
                'message' => 'Archivo no encontrado'
            ], 404);
        }

        return response()->file($path);
    }

    /**
     * Obtener combos para formulario de egreso
     */
    public function getCombos()
    {
        $userId = Auth::id() ?? 1;
        
        // Obtener tanques (filtrados por asignación si no es admin)
        if ($userId === 1) {
            $tanques = Tanque::activos()->with('ubicacion')->get();
        } else {
            $personal = Personal::where('user_id', $userId)->first();
            if ($personal) {
                $tanques = $personal->tanques()->where('is_active', true)->with('ubicacion')->get();
            } else {
                $tanques = collect();
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'tanques' => $tanques,
                'maquinas' => \App\Models\Diesel\Maquina::activos()->with('division')->get(),
                'trabajos' => \App\Models\Diesel\Trabajo::activos()->get()
            ]
        ]);
    }
}
