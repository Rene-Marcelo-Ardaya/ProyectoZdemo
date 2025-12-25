<?php

namespace App\Http\Controllers;

use App\Models\Cargo;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CargoController extends Controller
{
    /**
     * Listar todos los cargos
     */
    public function index(): JsonResponse
    {
        $cargos = Cargo::withCount('personal')
            ->orderBy('nombre')
            ->get()
            ->map(function ($cargo) {
                return [
                    'id' => $cargo->id,
                    'nombre' => $cargo->nombre,
                    'descripcion' => $cargo->descripcion,
                    'is_active' => $cargo->is_active,
                    'personal_count' => $cargo->personal_count,
                    'created_at' => $cargo->created_at?->format('Y-m-d H:i'),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $cargos
        ]);
    }

    /**
     * Obtener un cargo específico
     */
    public function show($id): JsonResponse
    {
        $cargo = Cargo::withCount('personal')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $cargo->id,
                'nombre' => $cargo->nombre,
                'descripcion' => $cargo->descripcion,
                'is_active' => $cargo->is_active,
                'personal_count' => $cargo->personal_count,
            ]
        ]);
    }

    /**
     * Crear nuevo cargo
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:100|unique:cargos,nombre',
            'descripcion' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $cargo = Cargo::create([
            'nombre' => $validated['nombre'],
            'descripcion' => $validated['descripcion'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cargo creado correctamente',
            'data' => $cargo
        ], 201);
    }

    /**
     * Actualizar cargo
     */
    public function update(Request $request, $id): JsonResponse
    {
        $cargo = Cargo::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'required|string|max:100|unique:cargos,nombre,' . $cargo->id,
            'descripcion' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $cargo->update([
            'nombre' => $validated['nombre'],
            'descripcion' => $validated['descripcion'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cargo actualizado correctamente',
            'data' => $cargo
        ]);
    }

    /**
     * Eliminar cargo
     */
    public function destroy($id): JsonResponse
    {
        $cargo = Cargo::withCount('personal')->findOrFail($id);

        // Verificar si tiene personal asociado
        if ($cargo->personal_count > 0) {
            return response()->json([
                'success' => false,
                'message' => "No se puede eliminar el cargo porque tiene {$cargo->personal_count} empleado(s) asociado(s)"
            ], 422);
        }

        $cargo->delete();

        return response()->json([
            'success' => true,
            'message' => 'Cargo eliminado correctamente'
        ]);
    }

    /**
     * Listar cargos activos (para selects)
     */
    public function activos(): JsonResponse
    {
        $cargos = Cargo::activos()
            ->orderBy('nombre')
            ->get(['id', 'nombre']);

        return response()->json([
            'success' => true,
            'data' => $cargos
        ]);
    }
}
