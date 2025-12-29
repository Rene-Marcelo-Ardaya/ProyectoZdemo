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
