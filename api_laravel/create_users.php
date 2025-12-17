<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

// Crear Usuario 1
$user1 = User::firstOrCreate(
    ['email' => 'juan@example.com'],
    ['name' => 'Juan Perez', 'password' => Hash::make('password')]
);

// Crear Usuario 2
$user2 = User::firstOrCreate(
    ['email' => 'maria@example.com'],
    ['name' => 'Maria Gomez', 'password' => Hash::make('password')]
);

echo "Usuarios creados:\n";
echo "1. ID: {$user1->id}, Nombre: {$user1->name}, Email: {$user1->email}\n";
echo "2. ID: {$user2->id}, Nombre: {$user2->name}, Email: {$user2->email}\n";
echo "\nContraseña para ambos: password\n";
