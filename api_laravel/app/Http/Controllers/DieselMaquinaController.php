<?php

namespace App\Http\Controllers;

use App\Models\Diesel\Maquina;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DieselMaquinaController extends Controller
{
    /**
     * Listar todas las máquinas
     */
    public function index(Request $request): JsonResponse
    {
        $query = Maquina::conDivision()->ordenado();

        if ($request->has('activos')) {
            $query->activos();
        }

        if ($request->has('division_id')) {
            $query->where('d_division_id', $request->division_id);
        }

        $maquinas = $query->get();

        return response()->json([
            'success' => true,
            'data' => $maquinas
        ]);
    }

    /**
     * Lista para combo (filtrable por división)
     */
    public function combo(Request $request): JsonResponse
    {
        $divisionId = $request->query('division_id');
        $maquinas = Maquina::comboMaquina($divisionId);

        return response()->json([
            'success' => true,
            'data' => $maquinas
        ]);
    }

    /**
     * Obtener una máquina específica
     */
    public function show($id): JsonResponse
    {
        $maquina = Maquina::conDivision()->find($id);

        if (!$maquina) {
            return response()->json([
                'success' => false,
                'error' => 'Máquina no encontrada'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $maquina
        ]);
    }

    /**
     * Crear nueva máquina
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'codigo' => 'required|string|max:50|unique:d_maquinas,codigo',
            'd_division_id' => 'required|exists:d_divisiones,id'
        ]);

        $validated['is_active'] = true;

        $maquina = Maquina::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Máquina creada correctamente',
            'data' => $maquina
        ], 201);
    }

    /**
     * Actualizar máquina
     */
    public function update(Request $request, $id): JsonResponse
    {
        $maquina = Maquina::find($id);

        if (!$maquina) {
            return response()->json([
                'success' => false,
                'error' => 'Máquina no encontrada'
            ], 404);
        }

        $validated = $request->validate([
            'codigo' => 'required|string|max:50|unique:d_maquinas,codigo,' . $id,
            'd_division_id' => 'required|exists:d_divisiones,id'
        ]);

        $maquina->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Máquina actualizada correctamente',
            'data' => $maquina
        ]);
    }

    /**
     * Activar/Desactivar máquina
     */
    public function toggleActivo($id): JsonResponse
    {
        $maquina = Maquina::find($id);

        if (!$maquina) {
            return response()->json([
                'success' => false,
                'error' => 'Máquina no encontrada'
            ], 404);
        }

        $maquina->toggleActivo();

        return response()->json([
            'success' => true,
            'message' => $maquina->is_active ? 'Máquina activada' : 'Máquina desactivada',
            'data' => $maquina
        ]);
    }
}
