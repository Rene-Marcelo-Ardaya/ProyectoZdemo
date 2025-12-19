# 🐳 Docker Setup - DemoZ01

Este proyecto incluye configuración completa de Docker para desarrollo y despliegue.

## 📦 Servicios Incluidos

| Servicio | Puerto Local | Descripción |
|----------|-------------|-------------|
| **MySQL** | 3307 | Base de datos para Laravel |
| **PostgreSQL** | 5433 | Base de datos para Evolution API |
| **Redis** | 6380 | Cache y sesiones |
| **API Laravel** | 8000 | Backend API |
| **Frontend React** | 5173 | Aplicación web |
| **Evolution API** | 8080 | Integración WhatsApp |

## 🚀 Inicio Rápido

### 1. Configurar variables de entorno

```bash
# Copia el archivo de ejemplo de Evolution API
cp .env.evolution.example .env.evolution

# Edita y cambia la API key
# AUTHENTICATION_API_KEY=tu-clave-secreta-aqui
```

### 2. Construir y levantar los contenedores

```bash
# Construir las imágenes y levantar en segundo plano
docker-compose up -d --build

# Ver los logs en tiempo real
docker-compose logs -f
```

### 3. Verificar que todo esté funcionando

```bash
# Ver el estado de los contenedores
docker-compose ps

# Verificar logs de un servicio específico
docker-compose logs api_laravel
docker-compose logs frontend
docker-compose logs evolution_api
```

## 🔧 Comandos Útiles

### Gestión de contenedores

```bash
# Iniciar servicios
docker-compose up -d

# Detener servicios
docker-compose down

# Reiniciar un servicio específico
docker-compose restart api_laravel

# Reconstruir un servicio
docker-compose up -d --build api_laravel
```

### Base de datos

```bash
# Acceder a MySQL
docker exec -it demoz01_mysql mysql -uroot -proot laravel_apichat

# Ejecutar migraciones manualmente
docker exec -it demoz01_api php artisan migrate

# Ejecutar seeders
docker exec -it demoz01_api php artisan db:seed

# Resetear base de datos
docker exec -it demoz01_api php artisan migrate:fresh --seed
```

### Laravel Artisan

```bash
# Cualquier comando artisan
docker exec -it demoz01_api php artisan <comando>

# Ejemplos
docker exec -it demoz01_api php artisan cache:clear
docker exec -it demoz01_api php artisan config:clear
docker exec -it demoz01_api php artisan queue:work
```

### Logs y depuración

```bash
# Ver todos los logs
docker-compose logs -f

# Ver logs de un servicio con las últimas 100 líneas
docker-compose logs -f --tail=100 api_laravel

# Acceder al contenedor
docker exec -it demoz01_api bash
docker exec -it demoz01_frontend sh
```

## 🌐 URLs de Acceso

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| API Laravel | http://localhost:8000 |
| Evolution API | http://localhost:8080 |

## 📱 Evolution API - Conectar WhatsApp

1. Accede a http://localhost:8080
2. Crea una nueva instancia:
   ```bash
   curl -X POST http://localhost:8080/instance/create \
     -H "apikey: your-evolution-api-key" \
     -H "Content-Type: application/json" \
     -d '{"instanceName": "mi-whatsapp", "qrcode": true}'
   ```
3. Obtén el código QR:
   ```bash
   curl http://localhost:8080/instance/qrcode/mi-whatsapp \
     -H "apikey: your-evolution-api-key"
   ```
4. Escanea el código QR con tu WhatsApp

## 🔐 Seguridad - Producción

⚠️ **IMPORTANTE**: Antes de desplegar en producción:

1. **Cambia todas las contraseñas**:
   - `MYSQL_ROOT_PASSWORD`
   - `MYSQL_PASSWORD`
   - `AUTHENTICATION_API_KEY`

2. **Configura SSL/HTTPS** usando Nginx o Traefik

3. **Ajusta las variables de entorno**:
   - `APP_ENV=production`
   - `APP_DEBUG=false`

## 🧹 Limpieza

```bash
# Detener y eliminar contenedores, redes
docker-compose down

# También eliminar volúmenes (¡BORRA LOS DATOS!)
docker-compose down -v

# Eliminar imágenes huérfanas
docker image prune -f
```

## 🐛 Solución de Problemas

### MySQL no inicia
```bash
# Verificar logs
docker-compose logs mysql

# Si hay problemas de permisos, eliminar el volumen
docker-compose down -v
docker-compose up -d
```

### Migraciones fallan
```bash
# Entrar al contenedor y verificar conexión
docker exec -it demoz01_api bash
php artisan migrate --force
```

### Evolution API no conecta
```bash
# Verificar que Redis esté funcionando
docker-compose logs redis
docker exec -it demoz01_redis redis-cli ping
```
