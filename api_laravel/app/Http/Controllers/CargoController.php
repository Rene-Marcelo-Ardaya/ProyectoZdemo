<?php

namespace App\Http\Controllers;

use App\Models\Cargo;
use Illuminate\Http\Request;

class CargoController extends Controller
{
    /**
     * Listar todos los cargos
     */
    public function index()
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
                    'created_at' => $cargo->created_at->format('Y-m-d H:i'),
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
    public function show($id)
    {
        $cargo = Cargo::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $cargo->id,
                'nombre' => $cargo->nombre,
                'descripcion' => $cargo->descripcion,
                'is_active' => $cargo->is_active,
            ]
        ]);
    }

    /**
     * Crear nuevo cargo
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:100',
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
    public function update(Request $request, $id)
    {
        $cargo = Cargo::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'required|string|max:100',
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
            'message' => 'Cargo actualizado correctamente'
        ]);
    }

    /**
     * Eliminar cargo
     */
    public function destroy($id)
    {
        $cargo = Cargo::withCount('personal')->findOrFail($id);

        // Verificar que no tenga personal asignado
        if ($cargo->personal_count > 0) {
            return response()->json([
                'success' => false,
                'error' => 'No se puede eliminar un cargo con personal asignado'
            ], 400);
        }

        $cargo->delete();

        return response()->json([
            'success' => true,
            'message' => 'Cargo eliminado correctamente'
        ]);
    }

    /**
     * Listar cargos activos (para combos)
     */
    public function listActive()
    {
        $cargos = Cargo::where('is_active', true)
            ->orderBy('nombre')
            ->get(['id', 'nombre']);

        return response()->json([
            'success' => true,
            'data' => $cargos
        ]);
    }
}
