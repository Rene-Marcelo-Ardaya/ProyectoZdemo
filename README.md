# DemoZ01 - Guía de Instalación y Ejecución

Este documento detalla los pasos necesarios para levantar el proyecto desde cero, tanto el backend (Laravel) como el frontend (React/Vite).

## 🚀 1. Backend (Laravel)

Ubicación: `/api_laravel`

### Prerrequisitos
Asegúrate de tener instalado PHP (8.1+) y Composer.

### Pasos de Instalación

1.  **Navegar al directorio:**
    ```bash
    cd api_laravel
    ```

2.  **Instalar dependencias de PHP:**
    ```bash
    composer install
    ```

3.  **Configurar entorno:**
    - Copia el archivo `.env.example` a `.env`:
      ```bash
      cp .env.example .env
      ```
    - Configura tus credenciales de base de datos en el archivo `.env` (`DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`).

4.  **Generar Key de Aplicación:**
    ```bash
    php artisan key:generate
    ```

5.  **Crear enlace simbólico para Storage (Imágenes):**
    *Nota: Si estás en Windows y no eres administrador, este paso puede fallar. El proyecto ya incluye una solución alternativa vía API, pero se recomienda intentar ejecutarlo.*
    ```bash
    php artisan storage:link
    ```

6.  **Ejecutar Migraciones:**
    Crea las tablas en la base de datos.
    ```bash
    php artisan migrate
    ```

7.  **Ejecutar Seeders (Datos de prueba):**
    Puebla la base de datos con usuarios, menús y datos iniciales.
    ```bash
    php artisan db:seed
    ```
    *Para ejecutar solo el seeder maestro de Diesel si ya tienes datos:*
    ```bash
    php artisan db:seed --class=DieselMasterSeeder
    ```

8.  **Levantar el Servidor:**
    ```bash
    php artisan serve
    ```
    El backend estará disponible en: `http://localhost:8000`

---

## 💻 2. Frontend (React + Vite)

Ubicación: `/Zdemo01`

### Prerrequisitos
Asegúrate de tener instalado Node.js (16+).

### Pasos de Instalación

1.  **Navegar al directorio:**
    ```bash
    cd Zdemo01
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Levantar el entorno de desarrollo:**
    ```bash
    npm run dev
    ```
    El frontend estará disponible generalmente en: `http://localhost:5173`

---

## 🛠️ Comandos Útiles

| Acción | Comando (en `api_laravel`) |
|--------|----------------------------|
| Limpiar caché de rutas | `php artisan route:clear` |
| Limpiar caché de config | `php artisan config:clear` |
| Crear un nuevo seeder | `php artisan make:seeder NombreSeeder` |
| Crear una nueva migración | `php artisan make:migration nombre_migracion` |
| Entrar a consola interactiva | `php artisan tinker` |

## 🔑 Credenciales por Defecto
(Si se usaron los seeders por defecto)

- **Usuario:** `admin@demo.com` (o el configurado en `DatabaseSeeder`)
- **Contraseña:** `password` (o la configurada)
