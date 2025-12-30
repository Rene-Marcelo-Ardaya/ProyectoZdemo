<?php

namespace App\Http\Controllers;

use App\Models\Diesel\TipoPago;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DieselTipoPagoController extends Controller
{
    /**
     * Listar todos los tipos de pago
     */
    public function index(Request $request): JsonResponse
    {
        $query = TipoPago::ordenado();

        if ($request->has('activos')) {
            $query->activos();
        }

        $tiposPago = $query->get();

        return response()->json([
            'success' => true,
            'data' => $tiposPago
        ]);
    }

    /**
     * Lista para combo (solo activos)
     */
    public function combo(): JsonResponse
    {
        $tiposPago = TipoPago::comboTipoPago();

        return response()->json([
            'success' => true,
            'data' => $tiposPago
        ]);
    }

    /**
     * Obtener un tipo de pago específico
     */
    public function show($id): JsonResponse
    {
        $tipoPago = TipoPago::find($id);

        if (!$tipoPago) {
            return response()->json([
                'success' => false,
                'error' => 'Tipo de pago no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $tipoPago
        ]);
    }

    /**
     * Crear nuevo tipo de pago
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:50|unique:d_tipos_pago,nombre'
        ]);

        $validated['is_active'] = true;

        $tipoPago = TipoPago::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Tipo de pago creado correctamente',
            'data' => $tipoPago
        ], 201);
    }

    /**
     * Crear múltiples tipos de pago (ingreso masivo)
     */
    public function storeBulk(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tipos_pago' => 'required|array|min:1',
            'tipos_pago.*.nombre' => 'required|string|max:50'
        ]);

        $creados = [];
        $errores = [];

        \DB::beginTransaction();
        try {
            foreach ($validated['tipos_pago'] as $index => $data) {
                $existe = TipoPago::where('nombre', $data['nombre'])->exists();
                if ($existe) {
                    $errores[] = [
                        'fila' => $index + 1,
                        'nombre' => $data['nombre'],
                        'error' => 'Ya existe un tipo de pago con este nombre'
                    ];
                    continue;
                }

                $tipoPago = TipoPago::create([
                    'nombre' => $data['nombre'],
                    'is_active' => true
                ]);
                $creados[] = $tipoPago;
            }

            if (count($errores) > 0 && count($creados) === 0) {
                \DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'No se pudo crear ningún tipo de pago',
                    'errores' => $errores
                ], 422);
            }

            \DB::commit();

            return response()->json([
                'success' => true,
                'message' => count($creados) . ' tipo(s) de pago creado(s) correctamente',
                'creados' => count($creados),
                'errores' => $errores,
                'data' => $creados
            ], 201);

        } catch (\Exception $e) {
            \DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al crear tipos de pago: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar tipo de pago
     */
    public function update(Request $request, $id): JsonResponse
    {
        $tipoPago = TipoPago::find($id);

        if (!$tipoPago) {
            return response()->json([
                'success' => false,
                'error' => 'Tipo de pago no encontrado'
            ], 404);
        }

        $validated = $request->validate([
            'nombre' => 'required|string|max:50|unique:d_tipos_pago,nombre,' . $id
        ]);

        $tipoPago->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Tipo de pago actualizado correctamente',
            'data' => $tipoPago
        ]);
    }

    /**
     * Activar/Desactivar tipo de pago
     */
    public function toggleActivo($id): JsonResponse
    {
        $tipoPago = TipoPago::find($id);

        if (!$tipoPago) {
            return response()->json([
                'success' => false,
                'error' => 'Tipo de pago no encontrado'
            ], 404);
        }

        $tipoPago->toggleActivo();

        return response()->json([
            'success' => true,
            'message' => $tipoPago->is_active ? 'Tipo de pago activado' : 'Tipo de pago desactivado',
            'data' => $tipoPago
        ]);
    }
}
