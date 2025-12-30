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
     * Crear múltiples ubicaciones (ingreso masivo)
     */
    public function storeBulk(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ubicaciones' => 'required|array|min:1',
            'ubicaciones.*.nombre' => 'required|string|max:100',
            'ubicaciones.*.d_division_id' => 'nullable|exists:d_divisiones,id'
        ]);

        $creadas = [];
        $errores = [];

        \DB::beginTransaction();
        try {
            foreach ($validated['ubicaciones'] as $index => $data) {
                // Verificar si ya existe
                $existe = UbicacionFisica::where('nombre', $data['nombre'])->exists();
                if ($existe) {
                    $errores[] = [
                        'fila' => $index + 1,
                        'nombre' => $data['nombre'],
                        'error' => 'Ya existe una ubicación con este nombre'
                    ];
                    continue;
                }

                $ubicacion = UbicacionFisica::create([
                    'nombre' => $data['nombre'],
                    'd_division_id' => $data['d_division_id'] ?? null,
                    'is_active' => true
                ]);
                $creadas[] = $ubicacion;
            }

            if (count($errores) > 0 && count($creadas) === 0) {
                \DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'No se pudo crear ninguna ubicación',
                    'errores' => $errores
                ], 422);
            }

            \DB::commit();

            return response()->json([
                'success' => true,
                'message' => count($creadas) . ' ubicación(es) creada(s) correctamente',
                'creadas' => count($creadas),
                'errores' => $errores,
                'data' => $creadas
            ], 201);

        } catch (\Exception $e) {
            \DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al crear ubicaciones: ' . $e->getMessage()
            ], 500);
        }
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

