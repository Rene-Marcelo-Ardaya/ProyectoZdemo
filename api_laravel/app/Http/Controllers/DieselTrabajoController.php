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
     * Crear múltiples trabajos (ingreso masivo)
     */
    public function storeBulk(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'trabajos' => 'required|array|min:1',
            'trabajos.*.nombre' => 'required|string|max:100'
        ]);

        $creados = [];
        $errores = [];

        \DB::beginTransaction();
        try {
            foreach ($validated['trabajos'] as $index => $data) {
                // Verificar si ya existe
                $existe = Trabajo::where('nombre', $data['nombre'])->exists();
                if ($existe) {
                    $errores[] = [
                        'fila' => $index + 1,
                        'nombre' => $data['nombre'],
                        'error' => 'Ya existe un trabajo con este nombre'
                    ];
                    continue;
                }

                $trabajo = Trabajo::create([
                    'nombre' => $data['nombre'],
                    'is_active' => true
                ]);
                $creados[] = $trabajo;
            }

            if (count($errores) > 0 && count($creados) === 0) {
                \DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'No se pudo crear ningún trabajo',
                    'errores' => $errores
                ], 422);
            }

            \DB::commit();

            return response()->json([
                'success' => true,
                'message' => count($creados) . ' trabajo(s) creado(s) correctamente',
                'creados' => count($creados),
                'errores' => $errores,
                'data' => $creados
            ], 201);

        } catch (\Exception $e) {
            \DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al crear trabajos: ' . $e->getMessage()
            ], 500);
        }
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

