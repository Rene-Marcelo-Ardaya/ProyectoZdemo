<?php

namespace App\Http\Controllers;

use App\Models\NivelSeguridad;
use App\Models\Personal;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NivelSeguridadController extends Controller
{
    // Listar todos los niveles
    public function index(): JsonResponse
    {
        $niveles = NivelSeguridad::withCount(['personal', 'componentes'])
            ->orderBy('id')
            ->get()
            ->map(function ($nivel) {
                return [
                    'id' => $nivel->id,
                    'nombre' => $nivel->nombre,
                    'color' => $nivel->color,
                    'descripcion' => $nivel->descripcion,
                    'is_active' => $nivel->is_active,
                    'personal_count' => $nivel->personal_count,
                    'componentes_count' => $nivel->componentes_count,
                ];
            });

        return response()->json(['success' => true, 'data' => $niveles]);
    }

    // Obtener niveles activos (para selects)
    public function activos(): JsonResponse
    {
        $niveles = NivelSeguridad::activos()
            ->orderBy('id')
            ->get(['id', 'nombre', 'color']);

        return response()->json([
            'success' => true,
            'data' => $niveles->map(fn($n) => [
                'id' => $n->id,
                'nombre' => $n->nombre,
                'color' => $n->color,
            ])
        ]);
    }

    // Obtener un nivel por ID
    public function show($id): JsonResponse
    {
        $nivel = NivelSeguridad::withCount(['personal', 'componentes'])->find($id);
        
        if (!$nivel) {
            return response()->json(['success' => false, 'message' => 'Nivel no encontrado'], 404);
        }

        return response()->json(['success' => true, 'data' => $nivel]);
    }

    // Crear nuevo nivel
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:50|unique:niveles_seguridad,nombre',
            'color' => 'nullable|string|max:7',
            'descripcion' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $nivel = NivelSeguridad::create([
            'nombre' => $validated['nombre'],
            'color' => $validated['color'] ?? '#6b7280',
            'descripcion' => $validated['descripcion'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Nivel de seguridad creado',
            'data' => $nivel
        ], 201);
    }

    // Actualizar nivel
    public function update(Request $request, $id): JsonResponse
    {
        $nivel = NivelSeguridad::find($id);
        
        if (!$nivel) {
            return response()->json(['success' => false, 'message' => 'Nivel no encontrado'], 404);
        }

        $validated = $request->validate([
            'nombre' => 'sometimes|required|string|max:50|unique:niveles_seguridad,nombre,' . $id,
            'color' => 'nullable|string|max:7',
            'descripcion' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $nivel->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Nivel de seguridad actualizado',
            'data' => $nivel
        ]);
    }

    // Eliminar nivel
    public function destroy($id): JsonResponse
    {
        $nivel = NivelSeguridad::withCount('personal')->find($id);
        
        if (!$nivel) {
            return response()->json(['success' => false, 'message' => 'Nivel no encontrado'], 404);
        }

        if ($nivel->personal_count > 0) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar: hay empleados asignados a este nivel'
            ], 409);
        }

        $nivel->delete();

        return response()->json([
            'success' => true,
            'message' => 'Nivel de seguridad eliminado'
        ]);
    }

    // Obtener miembros de un nivel
    public function miembros($id): JsonResponse
    {
        $nivel = NivelSeguridad::find($id);
        
        if (!$nivel) {
            return response()->json(['success' => false, 'message' => 'Nivel no encontrado'], 404);
        }

        $miembros = Personal::where('nivel_seguridad_id', $id)
            ->select('id', 'nombre', 'apellido_paterno', 'apellido_materno', 'ci', 'cargo_id')
            ->with('cargo:id,nombre')
            ->get();

        return response()->json(['success' => true, 'data' => $miembros]);
    }

    // Agregar miembro(s) a un nivel
    public function addMiembro(Request $request, $id): JsonResponse
    {
        $nivel = NivelSeguridad::find($id);
        
        if (!$nivel) {
            return response()->json(['success' => false, 'message' => 'Nivel no encontrado'], 404);
        }

        $validated = $request->validate([
            'persona_ids' => 'required|array',
            'persona_ids.*' => 'exists:personal,id',
        ]);

        Personal::whereIn('id', $validated['persona_ids'])
            ->update(['nivel_seguridad_id' => $id]);

        return response()->json([
            'success' => true,
            'message' => 'Miembro(s) agregado(s) al nivel'
        ]);
    }

    // Quitar miembro de un nivel
    public function removeMiembro($id, $personaId): JsonResponse
    {
        $persona = Personal::where('id', $personaId)
            ->where('nivel_seguridad_id', $id)
            ->first();
        
        if (!$persona) {
            return response()->json(['success' => false, 'message' => 'Persona no encontrada en este nivel'], 404);
        }

        $persona->update(['nivel_seguridad_id' => null]);

        return response()->json([
            'success' => true,
            'message' => 'Miembro removido del nivel'
        ]);
    }

    // Obtener empleados disponibles (sin nivel asignado)
    public function empleadosDisponibles($id): JsonResponse
    {
        $disponibles = Personal::whereNull('nivel_seguridad_id')
            ->select('id', 'nombre', 'apellido_paterno', 'apellido_materno', 'ci', 'cargo_id', 'estado')
            ->with('cargo:id,nombre')
            ->get();

        return response()->json(['success' => true, 'data' => $disponibles]);
    }
}
