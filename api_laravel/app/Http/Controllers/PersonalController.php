<?php

namespace App\Http\Controllers;

use App\Models\Persona;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PersonalController extends Controller
{
    /**
     * Listar todo el personal
     */
    public function index(): JsonResponse
    {
        $personal = Persona::with(['users:id,name,email', 'whatsapp'])
            ->orderBy('apellidos')
            ->orderBy('nombre')
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'nombre' => $p->nombre,
                    'apellidos' => $p->apellidos,
                    'nombre_completo' => $p->nombre_completo,
                    'ci' => $p->ci,
                    'fecha_nacimiento' => $p->fecha_nacimiento?->format('Y-m-d'),
                    'genero' => $p->genero,
                    'codigo_pais' => $p->codigo_pais,
                    'celular' => $p->celular,
                    'celular_completo' => $p->celular_completo,
                    'email_personal' => $p->email_personal,
                    'direccion' => $p->direccion,
                    'ciudad' => $p->ciudad,
                    'is_active' => $p->is_active,
                    'notas' => $p->notas,
                    'users' => $p->users->map(fn($u) => [
                        'id' => $u->id,
                        'name' => $u->name,
                        'email' => $u->email,
                    ]),
                    'whatsapp' => $p->whatsapp ? [
                        'status' => $p->whatsapp->status,
                        'verified_at' => $p->whatsapp->verified_at?->format('Y-m-d H:i'),
                        'whatsapp_jid' => $p->whatsapp->whatsapp_jid,
                    ] : null,
                    'created_at' => $p->created_at?->format('Y-m-d H:i'),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $personal
        ]);
    }

    /**
     * Obtener un registro de personal
     */
    public function show($id): JsonResponse
    {
        $persona = Persona::with('users:id,name,email')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $persona->id,
                'nombre' => $persona->nombre,
                'apellidos' => $persona->apellidos,
                'ci' => $persona->ci,
                'fecha_nacimiento' => $persona->fecha_nacimiento?->format('Y-m-d'),
                'genero' => $persona->genero,
                'codigo_pais' => $persona->codigo_pais,
                'celular' => $persona->celular,
                'email_personal' => $persona->email_personal,
                'direccion' => $persona->direccion,
                'ciudad' => $persona->ciudad,
                'is_active' => $persona->is_active,
                'notas' => $persona->notas,
                'user_ids' => $persona->users->pluck('id'),
            ]
        ]);
    }

    /**
     * Crear nuevo personal
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:100',
            'apellidos' => 'required|string|max:150',
            'ci' => 'nullable|string|max:20|unique:personal,ci',
            'fecha_nacimiento' => 'nullable|date',
            'genero' => 'nullable|in:M,F,O',
            'codigo_pais' => 'nullable|string|max:5',
            'celular' => 'nullable|string|max:20',
            'email_personal' => 'nullable|email|max:150',
            'direccion' => 'nullable|string',
            'ciudad' => 'nullable|string|max:100',
            'is_active' => 'boolean',
            'notas' => 'nullable|string',
            'user_ids' => 'array',
            'user_ids.*' => 'exists:users,id',
        ]);

        $persona = Persona::create([
            'nombre' => $validated['nombre'],
            'apellidos' => $validated['apellidos'],
            'ci' => $validated['ci'] ?? null,
            'fecha_nacimiento' => $validated['fecha_nacimiento'] ?? null,
            'genero' => $validated['genero'] ?? null,
            'codigo_pais' => $validated['codigo_pais'] ?? '591',
            'celular' => $validated['celular'] ?? null,
            'email_personal' => $validated['email_personal'] ?? null,
            'direccion' => $validated['direccion'] ?? null,
            'ciudad' => $validated['ciudad'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'notas' => $validated['notas'] ?? null,
        ]);

        // Vincular usuarios
        if (!empty($validated['user_ids'])) {
            $persona->users()->attach($validated['user_ids']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Personal creado correctamente',
            'data' => $persona->load('users')
        ], 201);
    }

    /**
     * Actualizar personal
     */
    public function update(Request $request, $id): JsonResponse
    {
        $persona = Persona::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'required|string|max:100',
            'apellidos' => 'required|string|max:150',
            'ci' => 'nullable|string|max:20|unique:personal,ci,' . $persona->id,
            'fecha_nacimiento' => 'nullable|date',
            'genero' => 'nullable|in:M,F,O',
            'codigo_pais' => 'nullable|string|max:5',
            'celular' => 'nullable|string|max:20',
            'email_personal' => 'nullable|email|max:150',
            'direccion' => 'nullable|string',
            'ciudad' => 'nullable|string|max:100',
            'is_active' => 'boolean',
            'notas' => 'nullable|string',
            'user_ids' => 'array',
            'user_ids.*' => 'exists:users,id',
        ]);

        $persona->update([
            'nombre' => $validated['nombre'],
            'apellidos' => $validated['apellidos'],
            'ci' => $validated['ci'] ?? null,
            'fecha_nacimiento' => $validated['fecha_nacimiento'] ?? null,
            'genero' => $validated['genero'] ?? null,
            'codigo_pais' => $validated['codigo_pais'] ?? '591',
            'celular' => $validated['celular'] ?? null,
            'email_personal' => $validated['email_personal'] ?? null,
            'direccion' => $validated['direccion'] ?? null,
            'ciudad' => $validated['ciudad'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'notas' => $validated['notas'] ?? null,
        ]);

        // Sincronizar usuarios
        if (isset($validated['user_ids'])) {
            $persona->users()->sync($validated['user_ids']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Personal actualizado correctamente'
        ]);
    }

    /**
     * Eliminar personal
     */
    public function destroy($id): JsonResponse
    {
        $persona = Persona::findOrFail($id);
        $persona->delete();

        return response()->json([
            'success' => true,
            'message' => 'Personal eliminado correctamente'
        ]);
    }

    /**
     * Listar usuarios disponibles para vincular
     */
    public function getAvailableUsers(): JsonResponse
    {
        $users = User::select('id', 'name', 'email')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }
}
