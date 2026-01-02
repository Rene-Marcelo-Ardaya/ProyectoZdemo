<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Broadcast;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\MenuController;

// Rutas públicas (sin autenticación)
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::get('/config/public', [SettingController::class, 'getPublic']); // Configuración pública para branding

// Rutas protegidas
Route::middleware(['auth:sanctum'])->group(function () {
    // Autenticación
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // Usuario (legacy)
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    // Broadcasting auth para Pusher
    Broadcast::routes();
    
    // Usuarios y Roles
    Route::get('/roles-list', [UserController::class, 'getRoles']);
    Route::get('/users/search', [ChatController::class, 'searchUsers']); // DEBE estar antes del apiResource
    Route::apiResource('users', UserController::class);

    // Gestión de Roles y Accesos
    Route::get('/menus-list', [RoleController::class, 'getMenus']);
    Route::apiResource('roles', RoleController::class);

    // Administración de Menús (Solo Superusuarios)
    Route::get('/menus/icons', [MenuController::class, 'getAvailableIcons']);
    Route::get('/menus/parents', [MenuController::class, 'getParentMenus']);
    Route::apiResource('menus', MenuController::class);

    // Configuración del Sistema (Branding)
    Route::get('/settings', [SettingController::class, 'index']);
    Route::put('/settings/{key}', [SettingController::class, 'update']);
    Route::post('/settings/{key}/upload', [SettingController::class, 'uploadImage']);
    Route::delete('/settings/{key}/image', [SettingController::class, 'deleteImage']);
    Route::put('/settings', [SettingController::class, 'bulkUpdate']);

    // Chat / Mensajería
    Route::get('/conversations', [ChatController::class, 'index']);
    Route::post('/conversations', [ChatController::class, 'createConversation']);
    Route::get('/conversations/{conversation}', [ChatController::class, 'show']);
    Route::post('/messages', [ChatController::class, 'store']);
    Route::post('/messages/read', [ChatController::class, 'markAsRead']);
    Route::post('/messages/typing', [ChatController::class, 'typing']);

    // RRHH - Cargos
    Route::get('/cargos/activos', [\App\Http\Controllers\CargoController::class, 'activos']);
    Route::apiResource('cargos', \App\Http\Controllers\CargoController::class);

    // RRHH - Personal
    Route::get('/personal/available-users', [\App\Http\Controllers\PersonalController::class, 'getAvailableUsers']);
    Route::apiResource('personal', \App\Http\Controllers\PersonalController::class);

    // WhatsApp Verification
    Route::prefix('personal/{personalId}/whatsapp')->group(function () {
        Route::get('/status', [\App\Http\Controllers\WhatsappVerificationController::class, 'status']);
        Route::post('/send-code', [\App\Http\Controllers\WhatsappVerificationController::class, 'sendCode']);
        Route::post('/verify', [\App\Http\Controllers\WhatsappVerificationController::class, 'verify']);
        Route::delete('/reset', [\App\Http\Controllers\WhatsappVerificationController::class, 'reset']);
    });

    // Niveles de Seguridad
    Route::get('/niveles-seguridad/activos', [\App\Http\Controllers\NivelSeguridadController::class, 'activos']);
    Route::get('/niveles-seguridad/{id}/miembros', [\App\Http\Controllers\NivelSeguridadController::class, 'miembros']);
    Route::get('/niveles-seguridad/{id}/empleados-disponibles', [\App\Http\Controllers\NivelSeguridadController::class, 'empleadosDisponibles']);
    Route::post('/niveles-seguridad/{id}/miembros', [\App\Http\Controllers\NivelSeguridadController::class, 'addMiembro']);
    Route::delete('/niveles-seguridad/{id}/miembros/{personaId}', [\App\Http\Controllers\NivelSeguridadController::class, 'removeMiembro']);
    Route::apiResource('niveles-seguridad', \App\Http\Controllers\NivelSeguridadController::class);

    // Componentes con Seguridad
    Route::get('/componentes-seguridad', [\App\Http\Controllers\ComponenteSeguridadController::class, 'index']);
    Route::post('/componentes-seguridad', [\App\Http\Controllers\ComponenteSeguridadController::class, 'upsert']);
    Route::delete('/componentes-seguridad/{componenteId}', [\App\Http\Controllers\ComponenteSeguridadController::class, 'destroy']);

    // API Credentials (Solo SuperAdmin)
    Route::prefix('api-credentials')->group(function () {
        Route::get('/', [\App\Http\Controllers\ApiCredentialController::class, 'index']);
        Route::get('/{provider}', [\App\Http\Controllers\ApiCredentialController::class, 'show']);
        Route::put('/{provider}', [\App\Http\Controllers\ApiCredentialController::class, 'update']);
        Route::post('/{provider}/test', [\App\Http\Controllers\ApiCredentialController::class, 'testConnection']);
    });

    // =====================================================
    // MÓDULO DE CONTROL DE DIÉSEL
    // =====================================================
    Route::prefix('diesel')->group(function () {
        // Tanques
        Route::get('/tanques/activos', [\App\Http\Controllers\Diesel\TanqueController::class, 'activos']);
        Route::get('/tanques/alertas', [\App\Http\Controllers\Diesel\TanqueController::class, 'alertas']);
        Route::apiResource('tanques', \App\Http\Controllers\Diesel\TanqueController::class);

        // Configuración de Alertas
        Route::get('/alertas/evolution-instances', [\App\Http\Controllers\Diesel\AlertConfigurationController::class, 'getEvolutionInstances']);
        Route::get('/alertas/whatsapp-groups', [\App\Http\Controllers\Diesel\AlertConfigurationController::class, 'getWhatsAppGroups']);
        Route::post('/alertas/test-send-message', [\App\Http\Controllers\Diesel\AlertConfigurationController::class, 'testSendMessage']);
        Route::post('/alertas/{id}/test', [\App\Http\Controllers\Diesel\AlertConfigurationController::class, 'testAlert']);
        Route::apiResource('alertas', \App\Http\Controllers\Diesel\AlertConfigurationController::class);
    });

    // =====================================================
    // INSTANCIAS DE WHATSAPP (Multi-tenant)
    // =====================================================
    Route::prefix('whatsapp-instances')->group(function () {
        Route::get('/', [\App\Http\Controllers\WhatsappInstanceController::class, 'index']);
        Route::post('/', [\App\Http\Controllers\WhatsappInstanceController::class, 'store']);
        Route::get('/{id}', [\App\Http\Controllers\WhatsappInstanceController::class, 'show']);
        Route::delete('/{id}', [\App\Http\Controllers\WhatsappInstanceController::class, 'destroy']);
        Route::post('/{id}/qrcode', [\App\Http\Controllers\WhatsappInstanceController::class, 'getQRCode']);
        Route::post('/{id}/logout', [\App\Http\Controllers\WhatsappInstanceController::class, 'logout']);
        Route::post('/{id}/restart', [\App\Http\Controllers\WhatsappInstanceController::class, 'restart']);
    });

    // =====================================================
    // RUTAS DE SUPER ADMIN (Solo usuarios sin tenant_id)
    // =====================================================
    Route::prefix('super-admin')->middleware('super-admin')->group(function () {
        // Dashboard Stats
        Route::get('/stats', [\App\Http\Controllers\SuperAdmin\TenantController::class, 'stats']);
        
        // Tenants CRUD
        Route::get('/tenants', [\App\Http\Controllers\SuperAdmin\TenantController::class, 'index']);
        Route::post('/tenants', [\App\Http\Controllers\SuperAdmin\TenantController::class, 'store']);
        Route::get('/tenants/{id}', [\App\Http\Controllers\SuperAdmin\TenantController::class, 'show']);
        Route::put('/tenants/{id}', [\App\Http\Controllers\SuperAdmin\TenantController::class, 'update']);
        Route::delete('/tenants/{id}', [\App\Http\Controllers\SuperAdmin\TenantController::class, 'destroy']);
        
        // Planes CRUD
        Route::get('/plans', [\App\Http\Controllers\SuperAdmin\PlanController::class, 'index']);
        Route::post('/plans', [\App\Http\Controllers\SuperAdmin\PlanController::class, 'store']);
        Route::get('/plans/{id}', [\App\Http\Controllers\SuperAdmin\PlanController::class, 'show']);
        Route::put('/plans/{id}', [\App\Http\Controllers\SuperAdmin\PlanController::class, 'update']);
        Route::patch('/plans/{id}/toggle-active', [\App\Http\Controllers\SuperAdmin\PlanController::class, 'toggleActive']);
        Route::delete('/plans/{id}', [\App\Http\Controllers\SuperAdmin\PlanController::class, 'destroy']);
        
        // Módulos CRUD
        Route::get('/modules', [\App\Http\Controllers\SuperAdmin\ModuleController::class, 'index']);
        Route::post('/modules', [\App\Http\Controllers\SuperAdmin\ModuleController::class, 'store']);
        Route::get('/modules/{id}', [\App\Http\Controllers\SuperAdmin\ModuleController::class, 'show']);
        Route::put('/modules/{id}', [\App\Http\Controllers\SuperAdmin\ModuleController::class, 'update']);
        Route::patch('/modules/{id}/toggle-active', [\App\Http\Controllers\SuperAdmin\ModuleController::class, 'toggleActive']);
        Route::delete('/modules/{id}', [\App\Http\Controllers\SuperAdmin\ModuleController::class, 'destroy']);
        
        // Audit Logs
        Route::get('/audit-logs', [\App\Http\Controllers\SuperAdmin\AuditLogController::class, 'index']);
        Route::get('/audit-logs/stats', [\App\Http\Controllers\SuperAdmin\AuditLogController::class, 'stats']);
        Route::get('/audit-logs/{id}', [\App\Http\Controllers\SuperAdmin\AuditLogController::class, 'show']);
    });
});

// Ruta pública para credenciales no secretas (app_key, cluster para frontend)
Route::get('/api-credentials/{provider}/public', [\App\Http\Controllers\ApiCredentialController::class, 'getPublicCredentials']);

