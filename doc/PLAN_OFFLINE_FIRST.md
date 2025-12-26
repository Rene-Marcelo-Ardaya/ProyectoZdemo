# Plan de Implementación: Offline-First con IndexedDB + Laravel Echo

## 📋 Resumen Ejecutivo

Este documento describe la arquitectura y pasos necesarios para implementar funcionalidad **offline-first** en el proyecto Zdemo01, permitiendo que los usuarios continúen trabajando sin conexión a internet y sincronicen automáticamente cuando la conexión se restablezca.

---

## 🎯 Objetivos

1. **Continuidad operativa**: Los usuarios pueden crear, editar y eliminar registros sin internet
2. **Sincronización automática**: Al recuperar conexión, los cambios se envían al servidor
3. **Actualización en tiempo real**: Los clientes conectados reciben cambios instantáneamente
4. **Resolución de conflictos**: Manejar ediciones simultáneas de forma predecible

---

## 🏗️ Arquitectura Propuesta

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ARQUITECTURA OFFLINE-FIRST                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   FRONTEND (React + Vite)                                                   │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                                                                     │  │
│   │   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐        │  │
│   │   │   UI/Pages   │◄──►│   Services   │◄──►│  SyncService │        │  │
│   │   └──────────────┘    └──────────────┘    └───────┬──────┘        │  │
│   │                                                   │               │  │
│   │                       ┌──────────────┐    ┌───────▼──────┐        │  │
│   │                       │ Laravel Echo │◄──►│   IndexedDB  │        │  │
│   │                       │  (Pusher)    │    │   (Dexie.js) │        │  │
│   │                       └───────┬──────┘    └──────────────┘        │  │
│   │                               │                                   │  │
│   └───────────────────────────────┼───────────────────────────────────┘  │
│                                   │                                      │
│   ════════════════════════════════╪══════════════════════════════════    │
│                              INTERNET                                    │
│   ════════════════════════════════╪══════════════════════════════════    │
│                                   │                                      │
│   BACKEND (Laravel)               │                                      │
│   ┌───────────────────────────────┼───────────────────────────────────┐  │
│   │                               ▼                                   │  │
│   │   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │  │
│   │   │  Controllers │◄──►│   Services   │◄──►│  Broadcasting│       │  │
│   │   └──────────────┘    └───────┬──────┘    │   (Pusher)   │       │  │
│   │                               │           └──────────────┘       │  │
│   │                       ┌───────▼──────┐                           │  │
│   │                       │   Database   │                           │  │
│   │                       │   (MySQL)    │                           │  │
│   │                       └──────────────┘                           │  │
│   └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 📦 Tecnologías a Utilizar

### Frontend

| Tecnología | Propósito | Estado |
|------------|-----------|--------|
| **Dexie.js** | Wrapper para IndexedDB (API más amigable) | 🆕 Por instalar |
| **Laravel Echo** | Cliente para eventos en tiempo real | ✅ Ya instalado |
| **Pusher.js** | Transporte de WebSocket | ✅ Ya instalado |

### Backend

| Tecnología | Propósito | Estado |
|------------|-----------|--------|
| **Laravel Broadcasting** | Enviar eventos a clientes | ⚙️ Por configurar |
| **Pusher** | Servicio de WebSocket | ⚙️ Por configurar |

---

## 📁 Estructura de Archivos Propuesta

```
Zdemo01/src/
├── db/
│   ├── database.js          # Configuración de Dexie/IndexedDB
│   ├── schemas/
│   │   ├── productosSchema.js
│   │   ├── personalSchema.js
│   │   └── ...
│   └── migrations/
│       └── v1.js            # Versiones del esquema
│
├── services/
│   ├── syncService.js       # 🆕 Orquestador de sincronización
│   ├── offlineService.js    # 🆕 Detección de estado de red
│   ├── conflictResolver.js  # 🆕 Resolución de conflictos
│   └── echoService.js       # 🆕 Configuración de Laravel Echo
│
├── hooks/
│   ├── useOnlineStatus.js   # 🆕 Hook para estado de conexión
│   ├── useSyncStatus.js     # 🆕 Hook para estado de sync
│   └── useOfflineData.js    # 🆕 Hook genérico para datos offline
│
└── components/
    └── SyncIndicator.jsx    # 🆕 Indicador visual de sincronización
```

---

## 🗄️ Diseño de Base de Datos Local (IndexedDB)

### Esquema Principal

```javascript
// db/database.js
import Dexie from 'dexie';

export const db = new Dexie('ZdemoOfflineDB');

db.version(1).stores({
  // Datos de negocio
  personal: '++id, nombre, cargo_id, activo, &servidor_id, sync_status, updated_at',
  cargos: '++id, nombre, &servidor_id, sync_status',
  
  // Cola de sincronización
  sync_queue: '++id, tabla, operacion, registro_id, datos, created_at, intentos',
  
  // Metadatos de sincronización
  sync_meta: 'tabla, last_sync, last_server_timestamp'
});
```

### Campos Especiales

| Campo | Tipo | Propósito |
|-------|------|-----------|
| `servidor_id` | int/null | ID del registro en el servidor (null si es nuevo local) |
| `sync_status` | string | `'synced'`, `'pending'`, `'conflict'`, `'error'` |
| `updated_at` | timestamp | Para detectar conflictos temporales |

---

## 🔄 Flujo de Sincronización

### 1. Crear Registro (Offline) -ejemplo ficticio-

```
┌─────────────────────────────────────────────────────────────┐
│                    CREAR PRODUCTO OFFLINE                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Usuario crea producto                                      │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────────┐                                        │
│  │ Guardar en      │  sync_status: 'pending'                │
│  │ IndexedDB       │  servidor_id: null                     │
│  └────────┬────────┘                                        │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                        │
│  │ Agregar a       │  operacion: 'CREATE'                   │
│  │ sync_queue      │  datos: {...producto}                  │
│  └────────┬────────┘                                        │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                        │
│  │ UI muestra      │  Badge: "Pendiente de sincronizar"     │
│  │ producto        │                                        │
│  └─────────────────┘                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2. Sincronización al Recuperar Conexión

```
┌─────────────────────────────────────────────────────────────┐
│             SINCRONIZACIÓN AL RECUPERAR INTERNET            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  navigator.onLine = true (evento 'online')                  │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────────┐                                        │
│  │ SyncService     │  Leer sync_queue ordenada por fecha    │
│  │ iniciado        │                                        │
│  └────────┬────────┘                                        │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                        │
│  │ Por cada item   │◄────────────────────┐                  │
│  │ en la cola      │                     │                  │
│  └────────┬────────┘                     │                  │
│           │                              │                  │
│           ▼                              │                  │
│  ┌─────────────────┐    ✅ Éxito        │                  │
│  │ Enviar a API    │─────────────────────┤                  │
│  │ Laravel         │                     │                  │
│  └────────┬────────┘                     │                  │
│           │ ❌ Error                     │                  │
│           ▼                              │                  │
│  ┌─────────────────┐                     │                  │
│  │ Reintentar      │  Max 3 intentos     │                  │
│  │ o marcar error  │─────────────────────┘                  │
│  └─────────────────┘                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3. Recepción de Cambios en Tiempo Real

```
┌─────────────────────────────────────────────────────────────┐
│         ACTUALIZACIÓN EN TIEMPO REAL (OTRAS SUCURSALES)     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Laravel dispara evento "ProductoCreated"                   │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────────┐                                        │
│  │ Pusher recibe   │  Broadcast a canal 'productos'         │
│  │ y retransmite   │                                        │
│  └────────┬────────┘                                        │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                        │
│  │ Laravel Echo    │  Echo.channel('productos')             │
│  │ en cliente      │    .listen('ProductoCreated', ...)     │
│  └────────┬────────┘                                        │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                        │
│  │ Actualizar      │  Agregar a IndexedDB + actualizar UI   │
│  │ datos locales   │  sync_status: 'synced'                 │
│  └─────────────────┘                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚔️ Resolución de Conflictos

### Escenario de Conflicto

```
CENTRAL (offline)           SERVIDOR              SUCURSAL A
      │                         │                      │
      │ Edita Producto #5       │                      │
      │ precio: $100→$120       │                      │
      │                         │   Edita Producto #5  │
      │                         │◄─────────────────────│
      │                         │   precio: $100→$90   │
      │                         │                      │
      │ (vuelve online)         │                      │
      │ Sync: precio=$120       │                      │
      │──────────────────────►  │                      │
      │                         │                      │
      │       CONFLICTO! 🔥     │                      │
      │   $120 vs $90           │                      │
```

### Estrategias de Resolución

| Estrategia | Descripción | Cuándo Usar |
|------------|-------------|-------------|
| **Last Write Wins** | El más reciente gana | Datos no críticos |
| **First Write Wins** | El primero que llegó gana | Datos de inventario |
| **Merge automático** | Combinar campos no conflictivos | Formularios parciales |
| **Resolución manual** | Preguntar al usuario | Datos críticos (precios, stock) |

### Implementación Propuesta

```javascript
// services/conflictResolver.js

export const STRATEGIES = {
  LAST_WRITE_WINS: 'last_write_wins',
  FIRST_WRITE_WINS: 'first_write_wins',
  MANUAL: 'manual'
};

// Configuración por tabla
export const conflictConfig = {
  productos: {
    default: STRATEGIES.MANUAL,  // Precios requieren revisión
    fields: {
      descripcion: STRATEGIES.LAST_WRITE_WINS,
      precio: STRATEGIES.MANUAL,
      stock: STRATEGIES.FIRST_WRITE_WINS  // Evitar sobreventa
    }
  },
  personal: {
    default: STRATEGIES.LAST_WRITE_WINS
  }
};
```

---

## 🖥️ Componentes de UI

### 1. Indicador de Conexión

```jsx
// components/SyncIndicator.jsx
// Muestra estado: 🟢 Online | 🟡 Sincronizando | 🔴 Offline | ⚠️ Conflictos

<SyncIndicator 
  pendingChanges={5}
  conflicts={0}
  lastSync="hace 2 minutos"
/>
```

### 2. Badge en Registros Pendientes

```jsx
// En listas/tablas de datos
<Badge variant={getSyncBadge(item.sync_status)}>
  {item.sync_status === 'pending' ? '⏳ Pendiente' : 
   item.sync_status === 'conflict' ? '⚠️ Conflicto' : 
   '✅ Sincronizado'}
</Badge>
```

### 3. Modal de Resolución de Conflictos

```jsx
// Cuando hay conflictos pendientes
<ConflictResolutionModal
  conflicts={pendingConflicts}
  onResolve={(conflictId, resolution) => {...}}
/>
```

---

## 📝 Plan de Implementación por Fases

### Fase 1: Infraestructura Base (2-3 días)

- [ ] Instalar Dexie.js
- [ ] Crear estructura de base de datos IndexedDB
- [ ] Implementar `offlineService.js` (detección de red)
- [ ] Crear hook `useOnlineStatus`
- [ ] Agregar `SyncIndicator` componente básico

### Fase 2: Módulo Piloto - Personal (3-4 días)

- [ ] Modificar `personalService.js` para guardar local primero
- [ ] Implementar cola de sincronización para Personal
- [ ] Crear sincronización bidireccional básica
- [ ] Probar flujo offline → online → sync

### Fase 3: Laravel Broadcasting (2-3 días)

- [ ] Configurar Pusher en Laravel
- [ ] Crear eventos de Broadcasting (`PersonalCreated`, etc.)
- [ ] Implementar `echoService.js` en frontend
- [ ] Conectar eventos a actualizaciones de IndexedDB

### Fase 4: Resolución de Conflictos (2-3 días)

- [ ] Implementar detección de conflictos por timestamp
- [ ] Crear modal de resolución manual
- [ ] Agregar estrategias automáticas configurables

### Fase 5: Extensión a Otros Módulos (3-5 días)

- [ ] Productos
- [ ] Usuarios (solo lectura offline)
- [ ] Configuración del sistema

### Fase 6: Optimización y Pulido (2-3 días)

- [ ] Limpieza periódica de datos sincronizados
- [ ] Compresión de cola de sync
- [ ] Manejo de errores robusto
- [ ] Documentación de uso

---

## ⚙️ Configuración Necesaria en Backend

### 1. Pusher (o alternativa self-hosted)

```env
# .env de Laravel
BROADCAST_DRIVER=pusher
PUSHER_APP_ID=your-app-id
PUSHER_APP_KEY=your-app-key
PUSHER_APP_SECRET=your-app-secret
PUSHER_APP_CLUSTER=mt1
```

> **Nota**: Pusher tiene plan gratuito de 200K mensajes/día. 
> Alternativas self-hosted: **Laravel Websockets** o **Soketi** (gratis, priorizar)

### 2. Eventos de Broadcasting

```php
// app/Events/ProductoCreated.php
class ProductoCreated implements ShouldBroadcast
{
    public $producto;
    
    public function broadcastOn()
    {
        return new Channel('productos');
    }
}
```

---

## 🧪 Consideraciones de Testing

1. **Simular offline**: DevTools → Network → Offline
2. **Verificar IndexedDB**: DevTools → Application → IndexedDB
3. **Monitor de eventos**: Pusher Debug Console
4. **Casos de prueba**:
   - Crear offline → sync
   - Editar offline → sync
   - Conflicto simultáneo
   - Cola con múltiples operaciones
   - Reconexión tras larga desconexión

---

## 📊 Estimación de Esfuerzo Total

| Fase | Días Estimados |
|------|----------------|
| Fase 1: Infraestructura | 2-3 |
| Fase 2: Módulo Piloto | 3-4 |
| Fase 3: Broadcasting | 2-3 |
| Fase 4: Conflictos | 2-3 |
| Fase 5: Extensión | 3-5 |
| Fase 6: Pulido | 2-3 |
| **TOTAL** | **14-21 días** |

---

## ❓ Preguntas para Definir Antes de Implementar

1. **¿Qué módulos son prioritarios para offline?**
   - [ ] Personal
   - [ ] Productos
   - [ ] Usuarios
   - [ ] Chat (más complejo)
   - [ ] Otros: ___________

2. **¿Cuánto tiempo máximo puede estar un usuario offline?**
   - [ ] Minutos (caída temporal)
   - [ ] Horas (jornada sin internet)
   - [ ] Días (zonas rurales)

3. **¿Qué estrategia de conflictos prefieres por defecto?**
   - [ ] Last Write Wins (más simple)
   - [ ] Manual (más control, más trabajo para usuario)

4. **¿Usarás Pusher (nube) o prefieres self-hosted (Soketi/Laravel Websockets)?**
   - [ ] Pusher (más fácil, límite gratuito)
   - [ ] Self-hosted (más trabajo inicial, sin límites)

5. **¿Los usuarios deben ver indicador de "cambios pendientes"?**
   - [ ] Sí, visible siempre
   - [ ] Solo cuando hay pendientes
   - [ ] Oculto (transparente)

---

## 🔗 Referencias y Recursos

- [Dexie.js Documentación](https://dexie.org/)
- [Laravel Broadcasting](https://laravel.com/docs/broadcasting)
- [Pusher Docs](https://pusher.com/docs)
- [Soketi (Self-hosted Pusher)](https://docs.soketi.app/)
- [Offline First Patterns](https://offlinefirst.org/)

---

*Documento creado: 2025-12-25*
*Proyecto: Zdemo01 - Sistema de Gestión*
