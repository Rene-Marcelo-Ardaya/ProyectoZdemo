-- Inicialización de la base de datos
-- Este script se ejecuta automáticamente cuando MySQL se inicia por primera vez

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS laravel_apichat 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

-- Crear usuario de la aplicación (opcional)
-- CREATE USER IF NOT EXISTS 'laravel'@'%' IDENTIFIED BY 'laravel_password';
-- GRANT ALL PRIVILEGES ON laravel_apichat.* TO 'laravel'@'%';
-- FLUSH PRIVILEGES;

-- Mostrar mensaje de confirmación
SELECT 'Base de datos laravel_apichat creada exitosamente!' AS message;
