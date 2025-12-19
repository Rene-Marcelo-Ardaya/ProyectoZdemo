# Dockerfile para Laravel API
FROM php:8.2-cli

# Argumentos
ARG user=laravel
ARG uid=1000

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    default-mysql-client \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip \
    && pecl install redis \
    && docker-php-ext-enable redis

# Limpiar cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Crear usuario del sistema
RUN useradd -G www-data,root -u $uid -d /home/$user $user || true
RUN mkdir -p /home/$user/.composer && \
    chown -R $user:$user /home/$user

# Crear directorio de trabajo
WORKDIR /var/www/html

# Copiar archivos de composer primero (para cache de layers)
COPY composer.json composer.lock ./

# Instalar dependencias de PHP (incluyendo dev porque algunos providers las requieren)
RUN composer install --no-interaction --optimize-autoloader --no-scripts || true

# Copiar el resto de la aplicación
COPY --chown=$user:$user . .

# Reejecutar scripts de composer
RUN composer dump-autoload --optimize || true

# Crear directorios necesarios
RUN mkdir -p storage/logs \
    storage/framework/cache \
    storage/framework/sessions \
    storage/framework/views \
    bootstrap/cache

# Configurar permisos de storage y cache
RUN chown -R $user:$user /var/www/html/storage /var/www/html/bootstrap/cache
RUN chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Copiar y dar permisos al entrypoint
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Exponer puerto
EXPOSE 8000

# Entrypoint para esperar MySQL y ejecutar migraciones
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
