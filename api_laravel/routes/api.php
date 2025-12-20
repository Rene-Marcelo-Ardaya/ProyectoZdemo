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

    // RRHH - Personal
    Route::get('/personal/available-users', [\App\Http\Controllers\PersonalController::class, 'getAvailableUsers']);
    Route::apiResource('personal', \App\Http\Controllers\PersonalController::class);
});
