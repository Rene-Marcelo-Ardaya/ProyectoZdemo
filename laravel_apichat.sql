/*
 Navicat Premium Dump SQL

 Source Server         : Local Admin
 Source Server Type    : MySQL
 Source Server Version : 80030 (8.0.30)
 Source Host           : localhost:3306
 Source Schema         : laravel_apichat

 Target Server Type    : MySQL
 Target Server Version : 80030 (8.0.30)
 File Encoding         : 65001

 Date: 31/12/2025 14:51:10
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for cache
-- ----------------------------
DROP TABLE IF EXISTS `cache`;
CREATE TABLE `cache`  (
  `key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of cache
-- ----------------------------
INSERT INTO `cache` VALUES ('laravel-cache-settings_all', 'a:2:{s:8:\"branding\";a:15:{i:0;a:7:{s:2:\"id\";i:1;s:3:\"key\";s:8:\"app_name\";s:5:\"value\";s:7:\"Zdemo01\";s:4:\"type\";s:4:\"text\";s:5:\"label\";s:24:\"Nombre de la Aplicación\";s:11:\"description\";s:57:\"Nombre que aparece en el título del navegador y manifest\";s:9:\"is_public\";b:1;}i:1;a:7:{s:2:\"id\";i:2;s:3:\"key\";s:14:\"app_short_name\";s:5:\"value\";s:5:\"Zdemo\";s:4:\"type\";s:4:\"text\";s:5:\"label\";s:12:\"Nombre Corto\";s:11:\"description\";s:45:\"Nombre corto para PWA y dispositivos móviles\";s:9:\"is_public\";b:1;}i:2;a:7:{s:2:\"id\";i:3;s:3:\"key\";s:15:\"app_description\";s:5:\"value\";s:31:\"Sistema de Gestión Empresarial\";s:4:\"type\";s:4:\"text\";s:5:\"label\";s:12:\"Descripción\";s:11:\"description\";s:50:\"Descripción de la aplicación para SEO y manifest\";s:9:\"is_public\";b:1;}i:3;a:7:{s:2:\"id\";i:4;s:3:\"key\";s:12:\"logo_sidebar\";s:5:\"value\";N;s:4:\"type\";s:5:\"image\";s:5:\"label\";s:16:\"Logo del Sidebar\";s:11:\"description\";s:67:\"Logo que aparece en el menú lateral. Tamaño recomendado: 180x50px\";s:9:\"is_public\";b:1;}i:4;a:7:{s:2:\"id\";i:5;s:3:\"key\";s:22:\"logo_sidebar_collapsed\";s:5:\"value\";N;s:4:\"type\";s:5:\"image\";s:5:\"label\";s:24:\"Logo Sidebar (Colapsado)\";s:11:\"description\";s:63:\"Logo pequeño cuando el sidebar está cerrado. Tamaño: 40x40px\";s:9:\"is_public\";b:1;}i:5;a:7:{s:2:\"id\";i:6;s:3:\"key\";s:10:\"logo_login\";s:5:\"value\";N;s:4:\"type\";s:5:\"image\";s:5:\"label\";s:26:\"Logo del Login (Principal)\";s:11:\"description\";s:46:\"Logo grande que aparece en la página de login\";s:9:\"is_public\";b:1;}i:6;a:7:{s:2:\"id\";i:7;s:3:\"key\";s:20:\"logo_login_secondary\";s:5:\"value\";N;s:4:\"type\";s:5:\"image\";s:5:\"label\";s:27:\"Logo del Login (Secundario)\";s:11:\"description\";s:48:\"Logo o imagen que aparece a la derecha del login\";s:9:\"is_public\";b:1;}i:7;a:7:{s:2:\"id\";i:8;s:3:\"key\";s:11:\"login_title\";s:5:\"value\";s:10:\"Bienvenido\";s:4:\"type\";s:4:\"text\";s:5:\"label\";s:17:\"Título del Login\";s:11:\"description\";s:47:\"Texto grande que aparece en la página de login\";s:9:\"is_public\";b:1;}i:8;a:7:{s:2:\"id\";i:9;s:3:\"key\";s:14:\"login_subtitle\";s:5:\"value\";s:29:\"Inicia sesión para continuar\";s:4:\"type\";s:4:\"text\";s:5:\"label\";s:20:\"Subtítulo del Login\";s:11:\"description\";s:39:\"Texto secundario en la página de login\";s:9:\"is_public\";b:1;}i:9;a:7:{s:2:\"id\";i:10;s:3:\"key\";s:7:\"favicon\";s:5:\"value\";N;s:4:\"type\";s:5:\"image\";s:5:\"label\";s:7:\"Favicon\";s:11:\"description\";s:74:\"Icono que aparece en la pestaña del navegador. Formato: .ico, .png o .svg\";s:9:\"is_public\";b:1;}i:10;a:7:{s:2:\"id\";i:11;s:3:\"key\";s:13:\"primary_color\";s:5:\"value\";s:7:\"#15428b\";s:4:\"type\";s:4:\"text\";s:5:\"label\";s:14:\"Color Primario\";s:11:\"description\";s:38:\"Color principal del tema (hexadecimal)\";s:9:\"is_public\";b:1;}i:11;a:7:{s:2:\"id\";i:12;s:3:\"key\";s:15:\"secondary_color\";s:5:\"value\";s:7:\"#4388cf\";s:4:\"type\";s:4:\"text\";s:5:\"label\";s:16:\"Color Secundario\";s:11:\"description\";s:39:\"Color secundario del tema (hexadecimal)\";s:9:\"is_public\";b:1;}i:12;a:7:{s:2:\"id\";i:18;s:3:\"key\";s:14:\"theme_bg_color\";s:5:\"value\";s:7:\"#1d1b1b\";s:4:\"type\";s:4:\"text\";s:5:\"label\";s:14:\"Color de Fondo\";s:11:\"description\";s:42:\"Color de fondo principal de la aplicación\";s:9:\"is_public\";b:1;}i:13;a:7:{s:2:\"id\";i:19;s:3:\"key\";s:17:\"theme_panel_color\";s:5:\"value\";s:7:\"#0033ff\";s:4:\"type\";s:4:\"text\";s:5:\"label\";s:16:\"Color de Paneles\";s:11:\"description\";s:38:\"Color de cabeceras de paneles y barras\";s:9:\"is_public\";b:1;}i:14;a:7:{s:2:\"id\";i:20;s:3:\"key\";s:16:\"theme_text_color\";s:5:\"value\";s:7:\"#171717\";s:4:\"type\";s:4:\"text\";s:5:\"label\";s:14:\"Color de Texto\";s:11:\"description\";s:25:\"Color principal del texto\";s:9:\"is_public\";b:1;}}s:7:\"general\";a:5:{i:0;a:7:{s:2:\"id\";i:13;s:3:\"key\";s:12:\"company_name\";s:5:\"value\";s:10:\"Mi Empresa\";s:4:\"type\";s:4:\"text\";s:5:\"label\";s:20:\"Nombre de la Empresa\";s:11:\"description\";s:32:\"Razón social o nombre comercial\";s:9:\"is_public\";b:0;}i:1;a:7:{s:2:\"id\";i:14;s:3:\"key\";s:11:\"company_rif\";s:5:\"value\";N;s:4:\"type\";s:4:\"text\";s:5:\"label\";s:9:\"RIF / NIT\";s:11:\"description\";s:36:\"Identificación fiscal de la empresa\";s:9:\"is_public\";b:0;}i:2;a:7:{s:2:\"id\";i:15;s:3:\"key\";s:15:\"company_address\";s:5:\"value\";N;s:4:\"type\";s:4:\"text\";s:5:\"label\";s:10:\"Dirección\";s:11:\"description\";s:32:\"Dirección física de la empresa\";s:9:\"is_public\";b:0;}i:3;a:7:{s:2:\"id\";i:16;s:3:\"key\";s:13:\"company_phone\";s:5:\"value\";N;s:4:\"type\";s:4:\"text\";s:5:\"label\";s:9:\"Teléfono\";s:11:\"description\";s:31:\"Teléfono principal de contacto\";s:9:\"is_public\";b:0;}i:4;a:7:{s:2:\"id\";i:17;s:3:\"key\";s:13:\"company_email\";s:5:\"value\";N;s:4:\"type\";s:4:\"text\";s:5:\"label\";s:19:\"Correo Electrónico\";s:11:\"description\";s:29:\"Email principal de la empresa\";s:9:\"is_public\";b:0;}}}', 1767198068);
INSERT INTO `cache` VALUES ('laravel-cache-settings_public', 'a:15:{s:8:\"app_name\";s:7:\"Zdemo01\";s:14:\"app_short_name\";s:5:\"Zdemo\";s:15:\"app_description\";s:31:\"Sistema de Gestión Empresarial\";s:12:\"logo_sidebar\";N;s:22:\"logo_sidebar_collapsed\";N;s:10:\"logo_login\";N;s:20:\"logo_login_secondary\";N;s:11:\"login_title\";s:10:\"Bienvenido\";s:14:\"login_subtitle\";s:29:\"Inicia sesión para continuar\";s:7:\"favicon\";N;s:13:\"primary_color\";s:7:\"#15428b\";s:15:\"secondary_color\";s:7:\"#4388cf\";s:14:\"theme_bg_color\";s:7:\"#1d1b1b\";s:17:\"theme_panel_color\";s:7:\"#0033ff\";s:16:\"theme_text_color\";s:7:\"#171717\";}', 1767209248);

-- ----------------------------
-- Table structure for cache_locks
-- ----------------------------
DROP TABLE IF EXISTS `cache_locks`;
CREATE TABLE `cache_locks`  (
  `key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of cache_locks
-- ----------------------------

-- ----------------------------
-- Table structure for cargos
-- ----------------------------
DROP TABLE IF EXISTS `cargos`;
CREATE TABLE `cargos`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of cargos
-- ----------------------------
INSERT INTO `cargos` VALUES (1, 'Gerente Ventas', 'Esto es una prueba', 1, '2025-12-22 13:45:53', '2025-12-22 13:45:53');
INSERT INTO `cargos` VALUES (2, 'Sistema', NULL, 1, '2025-12-22 15:27:05', '2025-12-22 15:27:05');

-- ----------------------------
-- Table structure for componente_seguridad
-- ----------------------------
DROP TABLE IF EXISTS `componente_seguridad`;
CREATE TABLE `componente_seguridad`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `componente_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `pagina` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `nivel_seguridad_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `componente_seguridad_componente_id_unique`(`componente_id` ASC) USING BTREE,
  INDEX `componente_seguridad_nivel_seguridad_id_foreign`(`nivel_seguridad_id` ASC) USING BTREE,
  CONSTRAINT `componente_seguridad_nivel_seguridad_id_foreign` FOREIGN KEY (`nivel_seguridad_id`) REFERENCES `niveles_seguridad` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of componente_seguridad
-- ----------------------------

-- ----------------------------
-- Table structure for conversation_user
-- ----------------------------
DROP TABLE IF EXISTS `conversation_user`;
CREATE TABLE `conversation_user`  (
  `conversation_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `last_read_at` timestamp NULL DEFAULT NULL,
  `unread_count` int NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`conversation_id`, `user_id`) USING BTREE,
  INDEX `conversation_user_user_id_foreign`(`user_id` ASC) USING BTREE,
  CONSTRAINT `conversation_user_conversation_id_foreign` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `conversation_user_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of conversation_user
-- ----------------------------
INSERT INTO `conversation_user` VALUES (4, 1, NULL, 0, '2025-12-19 14:10:30', '2025-12-19 14:10:30');
INSERT INTO `conversation_user` VALUES (4, 2, NULL, 0, '2025-12-19 14:10:30', '2025-12-19 14:10:30');

-- ----------------------------
-- Table structure for conversations
-- ----------------------------
DROP TABLE IF EXISTS `conversations`;
CREATE TABLE `conversations`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `is_group` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of conversations
-- ----------------------------
INSERT INTO `conversations` VALUES (1, NULL, 0, '2025-12-19 13:56:11', '2025-12-19 13:56:11');
INSERT INTO `conversations` VALUES (2, NULL, 0, '2025-12-19 13:56:28', '2025-12-19 13:56:28');
INSERT INTO `conversations` VALUES (3, NULL, 0, '2025-12-19 13:57:17', '2025-12-19 13:57:17');
INSERT INTO `conversations` VALUES (4, NULL, 0, '2025-12-19 14:10:30', '2025-12-19 14:10:30');

-- ----------------------------
-- Table structure for d_bitacora_ingresos
-- ----------------------------
DROP TABLE IF EXISTS `d_bitacora_ingresos`;
CREATE TABLE `d_bitacora_ingresos`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `d_ingreso_id` bigint UNSIGNED NOT NULL,
  `accion` enum('CREADO','ANULADO','RECEPCIONADO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `ip` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `d_bitacora_ingresos_d_ingreso_id_foreign`(`d_ingreso_id` ASC) USING BTREE,
  INDEX `d_bitacora_ingresos_user_id_foreign`(`user_id` ASC) USING BTREE,
  CONSTRAINT `d_bitacora_ingresos_d_ingreso_id_foreign` FOREIGN KEY (`d_ingreso_id`) REFERENCES `d_ingresos` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `d_bitacora_ingresos_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of d_bitacora_ingresos
-- ----------------------------
INSERT INTO `d_bitacora_ingresos` VALUES (1, 1, 'CREADO', 1, '127.0.0.1', '2025-12-31 11:16:59');

-- ----------------------------
-- Table structure for d_divisiones
-- ----------------------------
DROP TABLE IF EXISTS `d_divisiones`;
CREATE TABLE `d_divisiones`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of d_divisiones
-- ----------------------------
INSERT INTO `d_divisiones` VALUES (1, 'Agrícola', 1, '2025-12-29 13:46:47', '2025-12-29 13:46:47');
INSERT INTO `d_divisiones` VALUES (2, 'Ganadería', 1, '2025-12-29 13:46:47', '2025-12-29 13:46:47');
INSERT INTO `d_divisiones` VALUES (3, 'Maquinaria', 1, '2025-12-29 13:46:47', '2025-12-29 13:46:47');
INSERT INTO `d_divisiones` VALUES (4, 'Administración', 1, '2025-12-29 13:46:47', '2025-12-29 13:46:47');
INSERT INTO `d_divisiones` VALUES (5, 'prueba', 1, '2025-12-29 16:30:16', '2025-12-29 16:42:15');
INSERT INTO `d_divisiones` VALUES (6, 'Prueba02', 1, '2025-12-29 16:38:46', '2025-12-29 16:42:16');
INSERT INTO `d_divisiones` VALUES (7, 'prueba3', 1, '2025-12-29 16:56:17', '2025-12-29 16:56:17');

-- ----------------------------
-- Table structure for d_ingreso_detalles
-- ----------------------------
DROP TABLE IF EXISTS `d_ingreso_detalles`;
CREATE TABLE `d_ingreso_detalles`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `d_ingreso_id` bigint UNSIGNED NOT NULL,
  `d_tanque_id` bigint UNSIGNED NOT NULL,
  `litros` decimal(12, 2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `inicio_tanque` decimal(12, 2) NULL DEFAULT NULL,
  `final_tanque` decimal(12, 2) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `d_ingreso_detalles_d_ingreso_id_foreign`(`d_ingreso_id` ASC) USING BTREE,
  INDEX `d_ingreso_detalles_d_tanque_id_foreign`(`d_tanque_id` ASC) USING BTREE,
  CONSTRAINT `d_ingreso_detalles_d_ingreso_id_foreign` FOREIGN KEY (`d_ingreso_id`) REFERENCES `d_ingresos` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `d_ingreso_detalles_d_tanque_id_foreign` FOREIGN KEY (`d_tanque_id`) REFERENCES `d_tanques` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of d_ingreso_detalles
-- ----------------------------
INSERT INTO `d_ingreso_detalles` VALUES (1, 1, 1, 1000.00, '2025-12-31 11:16:59', NULL, NULL);

-- ----------------------------
-- Table structure for d_ingresos
-- ----------------------------
DROP TABLE IF EXISTS `d_ingresos`;
CREATE TABLE `d_ingresos`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `d_proveedor_id` bigint UNSIGNED NOT NULL,
  `d_tipo_pago_id` bigint UNSIGNED NOT NULL,
  `numero_factura` int UNSIGNED NULL DEFAULT NULL COMMENT 'Correlativo global',
  `numero_factura_dia` int UNSIGNED NULL DEFAULT NULL COMMENT 'Correlativo diario',
  `nombre_chofer` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `placa_vehiculo` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `total_litros` decimal(12, 2) NOT NULL,
  `precio_unitario` decimal(12, 4) NOT NULL,
  `total` decimal(14, 2) NOT NULL,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `foto_recepcion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Ruta de la foto del camión/chofer en la recepción',
  `estado` enum('ACTIVO','ANULADO','PENDIENTE','FINALIZADO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'PENDIENTE',
  `user_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `d_ingresos_d_proveedor_id_foreign`(`d_proveedor_id` ASC) USING BTREE,
  INDEX `d_ingresos_d_tipo_pago_id_foreign`(`d_tipo_pago_id` ASC) USING BTREE,
  INDEX `d_ingresos_user_id_foreign`(`user_id` ASC) USING BTREE,
  INDEX `d_ingresos_fecha_index`(`fecha` ASC) USING BTREE,
  INDEX `d_ingresos_estado_index`(`estado` ASC) USING BTREE,
  CONSTRAINT `d_ingresos_d_proveedor_id_foreign` FOREIGN KEY (`d_proveedor_id`) REFERENCES `d_proveedores` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `d_ingresos_d_tipo_pago_id_foreign` FOREIGN KEY (`d_tipo_pago_id`) REFERENCES `d_tipos_pago` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `d_ingresos_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of d_ingresos
-- ----------------------------
INSERT INTO `d_ingresos` VALUES (1, '2025-12-31', 2, 3, 1, 1, NULL, NULL, 1000.00, 9.6800, 9680.00, 'RWA', NULL, 'PENDIENTE', 1, '2025-12-31 11:16:59');

-- ----------------------------
-- Table structure for d_maquinas
-- ----------------------------
DROP TABLE IF EXISTS `d_maquinas`;
CREATE TABLE `d_maquinas`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `d_division_id` bigint UNSIGNED NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `d_maquinas_codigo_unique`(`codigo` ASC) USING BTREE,
  INDEX `d_maquinas_d_division_id_foreign`(`d_division_id` ASC) USING BTREE,
  CONSTRAINT `d_maquinas_d_division_id_foreign` FOREIGN KEY (`d_division_id`) REFERENCES `d_divisiones` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of d_maquinas
-- ----------------------------
INSERT INTO `d_maquinas` VALUES (1, 'D6M', 3, 1, '2025-12-29 13:46:47', '2025-12-29 13:46:47');
INSERT INTO `d_maquinas` VALUES (2, 'JD-6155', 1, 1, '2025-12-29 13:46:47', '2025-12-29 13:46:47');
INSERT INTO `d_maquinas` VALUES (3, 'HILUX-01', 4, 1, '2025-12-29 13:46:47', '2025-12-29 13:46:47');

-- ----------------------------
-- Table structure for d_motivos_ajuste
-- ----------------------------
DROP TABLE IF EXISTS `d_motivos_ajuste`;
CREATE TABLE `d_motivos_ajuste`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of d_motivos_ajuste
-- ----------------------------
INSERT INTO `d_motivos_ajuste` VALUES (1, 'Reseteo de medidor', 1, '2025-12-29 13:46:49', '2025-12-29 13:46:49');
INSERT INTO `d_motivos_ajuste` VALUES (2, 'Corrección de lectura', 1, '2025-12-29 13:46:49', '2025-12-29 13:46:49');
INSERT INTO `d_motivos_ajuste` VALUES (3, 'Derrame accidental', 1, '2025-12-29 13:46:49', '2025-12-29 13:46:49');
INSERT INTO `d_motivos_ajuste` VALUES (4, 'Evaporación', 1, '2025-12-29 13:46:49', '2025-12-29 13:46:49');
INSERT INTO `d_motivos_ajuste` VALUES (5, 'Ajuste de inventario', 1, '2025-12-29 13:46:49', '2025-12-29 13:46:49');

-- ----------------------------
-- Table structure for d_movimientos
-- ----------------------------
DROP TABLE IF EXISTS `d_movimientos`;
CREATE TABLE `d_movimientos`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `d_tipo_movimiento_id` bigint UNSIGNED NOT NULL,
  `id_origen` bigint UNSIGNED NOT NULL COMMENT 'ID del registro origen (ingreso, egreso, etc.)',
  `fecha` date NOT NULL,
  `d_tanque_id` bigint UNSIGNED NOT NULL,
  `litros` decimal(12, 2) NOT NULL,
  `stock_antes` decimal(12, 2) NOT NULL,
  `stock_despues` decimal(12, 2) NOT NULL,
  `estado` enum('ACTIVO','ANULADO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVO',
  `user_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `d_movimientos_d_tanque_id_foreign`(`d_tanque_id` ASC) USING BTREE,
  INDEX `d_movimientos_user_id_foreign`(`user_id` ASC) USING BTREE,
  INDEX `d_movimientos_d_tipo_movimiento_id_id_origen_index`(`d_tipo_movimiento_id` ASC, `id_origen` ASC) USING BTREE,
  INDEX `d_movimientos_fecha_index`(`fecha` ASC) USING BTREE,
  CONSTRAINT `d_movimientos_d_tanque_id_foreign` FOREIGN KEY (`d_tanque_id`) REFERENCES `d_tanques` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `d_movimientos_d_tipo_movimiento_id_foreign` FOREIGN KEY (`d_tipo_movimiento_id`) REFERENCES `d_tipo_movimientos` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `d_movimientos_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of d_movimientos
-- ----------------------------

-- ----------------------------
-- Table structure for d_proveedores
-- ----------------------------
DROP TABLE IF EXISTS `d_proveedores`;
CREATE TABLE `d_proveedores`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `razon_social` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `nit` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `telefono` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `celular` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `direccion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of d_proveedores
-- ----------------------------
INSERT INTO `d_proveedores` VALUES (1, 'YPFB', 'Yacimientos Petrolíferos Fiscales Bolivianos', '1023287029', '800-10-1001', NULL, 'La Paz, Bolivia', 1, '2025-12-29 13:46:49', '2025-12-29 13:46:49');
INSERT INTO `d_proveedores` VALUES (2, 'Proveedor Diesel Local', 'Distribuidora de Combustibles S.R.L.', '123456789', NULL, '70012345', 'Santa Cruz, Bolivia', 1, '2025-12-29 13:46:49', '2025-12-29 13:46:49');

-- ----------------------------
-- Table structure for d_tanques
-- ----------------------------
DROP TABLE IF EXISTS `d_tanques`;
CREATE TABLE `d_tanques`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` enum('FIJO','MOVIL') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `d_ubicacion_fisica_id` bigint UNSIGNED NOT NULL,
  `capacidad_maxima` decimal(12, 2) NOT NULL,
  `stock_actual` decimal(12, 2) NOT NULL DEFAULT 0.00,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `d_tanques_d_ubicacion_fisica_id_foreign`(`d_ubicacion_fisica_id` ASC) USING BTREE,
  CONSTRAINT `d_tanques_d_ubicacion_fisica_id_foreign` FOREIGN KEY (`d_ubicacion_fisica_id`) REFERENCES `d_ubicaciones_fisicas` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of d_tanques
-- ----------------------------
INSERT INTO `d_tanques` VALUES (1, 'Tanque Estacionario 1', 'FIJO', 1, 10000.00, 4000.00, 1, '2025-12-29 13:46:47', '2025-12-29 15:33:02');
INSERT INTO `d_tanques` VALUES (2, 'Cisterna Reparto 01', 'MOVIL', 2, 3000.00, 0.00, 1, '2025-12-29 13:46:47', '2025-12-29 13:46:47');
INSERT INTO `d_tanques` VALUES (3, 'Ejemplo', 'MOVIL', 2, 5000.00, 0.00, 1, '2025-12-30 21:03:45', '2025-12-30 21:03:45');

-- ----------------------------
-- Table structure for d_tipo_movimientos
-- ----------------------------
DROP TABLE IF EXISTS `d_tipo_movimientos`;
CREATE TABLE `d_tipo_movimientos`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of d_tipo_movimientos
-- ----------------------------
INSERT INTO `d_tipo_movimientos` VALUES (1, 'INGRESO', 'Compra de combustible de proveedores', 1, '2025-12-29 13:46:57', '2025-12-29 13:46:57');
INSERT INTO `d_tipo_movimientos` VALUES (2, 'EGRESO', 'Despacho de combustible a máquinas', 1, '2025-12-29 13:46:57', '2025-12-29 13:46:57');
INSERT INTO `d_tipo_movimientos` VALUES (3, 'TRASPASO', 'Transferencia entre tanques', 1, '2025-12-29 13:46:57', '2025-12-29 13:46:57');
INSERT INTO `d_tipo_movimientos` VALUES (4, 'AJUSTE', 'Corrección de stock por diferencias', 1, '2025-12-29 13:46:57', '2025-12-29 13:46:57');

-- ----------------------------
-- Table structure for d_tipos_pago
-- ----------------------------
DROP TABLE IF EXISTS `d_tipos_pago`;
CREATE TABLE `d_tipos_pago`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of d_tipos_pago
-- ----------------------------
INSERT INTO `d_tipos_pago` VALUES (1, 'Efectivo', 1, '2025-12-29 13:46:49', '2025-12-29 13:46:49');
INSERT INTO `d_tipos_pago` VALUES (2, 'Crédito', 1, '2025-12-29 13:46:49', '2025-12-29 13:46:49');
INSERT INTO `d_tipos_pago` VALUES (3, 'Transferencia', 1, '2025-12-29 13:46:49', '2025-12-29 13:46:49');
INSERT INTO `d_tipos_pago` VALUES (4, 'Cheque', 1, '2025-12-29 13:46:49', '2025-12-29 13:46:49');

-- ----------------------------
-- Table structure for d_trabajos
-- ----------------------------
DROP TABLE IF EXISTS `d_trabajos`;
CREATE TABLE `d_trabajos`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of d_trabajos
-- ----------------------------
INSERT INTO `d_trabajos` VALUES (1, 'Agricultura', 1, '2025-12-29 13:46:47', '2025-12-29 13:46:47');
INSERT INTO `d_trabajos` VALUES (2, 'Ganaderia', 1, '2025-12-29 13:46:47', '2025-12-29 13:46:47');
INSERT INTO `d_trabajos` VALUES (3, 'Desmonte', 1, '2025-12-29 13:46:47', '2025-12-29 13:46:47');
INSERT INTO `d_trabajos` VALUES (4, 'Caminos', 1, '2025-12-29 13:46:47', '2025-12-29 13:46:47');
INSERT INTO `d_trabajos` VALUES (5, 'Madera', 1, '2025-12-29 13:46:47', '2025-12-29 13:46:47');
INSERT INTO `d_trabajos` VALUES (6, '2', 1, '2025-12-29 20:33:56', '2025-12-29 20:33:56');
INSERT INTO `d_trabajos` VALUES (7, 'ejemplo', 1, '2025-12-29 20:44:35', '2025-12-29 20:44:35');

-- ----------------------------
-- Table structure for d_ubicaciones_fisicas
-- ----------------------------
DROP TABLE IF EXISTS `d_ubicaciones_fisicas`;
CREATE TABLE `d_ubicaciones_fisicas`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `d_division_id` bigint UNSIGNED NULL DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `d_ubicaciones_fisicas_d_division_id_foreign`(`d_division_id` ASC) USING BTREE,
  CONSTRAINT `d_ubicaciones_fisicas_d_division_id_foreign` FOREIGN KEY (`d_division_id`) REFERENCES `d_divisiones` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of d_ubicaciones_fisicas
-- ----------------------------
INSERT INTO `d_ubicaciones_fisicas` VALUES (1, 'Surtidor Central', 3, 1, '2025-12-29 13:46:47', '2025-12-29 13:46:47');
INSERT INTO `d_ubicaciones_fisicas` VALUES (2, 'Surtidor 2 Central', 3, 1, '2025-12-29 13:46:47', '2025-12-29 13:46:47');

-- ----------------------------
-- Table structure for failed_jobs
-- ----------------------------
DROP TABLE IF EXISTS `failed_jobs`;
CREATE TABLE `failed_jobs`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `failed_jobs_uuid_unique`(`uuid` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of failed_jobs
-- ----------------------------

-- ----------------------------
-- Table structure for job_batches
-- ----------------------------
DROP TABLE IF EXISTS `job_batches`;
CREATE TABLE `job_batches`  (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `cancelled_at` int NULL DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of job_batches
-- ----------------------------

-- ----------------------------
-- Table structure for jobs
-- ----------------------------
DROP TABLE IF EXISTS `jobs`;
CREATE TABLE `jobs`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint UNSIGNED NOT NULL,
  `reserved_at` int UNSIGNED NULL DEFAULT NULL,
  `available_at` int UNSIGNED NOT NULL,
  `created_at` int UNSIGNED NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `jobs_queue_index`(`queue` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of jobs
-- ----------------------------

-- ----------------------------
-- Table structure for menu_role
-- ----------------------------
DROP TABLE IF EXISTS `menu_role`;
CREATE TABLE `menu_role`  (
  `menu_id` bigint UNSIGNED NOT NULL,
  `role_id` bigint UNSIGNED NOT NULL,
  PRIMARY KEY (`menu_id`, `role_id`) USING BTREE,
  INDEX `menu_role_role_id_foreign`(`role_id` ASC) USING BTREE,
  CONSTRAINT `menu_role_menu_id_foreign` FOREIGN KEY (`menu_id`) REFERENCES `menus` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `menu_role_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of menu_role
-- ----------------------------
INSERT INTO `menu_role` VALUES (1, 1);
INSERT INTO `menu_role` VALUES (2, 1);
INSERT INTO `menu_role` VALUES (3, 1);
INSERT INTO `menu_role` VALUES (4, 1);
INSERT INTO `menu_role` VALUES (5, 1);
INSERT INTO `menu_role` VALUES (6, 1);
INSERT INTO `menu_role` VALUES (7, 1);
INSERT INTO `menu_role` VALUES (8, 1);
INSERT INTO `menu_role` VALUES (9, 1);
INSERT INTO `menu_role` VALUES (10, 1);
INSERT INTO `menu_role` VALUES (11, 1);
INSERT INTO `menu_role` VALUES (12, 1);
INSERT INTO `menu_role` VALUES (13, 1);
INSERT INTO `menu_role` VALUES (14, 1);
INSERT INTO `menu_role` VALUES (15, 1);
INSERT INTO `menu_role` VALUES (16, 1);
INSERT INTO `menu_role` VALUES (17, 1);
INSERT INTO `menu_role` VALUES (18, 1);
INSERT INTO `menu_role` VALUES (19, 1);
INSERT INTO `menu_role` VALUES (20, 1);
INSERT INTO `menu_role` VALUES (21, 1);
INSERT INTO `menu_role` VALUES (22, 1);
INSERT INTO `menu_role` VALUES (23, 1);
INSERT INTO `menu_role` VALUES (24, 1);

-- ----------------------------
-- Table structure for menus
-- ----------------------------
DROP TABLE IF EXISTS `menus`;
CREATE TABLE `menus`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `icon` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `parent_id` bigint UNSIGNED NULL DEFAULT NULL,
  `order` int NOT NULL DEFAULT 0,
  `module` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Agrupador principal del sistema',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `menus_parent_id_foreign`(`parent_id` ASC) USING BTREE,
  CONSTRAINT `menus_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `menus` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 25 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of menus
-- ----------------------------
INSERT INTO `menus` VALUES (1, 'Sistemas', NULL, 'Settings', NULL, 99, 'Sistemas', 1, '2025-12-17 20:56:31', '2025-12-29 13:42:58');
INSERT INTO `menus` VALUES (2, 'Usuarios', '/sistemas/usuarios', 'Users', 1, 1, 'Sistemas', 1, '2025-12-17 20:56:31', '2025-12-29 13:42:58');
INSERT INTO `menus` VALUES (3, 'Control de Accesos', '/sistemas/accesos', 'Lock', 1, 2, 'Sistemas', 1, '2025-12-17 20:56:31', '2025-12-29 13:42:58');
INSERT INTO `menus` VALUES (4, 'Comunicación', NULL, 'MessageCircle', NULL, 10, 'Chat', 1, '2025-12-17 20:56:31', '2025-12-29 13:42:58');
INSERT INTO `menus` VALUES (5, 'Chat', '/chat', 'MessageCircle', 4, 1, 'Chat', 1, '2025-12-17 20:56:31', '2025-12-29 13:42:58');
INSERT INTO `menus` VALUES (6, 'Configuración', '/sistemas/configuracion', 'Wrench', 1, 3, 'Sistemas', 1, '2025-12-17 22:30:40', '2025-12-29 13:42:58');
INSERT INTO `menus` VALUES (7, 'Administración de Menús', '/sistemas/menus', 'FolderTree', 1, 4, 'Sistemas', 1, '2025-12-18 23:38:27', '2025-12-29 13:42:58');
INSERT INTO `menus` VALUES (8, 'RRHH', NULL, 'Users', NULL, 20, 'RRHH', 1, '2025-12-22 13:41:34', '2025-12-22 13:41:34');
INSERT INTO `menus` VALUES (9, 'Cargos', '/rrhh/cargos', 'Briefcase', 8, 1, 'RRHH', 1, '2025-12-22 13:41:34', '2025-12-22 13:41:34');
INSERT INTO `menus` VALUES (10, 'Personal', '/rrhh/personal', 'UserCircle', 8, 2, 'RRHH', 1, '2025-12-22 13:41:34', '2025-12-22 13:41:34');
INSERT INTO `menus` VALUES (11, 'Configuraciones Diesel', NULL, 'Fuel', NULL, 50, 'DIESEL', 1, '2025-12-29 13:46:38', '2025-12-29 13:46:38');
INSERT INTO `menus` VALUES (12, 'Trabajos', '/diesel/trabajos', 'Hammer', 11, 1, 'DIESEL', 1, '2025-12-29 13:46:38', '2025-12-29 13:46:38');
INSERT INTO `menus` VALUES (13, 'Divisiones', '/diesel/divisiones', 'Building2', 11, 2, 'DIESEL', 1, '2025-12-29 13:46:38', '2025-12-29 13:46:38');
INSERT INTO `menus` VALUES (14, 'Proveedores', '/diesel/proveedores', 'Truck', 11, 3, 'DIESEL', 1, '2025-12-29 13:46:38', '2025-12-29 13:46:38');
INSERT INTO `menus` VALUES (15, 'Tipos de Pago', '/diesel/tipos-pago', 'CreditCard', 11, 4, 'DIESEL', 1, '2025-12-29 13:46:38', '2025-12-29 13:46:38');
INSERT INTO `menus` VALUES (16, 'Motivos de Ajuste', '/diesel/motivos-ajuste', 'ClipboardList', 11, 5, 'DIESEL', 1, '2025-12-29 13:46:38', '2025-12-29 13:46:38');
INSERT INTO `menus` VALUES (17, 'Ubicaciones Físicas', '/diesel/ubicaciones', 'MapPin', 11, 6, 'DIESEL', 1, '2025-12-29 13:46:53', '2025-12-29 13:46:53');
INSERT INTO `menus` VALUES (18, 'Tanques', '/diesel/tanques', 'Container', 11, 7, 'DIESEL', 1, '2025-12-29 13:46:53', '2025-12-29 13:46:53');
INSERT INTO `menus` VALUES (19, 'Máquinas', '/diesel/maquinas', 'Cog', 11, 8, 'DIESEL', 1, '2025-12-29 13:46:53', '2025-12-29 13:46:53');
INSERT INTO `menus` VALUES (20, 'Tipos de Movimiento', '/diesel/tipos-movimiento', 'Settings2', 11, 9, 'DIESEL', 1, '2025-12-29 13:46:55', '2025-12-29 13:46:55');
INSERT INTO `menus` VALUES (21, 'Operaciones Diesel', NULL, 'Activity', NULL, 51, 'DIESEL', 1, '2025-12-29 13:46:55', '2025-12-29 13:46:55');
INSERT INTO `menus` VALUES (22, 'Ingresos de Combustible', '/diesel/ingresos', 'Download', 21, 1, 'DIESEL', 1, '2025-12-29 13:46:55', '2025-12-29 13:46:55');
INSERT INTO `menus` VALUES (23, 'Grupos de Seguridad', '/sistemas/niveles-seguridad', 'Shield', 1, 5, 'Sistemas', 1, NULL, '2025-12-29 14:18:57');
INSERT INTO `menus` VALUES (24, 'Recepcion', '/diesel/recepcion', NULL, 21, 2, 'DIESEL', 1, '2025-12-31 15:16:08', '2025-12-31 15:16:08');

-- ----------------------------
-- Table structure for messages
-- ----------------------------
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `conversation_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `body` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('sent','delivered','read') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'sent',
  `delivered_at` timestamp NULL DEFAULT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `messages_conversation_id_foreign`(`conversation_id` ASC) USING BTREE,
  INDEX `messages_user_id_foreign`(`user_id` ASC) USING BTREE,
  CONSTRAINT `messages_conversation_id_foreign` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `messages_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of messages
-- ----------------------------

-- ----------------------------
-- Table structure for migrations
-- ----------------------------
DROP TABLE IF EXISTS `migrations`;
CREATE TABLE `migrations`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 27 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of migrations
-- ----------------------------
INSERT INTO `migrations` VALUES (1, '0001_01_01_000000_create_users_table', 1);
INSERT INTO `migrations` VALUES (2, '0001_01_01_000001_create_cache_table', 1);
INSERT INTO `migrations` VALUES (3, '0001_01_01_000002_create_jobs_table', 1);
INSERT INTO `migrations` VALUES (4, '2024_01_01_000001_create_chat_tables', 1);
INSERT INTO `migrations` VALUES (5, '2025_12_17_145753_create_personal_access_tokens_table', 1);
INSERT INTO `migrations` VALUES (6, '2025_12_17_162500_create_access_control_tables', 1);
INSERT INTO `migrations` VALUES (7, '2025_12_17_222048_create_settings_table', 2);
INSERT INTO `migrations` VALUES (8, '2025_12_18_233736_add_menu_admin_page', 3);
INSERT INTO `migrations` VALUES (9, '2025_12_18_151932_create_chat_system_tables', 4);
INSERT INTO `migrations` VALUES (10, '2025_12_18_153113_add_message_status_to_messages_table', 4);
INSERT INTO `migrations` VALUES (11, '2025_12_19_140018_add_timestamps_to_conversation_user_table', 5);
INSERT INTO `migrations` VALUES (12, '2025_12_19_140348_add_unread_count_to_conversation_user', 6);
INSERT INTO `migrations` VALUES (13, '2025_12_22_132500_create_rrhh_tables', 7);
INSERT INTO `migrations` VALUES (14, '2025_12_22_133500_add_rrhh_menu', 8);
INSERT INTO `migrations` VALUES (15, '2025_12_22_141500_add_session_timeout_to_roles', 9);
INSERT INTO `migrations` VALUES (16, '2025_12_22_111500_modify_personal_table', 10);
INSERT INTO `migrations` VALUES (17, '2025_12_26_150000_create_tanques_table', 11);
INSERT INTO `migrations` VALUES (18, '2024_12_29_010000_create_diesel_tables', 12);
INSERT INTO `migrations` VALUES (19, '2024_12_29_020000_create_diesel_extras_tables', 12);
INSERT INTO `migrations` VALUES (20, '2024_12_29_040000_create_diesel_movimientos_tables', 12);
INSERT INTO `migrations` VALUES (21, '2025_12_22_134500_modify_personal_table', 13);
INSERT INTO `migrations` VALUES (22, '2025_12_29_135547_create_security_levels_tables', 14);
INSERT INTO `migrations` VALUES (23, '2025_12_22_134501_modify_personal_table', 15);
INSERT INTO `migrations` VALUES (24, '2025_12_31_130412_add_pendiente_to_d_ingresos_estado', 15);
INSERT INTO `migrations` VALUES (25, '2025_12_31_131418_add_foto_recepcion_to_d_ingresos', 15);
INSERT INTO `migrations` VALUES (26, '2025_12_31_132943_add_recepcionado_to_d_bitacora_ingresos_accion', 16);

-- ----------------------------
-- Table structure for niveles_seguridad
-- ----------------------------
DROP TABLE IF EXISTS `niveles_seguridad`;
CREATE TABLE `niveles_seguridad`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `color` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '#6b7280',
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `niveles_seguridad_nombre_unique`(`nombre` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of niveles_seguridad
-- ----------------------------
INSERT INTO `niveles_seguridad` VALUES (1, 'Administración', '#3b82f6', 'Grupo de administración general', 1, '2025-12-29 14:01:37', '2025-12-29 14:01:37');
INSERT INTO `niveles_seguridad` VALUES (2, 'Operaciones', '#10b981', 'Personal de operaciones', 1, '2025-12-29 14:01:37', '2025-12-29 14:01:37');
INSERT INTO `niveles_seguridad` VALUES (3, 'Supervisores', '#f59e0b', 'Supervisores de campo', 1, '2025-12-29 14:01:37', '2025-12-29 14:01:37');

-- ----------------------------
-- Table structure for password_reset_tokens
-- ----------------------------
DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE `password_reset_tokens`  (
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of password_reset_tokens
-- ----------------------------

-- ----------------------------
-- Table structure for permission_role
-- ----------------------------
DROP TABLE IF EXISTS `permission_role`;
CREATE TABLE `permission_role`  (
  `permission_id` bigint UNSIGNED NOT NULL,
  `role_id` bigint UNSIGNED NOT NULL,
  PRIMARY KEY (`permission_id`, `role_id`) USING BTREE,
  INDEX `permission_role_role_id_foreign`(`role_id` ASC) USING BTREE,
  CONSTRAINT `permission_role_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `permission_role_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of permission_role
-- ----------------------------

-- ----------------------------
-- Table structure for permissions
-- ----------------------------
DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `module` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Modulo al que pertenece: Sistemas, Ventas, etc',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `permissions_slug_unique`(`slug` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of permissions
-- ----------------------------

-- ----------------------------
-- Table structure for personal
-- ----------------------------
DROP TABLE IF EXISTS `personal`;
CREATE TABLE `personal`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido_paterno` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido_materno` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `ci` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `pin` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `fecha_nacimiento` date NULL DEFAULT NULL,
  `genero` enum('M','F','O') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `direccion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `telefono` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `cargo_id` bigint UNSIGNED NOT NULL,
  `nivel_seguridad_id` bigint UNSIGNED NULL DEFAULT NULL,
  `fecha_ingreso` date NOT NULL,
  `fecha_salida` date NULL DEFAULT NULL,
  `salario` decimal(12, 2) NULL DEFAULT NULL,
  `tipo_contrato` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `estado` enum('activo','inactivo') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'activo',
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `user_id` bigint UNSIGNED NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `personal_ci_unique`(`ci` ASC) USING BTREE,
  UNIQUE INDEX `personal_user_id_unique`(`user_id` ASC) USING BTREE,
  INDEX `personal_cargo_id_foreign`(`cargo_id` ASC) USING BTREE,
  INDEX `personal_nivel_seguridad_id_foreign`(`nivel_seguridad_id` ASC) USING BTREE,
  CONSTRAINT `personal_cargo_id_foreign` FOREIGN KEY (`cargo_id`) REFERENCES `cargos` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `personal_nivel_seguridad_id_foreign` FOREIGN KEY (`nivel_seguridad_id`) REFERENCES `niveles_seguridad` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `personal_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of personal
-- ----------------------------
INSERT INTO `personal` VALUES (1, 'juan', 'perez', NULL, '5234', NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, '2025-12-22', NULL, NULL, NULL, 'inactivo', NULL, NULL, '2025-12-22 15:00:04', '2025-12-22 15:21:09');
INSERT INTO `personal` VALUES (2, 'Rene Marcelo', 'Oruño', 'Ardaya', '12345', '$2y$12$9GakkloRF5AChVfrShbSUuGQloxg2/qM6S22YRMkqxbZW0DuUcaNK', '2000-12-01', NULL, NULL, '76051575', NULL, 1, NULL, '2025-12-22', NULL, 1400.00, 'negro', 'activo', NULL, NULL, '2025-12-22 15:28:00', '2025-12-29 14:29:44');

-- ----------------------------
-- Table structure for personal_access_tokens
-- ----------------------------
DROP TABLE IF EXISTS `personal_access_tokens`;
CREATE TABLE `personal_access_tokens`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint UNSIGNED NOT NULL,
  `name` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `personal_access_tokens_token_unique`(`token` ASC) USING BTREE,
  INDEX `personal_access_tokens_tokenable_type_tokenable_id_index`(`tokenable_type` ASC, `tokenable_id` ASC) USING BTREE,
  INDEX `personal_access_tokens_expires_at_index`(`expires_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 45 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of personal_access_tokens
-- ----------------------------
INSERT INTO `personal_access_tokens` VALUES (44, 'App\\Models\\User', 1, 'auth-token', '34513802df7acafee9f9e5cf5f9464312d4eb5877f39e89bb6780da121304032', '[\"*\"]', '2025-12-31 18:29:33', NULL, '2025-12-31 18:29:26', '2025-12-31 18:29:33');

-- ----------------------------
-- Table structure for role_user
-- ----------------------------
DROP TABLE IF EXISTS `role_user`;
CREATE TABLE `role_user`  (
  `role_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  PRIMARY KEY (`role_id`, `user_id`) USING BTREE,
  INDEX `role_user_user_id_foreign`(`user_id` ASC) USING BTREE,
  CONSTRAINT `role_user_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `role_user_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of role_user
-- ----------------------------
INSERT INTO `role_user` VALUES (1, 1);
INSERT INTO `role_user` VALUES (2, 2);

-- ----------------------------
-- Table structure for roles
-- ----------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `session_timeout_minutes` int NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `roles_slug_unique`(`slug` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of roles
-- ----------------------------
INSERT INTO `roles` VALUES (1, 'Super Admin', 'super-admin', 'Acceso total al sistema', 1, NULL, '2025-12-17 20:56:31', '2025-12-31 15:16:20');
INSERT INTO `roles` VALUES (2, 'Usuario', 'user', 'Acceso limitado', 1, 60, '2025-12-17 20:56:31', '2025-12-29 13:42:58');

-- ----------------------------
-- Table structure for sessions
-- ----------------------------
DROP TABLE IF EXISTS `sessions`;
CREATE TABLE `sessions`  (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED NULL DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `sessions_user_id_index`(`user_id` ASC) USING BTREE,
  INDEX `sessions_last_activity_index`(`last_activity` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sessions
-- ----------------------------
INSERT INTO `sessions` VALUES ('9PumuFZbW5PJhmfg0pTKQXDhX5Yq0jeMvnBzuiKO', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:146.0) Gecko/20100101 Firefox/146.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiTkVWWGFKZ012Y3lhR1VtVkhpVFhRd2J0c3FzendJbTBES0ZDdVNJNiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDg6Imh0dHA6Ly9yZW1pbmQtZGVjbGFyZS1sZWUtcmFuay50cnljbG91ZGZsYXJlLmNvbSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1767130395);
INSERT INTO `sessions` VALUES ('RHxmoZxCPL8Z6XiMaxnJWzgU1YNMEVwr9qfCplzi', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoibnlJVTAzcTBRT3BXNVFDNndrZXVqQnhLQ3ZSZ0Exd3ZVTGN0OUpkbSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319fQ==', 1766153431);

-- ----------------------------
-- Table structure for settings
-- ----------------------------
DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'text',
  `group` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'general',
  `label` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `is_public` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `settings_key_unique`(`key` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 21 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of settings
-- ----------------------------
INSERT INTO `settings` VALUES (1, 'app_name', 'Zdemo01', 'text', 'branding', 'Nombre de la Aplicación', 'Nombre que aparece en el título del navegador y manifest', 1, '2025-12-17 22:23:49', '2025-12-17 23:12:59');
INSERT INTO `settings` VALUES (2, 'app_short_name', 'Zdemo', 'text', 'branding', 'Nombre Corto', 'Nombre corto para PWA y dispositivos móviles', 1, '2025-12-17 22:23:49', '2025-12-17 22:23:49');
INSERT INTO `settings` VALUES (3, 'app_description', 'Sistema de Gestión Empresarial', 'text', 'branding', 'Descripción', 'Descripción de la aplicación para SEO y manifest', 1, '2025-12-17 22:23:49', '2025-12-17 22:23:49');
INSERT INTO `settings` VALUES (4, 'logo_sidebar', NULL, 'image', 'branding', 'Logo del Sidebar', 'Logo que aparece en el menú lateral. Tamaño recomendado: 180x50px', 1, '2025-12-17 22:23:49', '2025-12-17 22:23:49');
INSERT INTO `settings` VALUES (5, 'logo_sidebar_collapsed', NULL, 'image', 'branding', 'Logo Sidebar (Colapsado)', 'Logo pequeño cuando el sidebar está cerrado. Tamaño: 40x40px', 1, '2025-12-17 22:23:49', '2025-12-17 22:23:49');
INSERT INTO `settings` VALUES (6, 'logo_login', NULL, 'image', 'branding', 'Logo del Login (Principal)', 'Logo grande que aparece en la página de login', 1, '2025-12-17 22:23:49', '2025-12-17 23:01:02');
INSERT INTO `settings` VALUES (7, 'logo_login_secondary', NULL, 'image', 'branding', 'Logo del Login (Secundario)', 'Logo o imagen que aparece a la derecha del login', 1, '2025-12-17 22:23:49', '2025-12-29 13:42:58');
INSERT INTO `settings` VALUES (8, 'login_title', 'Bienvenido', 'text', 'branding', 'Título del Login', 'Texto grande que aparece en la página de login', 1, '2025-12-17 22:23:49', '2025-12-17 22:23:49');
INSERT INTO `settings` VALUES (9, 'login_subtitle', 'Inicia sesión para continuar', 'text', 'branding', 'Subtítulo del Login', 'Texto secundario en la página de login', 1, '2025-12-17 22:23:49', '2025-12-17 22:23:49');
INSERT INTO `settings` VALUES (10, 'favicon', NULL, 'image', 'branding', 'Favicon', 'Icono que aparece en la pestaña del navegador. Formato: .ico, .png o .svg', 1, '2025-12-17 22:23:49', '2025-12-17 22:23:49');
INSERT INTO `settings` VALUES (11, 'primary_color', '#15428b', 'text', 'branding', 'Color Primario', 'Color principal del tema (hexadecimal)', 1, '2025-12-17 22:23:49', '2025-12-29 13:42:58');
INSERT INTO `settings` VALUES (12, 'secondary_color', '#4388cf', 'text', 'branding', 'Color Secundario', 'Color secundario del tema (hexadecimal)', 1, '2025-12-17 22:23:49', '2025-12-29 13:42:58');
INSERT INTO `settings` VALUES (13, 'company_name', 'Mi Empresa', 'text', 'general', 'Nombre de la Empresa', 'Razón social o nombre comercial', 0, '2025-12-17 22:23:49', '2025-12-17 22:23:49');
INSERT INTO `settings` VALUES (14, 'company_rif', NULL, 'text', 'general', 'RIF / NIT', 'Identificación fiscal de la empresa', 0, '2025-12-17 22:23:49', '2025-12-17 22:23:49');
INSERT INTO `settings` VALUES (15, 'company_address', NULL, 'text', 'general', 'Dirección', 'Dirección física de la empresa', 0, '2025-12-17 22:23:49', '2025-12-17 22:23:49');
INSERT INTO `settings` VALUES (16, 'company_phone', NULL, 'text', 'general', 'Teléfono', 'Teléfono principal de contacto', 0, '2025-12-17 22:23:49', '2025-12-17 22:23:49');
INSERT INTO `settings` VALUES (17, 'company_email', NULL, 'text', 'general', 'Correo Electrónico', 'Email principal de la empresa', 0, '2025-12-17 22:23:49', '2025-12-17 22:23:49');
INSERT INTO `settings` VALUES (18, 'theme_bg_color', '#1d1b1b', 'text', 'branding', 'Color de Fondo', 'Color de fondo principal de la aplicación', 1, '2025-12-17 23:12:59', '2025-12-17 23:25:03');
INSERT INTO `settings` VALUES (19, 'theme_panel_color', '#0033ff', 'text', 'branding', 'Color de Paneles', 'Color de cabeceras de paneles y barras', 1, '2025-12-17 23:12:59', '2025-12-17 23:20:43');
INSERT INTO `settings` VALUES (20, 'theme_text_color', '#171717', 'text', 'branding', 'Color de Texto', 'Color principal del texto', 1, '2025-12-17 23:12:59', '2025-12-17 23:20:52');

-- ----------------------------
-- Table structure for tanques
-- ----------------------------
DROP TABLE IF EXISTS `tanques`;
CREATE TABLE `tanques`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `tipo` enum('ESTATICO','MOVIL') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ESTATICO',
  `capacidad_litros` decimal(12, 2) NOT NULL,
  `nivel_actual` decimal(12, 2) NOT NULL DEFAULT 0.00,
  `nivel_minimo_alerta` decimal(12, 2) NOT NULL DEFAULT 0.00,
  `ubicacion_fija` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `placa_cisterna` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `responsable_id` bigint UNSIGNED NULL DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `tanques_codigo_unique`(`codigo` ASC) USING BTREE,
  INDEX `tanques_responsable_id_foreign`(`responsable_id` ASC) USING BTREE,
  CONSTRAINT `tanques_responsable_id_foreign` FOREIGN KEY (`responsable_id`) REFERENCES `personal` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of tanques
-- ----------------------------

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `remember_token` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `users_email_unique`(`email` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'Administrador', 'admin@admin.com', NULL, '$2y$12$WrgqCGDFXQ2mJxsVgFDsnusi4em98wcZEvVJsGuKx4F4RNN1VaL1q', 1, NULL, '2025-12-17 20:56:31', '2025-12-31 15:22:02');
INSERT INTO `users` VALUES (2, 'rene', 'renemarceloardaya@gmail.com', NULL, '$2y$12$hd69nLiG6Yj2VR6wM9gMq.9.BoS.AVmZXc3I0YSUrLld.CAu/yxpC', 1, NULL, '2025-12-19 13:55:22', '2025-12-19 13:55:22');

SET FOREIGN_KEY_CHECKS = 1;
