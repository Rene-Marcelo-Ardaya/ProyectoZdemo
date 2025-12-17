<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChatController;

use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;

// Rutas públicas de autenticación
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Rutas protegidas
Route::middleware(['auth:sanctum'])->group(function () {
    // Autenticación
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // Usuario (legacy)
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    // Usuarios y Roles (para combo de usuarios)
    Route::get('/roles-list', [UserController::class, 'getRoles']);
    Route::apiResource('users', UserController::class);

    // Gestión de Roles y Accesos
    Route::get('/menus-list', [RoleController::class, 'getMenus']);
    Route::apiResource('roles', RoleController::class);

    // Chat
    Route::get('/conversations', [ChatController::class, 'index']);
    Route::post('/conversations', [ChatController::class, 'createConversation']);
    Route::get('/conversations/{conversation}', [ChatController::class, 'show']);
    Route::post('/messages', [ChatController::class, 'store']);
    Route::get('/users/search', [ChatController::class, 'searchUsers']);
});
