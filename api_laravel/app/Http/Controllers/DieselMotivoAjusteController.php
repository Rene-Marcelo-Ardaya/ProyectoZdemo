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
     * Crear múltiples motivos de ajuste (ingreso masivo)
     */
    public function storeBulk(Request $request): JsonResponse
    {
        $request->validate([
            'motivos_ajuste' => 'required|array|min:1',
            'motivos_ajuste.*.nombre' => 'required|string|max:100|distinct'
        ]);

        $creados = [];
        $errores = [];

        \DB::beginTransaction();
        try {
            foreach ($request->motivos_ajuste as $data) {
                // Verificar duplicados en BD
                if (MotivoAjuste::where('nombre', $data['nombre'])->exists()) {
                    $errores[] = [
                        'nombre' => $data['nombre'],
                        'error' => 'Ya existe un motivo con este nombre'
                    ];
                    continue;
                }

                $motivo = MotivoAjuste::create([
                    'nombre' => $data['nombre'],
                    'is_active' => true
                ]);
                $creados[] = $motivo;
            }

            if (empty($creados) && !empty($errores)) {
                \DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'No se pudo crear ningún motivo de ajuste',
                    'errores' => $errores
                ], 422);
            }

            \DB::commit();

            return response()->json([
                'success' => true,
                'message' => count($creados) . ' motivo(s) creado(s) correctamente',
                'creados' => count($creados),
                'errores' => $errores,
                'data' => $creados
            ], 201);

        } catch (\Exception $e) {
            \DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al crear motivos de ajuste: ' . $e->getMessage()
            ], 500);
        }
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
