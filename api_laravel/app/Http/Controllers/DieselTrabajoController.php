<?php

namespace App\Http\Controllers;

use App\Models\Diesel\Trabajo;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DieselTrabajoController extends Controller
{
    /**
     * Listar todos los trabajos
     */
    public function index(Request $request): JsonResponse
    {
        $query = Trabajo::ordenado();

        // Filtrar por estado si se especifica
        if ($request->has('activos')) {
            $query->activos();
        }

        $trabajos = $query->get();

        return response()->json([
            'success' => true,
            'data' => $trabajos
        ]);
    }

    /**
     * Lista para combo (solo activos)
     */
    public function combo(): JsonResponse
    {
        $trabajos = Trabajo::comboTrabajo();

        return response()->json([
            'success' => true,
            'data' => $trabajos
        ]);
    }

    /**
     * Obtener un trabajo específico
     */
    public function show($id): JsonResponse
    {
        $trabajo = Trabajo::find($id);

        if (!$trabajo) {
            return response()->json([
                'success' => false,
                'error' => 'Trabajo no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $trabajo
        ]);
    }

    /**
     * Crear nuevo trabajo
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:100|unique:d_trabajos,nombre'
        ]);

        $validated['is_active'] = true; // Siempre activo al crear

        $trabajo = Trabajo::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Trabajo creado correctamente',
            'data' => $trabajo
        ], 201);
    }

    /**
     * Actualizar trabajo
     */
    public function update(Request $request, $id): JsonResponse
    {
        $trabajo = Trabajo::find($id);

        if (!$trabajo) {
            return response()->json([
                'success' => false,
                'error' => 'Trabajo no encontrado'
            ], 404);
        }

        $validated = $request->validate([
            'nombre' => 'required|string|max:100|unique:d_trabajos,nombre,' . $id
        ]);

        $trabajo->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Trabajo actualizado correctamente',
            'data' => $trabajo
        ]);
    }

    /**
     * Activar/Desactivar trabajo (en vez de eliminar)
     */
    public function toggleActivo($id): JsonResponse
    {
        $trabajo = Trabajo::find($id);

        if (!$trabajo) {
            return response()->json([
                'success' => false,
                'error' => 'Trabajo no encontrado'
            ], 404);
        }

        $trabajo->toggleActivo();

        return response()->json([
            'success' => true,
            'message' => $trabajo->is_active ? 'Trabajo activado' : 'Trabajo desactivado',
            'data' => $trabajo
        ]);
    }
}
