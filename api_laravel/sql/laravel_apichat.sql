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

 Date: 26/12/2025 06:27:03
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for bitacora_formularios
-- ----------------------------
DROP TABLE IF EXISTS `bitacora_formularios`;
CREATE TABLE `bitacora_formularios`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `tipo_formulario` enum('INGRESO','EGRESO') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `formulario_id` bigint UNSIGNED NOT NULL,
  `personal_id` bigint UNSIGNED NOT NULL,
  `ubicacion_pin_id` bigint UNSIGNED NOT NULL,
  `accion` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `observacion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `fecha_hora` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `personal_id`(`personal_id` ASC) USING BTREE,
  INDEX `ubicacion_pin_id`(`ubicacion_pin_id` ASC) USING BTREE,
  CONSTRAINT `bitacora_formularios_ibfk_1` FOREIGN KEY (`personal_id`) REFERENCES `personal` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `bitacora_formularios_ibfk_2` FOREIGN KEY (`ubicacion_pin_id`) REFERENCES `ubicaciones_pin` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of bitacora_formularios
-- ----------------------------

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
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of cargos
-- ----------------------------

-- ----------------------------
-- Table structure for conversation_user
-- ----------------------------
DROP TABLE IF EXISTS `conversation_user`;
CREATE TABLE `conversation_user`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `conversation_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `last_read_at` timestamp NULL DEFAULT NULL,
  `unread_count` int NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `conversation_user_conversation_id_user_id_unique`(`conversation_id` ASC, `user_id` ASC) USING BTREE,
  INDEX `conversation_user_user_id_foreign`(`user_id` ASC) USING BTREE,
  CONSTRAINT `conversation_user_conversation_id_foreign` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `conversation_user_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of conversation_user
-- ----------------------------

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
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of conversations
-- ----------------------------

-- ----------------------------
-- Table structure for detalle_egresos
-- ----------------------------
DROP TABLE IF EXISTS `detalle_egresos`;
CREATE TABLE `detalle_egresos`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `egreso_id` bigint UNSIGNED NOT NULL,
  `tanque_id` bigint UNSIGNED NOT NULL,
  `litros` decimal(12, 2) NOT NULL,
  `medidor_inicio` decimal(12, 2) NOT NULL,
  `medidor_fin` decimal(12, 2) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `egreso_id`(`egreso_id` ASC) USING BTREE,
  INDEX `tanque_id`(`tanque_id` ASC) USING BTREE,
  CONSTRAINT `detalle_egresos_ibfk_1` FOREIGN KEY (`egreso_id`) REFERENCES `egresos` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `detalle_egresos_ibfk_2` FOREIGN KEY (`tanque_id`) REFERENCES `tanques` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of detalle_egresos
-- ----------------------------

-- ----------------------------
-- Table structure for detalle_ingresos
-- ----------------------------
DROP TABLE IF EXISTS `detalle_ingresos`;
CREATE TABLE `detalle_ingresos`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `ingreso_id` bigint UNSIGNED NOT NULL,
  `tanque_id` bigint UNSIGNED NOT NULL,
  `litros` decimal(12, 2) NOT NULL,
  `precio_unitario` decimal(10, 2) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `ingreso_id`(`ingreso_id` ASC) USING BTREE,
  INDEX `tanque_id`(`tanque_id` ASC) USING BTREE,
  CONSTRAINT `detalle_ingresos_ibfk_1` FOREIGN KEY (`ingreso_id`) REFERENCES `ingresos` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `detalle_ingresos_ibfk_2` FOREIGN KEY (`tanque_id`) REFERENCES `tanques` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of detalle_ingresos
-- ----------------------------

-- ----------------------------
-- Table structure for divisiones
-- ----------------------------
DROP TABLE IF EXISTS `divisiones`;
CREATE TABLE `divisiones`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `is_active` tinyint(1) NULL DEFAULT 1,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of divisiones
-- ----------------------------

-- ----------------------------
-- Table structure for egresos
-- ----------------------------
DROP TABLE IF EXISTS `egresos`;
CREATE TABLE `egresos`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `fecha` datetime NOT NULL,
  `nro_recibo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `maquina_id` bigint UNSIGNED NOT NULL,
  `trabajo_id` bigint UNSIGNED NULL DEFAULT NULL,
  `horometro_actual` decimal(12, 2) NULL DEFAULT NULL,
  `personal_entrega_id` bigint UNSIGNED NOT NULL,
  `personal_recibe_id` bigint UNSIGNED NOT NULL,
  `usuario_registro_id` bigint UNSIGNED NOT NULL,
  `estado` enum('VALIDO','ANULADO') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'VALIDO',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `maquina_id`(`maquina_id` ASC) USING BTREE,
  INDEX `trabajo_id`(`trabajo_id` ASC) USING BTREE,
  INDEX `personal_entrega_id`(`personal_entrega_id` ASC) USING BTREE,
  INDEX `personal_recibe_id`(`personal_recibe_id` ASC) USING BTREE,
  CONSTRAINT `egresos_ibfk_1` FOREIGN KEY (`maquina_id`) REFERENCES `maquinas` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `egresos_ibfk_2` FOREIGN KEY (`trabajo_id`) REFERENCES `trabajos` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `egresos_ibfk_3` FOREIGN KEY (`personal_entrega_id`) REFERENCES `personal` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `egresos_ibfk_4` FOREIGN KEY (`personal_recibe_id`) REFERENCES `personal` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of egresos
-- ----------------------------

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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of failed_jobs
-- ----------------------------

-- ----------------------------
-- Table structure for ingresos
-- ----------------------------
DROP TABLE IF EXISTS `ingresos`;
CREATE TABLE `ingresos`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `fecha` datetime NOT NULL,
  `proveedor` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `nro_factura` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `chofer_externo` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `usuario_registro_id` bigint UNSIGNED NOT NULL,
  `estado` enum('VALIDO','ANULADO') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'VALIDO',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ingresos
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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of jobs
-- ----------------------------

-- ----------------------------
-- Table structure for maquinas
-- ----------------------------
DROP TABLE IF EXISTS `maquinas`;
CREATE TABLE `maquinas`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `division_id` bigint UNSIGNED NOT NULL,
  `is_active` tinyint(1) NULL DEFAULT 1,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `codigo`(`codigo` ASC) USING BTREE,
  INDEX `division_id`(`division_id` ASC) USING BTREE,
  CONSTRAINT `maquinas_ibfk_1` FOREIGN KEY (`division_id`) REFERENCES `divisiones` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of maquinas
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
) ENGINE = InnoDB AUTO_INCREMENT = 11 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of menus
-- ----------------------------
INSERT INTO `menus` VALUES (1, 'RRHH', NULL, 'Users', NULL, 20, 'RRHH', 1, '2025-12-26 10:26:25', '2025-12-26 10:26:25');
INSERT INTO `menus` VALUES (2, 'Cargos', '/rrhh/cargos', 'Briefcase', 1, 1, 'RRHH', 1, '2025-12-26 10:26:25', '2025-12-26 10:26:25');
INSERT INTO `menus` VALUES (3, 'Personal', '/rrhh/personal', 'UserCircle', 1, 2, 'RRHH', 1, '2025-12-26 10:26:25', '2025-12-26 10:26:25');
INSERT INTO `menus` VALUES (4, 'Sistemas', NULL, 'Settings', NULL, 99, 'Sistemas', 1, '2025-12-26 10:26:25', '2025-12-26 10:26:25');
INSERT INTO `menus` VALUES (5, 'Usuarios', '/sistemas/usuarios', 'Users', 4, 1, 'Sistemas', 1, '2025-12-26 10:26:25', '2025-12-26 10:26:25');
INSERT INTO `menus` VALUES (6, 'Control de Accesos', '/sistemas/accesos', 'Lock', 4, 2, 'Sistemas', 1, '2025-12-26 10:26:25', '2025-12-26 10:26:25');
INSERT INTO `menus` VALUES (7, 'Configuración', '/sistemas/configuracion', 'Wrench', 4, 3, 'Sistemas', 1, '2025-12-26 10:26:25', '2025-12-26 10:26:25');
INSERT INTO `menus` VALUES (8, 'Administración de Menús', '/sistemas/menus', 'FolderTree', 4, 4, 'Sistemas', 1, '2025-12-26 10:26:25', '2025-12-26 10:26:25');
INSERT INTO `menus` VALUES (9, 'Comunicación', NULL, 'MessageCircle', NULL, 10, 'Chat', 1, '2025-12-26 10:26:25', '2025-12-26 10:26:25');
INSERT INTO `menus` VALUES (10, 'Chat', '/chat', 'MessageCircle', 9, 1, 'Chat', 1, '2025-12-26 10:26:25', '2025-12-26 10:26:25');

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
  INDEX `messages_user_id_foreign`(`user_id` ASC) USING BTREE,
  INDEX `messages_conversation_id_created_at_index`(`conversation_id` ASC, `created_at` ASC) USING BTREE,
  CONSTRAINT `messages_conversation_id_foreign` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `messages_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

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
) ENGINE = InnoDB AUTO_INCREMENT = 16 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of migrations
-- ----------------------------
INSERT INTO `migrations` VALUES (1, '0001_01_01_000000_create_users_table', 1);
INSERT INTO `migrations` VALUES (2, '0001_01_01_000001_create_cache_table', 1);
INSERT INTO `migrations` VALUES (3, '0001_01_01_000002_create_jobs_table', 1);
INSERT INTO `migrations` VALUES (4, '2025_12_17_145753_create_personal_access_tokens_table', 1);
INSERT INTO `migrations` VALUES (5, '2025_12_17_162500_create_access_control_tables', 1);
INSERT INTO `migrations` VALUES (6, '2025_12_17_222048_create_settings_table', 1);
INSERT INTO `migrations` VALUES (7, '2025_12_18_151932_create_chat_system_tables', 1);
INSERT INTO `migrations` VALUES (8, '2025_12_18_153113_add_message_status_to_messages_table', 1);
INSERT INTO `migrations` VALUES (9, '2025_12_18_233736_add_menu_admin_page', 1);
INSERT INTO `migrations` VALUES (10, '2025_12_19_140018_add_timestamps_to_conversation_user_table', 1);
INSERT INTO `migrations` VALUES (11, '2025_12_19_140348_add_unread_count_to_conversation_user', 1);
INSERT INTO `migrations` VALUES (12, '2025_12_22_132500_create_rrhh_tables', 1);
INSERT INTO `migrations` VALUES (13, '2025_12_22_133500_add_rrhh_menu', 1);
INSERT INTO `migrations` VALUES (14, '2025_12_22_134500_modify_personal_table', 1);
INSERT INTO `migrations` VALUES (15, '2025_12_22_141500_add_session_timeout_to_roles', 1);

-- ----------------------------
-- Table structure for niveles_seguridad
-- ----------------------------
DROP TABLE IF EXISTS `niveles_seguridad`;
CREATE TABLE `niveles_seguridad`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `nivel` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of niveles_seguridad
-- ----------------------------

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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

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
  CONSTRAINT `personal_cargo_id_foreign` FOREIGN KEY (`cargo_id`) REFERENCES `cargos` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `personal_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of personal
-- ----------------------------

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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of personal_access_tokens
-- ----------------------------

-- ----------------------------
-- Table structure for personal_pin_acceso
-- ----------------------------
DROP TABLE IF EXISTS `personal_pin_acceso`;
CREATE TABLE `personal_pin_acceso`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `personal_id` bigint UNSIGNED NOT NULL,
  `ubicacion_pin_id` bigint UNSIGNED NOT NULL,
  `nivel_seguridad_id` bigint UNSIGNED NOT NULL,
  `is_active` tinyint(1) NULL DEFAULT 1,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uniq_permiso`(`personal_id` ASC, `ubicacion_pin_id` ASC) USING BTREE,
  INDEX `ubicacion_pin_id`(`ubicacion_pin_id` ASC) USING BTREE,
  INDEX `nivel_seguridad_id`(`nivel_seguridad_id` ASC) USING BTREE,
  CONSTRAINT `personal_pin_acceso_ibfk_1` FOREIGN KEY (`personal_id`) REFERENCES `personal` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `personal_pin_acceso_ibfk_2` FOREIGN KEY (`ubicacion_pin_id`) REFERENCES `ubicaciones_pin` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `personal_pin_acceso_ibfk_3` FOREIGN KEY (`nivel_seguridad_id`) REFERENCES `niveles_seguridad` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of personal_pin_acceso
-- ----------------------------

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
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of roles
-- ----------------------------
INSERT INTO `roles` VALUES (1, 'Super Admin', 'super-admin', 'Acceso total al sistema', 1, NULL, '2025-12-26 10:26:25', '2025-12-26 10:26:25');
INSERT INTO `roles` VALUES (2, 'Usuario', 'user', 'Acceso limitado', 1, 60, '2025-12-26 10:26:25', '2025-12-26 10:26:25');

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
) ENGINE = InnoDB AUTO_INCREMENT = 17 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of settings
-- ----------------------------
INSERT INTO `settings` VALUES (1, 'app_name', 'Zdemo01', 'text', 'branding', 'Nombre de la Aplicación', 'Nombre que aparece en el título del navegador y manifest', 1, '2025-12-26 10:26:25', '2025-12-26 10:26:25');
INSERT INTO `settings` VALUES (2, 'app_short_name', 'Zdemo', 'text', 'branding', 'Nombre Corto', 'Nombre corto para PWA y dispositivos móviles', 1, '2025-12-26 10:26:25', '2025-12-26 10:26:25');
INSERT INTO `settings` VALUES (3, 'app_description', 'Sistema de Gestión Empresarial', 'text', 'branding', 'Descripción', 'Descripción de la aplicación para SEO y manifest', 1, '2025-12-26 10:26:25', '2025-12-26 10:26:25');
INSERT INTO `settings` VALUES (4, 'logo_sidebar', NULL, 'image', 'branding', 'Logo del Sidebar', 'Logo que aparece en el menú lateral. Tamaño recomendado: 180x50px', 1, '2025-12-26 10:26:25', '2025-12-26 10:26:25');
INSERT INTO `settings` VALUES (5, 'logo_sidebar_collapsed', NULL, 'image', 'branding', 'Logo Sidebar (Colapsado)', 'Logo pequeño cuando el sidebar está cerrado. Tamaño: 40x40px', 1, '2025-12-26 10:26:25', '2025-12-26 10:26:25');
INSERT INTO `settings` VALUES (6, 'logo_login', NULL, 'image', 'branding', 'Logo del Login (Principal)', 'Logo grande que aparece en la página de login', 1, '2025-12-26 10:26:25', '2025-12-26 10:26:25');
INSERT INTO `settings` VALUES (7, 'logo_login_secondary', NULL, 'image', 'branding', 'Logo del Login (Secundario)', 'Logo o imagen que aparece a la derecha del login', 1, '2025-12-26 10:26:25', '2025-12-26 10:26:25');
INSERT INTO `settings` VALUES (8, 'login_title', 'Bienvenido', 'text', 'branding', 'Título del Login', 'Texto grande que aparece en la página de login', 1, '2025-12-26 10:26:25', '2025-12-26 10:26:25');
INSERT INTO `settings` VALUES (9, 'favicon', NULL, 'image', 'branding', 'Favicon', 'Icono que aparece en la pestaña del navegador. Formato: .ico, .png o .svg', 1, '2025-12-26 10:26:25', '2025-12-26 10:26:25');
INSERT INTO `settings` VALUES (10, 'primary_color', '#15428b', 'text', 'branding', 'Color Primario', 'Color principal del tema (hexadecimal)', 1, '2025-12-26 10:26:25', '2025-12-26 10:26:25');
INSERT INTO `settings` VALUES (11, 'secondary_color', '#4388cf', 'text', 'branding', 'Color Secundario', 'Color secundario del tema (hexadecimal)', 1, '2025-12-26 10:26:25', '2025-12-26 10:26:25');
INSERT INTO `settings` VALUES (12, 'company_name', 'Mi Empresa', 'text', 'general', 'Nombre de la Empresa', 'Razón social o nombre comercial', 0, '2025-12-26 10:26:25', '2025-12-26 10:26:25');
INSERT INTO `settings` VALUES (13, 'company_rif', NULL, 'text', 'general', 'RIF / NIT', 'Identificación fiscal de la empresa', 0, '2025-12-26 10:26:25', '2025-12-26 10:26:25');
INSERT INTO `settings` VALUES (14, 'company_address', NULL, 'text', 'general', 'Dirección', 'Dirección física de la empresa', 0, '2025-12-26 10:26:25', '2025-12-26 10:26:25');
INSERT INTO `settings` VALUES (15, 'company_phone', NULL, 'text', 'general', 'Teléfono', 'Teléfono principal de contacto', 0, '2025-12-26 10:26:25', '2025-12-26 10:26:25');
INSERT INTO `settings` VALUES (16, 'company_email', NULL, 'text', 'general', 'Correo Electrónico', 'Email principal de la empresa', 0, '2025-12-26 10:26:25', '2025-12-26 10:26:25');

-- ----------------------------
-- Table structure for tanques
-- ----------------------------
DROP TABLE IF EXISTS `tanques`;
CREATE TABLE `tanques`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `tipo` enum('FIJO','MOVIL') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ubicacion_fisica_id` bigint UNSIGNED NOT NULL,
  `capacidad_maxima` decimal(12, 2) NOT NULL,
  `stock_actual` decimal(12, 2) NULL DEFAULT 0.00,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `ubicacion_fisica_id`(`ubicacion_fisica_id` ASC) USING BTREE,
  CONSTRAINT `tanques_ibfk_1` FOREIGN KEY (`ubicacion_fisica_id`) REFERENCES `ubicaciones_fisicas` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of tanques
-- ----------------------------

-- ----------------------------
-- Table structure for trabajos
-- ----------------------------
DROP TABLE IF EXISTS `trabajos`;
CREATE TABLE `trabajos`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of trabajos
-- ----------------------------

-- ----------------------------
-- Table structure for ubicaciones_fisicas
-- ----------------------------
DROP TABLE IF EXISTS `ubicaciones_fisicas`;
CREATE TABLE `ubicaciones_fisicas`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `division_id` bigint UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ubicaciones_fisicas
-- ----------------------------

-- ----------------------------
-- Table structure for ubicaciones_pin
-- ----------------------------
DROP TABLE IF EXISTS `ubicaciones_pin`;
CREATE TABLE `ubicaciones_pin`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `codigo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `codigo`(`codigo` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ubicaciones_pin
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
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'Administrador', 'admin@admin.com', NULL, '$2y$12$2xnTJLZNb3NJToO56g2lw.cdyl8i01yAk/cblwFck5E.GTAf4FSMG', 1, NULL, '2025-12-26 10:26:25', '2025-12-26 10:26:25');

SET FOREIGN_KEY_CHECKS = 1;
