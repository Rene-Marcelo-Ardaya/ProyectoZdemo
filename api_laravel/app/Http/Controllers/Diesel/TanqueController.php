<?php

namespace App\Http\Controllers\Diesel;

use App\Http\Controllers\Controller;
use App\Models\Tanque;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TanqueController extends Controller
{
    /**
     * Listar todos los tanques
     */
    public function index(Request $request): JsonResponse
    {
        $query = Tanque::with(['responsable:id,nombre,apellido_paterno,apellido_materno']);

        // Filtro por tipo
        if ($request->has('tipo') && in_array($request->tipo, ['ESTATICO', 'MOVIL'])) {
            $query->where('tipo', $request->tipo);
        }

        // Filtro por estado
        if ($request->has('activos') && $request->activos === 'true') {
            $query->activos();
        }

        // Filtro por nivel bajo
        if ($request->has('nivel_bajo') && $request->nivel_bajo === 'true') {
            $query->conNivelBajo();
        }

        $tanques = $query->orderBy('tipo')
            ->orderBy('nombre')
            ->get()
            ->map(function ($tanque) {
                return [
                    'id' => $tanque->id,
                    'nombre' => $tanque->nombre,
                    'codigo' => $tanque->codigo,
                    'tipo' => $tanque->tipo,
                    'tipo_descripcion' => $tanque->tipo_descripcion,
                    'capacidad_litros' => (float) $tanque->capacidad_litros,
                    'nivel_actual' => (float) $tanque->nivel_actual,
                    'nivel_porcentaje' => $tanque->nivel_porcentaje,
                    'nivel_minimo_alerta' => (float) $tanque->nivel_minimo_alerta,
                    'nivel_bajo' => $tanque->nivel_bajo,
                    'ubicacion_fija' => $tanque->ubicacion_fija,
                    'placa_cisterna' => $tanque->placa_cisterna,
                    'responsable_id' => $tanque->responsable_id,
                    'responsable' => $tanque->responsable ? [
                        'id' => $tanque->responsable->id,
                        'nombre_completo' => $tanque->responsable->nombre_completo,
                    ] : null,
                    'is_active' => $tanque->is_active,
                    'observaciones' => $tanque->observaciones,
                    'created_at' => $tanque->created_at?->format('Y-m-d H:i'),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $tanques
        ]);
    }

    /**
     * Obtener un tanque específico
     */
    public function show($id): JsonResponse
    {
        $tanque = Tanque::with(['responsable:id,nombre,apellido_paterno,apellido_materno'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $tanque->id,
                'nombre' => $tanque->nombre,
                'codigo' => $tanque->codigo,
                'tipo' => $tanque->tipo,
                'tipo_descripcion' => $tanque->tipo_descripcion,
                'capacidad_litros' => (float) $tanque->capacidad_litros,
                'nivel_actual' => (float) $tanque->nivel_actual,
                'nivel_porcentaje' => $tanque->nivel_porcentaje,
                'nivel_minimo_alerta' => (float) $tanque->nivel_minimo_alerta,
                'nivel_bajo' => $tanque->nivel_bajo,
                'ubicacion_fija' => $tanque->ubicacion_fija,
                'placa_cisterna' => $tanque->placa_cisterna,
                'responsable_id' => $tanque->responsable_id,
                'responsable' => $tanque->responsable ? [
                    'id' => $tanque->responsable->id,
                    'nombre_completo' => $tanque->responsable->nombre_completo,
                ] : null,
                'is_active' => $tanque->is_active,
                'observaciones' => $tanque->observaciones,
            ]
        ]);
    }

    /**
     * Crear nuevo tanque
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:100',
            'codigo' => 'nullable|string|max:20|unique:tanques,codigo',
            'tipo' => 'required|in:ESTATICO,MOVIL',
            'capacidad_litros' => 'required|numeric|min:1',
            'nivel_actual' => 'nullable|numeric|min:0',
            'nivel_minimo_alerta' => 'nullable|numeric|min:0',
            'ubicacion_fija' => 'nullable|string|max:200',
            'placa_cisterna' => 'nullable|string|max:20',
            'responsable_id' => 'nullable|exists:personal,id',
            'is_active' => 'boolean',
            'observaciones' => 'nullable|string',
        ]);

        // Validaciones adicionales según tipo
        if ($validated['tipo'] === 'MOVIL') {
            $request->validate([
                'placa_cisterna' => 'required|string|max:20',
            ]);
        }

        // Asegurar que nivel_actual no exceda capacidad
        $nivelActual = $validated['nivel_actual'] ?? 0;
        if ($nivelActual > $validated['capacidad_litros']) {
            return response()->json([
                'success' => false,
                'message' => 'El nivel actual no puede exceder la capacidad del tanque'
            ], 422);
        }

        $tanque = Tanque::create([
            'nombre' => $validated['nombre'],
            'codigo' => $validated['codigo'] ?? null,
            'tipo' => $validated['tipo'],
            'capacidad_litros' => $validated['capacidad_litros'],
            'nivel_actual' => $nivelActual,
            'nivel_minimo_alerta' => $validated['nivel_minimo_alerta'] ?? 0,
            'ubicacion_fija' => $validated['ubicacion_fija'] ?? null,
            'placa_cisterna' => $validated['placa_cisterna'] ?? null,
            'responsable_id' => $validated['responsable_id'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'observaciones' => $validated['observaciones'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tanque creado correctamente',
            'data' => $tanque->load('responsable')
        ], 201);
    }

    /**
     * Actualizar tanque
     */
    public function update(Request $request, $id): JsonResponse
    {
        $tanque = Tanque::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'required|string|max:100',
            'codigo' => 'nullable|string|max:20|unique:tanques,codigo,' . $tanque->id,
            'tipo' => 'required|in:ESTATICO,MOVIL',
            'capacidad_litros' => 'required|numeric|min:1',
            'nivel_actual' => 'nullable|numeric|min:0',
            'nivel_minimo_alerta' => 'nullable|numeric|min:0',
            'ubicacion_fija' => 'nullable|string|max:200',
            'placa_cisterna' => 'nullable|string|max:20',
            'responsable_id' => 'nullable|exists:personal,id',
            'is_active' => 'boolean',
            'observaciones' => 'nullable|string',
        ]);

        // Validaciones adicionales según tipo
        if ($validated['tipo'] === 'MOVIL') {
            $request->validate([
                'placa_cisterna' => 'required|string|max:20',
            ]);
        }

        // Asegurar que nivel_actual no exceda capacidad
        $nivelActual = $validated['nivel_actual'] ?? $tanque->nivel_actual;
        if ($nivelActual > $validated['capacidad_litros']) {
            return response()->json([
                'success' => false,
                'message' => 'El nivel actual no puede exceder la capacidad del tanque'
            ], 422);
        }

        $tanque->update([
            'nombre' => $validated['nombre'],
            'codigo' => $validated['codigo'] ?? null,
            'tipo' => $validated['tipo'],
            'capacidad_litros' => $validated['capacidad_litros'],
            'nivel_actual' => $nivelActual,
            'nivel_minimo_alerta' => $validated['nivel_minimo_alerta'] ?? 0,
            'ubicacion_fija' => $validated['ubicacion_fija'] ?? null,
            'placa_cisterna' => $validated['placa_cisterna'] ?? null,
            'responsable_id' => $validated['responsable_id'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'observaciones' => $validated['observaciones'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tanque actualizado correctamente'
        ]);
    }

    /**
     * Eliminar tanque (soft delete)
     */
    public function destroy($id): JsonResponse
    {
        $tanque = Tanque::findOrFail($id);
        
        // Verificar si tiene despachos o transferencias activas
        // (Se podría agregar validación aquí si es necesario)
        
        $tanque->delete();

        return response()->json([
            'success' => true,
            'message' => 'Tanque eliminado correctamente'
        ]);
    }

    /**
     * Listar tanques activos (para selects)
     */
    public function activos(Request $request): JsonResponse
    {
        $query = Tanque::activos()
            ->select('id', 'nombre', 'codigo', 'tipo', 'capacidad_litros', 'nivel_actual', 'placa_cisterna');

        // Filtro por tipo
        if ($request->has('tipo') && in_array($request->tipo, ['ESTATICO', 'MOVIL'])) {
            $query->where('tipo', $request->tipo);
        }

        $tanques = $query->orderBy('nombre')->get()->map(function ($t) {
            return [
                'id' => $t->id,
                'nombre' => $t->nombre,
                'codigo' => $t->codigo,
                'tipo' => $t->tipo,
                'capacidad_litros' => (float) $t->capacidad_litros,
                'nivel_actual' => (float) $t->nivel_actual,
                'placa_cisterna' => $t->placa_cisterna,
                'label' => $t->tipo === 'MOVIL' 
                    ? "{$t->nombre} ({$t->placa_cisterna}) - {$t->nivel_actual} Lts"
                    : "{$t->nombre} - {$t->nivel_actual} Lts",
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $tanques
        ]);
    }

    /**
     * Obtener tanques con nivel bajo (para alertas)
     */
    public function alertas(): JsonResponse
    {
        $tanques = Tanque::activos()
            ->conNivelBajo()
            ->orderBy('nivel_actual')
            ->get()
            ->map(function ($t) {
                return [
                    'id' => $t->id,
                    'nombre' => $t->nombre,
                    'tipo' => $t->tipo,
                    'nivel_actual' => (float) $t->nivel_actual,
                    'nivel_minimo' => (float) $t->nivel_minimo_alerta,
                    'capacidad' => (float) $t->capacidad_litros,
                    'porcentaje' => $t->nivel_porcentaje,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $tanques,
            'count' => $tanques->count()
        ]);
    }
}
