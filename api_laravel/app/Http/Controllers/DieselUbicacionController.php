<?php

namespace App\Http\Controllers;

use App\Models\Diesel\UbicacionFisica;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DieselUbicacionController extends Controller
{
    /**
     * Listar todas las ubicaciones
     */
    public function index(Request $request): JsonResponse
    {
        $query = UbicacionFisica::conDivision()->ordenado();

        if ($request->has('activos')) {
            $query->activos();
        }

        $ubicaciones = $query->get();

        return response()->json([
            'success' => true,
            'data' => $ubicaciones
        ]);
    }

    /**
     * Lista para combo (solo activos, filtrable por división)
     */
    public function combo(Request $request): JsonResponse
    {
        $divisionId = $request->query('division_id');
        $ubicaciones = UbicacionFisica::comboUbicacion($divisionId);

        return response()->json([
            'success' => true,
            'data' => $ubicaciones
        ]);
    }

    /**
     * Obtener una ubicación específica
     */
    public function show($id): JsonResponse
    {
        $ubicacion = UbicacionFisica::conDivision()->with('tanques')->find($id);

        if (!$ubicacion) {
            return response()->json([
                'success' => false,
                'error' => 'Ubicación no encontrada'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $ubicacion
        ]);
    }

    /**
     * Crear nueva ubicación
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:100|unique:d_ubicaciones_fisicas,nombre',
            'd_division_id' => 'nullable|exists:d_divisiones,id'
        ]);

        $validated['is_active'] = true;

        $ubicacion = UbicacionFisica::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Ubicación creada correctamente',
            'data' => $ubicacion
        ], 201);
    }

    /**
     * Actualizar ubicación
     */
    public function update(Request $request, $id): JsonResponse
    {
        $ubicacion = UbicacionFisica::find($id);

        if (!$ubicacion) {
            return response()->json([
                'success' => false,
                'error' => 'Ubicación no encontrada'
            ], 404);
        }

        $validated = $request->validate([
            'nombre' => 'required|string|max:100|unique:d_ubicaciones_fisicas,nombre,' . $id,
            'd_division_id' => 'nullable|exists:d_divisiones,id'
        ]);

        $ubicacion->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Ubicación actualizada correctamente',
            'data' => $ubicacion
        ]);
    }

    /**
     * Activar/Desactivar ubicación
     */
    public function toggleActivo($id): JsonResponse
    {
        $ubicacion = UbicacionFisica::find($id);

        if (!$ubicacion) {
            return response()->json([
                'success' => false,
                'error' => 'Ubicación no encontrada'
            ], 404);
        }

        $ubicacion->toggleActivo();

        return response()->json([
            'success' => true,
            'message' => $ubicacion->is_active ? 'Ubicación activada' : 'Ubicación desactivada',
            'data' => $ubicacion
        ]);
    }
}
