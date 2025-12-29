-- ============================================
-- Script SQL: Configuración de Menús para Sistema Diesel TORETO
-- ============================================
-- Este script crea los menús necesarios en tu sistema para acceder
-- al módulo de gestión de diesel desde el frontend React.
--
-- INSTRUCCIONES:
-- 1. Ejecuta este script en tu base de datos MySQL
-- 2. Asigna los menús a los roles correspondientes desde el panel de administración
-- 3. Los usuarios verán los menús en el sidebar según sus permisos
-- ============================================

USE zdemo;

-- Insertar el menú padre "Diesel"
INSERT INTO menus (name, path, icon, parent_id, orden, is_visible, description, created_at, updated_at)
VALUES (
    'Gestión Diesel',           -- nombre del menú
    '/diesel',                   -- ruta base
    'fuel',                      -- icono (puedes cambiar según tu sistema de iconos)
    NULL,                        -- sin padre (es menú principal)
    60,                          -- orden en el sidebar
    1,                           -- visible
    'Sistema de control y gestión de combustible diesel (TORETO)',
    NOW(),
    NOW()
);

-- Obtener el ID del menú padre recién creado
SET @diesel_parent_id = LAST_INSERT_ID();

-- Insertar submenú: Dashboard Diesel
INSERT INTO menus (name, path, icon, parent_id, orden, is_visible, description, created_at, updated_at)
VALUES (
    'Dashboard Diesel',
    '/diesel/dashboard',
    'gauge',
    @diesel_parent_id,
    1,
    1,
    'Panel principal con estadísticas y estado de tanques',
    NOW(),
    NOW()
);

-- Insertar submenú: Movimientos
INSERT INTO menus (name, path, icon, parent_id, orden, is_visible, description, created_at, updated_at)
VALUES (
    'Movimientos',
    '/diesel/movements',
    'clipboard-list',
    @diesel_parent_id,
    2,
    1,
    'Registro de entradas, salidas, traspasos y ajustes',
    NOW(),
    NOW()
);

-- Insertar submenú: Nuevo Movimiento
INSERT INTO menus (name, path, icon, parent_id, orden, is_visible, description, created_at, updated_at)
VALUES (
    'Nuevo Movimiento',
    '/diesel/movements/new',
    'plus-circle',
    @diesel_parent_id,
    3,
    1,
    'Registrar nueva operación de diesel',
    NOW(),
    NOW()
);

-- Insertar submenú: Tanques (opcional para futuro desarrollo)
INSERT INTO menus (name, path, icon, parent_id, orden, is_visible, description, created_at, updated_at)
VALUES (
    'Tanques',
    '/diesel/tanks',
    'database',
    @diesel_parent_id,
    4,
    0,  -- oculto por ahora (cambia a 1 cuando implementes la página)
    'Gestión y monitoreo de tanques de diesel',
    NOW(),
    NOW()
);

-- Insertar submenú: Máquinas (opcional para futuro desarrollo)
INSERT INTO menus (name, path, icon, parent_id, orden, is_visible, description, created_at, updated_at)
VALUES (
    'Máquinas',
    '/diesel/machines',
    'truck',
    @diesel_parent_id,
    5,
    0,  -- oculto por ahora (cambia a 1 cuando implementes la página)
    'Registro de maquinaria y consumo',
    NOW(),
    NOW()
);

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Ver los menús creados:
SELECT 
    m.id,
    m.name,
    m.path,
    m.icon,
    IFNULL(p.name, 'Ninguno') as parent_name,
    m.orden,
    m.is_visible,
    m.description
FROM menus m
LEFT JOIN menus p ON m.parent_id = p.id
WHERE m.path LIKE '/diesel%'
ORDER BY m.parent_id, m.orden;

-- ============================================
-- ASIGNACIÓN A ROLES (Opcional - Ajusta según tus roles)
-- ============================================
-- Ejemplo: Asignar todos los menús diesel al rol "Administrador" (role_id = 1)
-- Descomenta y ajusta según tu estructura:

/*
-- Obtener IDs de los menús diesel
SET @menu_ids = (
    SELECT GROUP_CONCAT(id) 
    FROM menus 
    WHERE path LIKE '/diesel%'
);

-- Asignar al rol Administrador (ajusta el role_id según tu BD)
INSERT INTO menu_role (role_id, menu_id, created_at, updated_at)
SELECT 1, m.id, NOW(), NOW()
FROM menus m
WHERE m.path LIKE '/diesel%'
AND NOT EXISTS (
    SELECT 1 FROM menu_role mr 
    WHERE mr.role_id = 1 AND mr.menu_id = m.id
);
*/

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 1. Los iconos pueden variar según tu librería de iconos (lucide-react, heroicons, etc.)
-- 2. Las páginas /diesel/tanks y /diesel/machines están marcadas como no visibles
--    porque aún no están implementadas. Cámbialas a is_visible = 1 cuando las necesites.
-- 3. Recuerda asignar estos menús a los roles apropiados desde el panel de administración
--    o usando consultas SQL como el ejemplo de arriba.
-- 4. El sistema de permisos con PIN es independiente de los menús - se valida a nivel de API.
