<?php

namespace App\Http\Controllers;

use App\Models\Diesel\Proveedor;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DieselProveedorController extends Controller
{
    /**
     * Listar todos los proveedores
     */
    public function index(Request $request): JsonResponse
    {
        $query = Proveedor::ordenado();

        if ($request->has('activos')) {
            $query->activos();
        }

        $proveedores = $query->get();

        return response()->json([
            'success' => true,
            'data' => $proveedores
        ]);
    }

    /**
     * Lista para combo (solo activos)
     */
    public function combo(): JsonResponse
    {
        $proveedores = Proveedor::comboProveedor();

        return response()->json([
            'success' => true,
            'data' => $proveedores
        ]);
    }

    /**
     * Obtener un proveedor específico
     */
    public function show($id): JsonResponse
    {
        $proveedor = Proveedor::find($id);

        if (!$proveedor) {
            return response()->json([
                'success' => false,
                'error' => 'Proveedor no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $proveedor
        ]);
    }

    /**
     * Crear nuevo proveedor
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:100',
            'razon_social' => 'nullable|string|max:150',
            'nit' => 'nullable|string|max:50',
            'telefono' => 'nullable|string|max:50',
            'celular' => 'nullable|string|max:50',
            'direccion' => 'nullable|string'
        ]);

        $validated['is_active'] = true;

        $proveedor = Proveedor::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Proveedor creado correctamente',
            'data' => $proveedor
        ], 201);
    }

    /**
     * Crear múltiples proveedores (ingreso masivo)
     */
    public function storeBulk(Request $request): JsonResponse
    {
        $request->validate([
            'proveedores' => 'required|array|min:1',
            'proveedores.*.nombre' => 'required|string|max:100',
            'proveedores.*.razon_social' => 'nullable|string|max:150',
            'proveedores.*.nit' => 'nullable|string|max:50',
            'proveedores.*.telefono' => 'nullable|string|max:50',
            'proveedores.*.celular' => 'nullable|string|max:50',
            'proveedores.*.direccion' => 'nullable|string'
        ]);

        $creados = [];

        \DB::beginTransaction();
        try {
            foreach ($request->proveedores as $data) {
                // Crear proveedor
                $creados[] = Proveedor::create([
                    'nombre' => $data['nombre'],
                    'razon_social' => $data['razon_social'] ?? null,
                    'nit' => $data['nit'] ?? null,
                    'telefono' => $data['telefono'] ?? null,
                    'celular' => $data['celular'] ?? null,
                    'direccion' => $data['direccion'] ?? null,
                    'is_active' => true
                ]);
            }

            \DB::commit();

            return response()->json([
                'success' => true,
                'message' => count($creados) . ' proveedor(es) creado(s) correctamente',
                'creados' => count($creados),
                'errores' => [],
                'data' => $creados
            ], 201);

        } catch (\Exception $e) {
            \DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al crear proveedores: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar proveedor
     */
    public function update(Request $request, $id): JsonResponse
    {
        $proveedor = Proveedor::find($id);

        if (!$proveedor) {
            return response()->json([
                'success' => false,
                'error' => 'Proveedor no encontrado'
            ], 404);
        }

        $validated = $request->validate([
            'nombre' => 'required|string|max:100',
            'razon_social' => 'nullable|string|max:150',
            'nit' => 'nullable|string|max:50',
            'telefono' => 'nullable|string|max:50',
            'celular' => 'nullable|string|max:50',
            'direccion' => 'nullable|string'
        ]);

        $proveedor->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Proveedor actualizado correctamente',
            'data' => $proveedor
        ]);
    }

    /**
     * Activar/Desactivar proveedor
     */
    public function toggleActivo($id): JsonResponse
    {
        $proveedor = Proveedor::find($id);

        if (!$proveedor) {
            return response()->json([
                'success' => false,
                'error' => 'Proveedor no encontrado'
            ], 404);
        }

        $proveedor->toggleActivo();

        return response()->json([
            'success' => true,
            'message' => $proveedor->is_active ? 'Proveedor activado' : 'Proveedor desactivado',
            'data' => $proveedor
        ]);
    }
}
