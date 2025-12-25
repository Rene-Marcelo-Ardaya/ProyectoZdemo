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
        $personal = Persona::with(['users:id,name,email', 'whatsapp', 'cargo'])
            ->orderBy('apellido_paterno')
            ->orderBy('apellido_materno')
            ->orderBy('nombre')
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'codigo_empleado' => $p->codigo_empleado,
                    'nombre' => $p->nombre,
                    'apellido_paterno' => $p->apellido_paterno,
                    'apellido_materno' => $p->apellido_materno,
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
                    // Datos laborales
                    'cargo_id' => $p->cargo_id,
                    'cargo' => $p->cargo ? [
                        'id' => $p->cargo->id,
                        'nombre' => $p->cargo->nombre,
                    ] : null,
                    'fecha_ingreso' => $p->fecha_ingreso?->format('Y-m-d'),
                    'fecha_salida' => $p->fecha_salida?->format('Y-m-d'),
                    'salario' => $p->salario,
                    'tipo_contrato' => $p->tipo_contrato,
                    'estado_laboral' => $p->estado_laboral,
                    'antiguedad' => $p->antiguedad,
                    // Estado
                    'is_active' => $p->is_active,
                    'notas' => $p->notas,
                    'users' => $p->users->map(fn($u) => [
                        'id' => $u->id,
                        'name' => $u->name,
                        'email' => $u->email,
                    ]),
                    'whatsapp' => $p->whatsapp ? [
                        'status' => $p->whatsapp->estatus,
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
        $persona = Persona::with(['users:id,name,email', 'cargo'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $persona->id,
                'codigo_empleado' => $persona->codigo_empleado,
                'nombre' => $persona->nombre,
                'apellido_paterno' => $persona->apellido_paterno,
                'apellido_materno' => $persona->apellido_materno,
                'ci' => $persona->ci,
                'fecha_nacimiento' => $persona->fecha_nacimiento?->format('Y-m-d'),
                'genero' => $persona->genero,
                'codigo_pais' => $persona->codigo_pais,
                'celular' => $persona->celular,
                'email_personal' => $persona->email_personal,
                'direccion' => $persona->direccion,
                'ciudad' => $persona->ciudad,
                // Datos laborales
                'cargo_id' => $persona->cargo_id,
                'fecha_ingreso' => $persona->fecha_ingreso?->format('Y-m-d'),
                'fecha_salida' => $persona->fecha_salida?->format('Y-m-d'),
                'salario' => $persona->salario,
                'tipo_contrato' => $persona->tipo_contrato,
                'estado_laboral' => $persona->estado_laboral,
                // Estado
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
            'codigo_empleado' => 'nullable|string|max:20|unique:personal,codigo_empleado',
            'nombre' => 'required|string|max:100',
            'apellido_paterno' => 'required|string|max:100',
            'apellido_materno' => 'nullable|string|max:100',
            'ci' => 'nullable|string|max:20|unique:personal,ci',
            'fecha_nacimiento' => 'nullable|date',
            'genero' => 'nullable|in:M,F,O',
            'codigo_pais' => 'nullable|string|max:5',
            'celular' => 'nullable|string|max:20',
            'email_personal' => 'nullable|email|max:150',
            'direccion' => 'nullable|string',
            'ciudad' => 'nullable|string|max:100',
            // Datos laborales
            'cargo_id' => 'nullable|exists:cargos,id',
            'fecha_ingreso' => 'nullable|date',
            'fecha_salida' => 'nullable|date|after_or_equal:fecha_ingreso',
            'salario' => 'nullable|numeric|min:0',
            'tipo_contrato' => 'nullable|string|max:50',
            'estado_laboral' => 'nullable|in:activo,inactivo',
            // Estado
            'is_active' => 'boolean',
            'notas' => 'nullable|string',
            'user_ids' => 'array',
            'user_ids.*' => 'exists:users,id',
        ]);

        $persona = Persona::create([
            'codigo_empleado' => $validated['codigo_empleado'] ?? null,
            'nombre' => $validated['nombre'],
            'apellido_paterno' => $validated['apellido_paterno'],
            'apellido_materno' => $validated['apellido_materno'] ?? null,
            'ci' => $validated['ci'] ?? null,
            'fecha_nacimiento' => $validated['fecha_nacimiento'] ?? null,
            'genero' => $validated['genero'] ?? null,
            'codigo_pais' => $validated['codigo_pais'] ?? '591',
            'celular' => $validated['celular'] ?? null,
            'email_personal' => $validated['email_personal'] ?? null,
            'direccion' => $validated['direccion'] ?? null,
            'ciudad' => $validated['ciudad'] ?? null,
            // Datos laborales
            'cargo_id' => $validated['cargo_id'] ?? null,
            'fecha_ingreso' => $validated['fecha_ingreso'] ?? null,
            'fecha_salida' => $validated['fecha_salida'] ?? null,
            'salario' => $validated['salario'] ?? null,
            'tipo_contrato' => $validated['tipo_contrato'] ?? null,
            'estado_laboral' => $validated['estado_laboral'] ?? 'activo',
            // Estado
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
            'data' => $persona->load(['users', 'cargo'])
        ], 201);
    }

    /**
     * Actualizar personal
     */
    public function update(Request $request, $id): JsonResponse
    {
        $persona = Persona::findOrFail($id);

        $validated = $request->validate([
            'codigo_empleado' => 'nullable|string|max:20|unique:personal,codigo_empleado,' . $persona->id,
            'nombre' => 'required|string|max:100',
            'apellido_paterno' => 'required|string|max:100',
            'apellido_materno' => 'nullable|string|max:100',
            'ci' => 'nullable|string|max:20|unique:personal,ci,' . $persona->id,
            'fecha_nacimiento' => 'nullable|date',
            'genero' => 'nullable|in:M,F,O',
            'codigo_pais' => 'nullable|string|max:5',
            'celular' => 'nullable|string|max:20',
            'email_personal' => 'nullable|email|max:150',
            'direccion' => 'nullable|string',
            'ciudad' => 'nullable|string|max:100',
            // Datos laborales
            'cargo_id' => 'nullable|exists:cargos,id',
            'fecha_ingreso' => 'nullable|date',
            'fecha_salida' => 'nullable|date|after_or_equal:fecha_ingreso',
            'salario' => 'nullable|numeric|min:0',
            'tipo_contrato' => 'nullable|string|max:50',
            'estado_laboral' => 'nullable|in:activo,inactivo',
            // Estado
            'is_active' => 'boolean',
            'notas' => 'nullable|string',
            'user_ids' => 'array',
            'user_ids.*' => 'exists:users,id',
        ]);

        $persona->update([
            'codigo_empleado' => $validated['codigo_empleado'] ?? null,
            'nombre' => $validated['nombre'],
            'apellido_paterno' => $validated['apellido_paterno'],
            'apellido_materno' => $validated['apellido_materno'] ?? null,
            'ci' => $validated['ci'] ?? null,
            'fecha_nacimiento' => $validated['fecha_nacimiento'] ?? null,
            'genero' => $validated['genero'] ?? null,
            'codigo_pais' => $validated['codigo_pais'] ?? '591',
            'celular' => $validated['celular'] ?? null,
            'email_personal' => $validated['email_personal'] ?? null,
            'direccion' => $validated['direccion'] ?? null,
            'ciudad' => $validated['ciudad'] ?? null,
            // Datos laborales
            'cargo_id' => $validated['cargo_id'] ?? null,
            'fecha_ingreso' => $validated['fecha_ingreso'] ?? null,
            'fecha_salida' => $validated['fecha_salida'] ?? null,
            'salario' => $validated['salario'] ?? null,
            'tipo_contrato' => $validated['tipo_contrato'] ?? null,
            'estado_laboral' => $validated['estado_laboral'] ?? 'activo',
            // Estado
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
     * Eliminar personal (soft delete)
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

