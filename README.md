# DemoZ01 - Sistema de Gestión con Chat Integrado

Sistema modular de gestión empresarial con autenticación, administración de usuarios/roles, y chat integrado con WhatsApp mediante Evolution API.

## 🏗️ Arquitectura

| Servicio | Tecnología | Puerto |
|----------|------------|--------|
| **Frontend** | React + Vite | 5173 |
| **Backend API** | Laravel 11 + PHP 8.2 | 8000 |
| **Base de Datos** | MySQL 8.0 | 3307 |
| **Cache/Sessions** | Redis 7 | 6380 |
| **WhatsApp API** | Evolution API v2.1.1 | 8080 |
| **DB Evolution** | PostgreSQL 15 | 5433 |

## 📋 Requisitos Previos

- **Git** instalado
- **Docker Desktop** instalado y corriendo
- **Docker Compose** (incluido con Docker Desktop)

## 🚀 Instalación Rápida

```bash
# 1. Clonar el repositorio
git clone <URL_DEL_REPOSITORIO> DemoZ01
cd DemoZ01

# 2. Levantar todos los contenedores (primera vez tarda ~5 min)
docker-compose up -d --build

# 3. Esperar ~30 segundos para que MySQL esté listo, luego ejecutar migraciones y seeders
docker exec demoz01_api php artisan migrate --seed

# 4. Generar key de Laravel
docker exec demoz01_api php artisan key:generate
```

## 🌐 Acceso a la Aplicación

| Servicio | URL |
|----------|-----|
| **Frontend** | http://localhost:5173 |
| **API Laravel** | http://localhost:8000 |
| **Evolution API** | http://localhost:8080 |

## 🔑 Credenciales de Prueba

| Usuario | Email | Contraseña |
|---------|-------|------------|
| Administrador | `admin@admin.com` | `password` |

## 🛠️ Comandos Útiles

### Docker

```bash
# Ver estado de contenedores
docker-compose ps

# Ver logs de todos los contenedores
docker-compose logs -f

# Ver logs solo de la API
docker-compose logs -f api_laravel

# Reiniciar un servicio específico
docker-compose restart api_laravel

# Reiniciar todos los contenedores
docker-compose restart

# Detener todo
docker-compose down

# Detener y borrar datos (base de datos limpia)
docker-compose down -v
```

### Laravel (dentro del contenedor)

```bash
# Ejecutar migraciones
docker exec demoz01_api php artisan migrate

# Ejecutar migraciones desde cero + seeders
docker exec demoz01_api php artisan migrate:fresh --seed

# Limpiar caches
docker exec demoz01_api php artisan config:clear
docker exec demoz01_api php artisan cache:clear

# Ver rutas disponibles
docker exec demoz01_api php artisan route:list

# Entrar al contenedor
docker exec -it demoz01_api bash
```

## 📁 Estructura del Proyecto

```
DemoZ01/
├── api_laravel/          # Backend Laravel
│   ├── app/
│   │   ├── Http/Controllers/
│   │   └── Models/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/
├── Zdemo01/              # Frontend React + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── styles/
│   └── public/
├── docker/               # Configuraciones Docker
│   ├── api_laravel.env
│   ├── frontend.env
│   └── mysql/
└── docker-compose.yml    # Orquestación de contenedores
```

## 🔧 Configuración para Producción

Para desplegar en producción, modifica las siguientes variables en `docker-compose.yml`:

1. **APP_ENV**: Cambiar de `local` a `production`
2. **APP_DEBUG**: Cambiar de `"true"` a `"false"`
3. **Contraseñas**: Cambiar todas las contraseñas por defecto
4. **SANCTUM_STATEFUL_DOMAINS**: Actualizar con tu dominio
5. **FRONTEND_URL**: Actualizar con tu dominio

## 🐛 Solución de Problemas

### Error: "Connection refused" a MySQL
```bash
# Esperar a que MySQL esté healthy
docker-compose logs mysql
# Reintentar migraciones después de ~30 segundos
```

### Error: 401 Unauthorized después de migrate:fresh
Es normal. Los tokens fueron eliminados. Solo haz login de nuevo.

### Error: CORS
Verificar que `SANCTUM_STATEFUL_DOMAINS` incluya tu dominio/puerto.

## 📄 Licencia

Proyecto privado - Todos los derechos reservados.
