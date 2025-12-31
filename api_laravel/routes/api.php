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
use App\Http\Controllers\CargoController;
use App\Http\Controllers\PersonalController;
use App\Http\Controllers\NivelSeguridadController;
use App\Http\Controllers\ComponenteSeguridadController;
use App\Http\Controllers\DieselDivisionController;
use App\Http\Controllers\DieselTrabajoController;
use App\Http\Controllers\DieselUbicacionController;
use App\Http\Controllers\DieselTanqueController;
use App\Http\Controllers\DieselMaquinaController;
use App\Http\Controllers\DieselProveedorController;
use App\Http\Controllers\DieselTipoPagoController;
use App\Http\Controllers\DieselMotivoAjusteController;
use App\Http\Controllers\DieselTipoMovimientoController;
use App\Http\Controllers\DieselIngresoController;


// Rutas públicas (sin autenticación)
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::get('/config/public', [SettingController::class, 'getPublic']); // Configuración pública para branding
Route::get('/config/branding/{filename}', [SettingController::class, 'getBrandingImage']); // Servir imágenes de branding vía API
Route::get('/diesel/ingresos/{id}/foto', [DieselIngresoController::class, 'getFoto']); // Foto de recepción (acceso directo para <img>)

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
    Route::put('/menus/positions', [MenuController::class, 'updatePositions']); // Drag & Drop
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
    Route::get('/cargos-list', [CargoController::class, 'listActive']); // Para combos
    Route::apiResource('cargos', CargoController::class);

    // RRHH - Personal
    Route::get('/personal/stats', [PersonalController::class, 'stats']);
    Route::apiResource('personal', PersonalController::class);

    // ======================================================================
    // NIVELES DE SEGURIDAD (SecuredButton System)
    // ======================================================================
    Route::get('/niveles-seguridad/activos', [NivelSeguridadController::class, 'activos']);
    Route::get('/niveles-seguridad/{id}/miembros', [NivelSeguridadController::class, 'miembros']);
    Route::get('/niveles-seguridad/{id}/empleados-disponibles', [NivelSeguridadController::class, 'empleadosDisponibles']);
    Route::post('/niveles-seguridad/{id}/miembros', [NivelSeguridadController::class, 'addMiembro']);
    Route::delete('/niveles-seguridad/{id}/miembros/{personaId}', [NivelSeguridadController::class, 'removeMiembro']);
    Route::apiResource('niveles-seguridad', NivelSeguridadController::class);

    // Componentes con Seguridad
    Route::get('/componentes-seguridad', [ComponenteSeguridadController::class, 'index']);
    Route::post('/componentes-seguridad', [ComponenteSeguridadController::class, 'upsert']);
    Route::delete('/componentes-seguridad/{componenteId}', [ComponenteSeguridadController::class, 'destroy']);

    // ======================================================================
    // SISTEMA DE GESTIÓN DE DIESEL - NUEVA ESTRUCTURA
    // ======================================================================

    Route::prefix('diesel')->group(function () {

        // ==================== DIVISIONES ====================
        Route::prefix('divisiones')->group(function () {
            Route::get('/', [DieselDivisionController::class, 'index']);
            Route::get('/combo', [DieselDivisionController::class, 'combo']);
            Route::get('/{id}', [DieselDivisionController::class, 'show']);
            Route::post('/', [DieselDivisionController::class, 'store']);
            Route::post('/bulk', [DieselDivisionController::class, 'storeBulk']);
            Route::put('/{id}', [DieselDivisionController::class, 'update']);
            Route::patch('/{id}/toggle', [DieselDivisionController::class, 'toggleActivo']);
        });

        // ==================== TRABAJOS ====================
        Route::prefix('trabajos')->group(function () {
            Route::get('/', [DieselTrabajoController::class, 'index']);
            Route::get('/combo', [DieselTrabajoController::class, 'combo']);
            Route::get('/{id}', [DieselTrabajoController::class, 'show']);
            Route::post('/', [DieselTrabajoController::class, 'store']);
            Route::post('/bulk', [DieselTrabajoController::class, 'storeBulk']); // Ingreso masivo
            Route::put('/{id}', [DieselTrabajoController::class, 'update']);
            Route::patch('/{id}/toggle', [DieselTrabajoController::class, 'toggleActivo']);
        });

        // ==================== UBICACIONES ====================
        Route::prefix('ubicaciones')->group(function () {
            Route::get('/', [DieselUbicacionController::class, 'index']);
            Route::get('/combo', [DieselUbicacionController::class, 'combo']); // ?division_id=X
            Route::get('/{id}', [DieselUbicacionController::class, 'show']);
            Route::post('/', [DieselUbicacionController::class, 'store']);
            Route::post('/bulk', [DieselUbicacionController::class, 'storeBulk']); // Ingreso masivo
            Route::put('/{id}', [DieselUbicacionController::class, 'update']);
            Route::patch('/{id}/toggle', [DieselUbicacionController::class, 'toggleActivo']);
        });

        // ==================== TANQUES ====================
        Route::prefix('tanques')->group(function () {
            Route::get('/', [DieselTanqueController::class, 'index']);
            Route::get('/combo', [DieselTanqueController::class, 'combo']); // ?ubicacion_id=X
            Route::get('/{id}', [DieselTanqueController::class, 'show']);
            Route::post('/', [DieselTanqueController::class, 'store']);
            Route::post('/bulk', [DieselTanqueController::class, 'storeBulk']);
            Route::put('/{id}', [DieselTanqueController::class, 'update']);
            Route::patch('/{id}/toggle', [DieselTanqueController::class, 'toggleActivo']);
            Route::patch('/{id}/adjust-stock', [DieselTanqueController::class, 'adjustStock']);
            
            // Asignación de personal
            Route::get('/{id}/personal', [DieselTanqueController::class, 'getPersonal']);
            Route::post('/{id}/personal', [DieselTanqueController::class, 'assignPersonal']);
        });

        // ==================== MÁQUINAS ====================
        Route::prefix('maquinas')->group(function () {
            Route::get('/', [DieselMaquinaController::class, 'index']);
            Route::get('/combo', [DieselMaquinaController::class, 'combo']); // ?division_id=X
            Route::get('/{id}', [DieselMaquinaController::class, 'show']);
            Route::post('/', [DieselMaquinaController::class, 'store']);
            Route::post('/bulk', [DieselMaquinaController::class, 'storeBulk']);
            Route::put('/{id}', [DieselMaquinaController::class, 'update']);
            Route::patch('/{id}/toggle', [DieselMaquinaController::class, 'toggleActivo']);
        });

        // ==================== PROVEEDORES ====================
        Route::prefix('proveedores')->group(function () {
            Route::get('/', [DieselProveedorController::class, 'index']);
            Route::get('/combo', [DieselProveedorController::class, 'combo']);
            Route::get('/{id}', [DieselProveedorController::class, 'show']);
            Route::post('/', [DieselProveedorController::class, 'store']);
            Route::post('/bulk', [DieselProveedorController::class, 'storeBulk']); // Ingreso masivo
            Route::put('/{id}', [DieselProveedorController::class, 'update']);
            Route::patch('/{id}/toggle', [DieselProveedorController::class, 'toggleActivo']);
        });

        // ==================== TIPOS DE PAGO ====================
        Route::prefix('tipos-pago')->group(function () {
            Route::get('/', [DieselTipoPagoController::class, 'index']);
            Route::get('/combo', [DieselTipoPagoController::class, 'combo']);
            Route::get('/{id}', [DieselTipoPagoController::class, 'show']);
            Route::post('/', [DieselTipoPagoController::class, 'store']);
            Route::post('/bulk', [DieselTipoPagoController::class, 'storeBulk']);
            Route::put('/{id}', [DieselTipoPagoController::class, 'update']);
            Route::patch('/{id}/toggle', [DieselTipoPagoController::class, 'toggleActivo']);
        });

        // ==================== MOTIVOS DE AJUSTE ====================
        Route::prefix('motivos-ajuste')->group(function () {
            Route::get('/', [DieselMotivoAjusteController::class, 'index']);
            Route::get('/combo', [DieselMotivoAjusteController::class, 'combo']);
            Route::get('/{id}', [DieselMotivoAjusteController::class, 'show']);
            Route::post('/', [DieselMotivoAjusteController::class, 'store']);
            Route::post('/bulk', [DieselMotivoAjusteController::class, 'storeBulk']);
            Route::put('/{id}', [DieselMotivoAjusteController::class, 'update']);
            Route::patch('/{id}/toggle', [DieselMotivoAjusteController::class, 'toggleActivo']);
        });

        // ==================== TIPO DE MOVIMIENTOS ====================
        Route::prefix('tipos-movimiento')->group(function () {
            Route::get('/', [DieselTipoMovimientoController::class, 'index']);
            Route::get('/combo', [DieselTipoMovimientoController::class, 'combo']);
            Route::get('/{id}', [DieselTipoMovimientoController::class, 'show']);
            Route::post('/', [DieselTipoMovimientoController::class, 'store']);
            Route::post('/bulk', [DieselTipoMovimientoController::class, 'storeBulk']);
            Route::put('/{id}', [DieselTipoMovimientoController::class, 'update']);
            Route::patch('/{id}/toggle', [DieselTipoMovimientoController::class, 'toggleActivo']);
        });

        // ==================== INGRESOS ====================
        Route::prefix('ingresos')->group(function () {
            Route::get('/', [DieselIngresoController::class, 'index']);
            Route::get('/{id}', [DieselIngresoController::class, 'show']);
            Route::post('/', [DieselIngresoController::class, 'store']);                    // Fase 1: Dueño
            Route::patch('/{id}/recepcionar', [DieselIngresoController::class, 'recepcionar']); // Fase 2: Surtidor (JSON)
            Route::post('/{id}/recepcionar', [DieselIngresoController::class, 'recepcionar']);  // Fase 2: Surtidor (FormData con foto)
            Route::patch('/{id}/anular', [DieselIngresoController::class, 'anular']);
        });
    });
});
