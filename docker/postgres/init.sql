-- Inicialización de PostgreSQL para DemoZ01
-- Este script se ejecuta automáticamente cuando PostgreSQL se inicia por primera vez

-- Crear base de datos para n8n
CREATE DATABASE n8n;

-- Dar permisos al usuario evolution sobre la base de datos n8n
GRANT ALL PRIVILEGES ON DATABASE n8n TO evolution;

-- Mensaje de confirmación
\echo 'Base de datos n8n creada exitosamente!'
