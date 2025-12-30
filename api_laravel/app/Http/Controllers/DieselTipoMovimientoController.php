<?php

namespace App\Http\Controllers;

use App\Models\Diesel\TipoMovimiento;
use Illuminate\Http\Request;

class DieselTipoMovimientoController extends Controller
{
    /**
     * Listar tipos de movimiento
     */
    public function index(Request $request)
    {
        $query = TipoMovimiento::ordenado();

        if ($request->has('activos') && $request->activos) {
            $query->activos();
        }

        return response()->json([
            'success' => true,
            'data' => $query->get()
        ]);
    }

    /**
     * Combo para selects
     */
    public function combo()
    {
        return response()->json([
            'success' => true,
            'data' => TipoMovimiento::comboTipoMovimiento()
        ]);
    }

    /**
     * Obtener un tipo
     */
    public function show($id)
    {
        $tipo = TipoMovimiento::find($id);

        if (!$tipo) {
            return response()->json([
                'success' => false,
                'message' => 'Tipo de movimiento no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $tipo
        ]);
    }

    /**
     * Crear tipo
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:50|unique:d_tipo_movimientos,nombre',
            'descripcion' => 'nullable|string|max:255'
        ]);

        $tipo = TipoMovimiento::create([
            'nombre' => strtoupper($request->nombre),
            'descripcion' => $request->descripcion,
            'is_active' => true
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tipo de movimiento creado',
            'data' => $tipo
        ], 201);
    }

    /**
     * Crear múltiples tipos de movimiento (ingreso masivo)
     */
    public function storeBulk(Request $request)
    {
        $request->validate([
            'tipos_movimiento' => 'required|array|min:1',
            'tipos_movimiento.*.nombre' => 'required|string|max:50',
            'tipos_movimiento.*.descripcion' => 'nullable|string|max:255'
        ]);

        $creados = [];
        $errores = [];

        \DB::beginTransaction();
        try {
            foreach ($request->tipos_movimiento as $index => $data) {
                $existe = TipoMovimiento::where('nombre', strtoupper($data['nombre']))->exists();
                if ($existe) {
                    $errores[] = [
                        'fila' => $index + 1,
                        'nombre' => $data['nombre'],
                        'error' => 'Ya existe un tipo con este nombre'
                    ];
                    continue;
                }

                $tipo = TipoMovimiento::create([
                    'nombre' => strtoupper($data['nombre']),
                    'descripcion' => $data['descripcion'] ?? null,
                    'is_active' => true
                ]);
                $creados[] = $tipo;
            }

            if (count($errores) > 0 && count($creados) === 0) {
                \DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'No se pudo crear ningún tipo',
                    'errores' => $errores
                ], 422);
            }

            \DB::commit();

            return response()->json([
                'success' => true,
                'message' => count($creados) . ' tipo(s) creado(s) correctamente',
                'creados' => count($creados),
                'errores' => $errores,
                'data' => $creados
            ], 201);

        } catch (\Exception $e) {
            \DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al crear tipos: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar tipo
     */
    public function update(Request $request, $id)
    {
        $tipo = TipoMovimiento::find($id);

        if (!$tipo) {
            return response()->json([
                'success' => false,
                'message' => 'Tipo de movimiento no encontrado'
            ], 404);
        }

        $request->validate([
            'nombre' => 'required|string|max:50|unique:d_tipo_movimientos,nombre,' . $id,
            'descripcion' => 'nullable|string|max:255'
        ]);

        $tipo->update([
            'nombre' => strtoupper($request->nombre),
            'descripcion' => $request->descripcion
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tipo de movimiento actualizado',
            'data' => $tipo
        ]);
    }

    /**
     * Toggle activo/inactivo
     */
    public function toggleActivo($id)
    {
        $tipo = TipoMovimiento::find($id);

        if (!$tipo) {
            return response()->json([
                'success' => false,
                'message' => 'Tipo de movimiento no encontrado'
            ], 404);
        }

        $tipo->toggleActivo();
        $estado = $tipo->is_active ? 'activado' : 'desactivado';

        return response()->json([
            'success' => true,
            'message' => "Tipo de movimiento {$estado}",
            'data' => $tipo
        ]);
    }
}
