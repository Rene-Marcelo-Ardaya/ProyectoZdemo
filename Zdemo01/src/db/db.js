import Dexie from 'dexie';

export const db = new Dexie('ZdemoDB');

db.version(1).stores({
  // Cola de sincronización:
  // id (auto), url, method, body, timestamp, retryCount
  pendingSync: '++id, timestamp',

  // Caché de API:
  // key (url completa), data, timestamp
  apiCache: 'key, timestamp'
});

/**
 * Guarda una petición en la cola de pendientes
 */
export async function queueRequest(url, method, body = null) {
  try {
      await db.pendingSync.add({
          url,
          method,
          body,
          timestamp: Date.now(),
          retryCount: 0
      });
      console.log('📦 Petición guardada offline:', method, url);
      
      // OPTIMISTIC UPDATE: Actualizar caché local para que se vea en la lista
      try {
        await handleOptimisticUpdate(url, method, body);
      } catch (e) {
        console.warn('Fallo actualización optimista:', e);
      }

      // Avisar a la UI inmediatamente
      window.dispatchEvent(new Event('zdemo:offline-saved'));
      
      return true;
  } catch (error) {
      console.error('Error guardando offline:', error);
      return false;
  }
}

/**
 * Intenta actualizar la caché visualmente para reflejar cambios offline
 */
async function handleOptimisticUpdate(url, method, body) {
    if (!body) return;

    // Caso 1: Nuevo item (POST)
    // Url ej: /diesel/tanques -> Cache Key: .../api/diesel/tanques
    if (method === 'POST') {
        const cacheKey = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}${url}`;
        const cached = await db.apiCache.get(cacheKey);
        
        if (cached && cached.data) {
            let newData = { ...cached.data };
            // Generar ID temporal si no tiene
            const newItem = { ...body, id: `temp_${Date.now()}`, offline: true };
            
            if (Array.isArray(newData)) {
                newData.push(newItem);
            } else if (newData.data && Array.isArray(newData.data)) {
                 newData.data.push(newItem);
            }
            
            await db.apiCache.put({ ...cached, data: newData });
        }
    }

    // Caso 2: Edición (PUT/PATCH)
    // Url ej: /diesel/tanques/1 -> Cache List: /diesel/tanques
    if (method === 'PUT' || method === 'PATCH') {
        // Intentar adivinar la URL de la lista (quitando el ID)
        const parts = url.split('/');
        // Si el último es un número o ID, lo quitamos
        const lastPart = parts[parts.length - 1];
        // Asumimos que es una edición si tiene ID al final.
        // Url base lista:
        const listUrlPartial = url.substring(0, url.lastIndexOf('/'));
        const cacheKey = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}${listUrlPartial}`;
        
        const cached = await db.apiCache.get(cacheKey);
        if (cached && cached.data) {
            let newData = { ...cached.data };
            let list = Array.isArray(newData) ? newData : (newData.data && Array.isArray(newData.data) ? newData.data : null);
            
            if (list) {
                // El ID suele ser el último segmento de la URL original
                const idToUpdate = isNaN(lastPart) ? parseInt(parts[parts.length - 2]) : parseInt(lastPart); // Manejo simple
                
                // Buscar y actualizar
                const index = list.findIndex(item => item.id == idToUpdate || item.id == lastPart);
                if (index !== -1) {
                    list[index] = { ...list[index], ...body };
                    await db.apiCache.put({ ...cached, data: newData });
                }
            }
        }
    }
}

/**
 * Guarda datos en caché para uso offline
 */
export async function cacheResponse(key, data) {
    try {
        await db.apiCache.put({
            key,
            data,
            timestamp: Date.now()
        });
    } catch (error) {
        console.warn('Error guardando cache:', error);
    }
}

/**
 * Obtiene datos de caché si existen
 */
export async function getCachedResponse(key) {
    try {
        const record = await db.apiCache.get(key);
        // Opcional: Validar caducidad del cache (ej: 24 horas)
        // const ONE_DAY = 24 * 60 * 60 * 1000;
        // if (record && Date.now() - record.timestamp > ONE_DAY) return null;
        
        return record ? record.data : null;
    } catch (error) {
        return null;
    }
}
