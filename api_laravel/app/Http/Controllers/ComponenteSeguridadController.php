<?php

namespace App\Http\Controllers;

use App\Models\ComponenteSeguridad;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ComponenteSeguridadController extends Controller
{
    // Obtener todos los componentes protegidos
    public function index(): JsonResponse
    {
        $componentes = ComponenteSeguridad::with('nivelSeguridad:id,nombre,color')->get();
        return response()->json(['success' => true, 'data' => $componentes]);
    }

    // Asignar/actualizar nivel a un componente (upsert)
    public function upsert(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'componente_id' => 'required|string|max:100',
            'pagina' => 'required|string|max:100',
            'descripcion' => 'nullable|string',
            'nivel_seguridad_id' => 'required|exists:niveles_seguridad,id',
        ]);

        $componente = ComponenteSeguridad::updateOrCreate(
            ['componente_id' => $validated['componente_id']],
            $validated
        );

        return response()->json([
            'success' => true,
            'message' => 'Nivel de seguridad asignado al componente',
            'data' => $componente->load('nivelSeguridad:id,nombre,color')
        ]);
    }

    // Eliminar protección de un componente
    public function destroy(string $componenteId): JsonResponse
    {
        $deleted = ComponenteSeguridad::where('componente_id', $componenteId)->delete();
        return response()->json([
            'success' => $deleted > 0,
            'message' => $deleted > 0 ? 'Componente liberado' : 'Componente no encontrado'
        ]);
    }
}
