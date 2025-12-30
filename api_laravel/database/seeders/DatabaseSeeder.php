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
        // 1. Crear Roles (idempotente)
        \Illuminate\Support\Facades\DB::table('roles')->updateOrInsert(
            ['slug' => 'super-admin'],
            [
                'name' => 'Super Admin',
                'description' => 'Acceso total al sistema',
                'is_active' => true,
                'session_timeout_minutes' => null, // Sin límite
                'updated_at' => now(),
            ]
        );
        $adminRoleId = \Illuminate\Support\Facades\DB::table('roles')->where('slug', 'super-admin')->value('id');

        \Illuminate\Support\Facades\DB::table('roles')->updateOrInsert(
            ['slug' => 'user'],
            [
                'name' => 'Usuario',
                'description' => 'Acceso limitado',
                'is_active' => true,
                'session_timeout_minutes' => 60, // 1 hora
                'updated_at' => now(),
            ]
        );

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

        // 4. Crear Menús Básicos (Sistemas) - Idempotente
        // Módulo Sistemas
        \Illuminate\Support\Facades\DB::table('menus')->updateOrInsert(
            ['name' => 'Sistemas', 'parent_id' => null],
            [
                'icon' => 'Settings',
                'order' => 99,
                'module' => 'Sistemas',
                'is_active' => true,
                'updated_at' => now(),
            ]
        );
        $sysMenuId = \Illuminate\Support\Facades\DB::table('menus')->where('name', 'Sistemas')->whereNull('parent_id')->value('id');

        // Submenú: Usuarios
        \Illuminate\Support\Facades\DB::table('menus')->updateOrInsert(
            ['url' => '/sistemas/usuarios'],
            [
                'name' => 'Usuarios',
                'icon' => 'Users',
                'parent_id' => $sysMenuId,
                'order' => 1,
                'module' => 'Sistemas',
                'is_active' => true,
                'updated_at' => now(),
            ]
        );

        // Submenú: Control de Accesos
        \Illuminate\Support\Facades\DB::table('menus')->updateOrInsert(
            ['url' => '/sistemas/accesos'],
            [
                'name' => 'Control de Accesos',
                'icon' => 'Lock',
                'parent_id' => $sysMenuId,
                'order' => 2,
                'module' => 'Sistemas',
                'is_active' => true,
                'updated_at' => now(),
            ]
        );

        // Submenú: Configuración
        \Illuminate\Support\Facades\DB::table('menus')->updateOrInsert(
            ['url' => '/sistemas/configuracion'],
            [
                'name' => 'Configuración',
                'icon' => 'Wrench',
                'parent_id' => $sysMenuId,
                'order' => 3,
                'module' => 'Sistemas',
                'is_active' => true,
                'updated_at' => now(),
            ]
        );

        // Submenú: Administración de Menús (Solo Superusuarios)
        \Illuminate\Support\Facades\DB::table('menus')->updateOrInsert(
            ['url' => '/sistemas/menus'],
            [
                'name' => 'Administración de Menús',
                'icon' => 'FolderTree',
                'parent_id' => $sysMenuId,
                'order' => 4,
                'module' => 'Sistemas',
                'is_active' => true,
                'updated_at' => now(),
            ]
        );
        
        // Módulo: Comunicación (Chat)
        \Illuminate\Support\Facades\DB::table('menus')->updateOrInsert(
            ['name' => 'Comunicación', 'parent_id' => null],
            [
                'icon' => 'MessageCircle',
                'order' => 10,
                'module' => 'Chat',
                'is_active' => true,
                'updated_at' => now(),
            ]
        );
        $comMenuId = \Illuminate\Support\Facades\DB::table('menus')->where('name', 'Comunicación')->whereNull('parent_id')->value('id');

        // Submenú: Chat
        \Illuminate\Support\Facades\DB::table('menus')->updateOrInsert(
            ['url' => '/chat'],
            [
                'name' => 'Chat',
                'icon' => 'MessageCircle',
                'parent_id' => $comMenuId,
                'order' => 1,
                'module' => 'Chat',
                'is_active' => true,
                'updated_at' => now(),
            ]
        );
        
        // Asignar menus al rol admin (Ver todo)
        $menus = \Illuminate\Support\Facades\DB::table('menus')->pluck('id');
        foreach($menus as $menuId) {
             \Illuminate\Support\Facades\DB::table('menu_role')->insertOrIgnore([
                'role_id' => $adminRoleId,
                'menu_id' => $menuId
             ]);
        }

        // =============================================
        // LLAMAR A TODOS LOS SEEDERS EN ORDEN
        // =============================================
        
        // 1. DATOS BASE (sin dependencias de menús)
        $this->call([
            DieselBasicosSeeder::class,        // Divisiones, Trabajos, Ubicaciones, Tanques, Máquinas
            DieselExtrasSeeder::class,         // Proveedores, Tipos de Pago, Motivos Ajuste
            DieselMovimientosSeeder::class,    // Tipos de Movimiento
            NivelesSeguridadSeeder::class,     // Niveles de seguridad
        ]);

        // 2. MENÚS (dependen de que existan los menús base creados arriba)
        $this->call([
            DieselMenusSeeder::class,           // Menú padre "Configuraciones Diesel" + submenús
            DieselMenusExtrasSeeder::class,     // Submenús: Ubicaciones, Tanques, Máquinas (depende de DieselMenusSeeder)
            DieselMenusMovimientosSeeder::class,// Submenú: Tipos de Movimiento + Menú "Operaciones Diesel"
            NivelesSeguridadMenuSeeder::class,  // Menú "Grupos de Seguridad" bajo Sistemas
        ]);

        // 3. CONFIGURACIÓN DEL SISTEMA
        $this->call(SettingSeeder::class);

        // 4. ASIGNACIÓN FINAL DE PERMISOS (debe ir AL FINAL)
        $this->call(AssignMenusToSuperAdminSeeder::class);  // Asigna TODOS los menús al super-admin
    }
}
