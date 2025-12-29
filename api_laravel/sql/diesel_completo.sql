-- ========================================================================
-- SQL COMPLETO: DATOS BÁSICOS + MENÚS SISTEMA DIESEL
-- ========================================================================
-- Ejecutar DESPUÉS de migrate:fresh --seed
-- Base de datos: laravel_apichat
-- ========================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ========================================================================
-- 1. DATOS BÁSICOS - DIVISIONES
-- ========================================================================
INSERT INTO `divisiones` (`id`, `nombre`, `is_active`) VALUES
(1, 'Agrícola', 1),
(2, 'Ganadería', 1),
(3, 'Transporte', 1),
(4, 'Mantenimiento', 1);

-- ========================================================================
-- 2. DATOS BÁSICOS - UBICACIONES FÍSICAS
-- ========================================================================
INSERT INTO `ubicaciones_fisicas` (`id`, `nombre`, `division_id`) VALUES
(1, 'Surtidor Central', NULL),
(2, 'Campo 1', 1),
(3, 'Campo 2', 1),
(4, 'Campo 4', 1),
(5, 'Estancia Ganadera', 2),
(6, 'Taller Mecánico', 4),
(7, 'Garaje Principal', 3);

-- ========================================================================
-- 3. DATOS BÁSICOS - TRABAJOS
-- ========================================================================
INSERT INTO `trabajos` (`id`, `nombre`) VALUES
(1, 'Desmonte'),
(2, 'Arado'),
(3, 'Siembra'),
(4, 'Cosecha'),
(5, 'Transporte de Carga'),
(6, 'Mantenimiento Preventivo'),
(7, 'Patrullaje'),
(8, 'Limpieza de Terreno');

-- ========================================================================
-- 4. DATOS BÁSICOS - MÁQUINAS
-- ========================================================================
INSERT INTO `maquinas` (`id`, `codigo`, `nombre`, `division_id`, `is_active`) VALUES
(1, 'D6M', 'Tractor Caterpillar D6M', 1, 1),
(2, 'JD8320', 'John Deere 8320', 1, 1),
(3, 'CAT140', 'Motoniveladora CAT 140', 4, 1),
(4, 'KB350', 'Camión Kenworth T350', 3, 1),
(5, 'CASE450', 'Retroexcavadora Case 450', 4, 1),
(6, 'NH7630', 'New Holland T7630', 1, 1),
(7, 'VW17280', 'Camión Volkswagen 17-280', 3, 1);

-- ========================================================================
-- 5. DATOS BÁSICOS - TANQUES
-- ========================================================================
INSERT INTO `tanques` (`id`, `nombre`, `tipo`, `ubicacion_fisica_id`, `capacidad_maxima`, `stock_actual`) VALUES
(1, 'Tanque Central 1', 'FIJO', 1, 10000.00, 7500.00),
(2, 'Tanque Central 2', 'FIJO', 1, 10000.00, 8200.00),
(3, 'Cisterna Campo 1', 'MOVIL', 2, 2000.00, 1500.00),
(4, 'Cisterna Campo 2', 'MOVIL', 3, 2000.00, 800.00),
(5, 'Tanque Taller', 'FIJO', 6, 3000.00, 2100.00),
(6, 'Cisterna Ganadería', 'MOVIL', 5, 1500.00, 900.00);

-- ========================================================================
-- 6. DATOS BÁSICOS - NIVELES DE SEGURIDAD
-- ========================================================================
INSERT INTO `niveles_seguridad` (`id`, `nombre`, `nivel`) VALUES
(1, 'Operador', 1),
(2, 'Supervisor', 2),
(3, 'Jefe de División', 3),
(4, 'Auditor', 4),
(5, 'Administrador', 5);

-- ========================================================================
-- 7. DATOS BÁSICOS - UBICACIONES PIN (Dispositivos)
-- ========================================================================
INSERT INTO `ubicaciones_pin` (`id`, `nombre`, `codigo`) VALUES
(1, 'Tablet Surtidor Central', 'TAB-SURT-01'),
(2, 'Tablet Campo 1', 'TAB-CAMP-01'),
(3, 'Tablet Campo 2', 'TAB-CAMP-02'),
(4, 'Celular Cisterna 1', 'CEL-CIS-01'),
(5, 'Celular Cisterna 2', 'CEL-CIS-02'),
(6, 'Tablet Oficina Principal', 'TAB-OFIC-01');

-- ========================================================================
-- 8. MENÚS Y SUBMENÚS - SISTEMA DIESEL
-- ========================================================================

-- Menú principal: DIESEL
INSERT INTO `menus` (`id`, `name`, `url`, `icon`, `parent_id`, `order`, `module`, `is_active`, `created_at`, `updated_at`) VALUES
(11, 'Diesel', NULL, 'Fuel', NULL, 30, 'Diesel', 1, NOW(), NOW());

-- Submenús de Diesel
INSERT INTO `menus` (`id`, `name`, `url`, `icon`, `parent_id`, `order`, `module`, `is_active`, `created_at`, `updated_at`) VALUES
(12, 'Dashboard', '/diesel/dashboard', 'LayoutDashboard', 11, 1, 'Diesel', 1, NOW(), NOW()),
(13, 'Ingresos', '/diesel/ingresos', 'TrendingUp', 11, 2, 'Diesel', 1, NOW(), NOW()),
(14, 'Egresos', '/diesel/egresos', 'TrendingDown', 11, 3, 'Diesel', 1, NOW(), NOW()),
(15, 'Tanques', '/diesel/tanques', 'Droplet', 11, 4, 'Diesel', 1, NOW(), NOW()),
(16, 'Máquinas', '/diesel/maquinas', 'Truck', 11, 5, 'Diesel', 1, NOW(), NOW()),
(17, 'Reportes', '/diesel/reportes', 'FileText', 11, 6, 'Diesel', 1, NOW(), NOW()),
(18, 'Configuración', '/diesel/config', 'Settings', 11, 7, 'Diesel', 1, NOW(), NOW());

-- ========================================================================
-- 9. ASIGNAR MENÚS AL ROL SUPER ADMIN (role_id = 1)
-- ========================================================================
INSERT INTO `menu_role` (`menu_id`, `role_id`) VALUES
(11, 1), -- Diesel
(12, 1), -- Dashboard
(13, 1), -- Ingresos
(14, 1), -- Egresos
(15, 1), -- Tanques
(16, 1), -- Máquinas
(17, 1), -- Reportes
(18, 1); -- Configuración

-- ========================================================================
-- 10. VERIFICACIÓN (Opcional - Comentar si no se necesita)
-- ========================================================================
-- Ver divisiones creadas
SELECT '=== DIVISIONES ===' as '';
SELECT * FROM divisiones;

-- Ver ubicaciones físicas
SELECT '=== UBICACIONES FÍSICAS ===' as '';
SELECT uf.id, uf.nombre, d.nombre as division 
FROM ubicaciones_fisicas uf 
LEFT JOIN divisiones d ON uf.division_id = d.id;

-- Ver trabajos
SELECT '=== TRABAJOS ===' as '';
SELECT * FROM trabajos;

-- Ver máquinas
SELECT '=== MÁQUINAS ===' as '';
SELECT m.codigo, m.nombre, d.nombre as division 
FROM maquinas m 
INNER JOIN divisiones d ON m.division_id = d.id;

-- Ver tanques
SELECT '=== TANQUES ===' as '';
SELECT t.nombre, t.tipo, t.capacidad_maxima, t.stock_actual, uf.nombre as ubicacion
FROM tanques t
INNER JOIN ubicaciones_fisicas uf ON t.ubicacion_fisica_id = uf.id;

-- Ver menús creados
SELECT '=== MENÚS DIESEL ===' as '';
SELECT m.id, m.name, m.url, m.icon, 
       IFNULL(p.name, 'ROOT') as parent,
       m.order
FROM menus m
LEFT JOIN menus p ON m.parent_id = p.id
WHERE m.module = 'Diesel'
ORDER BY m.parent_id, m.order;

SET FOREIGN_KEY_CHECKS = 1;

-- ========================================================================
-- FIN DEL SCRIPT
-- ========================================================================
-- Resumen de datos insertados:
-- - 4 Divisiones
-- - 7 Ubicaciones Físicas
-- - 8 Trabajos
-- - 7 Máquinas
-- - 6 Tanques
-- - 5 Niveles de Seguridad
-- - 6 Ubicaciones PIN
-- - 1 Menú Principal + 7 Submenús (8 total)
-- - 8 Asignaciones de menú al rol Super Admin
-- ========================================================================
