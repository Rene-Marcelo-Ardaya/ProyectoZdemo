<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Crear Roles
        $adminRoleId = \Illuminate\Support\Facades\DB::table('roles')->insertGetId([
            'name' => 'Super Admin',
            'slug' => 'super-admin',
            'description' => 'Acceso total al sistema',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        \Illuminate\Support\Facades\DB::table('roles')->insert([
            'name' => 'Usuario',
            'slug' => 'user',
            'description' => 'Acceso limitado',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Crear Usuario Admin (o actualizar si existe)
        $user = User::firstOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name' => 'Administrador',
                'password' => bcrypt('password'), // Contraseña genérica
                'is_active' => true,
            ]
        );

        // 3. Asignar Rol al Usuario
        \Illuminate\Support\Facades\DB::table('role_user')->updateOrInsert(
            ['user_id' => $user->id, 'role_id' => $adminRoleId],
            []
        );

        // 4. Crear Menús Básicos (Sistemas)
        // Módulo Sistemas
        $sysMenuId = \Illuminate\Support\Facades\DB::table('menus')->insertGetId([
            'name' => 'Sistemas',
            'icon' => 'Settings', // Icono Lucide
            'order' => 99,
            'module' => 'Sistemas',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Submenú: Usuarios
        \Illuminate\Support\Facades\DB::table('menus')->insert([
            'name' => 'Usuarios',
            'url' => '/sistemas/usuarios',
            'icon' => 'Users',
            'parent_id' => $sysMenuId,
            'order' => 1,
            'module' => 'Sistemas',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Submenú: Control de Accesos
        \Illuminate\Support\Facades\DB::table('menus')->insert([
            'name' => 'Control de Accesos',
            'url' => '/sistemas/accesos',
            'icon' => 'Lock',
            'parent_id' => $sysMenuId,
            'order' => 2,
            'module' => 'Sistemas',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        
        // Módulo: Comunicación (Chat)
        $comMenuId = \Illuminate\Support\Facades\DB::table('menus')->insertGetId([
            'name' => 'Comunicación',
            'icon' => 'MessageCircle',
            'order' => 10,
            'module' => 'Chat',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Submenú: Chat
        \Illuminate\Support\Facades\DB::table('menus')->insert([
            'name' => 'Chat',
            'url' => '/chat',
            'icon' => 'MessageCircle',
            'parent_id' => $comMenuId,
            'order' => 1,
            'module' => 'Chat',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        
        // Asignar menus al rol admin (Ver todo)
        $menus = \Illuminate\Support\Facades\DB::table('menus')->pluck('id');
        foreach($menus as $menuId) {
             \Illuminate\Support\Facades\DB::table('menu_role')->insertOrIgnore([
                'role_id' => $adminRoleId,
                'menu_id' => $menuId
             ]);
        }
    }
}
