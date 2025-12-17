<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login del usuario - retorna token de Sanctum
     */
    public function login(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'password' => 'required',
        ]);

        $user = User::where('name', $request->name)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'error' => 'Las credenciales no son correctas'
            ], 401);
        }

        // Eliminar tokens anteriores (opcional, para seguridad)
        $user->tokens()->delete();

        // Crear nuevo token
        $token = $user->createToken('auth-token')->plainTextToken;

        // Obtener Roles
        $roles = $user->roles()->pluck('slug');

        // Obtener Menús (Union de menús de todos los roles)
        $menus = \App\Models\Menu::whereHas('roles', function($q) use ($user) {
                $q->whereIn('roles.id', $user->roles->pluck('id'));
            })
            ->where('is_active', true)
            ->whereNull('parent_id') // Obtener solo padres 
            ->with(['children' => function($q) use ($user) {
                // Filtrar hijos que también estén permitidos para el usuario
                $q->whereHas('roles', function($q2) use ($user) {
                    $q2->whereIn('roles.id', $user->roles->pluck('id'));
                })
                ->where('is_active', true)
                ->orderBy('order');
            }])
            ->orderBy('order')
            ->get();

        // Formatear menús para el frontend
        // TODO: Mover esto a un Resource o Service si crece
        $formattedMenus = $menus->map(function($menu) {
            return [
                'id' => $menu->id,
                'title' => $menu->name, // Frontend usa descripcion/title
                'icon' => $menu->icon,
                'module' => $menu->module,
                'children' => $menu->children->map(function($sub) {
                    return [
                        'id' => $sub->id,
                        'title' => $sub->name,
                        'url' => $sub->url, // Frontend usa rutaReact/url
                        'icon' => $sub->icon,
                    ];
                })
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $roles,
                ],
                'token' => $token,
                'menus' => $formattedMenus
            ]
        ]);
    }

    /**
     * Logout - elimina el token actual
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sesión cerrada exitosamente'
        ]);
    }

    /**
     * Obtener usuario autenticado
     */
    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => $request->user()
        ]);
    }

    /**
     * Registrar nuevo usuario (opcional)
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ],
                'token' => $token
            ]
        ], 201);
    }
}
