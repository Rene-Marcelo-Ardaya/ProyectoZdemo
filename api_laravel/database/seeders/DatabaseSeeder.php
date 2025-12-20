<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Crear Roles (idempotente)
        DB::table('roles')->updateOrInsert(
            ['slug' => 'super-admin'],
            [
                'name' => 'Super Admin',
                'description' => 'Acceso total al sistema',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
        $adminRoleId = DB::table('roles')->where('slug', 'super-admin')->value('id');

        DB::table('roles')->updateOrInsert(
            ['slug' => 'user'],
            [
                'name' => 'Usuario',
                'description' => 'Acceso limitado',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        // 2. Crear Usuario Admin (o actualizar si existe)
        $user = User::firstOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name' => 'Administrador',
                'password' => bcrypt('password'),
                'is_active' => true,
            ]
        );

        // 3. Asignar Rol al Usuario
        DB::table('role_user')->updateOrInsert(
            ['user_id' => $user->id, 'role_id' => $adminRoleId],
            []
        );

        // 4. Crear Menús Básicos (idempotente)
        // Módulo Sistemas
        DB::table('menus')->updateOrInsert(
            ['name' => 'Sistemas', 'parent_id' => null],
            [
                'icon' => 'Settings',
                'order' => 99,
                'module' => 'Sistemas',
                'is_active' => true,
                'updated_at' => now(),
            ]
        );
        $sysMenuId = DB::table('menus')->where('name', 'Sistemas')->whereNull('parent_id')->value('id');

        // Submenú: Usuarios
        DB::table('menus')->updateOrInsert(
            ['name' => 'Usuarios', 'parent_id' => $sysMenuId],
            [
                'url' => '/sistemas/usuarios',
                'icon' => 'Users',
                'order' => 1,
                'module' => 'Sistemas',
                'is_active' => true,
                'updated_at' => now(),
            ]
        );

        // Submenú: Control de Accesos
        DB::table('menus')->updateOrInsert(
            ['name' => 'Control de Accesos', 'parent_id' => $sysMenuId],
            [
                'url' => '/sistemas/accesos',
                'icon' => 'Lock',
                'order' => 2,
                'module' => 'Sistemas',
                'is_active' => true,
                'updated_at' => now(),
            ]
        );

        // Submenú: Configuración
        DB::table('menus')->updateOrInsert(
            ['name' => 'Configuración', 'parent_id' => $sysMenuId],
            [
                'url' => '/sistemas/configuracion',
                'icon' => 'Wrench',
                'order' => 3,
                'module' => 'Sistemas',
                'is_active' => true,
                'updated_at' => now(),
            ]
        );

        // Submenú: Administración de Menús
        DB::table('menus')->updateOrInsert(
            ['name' => 'Administración de Menús', 'parent_id' => $sysMenuId],
            [
                'url' => '/sistemas/menus',
                'icon' => 'FolderTree',
                'order' => 4,
                'module' => 'Sistemas',
                'is_active' => true,
                'updated_at' => now(),
            ]
        );
        
        // Módulo: Comunicación (Chat)
        DB::table('menus')->updateOrInsert(
            ['name' => 'Comunicación', 'parent_id' => null],
            [
                'icon' => 'MessageCircle',
                'order' => 10,
                'module' => 'Chat',
                'is_active' => true,
                'updated_at' => now(),
            ]
        );
        $comMenuId = DB::table('menus')->where('name', 'Comunicación')->whereNull('parent_id')->value('id');

        // Submenú: Chat
        DB::table('menus')->updateOrInsert(
            ['name' => 'Chat', 'parent_id' => $comMenuId],
            [
                'url' => '/chat',
                'icon' => 'MessageCircle',
                'order' => 1,
                'module' => 'Chat',
                'is_active' => true,
                'updated_at' => now(),
            ]
        );

        // Submenú: Instancias WhatsApp
        DB::table('menus')->updateOrInsert(
            ['name' => 'Instancias WhatsApp', 'parent_id' => $comMenuId],
            [
                'url' => '/comunicacion/instancias',
                'icon' => 'Smartphone',
                'order' => 2,
                'module' => 'Chat',
                'is_active' => true,
                'updated_at' => now(),
            ]
        );

        // Submenú: Mensajería
        DB::table('menus')->updateOrInsert(
            ['name' => 'Mensajería', 'parent_id' => $comMenuId],
            [
                'url' => '/comunicacion/mensajeria',
                'icon' => 'Send',
                'order' => 3,
                'module' => 'Chat',
                'is_active' => true,
                'updated_at' => now(),
            ]
        );

        // ==========================================
        // Módulo: RRHH (Recursos Humanos)
        // ==========================================
        DB::table('menus')->updateOrInsert(
            ['name' => 'RRHH', 'parent_id' => null],
            [
                'icon' => 'Users',
                'order' => 15,
                'module' => 'RRHH',
                'is_active' => true,
                'updated_at' => now(),
            ]
        );
        $rrhhMenuId = DB::table('menus')->where('name', 'RRHH')->whereNull('parent_id')->value('id');

        // Submenú: Personal
        DB::table('menus')->updateOrInsert(
            ['name' => 'Personal', 'parent_id' => $rrhhMenuId],
            [
                'url' => '/rrhh/personal',
                'icon' => 'UserCircle',
                'order' => 1,
                'module' => 'RRHH',
                'is_active' => true,
                'updated_at' => now(),
            ]
        );
        
        // Asignar menus al rol admin (Ver todo)
        $menus = DB::table('menus')->pluck('id');
        foreach($menus as $menuId) {
             DB::table('menu_role')->insertOrIgnore([
                'role_id' => $adminRoleId,
                'menu_id' => $menuId
             ]);
        }

        // Cargar configuraciones del sistema
        $this->call(SettingSeeder::class);
    }
}
