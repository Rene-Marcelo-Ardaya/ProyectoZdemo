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
     * Crear múltiples divisiones (ingreso masivo)
     */
    public function storeBulk(Request $request): JsonResponse
    {
        $request->validate([
            'divisiones' => 'required|array|min:1',
            'divisiones.*.nombre' => 'required|string|max:100|distinct'
        ]);

        $creados = [];
        $errores = [];

        \DB::beginTransaction();
        try {
            foreach ($request->divisiones as $data) {
                // Verificar duplicados en BD
                if (Division::where('nombre', $data['nombre'])->exists()) {
                    $errores[] = [
                        'nombre' => $data['nombre'],
                        'error' => 'Ya existe una división con este nombre'
                    ];
                    continue;
                }

                $division = Division::create([
                    'nombre' => $data['nombre'],
                    'is_active' => true
                ]);
                $creados[] = $division;
            }

            if (empty($creados) && !empty($errores)) {
                \DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'No se pudo crear ninguna división',
                    'errores' => $errores
                ], 422);
            }

            \DB::commit();

            return response()->json([
                'success' => true,
                'message' => count($creados) . ' división(es) creada(s) correctamente',
                'creados' => count($creados),
                'errores' => $errores,
                'data' => $creados
            ], 201);

        } catch (\Exception $e) {
            \DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al crear divisiones: ' . $e->getMessage()
            ], 500);
        }
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
