# Arquitectura de Modo Offline y Sincronización

Este documento describe la arquitectura técnica para habilitar el funcionamiento sin conexión en la aplicación, incluyendo manejo de servidor caído y sincronización manual.

## 1. Visión General

El sistema permitirá operar la aplicación completamente funcional sin conexión a internet o cuando la API backend no esté disponible. Los datos se almacenarán localmente y se sincronizarán bajo demanda del usuario cuando se restablezca la conexión.

### Principios Clave
1.  **Offline First**: La UI nunca se bloquea por falta de red.
2.  **API Fallback**: Caída de servidor = Modo Offline.
3.  **Control de Usuario**: La sincronización (subida de datos) requiere confirmación explícita.
4.  **Backend Agmóstico**: No se requieren cambios en la base de datos del servidor.

---

## 2. Almacenamiento Local (`ZdemoDB`)

Utilizaremos **Dexie.js** (IndexedDB Wrapper) para crear una base de datos en el navegador del usuario.

### Estructura de Tablas

#### A. Cola de Pendientes (`pendingSync`)
Almacena todas las operaciones de escritura (crear, editar, borrar) que no pudieron enviarse.

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| `id` | ID auto-incremental local | `1` |
| `url` | Endpoint destino | `/diesel/tanques` |
| `method` | Acción HTTP | `POST` |
| `body` | Datos a enviar | `{ "nombre": "T-01", "capacidad": 5000 }` |
| `timestamp` | Momento de la acción | `1709123456789` |
| `retryCount` | Intentos fallidos previos | `0` |

#### B. Caché de Lectura (`apiCache`)
Almacena la última respuesta exitosa de cada consulta para mostrar datos cuando no hay red.

| Campo | Descripción |
|-------|-------------|
| `key` | URL completa de la consulta (PK) |
| `data` | JSON completo de la respuesta |
| `timestamp` | Fecha de última actualización |

---

## 3. Flujo de Interceptación (`authFetch`)

El servicio central de peticiones (`authService.js`) actuará como "semáforo" inteligente:

### Lectura (GET)
1.  Intentar petición a API.
2.  **Éxito**: Guardar respuesta en `apiCache` y retornar datos.
3.  **Fallo** (Red/Servidor):
    *   Consultar `apiCache`.
    *   Si existe dato: Retornar dato cacheado (con flag `fromCache: true`).
    *   Si no existe: Retornar error.

### Escritura (POST/PUT/DELETE)
1.  Intentar enviar a API.
2.  **Éxito**: Retornar éxito.
3.  **Fallo** (Red/Servidor):
    *   Guardar petición en tabla `pendingSync`.
    *   Retornar éxito simulado: `{ success: true, offline: true, message: 'Guardado para sincronizar' }`.

---

## 4. Gestor de Sincronización (`SyncManager`)

Componente invisible que monitorea el estado de la red.

### Estados
1.  **Online**: Internet disponible.
2.  **Offline**: Sin conexión.
3.  **SyncRequired**: Hay internet Y existen registros en `pendingSync`.

### Flujo de Sincronización Manual
1.  El sistema detecta conexión restablecida.
2.  Verifica si hay registros en `pendingSync`.
3.  Si hay pendientes: Muestra alerta en UI **"X cambios pendientes de subir"**.
4.  Usuario presiona botón **"Sincronizar Ahora"**.
5.  El sistema procesa la cola FIFO (First In, First Out).
6.  Al finalizar, notifica resultado y limpia la cola.

---

## 5. Manejo de Conflictos

Estrategia: **Last Write Wins (El último gana)**

*   Si el usuario modifica un registro offline, al sincronizar sobrescribirá el valor del servidor.
*   Si el registro fue eliminado en el servidor mientras tanto, la sincronización de ese ítem fallará y se notificará al usuario en un reporte de errores de sincronización.

## 6. Pasos de Implementación

1.  Instalar `dexie`.
2.  Configurar base de datos `src/db/db.js`.
3.  Implementar lógica de intercepción en `authService.js`.
4.  Crear componente `SyncAlert` para notificación y botón manual.
5.  Implementar lógica de procesamiento de cola.
