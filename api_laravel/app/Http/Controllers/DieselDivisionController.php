<?php

namespace App\Http\Controllers;

use App\Models\Diesel\Division;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DieselDivisionController extends Controller
{
    /**
     * Listar todas las divisiones
     */
    public function index(Request $request): JsonResponse
    {
        $query = Division::ordenado();

        if ($request->has('activos')) {
            $query->activos();
        }

        $divisiones = $query->get();

        return response()->json([
            'success' => true,
            'data' => $divisiones
        ]);
    }

    /**
     * Lista para combo (solo activos)
     */
    public function combo(): JsonResponse
    {
        $divisiones = Division::comboDivision();

        return response()->json([
            'success' => true,
            'data' => $divisiones
        ]);
    }

    /**
     * Obtener una división específica
     */
    public function show($id): JsonResponse
    {
        $division = Division::with(['ubicaciones', 'maquinas'])->find($id);

        if (!$division) {
            return response()->json([
                'success' => false,
                'error' => 'División no encontrada'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $division
        ]);
    }

    /**
     * Crear nueva división
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:100|unique:d_divisiones,nombre'
        ]);

        $validated['is_active'] = true;

        $division = Division::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'División creada correctamente',
            'data' => $division
        ], 201);
    }

    /**
     * Actualizar división
     */
    public function update(Request $request, $id): JsonResponse
    {
        $division = Division::find($id);

        if (!$division) {
            return response()->json([
                'success' => false,
                'error' => 'División no encontrada'
            ], 404);
        }

        $validated = $request->validate([
            'nombre' => 'required|string|max:100|unique:d_divisiones,nombre,' . $id
        ]);

        $division->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'División actualizada correctamente',
            'data' => $division
        ]);
    }

    /**
     * Activar/Desactivar división
     */
    public function toggleActivo($id): JsonResponse
    {
        $division = Division::find($id);

        if (!$division) {
            return response()->json([
                'success' => false,
                'error' => 'División no encontrada'
            ], 404);
        }

        $division->toggleActivo();

        return response()->json([
            'success' => true,
            'message' => $division->is_active ? 'División activada' : 'División desactivada',
            'data' => $division
        ]);
    }
}
