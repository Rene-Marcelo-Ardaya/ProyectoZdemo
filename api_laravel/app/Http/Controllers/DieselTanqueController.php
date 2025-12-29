<?php

namespace App\Http\Controllers;

use App\Models\Diesel\Tanque;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DieselTanqueController extends Controller
{
    /**
     * Listar todos los tanques
     */
    public function index(Request $request): JsonResponse
    {
        $query = Tanque::conUbicacion()->ordenado();

        if ($request->has('activos')) {
            $query->activos();
        }

        if ($request->has('tipo')) {
            $query->where('tipo', $request->tipo);
        }

        if ($request->has('ubicacion_id')) {
            $query->where('d_ubicacion_fisica_id', $request->ubicacion_id);
        }

        $tanques = $query->get();

        // Agregar porcentaje de llenado
        $tanques->each(function ($tanque) {
            $tanque->porcentaje_llenado = $tanque->porcentaje_llenado;
        });

        return response()->json([
            'success' => true,
            'data' => $tanques
        ]);
    }

    /**
     * Lista para combo (filtrable por ubicación)
     */
    public function combo(Request $request): JsonResponse
    {
        $ubicacionId = $request->query('ubicacion_id');
        $tanques = Tanque::comboTanque($ubicacionId);

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
        $tanque = Tanque::conUbicacion()->find($id);

        if (!$tanque) {
            return response()->json([
                'success' => false,
                'error' => 'Tanque no encontrado'
            ], 404);
        }

        $tanque->porcentaje_llenado = $tanque->porcentaje_llenado;

        return response()->json([
            'success' => true,
            'data' => $tanque
        ]);
    }

    /**
     * Crear nuevo tanque
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:100|unique:d_tanques,nombre',
            'tipo' => 'required|in:FIJO,MOVIL',
            'd_ubicacion_fisica_id' => 'required|exists:d_ubicaciones_fisicas,id',
            'capacidad_maxima' => 'required|numeric|min:1',
            'stock_actual' => 'nullable|numeric|min:0'
        ]);

        // Validar que stock no exceda capacidad
        if (isset($validated['stock_actual']) && $validated['stock_actual'] > $validated['capacidad_maxima']) {
            return response()->json([
                'success' => false,
                'error' => 'El stock no puede exceder la capacidad máxima'
            ], 400);
        }

        $validated['is_active'] = true;

        $tanque = Tanque::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Tanque creado correctamente',
            'data' => $tanque
        ], 201);
    }

    /**
     * Actualizar tanque
     */
    public function update(Request $request, $id): JsonResponse
    {
        $tanque = Tanque::find($id);

        if (!$tanque) {
            return response()->json([
                'success' => false,
                'error' => 'Tanque no encontrado'
            ], 404);
        }

        $validated = $request->validate([
            'nombre' => 'required|string|max:100|unique:d_tanques,nombre,' . $id,
            'tipo' => 'required|in:FIJO,MOVIL',
            'd_ubicacion_fisica_id' => 'required|exists:d_ubicaciones_fisicas,id',
            'capacidad_maxima' => 'required|numeric|min:1'
        ]);

        // Validar que stock actual no exceda nueva capacidad
        if ($tanque->stock_actual > $validated['capacidad_maxima']) {
            return response()->json([
                'success' => false,
                'error' => 'La nueva capacidad no puede ser menor al stock actual'
            ], 400);
        }

        $tanque->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Tanque actualizado correctamente',
            'data' => $tanque
        ]);
    }

    /**
     * Activar/Desactivar tanque
     */
    public function toggleActivo($id): JsonResponse
    {
        $tanque = Tanque::find($id);

        if (!$tanque) {
            return response()->json([
                'success' => false,
                'error' => 'Tanque no encontrado'
            ], 404);
        }

        $tanque->toggleActivo();

        return response()->json([
            'success' => true,
            'message' => $tanque->is_active ? 'Tanque activado' : 'Tanque desactivado',
            'data' => $tanque
        ]);
    }
}
