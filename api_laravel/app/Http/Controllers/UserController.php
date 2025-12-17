<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Listar usuarios con sus roles
     */
    public function index()
    {
        $users = User::with('roles')->get()->map(function($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_active' => $user->is_active,
                'roles' => $user->roles->pluck('name')->join(', '), // String para mostrar en tabla
                'role_id' => $user->roles->first()?->id, // Para edición simple (asumiendo 1 rol principal)
                'created_at' => $user->created_at->format('Y-m-d H:i')
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    /**
     * Guardar nuevo usuario
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role_id' => 'required|exists:roles,id',
            'is_active' => 'boolean'
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'is_active' => $validated['is_active'] ?? true,
        ]);

        // Asignar rol
        $user->roles()->attach($validated['role_id']);

        return response()->json([
            'success' => true,
            'message' => 'Usuario creado correctamente',
            'data' => $user
        ]);
    }

    /**
     * Actualizar usuario
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            // Password es opcional en update
            'password' => 'nullable|string|min:6',
            'role_id' => 'required|exists:roles,id',
            'is_active' => 'boolean'
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }
        $user->is_active = $validated['is_active'];
        $user->save();

        // Sincronizar rol (reemplaza anteriores)
        $user->roles()->sync([$validated['role_id']]);

        return response()->json([
            'success' => true,
            'message' => 'Usuario actualizado correctamente'
        ]);
    }

    /**
     * Eliminar usuario
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        
        // Evitar auto-eliminación
        if ($user->id === auth()->id()) {
            return response()->json([
                'success' => false,
                'error' => 'No puedes eliminar tu propio usuario'
            ], 403);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Usuario eliminado correctamente'
        ]);
    }

    /**
     * Listar roles disponibles para el select
     */
    public function getRoles()
    {
        $roles = Role::where('is_active', true)
            ->get()
            ->map(function($role) {
                return [
                    'value' => $role->id,
                    'label' => $role->name
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $roles
        ]);
    }
}
