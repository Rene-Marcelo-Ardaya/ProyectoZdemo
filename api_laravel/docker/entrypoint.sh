#!/bin/bash
set -e

echo "🚀 Iniciando API Laravel..."

# Esperar a que MySQL esté disponible
echo "⏳ Esperando a que MySQL esté listo..."
while ! php -r "
try {
    new PDO('mysql:host=' . getenv('DB_HOST') . ';port=' . getenv('DB_PORT'), getenv('DB_USERNAME'), getenv('DB_PASSWORD'));
    echo 'MySQL está listo!';
    exit(0);
} catch (PDOException \$e) {
    exit(1);
}
" 2>/dev/null; do
    echo "   MySQL no está disponible aún - reintentando en 3 segundos..."
    sleep 3
done

echo "✅ MySQL está conectado!"

# Verificar si vendor existe y tiene contenido
if [ ! -d "vendor" ] || [ -z "$(ls -A vendor 2>/dev/null)" ]; then
    echo "📦 Instalando dependencias de Composer..."
    composer install --no-interaction --optimize-autoloader
fi

# Generar APP_KEY si no existe
if [ -z "$APP_KEY" ] || [ "$APP_KEY" = "base64:" ]; then
    echo "🔑 Generando APP_KEY..."
    php artisan key:generate --force
fi

# Crear directorios de storage si no existen
echo "📁 Verificando directorios de storage..."
mkdir -p storage/logs
mkdir -p storage/framework/{cache,sessions,views}
mkdir -p bootstrap/cache

# Configurar permisos
chmod -R 775 storage bootstrap/cache 2>/dev/null || true

# Limpiar cache de configuración
echo "🧹 Limpiando cache..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Ejecutar migraciones
echo "🗃️ Ejecutando migraciones de base de datos..."
php artisan migrate --force

# Ejecutar seeders
echo "🌱 Ejecutando seeders..."
php artisan db:seed --force

# Crear link simbólico para storage
echo "🔗 Creando link simbólico de storage..."
php artisan storage:link 2>/dev/null || true

# Cache de configuración para producción
if [ "$APP_ENV" = "production" ]; then
    echo "⚡ Cacheando configuración para producción..."
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
fi

echo "✅ ¡API Laravel lista!"
echo "🌐 Iniciando servidor en puerto 8000..."

# Iniciar el servidor
exec php artisan serve --host=0.0.0.0 --port=8000
