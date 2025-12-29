<?php

namespace App\Http\Controllers;

use App\Models\Diesel\MotivoAjuste;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DieselMotivoAjusteController extends Controller
{
    /**
     * Listar todos los motivos de ajuste
     */
    public function index(Request $request): JsonResponse
    {
        $query = MotivoAjuste::ordenado();

        if ($request->has('activos')) {
            $query->activos();
        }

        $motivos = $query->get();

        return response()->json([
            'success' => true,
            'data' => $motivos
        ]);
    }

    /**
     * Lista para combo (solo activos)
     */
    public function combo(): JsonResponse
    {
        $motivos = MotivoAjuste::comboMotivoAjuste();

        return response()->json([
            'success' => true,
            'data' => $motivos
        ]);
    }

    /**
     * Obtener un motivo de ajuste específico
     */
    public function show($id): JsonResponse
    {
        $motivo = MotivoAjuste::find($id);

        if (!$motivo) {
            return response()->json([
                'success' => false,
                'error' => 'Motivo de ajuste no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $motivo
        ]);
    }

    /**
     * Crear nuevo motivo de ajuste
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:100|unique:d_motivos_ajuste,nombre'
        ]);

        $validated['is_active'] = true;

        $motivo = MotivoAjuste::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Motivo de ajuste creado correctamente',
            'data' => $motivo
        ], 201);
    }

    /**
     * Actualizar motivo de ajuste
     */
    public function update(Request $request, $id): JsonResponse
    {
        $motivo = MotivoAjuste::find($id);

        if (!$motivo) {
            return response()->json([
                'success' => false,
                'error' => 'Motivo de ajuste no encontrado'
            ], 404);
        }

        $validated = $request->validate([
            'nombre' => 'required|string|max:100|unique:d_motivos_ajuste,nombre,' . $id
        ]);

        $motivo->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Motivo de ajuste actualizado correctamente',
            'data' => $motivo
        ]);
    }

    /**
     * Activar/Desactivar motivo de ajuste
     */
    public function toggleActivo($id): JsonResponse
    {
        $motivo = MotivoAjuste::find($id);

        if (!$motivo) {
            return response()->json([
                'success' => false,
                'error' => 'Motivo de ajuste no encontrado'
            ], 404);
        }

        $motivo->toggleActivo();

        return response()->json([
            'success' => true,
            'message' => $motivo->is_active ? 'Motivo activado' : 'Motivo desactivado',
            'data' => $motivo
        ]);
    }
}
