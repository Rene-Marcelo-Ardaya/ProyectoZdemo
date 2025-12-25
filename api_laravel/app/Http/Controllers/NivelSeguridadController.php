<?php

namespace App\Http\Controllers;

use App\Models\NivelSeguridad;
use App\Models\Persona;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NivelSeguridadController extends Controller
{
    /**
     * Listar todos los niveles de seguridad
     */
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
                    'created_at' => $nivel->created_at?->format('Y-m-d H:i'),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $niveles
        ]);
    }

    /**
     * Obtener un nivel específico
     */
    public function show($id): JsonResponse
    {
        $nivel = NivelSeguridad::withCount(['personal', 'componentes'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $nivel->id,
                'nombre' => $nivel->nombre,
                'color' => $nivel->color,
                'descripcion' => $nivel->descripcion,
                'is_active' => $nivel->is_active,
                'personal_count' => $nivel->personal_count,
                'componentes_count' => $nivel->componentes_count,
            ]
        ]);
    }

    /**
     * Crear nuevo nivel de seguridad
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:50',
            'color' => 'nullable|string|max:7',
            'descripcion' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $nivel = NivelSeguridad::create([
            'nombre' => $validated['nombre'],
            'color' => $validated['color'] ?? '#6b7280',
            'descripcion' => $validated['descripcion'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Nivel de seguridad creado correctamente',
            'data' => $nivel
        ], 201);
    }

    /**
     * Actualizar nivel de seguridad
     */
    public function update(Request $request, $id): JsonResponse
    {
        $nivel = NivelSeguridad::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'required|string|max:50',
            'color' => 'nullable|string|max:7',
            'descripcion' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $nivel->update([
            'nombre' => $validated['nombre'],
            'color' => $validated['color'] ?? '#6b7280',
            'descripcion' => $validated['descripcion'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Nivel de seguridad actualizado correctamente',
            'data' => $nivel
        ]);
    }

    /**
     * Eliminar nivel de seguridad
     */
    public function destroy($id): JsonResponse
    {
        $nivel = NivelSeguridad::withCount(['personal', 'componentes'])->findOrFail($id);

        if ($nivel->personal_count > 0) {
            return response()->json([
                'success' => false,
                'message' => "No se puede eliminar: el nivel tiene {$nivel->personal_count} empleado(s) asignado(s)"
            ], 422);
        }

        if ($nivel->componentes_count > 0) {
            return response()->json([
                'success' => false,
                'message' => "No se puede eliminar: el nivel tiene {$nivel->componentes_count} componente(s) asignado(s)"
            ], 422);
        }

        $nivel->delete();

        return response()->json([
            'success' => true,
            'message' => 'Nivel de seguridad eliminado correctamente'
        ]);
    }

    /**
     * Listar niveles activos (para selects/combos)
     */
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

    // ============================================
    // GESTIÓN DE MIEMBROS
    // ============================================

    /**
     * Listar miembros de un nivel de seguridad
     */
    public function miembros($id): JsonResponse
    {
        $nivel = NivelSeguridad::findOrFail($id);
        
        $miembros = Persona::where('nivel_seguridad_id', $id)
            ->with('cargo:id,nombre')
            ->orderBy('apellido_paterno')
            ->orderBy('nombre')
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'nombre_completo' => $p->nombre_completo,
                'cargo' => $p->cargo?->nombre,
                'is_active' => $p->is_active,
            ]);

        return response()->json([
            'success' => true,
            'data' => $miembros
        ]);
    }

    /**
     * Agregar miembro(s) a un nivel de seguridad
     */
    public function addMiembro(Request $request, $id): JsonResponse
    {
        $nivel = NivelSeguridad::findOrFail($id);

        $validated = $request->validate([
            'persona_ids' => 'required|array',
            'persona_ids.*' => 'exists:personal,id',
        ]);

        $count = Persona::whereIn('id', $validated['persona_ids'])
            ->update(['nivel_seguridad_id' => $id]);

        return response()->json([
            'success' => true,
            'message' => "{$count} empleado(s) agregado(s) al grupo"
        ]);
    }

    /**
     * Quitar un miembro de un nivel de seguridad
     */
    public function removeMiembro($id, $personaId): JsonResponse
    {
        $nivel = NivelSeguridad::findOrFail($id);
        $persona = Persona::where('id', $personaId)
            ->where('nivel_seguridad_id', $id)
            ->firstOrFail();

        $persona->update(['nivel_seguridad_id' => null]);

        return response()->json([
            'success' => true,
            'message' => 'Empleado removido del grupo'
        ]);
    }

    /**
     * Listar empleados disponibles (sin grupo asignado o de otros grupos)
     */
    public function empleadosDisponibles($id): JsonResponse
    {
        $empleados = Persona::where(function ($q) use ($id) {
                $q->whereNull('nivel_seguridad_id')
                  ->orWhere('nivel_seguridad_id', '!=', $id);
            })
            ->where('is_active', true)
            ->with('cargo:id,nombre')
            ->orderBy('apellido_paterno')
            ->orderBy('nombre')
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'nombre_completo' => $p->nombre_completo,
                'cargo' => $p->cargo?->nombre,
                'nivel_actual' => $p->nivelSeguridad?->nombre,
            ]);

        return response()->json([
            'success' => true,
            'data' => $empleados
        ]);
    }
}
