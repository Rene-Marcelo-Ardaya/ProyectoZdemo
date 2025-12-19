<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    /**
     * Verificar si el usuario es superadmin
     */
    private function isSuperAdmin($user)
    {
        if (!$user) return false;
        
        // Verificar por slug O nombre que contenga "admin" o "super"
        return $user->roles()
            ->where(function($q) {
                $q->where('slug', 'super-admin')
                  ->orWhere('slug', 'admin')
                  ->orWhere('name', 'like', '%Admin%')
                  ->orWhere('name', 'like', '%Super%');
            })
            ->exists();
    }

    /**
     * Listar todos los menús con estructura jerárquica
     */
    public function index(Request $request)
    {
        // Verificar acceso de superadmin
        if (!$this->isSuperAdmin($request->user())) {
            return response()->json([
                'success' => false,
                'error' => 'Acceso denegado. Solo superusuarios pueden acceder.'
            ], 403);
        }

        $menus = Menu::whereNull('parent_id')
            ->with('children')
            ->orderBy('order')
            ->get()
            ->map(function($menu) {
                return [
                    'id' => $menu->id,
                    'name' => $menu->name,
                    'url' => $menu->url,
                    'icon' => $menu->icon,
                    'order' => $menu->order,
                    'module' => $menu->module,
                    'is_active' => $menu->is_active,
                    'parent_id' => $menu->parent_id,
                    'children_count' => $menu->children->count(),
                    'roles_count' => $menu->roles()->count(),
                    'children' => $menu->children->map(function($child) {
                        return [
                            'id' => $child->id,
                            'name' => $child->name,
                            'url' => $child->url,
                            'icon' => $child->icon,
                            'order' => $child->order,
                            'module' => $child->module,
                            'is_active' => $child->is_active,
                            'parent_id' => $child->parent_id,
                            'roles_count' => $child->roles()->count(),
                        ];
                    })
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $menus
        ]);
    }

    /**
     * Obtener un menú específico
     */
    public function show(Request $request, $id)
    {
        if (!$this->isSuperAdmin($request->user())) {
            return response()->json([
                'success' => false,
                'error' => 'Acceso denegado'
            ], 403);
        }

        $menu = Menu::with(['children', 'parent', 'roles'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $menu->id,
                'name' => $menu->name,
                'url' => $menu->url,
                'icon' => $menu->icon,
                'order' => $menu->order,
                'module' => $menu->module,
                'is_active' => $menu->is_active,
                'parent_id' => $menu->parent_id,
                'parent_name' => $menu->parent?->name,
                'children' => $menu->children,
                'role_ids' => $menu->roles->pluck('id')
            ]
        ]);
    }

    /**
     * Obtener lista de menús padres (para combo de selección)
     */
    public function getParentMenus(Request $request)
    {
        if (!$this->isSuperAdmin($request->user())) {
            return response()->json([
                'success' => false,
                'error' => 'Acceso denegado'
            ], 403);
        }

        $menus = Menu::whereNull('parent_id')
            ->orderBy('order')
            ->get(['id', 'name', 'icon', 'module']);

        return response()->json([
            'success' => true,
            'data' => $menus
        ]);
    }

    /**
     * Crear un nuevo menú
     */
    public function store(Request $request)
    {
        if (!$this->isSuperAdmin($request->user())) {
            return response()->json([
                'success' => false,
                'error' => 'Acceso denegado'
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'url' => 'nullable|string|max:255',
            'icon' => 'nullable|string|max:255',
            'parent_id' => 'nullable|exists:menus,id',
            'order' => 'integer',
            'module' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        // Si tiene parent_id, heredar el módulo del padre
        if (!empty($validated['parent_id'])) {
            $parent = Menu::find($validated['parent_id']);
            if ($parent && empty($validated['module'])) {
                $validated['module'] = $parent->module;
            }
        }

        $menu = Menu::create([
            'name' => $validated['name'],
            'url' => $validated['url'] ?? null,
            'icon' => $validated['icon'] ?? null,
            'parent_id' => $validated['parent_id'] ?? null,
            'order' => $validated['order'] ?? 0,
            'module' => $validated['module'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Menú creado correctamente',
            'data' => $menu
        ]);
    }

    /**
     * Actualizar un menú existente
     */
    public function update(Request $request, $id)
    {
        if (!$this->isSuperAdmin($request->user())) {
            return response()->json([
                'success' => false,
                'error' => 'Acceso denegado'
            ], 403);
        }

        $menu = Menu::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'url' => 'nullable|string|max:255',
            'icon' => 'nullable|string|max:255',
            'parent_id' => 'nullable|exists:menus,id',
            'order' => 'integer',
            'module' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        // Evitar que un menú sea su propio padre
        if (!empty($validated['parent_id']) && $validated['parent_id'] == $id) {
            return response()->json([
                'success' => false,
                'error' => 'Un menú no puede ser su propio padre'
            ], 400);
        }

        // Si tiene parent_id, heredar el módulo del padre
        if (!empty($validated['parent_id'])) {
            $parent = Menu::find($validated['parent_id']);
            if ($parent && empty($validated['module'])) {
                $validated['module'] = $parent->module;
            }
        }

        $menu->update([
            'name' => $validated['name'],
            'url' => $validated['url'] ?? null,
            'icon' => $validated['icon'] ?? null,
            'parent_id' => $validated['parent_id'] ?? null,
            'order' => $validated['order'] ?? $menu->order,
            'module' => $validated['module'] ?? $menu->module,
            'is_active' => $validated['is_active'] ?? $menu->is_active,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Menú actualizado correctamente'
        ]);
    }

    /**
     * Eliminar un menú
     */
    public function destroy(Request $request, $id)
    {
        if (!$this->isSuperAdmin($request->user())) {
            return response()->json([
                'success' => false,
                'error' => 'Acceso denegado'
            ], 403);
        }

        $menu = Menu::findOrFail($id);

        // Verificar que no tenga hijos
        if ($menu->children()->count() > 0) {
            return response()->json([
                'success' => false,
                'error' => 'No se puede eliminar un menú que tiene submenús. Elimine primero los submenús.'
            ], 400);
        }

        // Eliminar relaciones con roles
        $menu->roles()->detach();
        
        $menu->delete();

        return response()->json([
            'success' => true,
            'message' => 'Menú eliminado correctamente'
        ]);
    }

    /**
     * Obtener lista de iconos disponibles (Lucide)
     */
    public function getAvailableIcons()
    {
        // Lista de iconos Lucide más comunes para menús
        $icons = [
            'Home', 'Settings', 'Users', 'User', 'Lock', 'Shield',
            'Wrench', 'Cog', 'Menu', 'List', 'Grid', 'Folder',
            'File', 'FileText', 'Database', 'Server', 'Cloud',
            'MessageCircle', 'Mail', 'Bell', 'Calendar', 'Clock',
            'Search', 'Filter', 'Plus', 'Minus', 'Edit', 'Trash2',
            'Eye', 'EyeOff', 'Download', 'Upload', 'Share',
            'Link', 'ExternalLink', 'Bookmark', 'Star', 'Heart',
            'ShoppingCart', 'CreditCard', 'DollarSign', 'TrendingUp',
            'BarChart', 'PieChart', 'Activity', 'Zap', 'Award',
            'Package', 'Box', 'Archive', 'Briefcase', 'Building',
            'Map', 'MapPin', 'Navigation', 'Compass', 'Globe',
            'Phone', 'Smartphone', 'Tablet', 'Monitor', 'Laptop',
            'Printer', 'Camera', 'Image', 'Video', 'Music',
            'Play', 'Pause', 'Volume2', 'Mic', 'Headphones',
            'Wifi', 'Bluetooth', 'Battery', 'Power', 'RefreshCw',
            'RotateCcw', 'RotateCw', 'Shuffle', 'Repeat', 'Save',
            'Copy', 'Clipboard', 'CheckCircle', 'XCircle', 'AlertCircle',
            'Info', 'HelpCircle', 'Sun', 'Moon', 'Layers',
            'Layout', 'Sidebar', 'Square', 'Circle', 'Triangle',
            'Hash', 'AtSign', 'Terminal', 'Code', 'GitBranch',
            'Github', 'Gitlab', 'Chrome', 'Facebook', 'Twitter',
            'Linkedin', 'Instagram', 'Youtube', 'Truck', 'Tag', 'Tags'
        ];

        return response()->json([
            'success' => true,
            'data' => $icons
        ]);
    }
}
