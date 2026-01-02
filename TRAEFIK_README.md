# Configuración de Traefik para Producción

## Requisitos

- Un dominio propio (ej: `tuapp.com`)
- Servidor con IP pública
- Puertos 80 y 443 abiertos

## Configuración DNS

En tu proveedor de DNS (Cloudflare, Route53, etc.), configura:

### Registros requeridos

| Tipo | Nombre | Valor | TTL |
|------|--------|-------|-----|
| A | `@` | `TU_IP_SERVIDOR` | 300 |
| A | `www` | `TU_IP_SERVIDOR` | 300 |
| A | `*` | `TU_IP_SERVIDOR` | 300 |

> **Nota**: El registro `*` (wildcard) permite que cualquier subdominio funcione automáticamente: `cliente1.tuapp.com`, `empresa2.tuapp.com`, etc.

### Registros adicionales (servicios)

| Tipo | Nombre | Valor | TTL |
|------|--------|-------|-----|
| A | `traefik` | `TU_IP_SERVIDOR` | 300 |
| A | `evolution` | `TU_IP_SERVIDOR` | 300 |
| A | `n8n` | `TU_IP_SERVIDOR` | 300 |
| A | `ws` | `TU_IP_SERVIDOR` | 300 |

## Antes de desplegar

### 1. Editar docker-compose.traefik.yml

Reemplaza todas las ocurrencias de:
- `tu-dominio.com` → Tu dominio real
- `tu-email@ejemplo.com` → Tu email real (para SSL)

```bash
# Linux/Mac
sed -i 's/tu-dominio.com/tudominio.com/g' docker-compose.traefik.yml
sed -i 's/tu-email@ejemplo.com/tu@email.com/g' docker-compose.traefik.yml

# Windows PowerShell
(Get-Content docker-compose.traefik.yml) -replace 'tu-dominio.com', 'tudominio.com' | Set-Content docker-compose.traefik.yml
```

### 2. Generar contraseña para dashboard de Traefik

```bash
# Instalar htpasswd si no lo tienes
apt-get install apache2-utils

# Generar hash de contraseña
htpasswd -nb admin TU_CONTRASEÑA_SEGURA
```

Copia el resultado y reemplázalo en la línea de `basicauth.users` del docker-compose.traefik.yml.

## Despliegue

### Desarrollo (sin Traefik)

```bash
docker-compose up -d
```

### Producción (con Traefik)

```bash
# Crear la red primero
docker network create demoz01_network

# Iniciar con Traefik
docker-compose -f docker-compose.yml -f docker-compose.traefik.yml up -d
```

## Verificación

1. **Dashboard de Traefik**: `https://traefik.tudominio.com`
2. **Frontend principal**: `https://tudominio.com`
3. **API**: `https://tudominio.com/api`
4. **Cliente demo**: `https://demo.tudominio.com`

## Dominios personalizados de clientes

Cuando un cliente quiera usar su propio dominio (ej: `miempresa.com`):

### El cliente debe:
1. Configurar un registro CNAME en su DNS:
   ```
   CNAME @ -> tudominio.com
   ```
   O un registro A:
   ```
   A @ -> TU_IP_SERVIDOR
   ```

### Tú debes:
1. Actualizar el campo `custom_domain` del tenant en la base de datos:
   ```sql
   UPDATE tenants SET custom_domain = 'miempresa.com' WHERE slug = 'cliente1';
   ```

2. Agregar una regla específica en Traefik (se puede hacer dinámicamente o agregar al docker-compose).

## Troubleshooting

### SSL no funciona
- Verifica que los puertos 80 y 443 estén abiertos
- Revisa los logs: `docker logs demoz01_traefik`
- Espera unos minutos, Let's Encrypt puede tardar

### Subdominio no resuelve
- Verifica el registro DNS wildcard `*`
- Prueba con: `nslookup test.tudominio.com`

### 404 en rutas
- Verifica que el tenant exista en la base de datos
- Revisa los logs del API: `docker logs demoz01_api`
