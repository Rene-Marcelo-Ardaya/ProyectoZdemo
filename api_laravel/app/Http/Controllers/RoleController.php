<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\Menu;
use App\Models\Permission;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    /**
     * Listar roles con sus menús asignados
     */
    public function index()
    {
        $roles = Role::withCount('menus', 'permissions', 'users')
            ->get()
            ->map(function($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'slug' => $role->slug,
                    'description' => $role->description,
                    'is_active' => $role->is_active,
                    'menus_count' => $role->menus_count,
                    'permissions_count' => $role->permissions_count,
                    'users_count' => $role->users_count,
                    'created_at' => optional($role->created_at)->format('Y-m-d H:i')
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $roles
        ]);
    }

    /**
     * Obtener un rol con sus menús y permisos
     */
    public function show($id)
    {
        $role = Role::with(['menus', 'permissions'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $role->id,
                'name' => $role->name,
                'slug' => $role->slug,
                'description' => $role->description,
                'is_active' => $role->is_active,
                'menu_ids' => $role->menus->pluck('id'),
                'permission_ids' => $role->permissions->pluck('id')
            ]
        ]);
    }

    /**
     * Crear nuevo rol
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:roles,slug',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'menu_ids' => 'array',
            'menu_ids.*' => 'exists:menus,id'
        ]);

        $role = Role::create([
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        // Asignar menús
        if (!empty($validated['menu_ids'])) {
            $role->menus()->attach($validated['menu_ids']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Rol creado correctamente',
            'data' => $role
        ]);
    }

    /**
     * Actualizar rol
     */
    public function update(Request $request, $id)
    {
        $role = Role::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:roles,slug,' . $role->id,
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'menu_ids' => 'array',
            'menu_ids.*' => 'exists:menus,id'
        ]);

        $role->update([
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        // Sincronizar menús
        if (isset($validated['menu_ids'])) {
            $role->menus()->sync($validated['menu_ids']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Rol actualizado correctamente'
        ]);
    }

    /**
     * Eliminar rol
     */
    public function destroy($id)
    {
        $role = Role::findOrFail($id);

        // Verificar que no tenga usuarios asignados
        if ($role->users()->count() > 0) {
            return response()->json([
                'success' => false,
                'error' => 'No se puede eliminar un rol con usuarios asignados'
            ], 400);
        }

        $role->delete();

        return response()->json([
            'success' => true,
            'message' => 'Rol eliminado correctamente'
        ]);
    }

    /**
     * Listar todos los menús disponibles (para asignar a roles)
     */
    public function getMenus()
    {
        $menus = Menu::whereNull('parent_id')
            ->with('children')
            ->orderBy('order')
            ->get()
            ->map(function($menu) {
                return [
                    'id' => $menu->id,
                    'name' => $menu->name,
                    'icon' => $menu->icon,
                    'children' => $menu->children->map(function($child) {
                        return [
                            'id' => $child->id,
                            'name' => $child->name,
                            'url' => $child->url,
                            'icon' => $child->icon
                        ];
                    })
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $menus
        ]);
    }
}
