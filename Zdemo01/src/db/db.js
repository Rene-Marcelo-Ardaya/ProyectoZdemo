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
 * Soporta:
 * - POST: Agregar nuevo item a listas cacheadas
 * - PATCH: Actualizar estado de items (ej: recepcionar)
 */
async function handleOptimisticUpdate(url, method, body) {
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

    // Obtener todas las entradas del cache para buscar matches por prefijo
    const allCache = await db.apiCache.toArray();

    // Caso 1: Nuevo item (POST) - Agregar a listas que matcheen
    if (method === 'POST' && body) {
        // URL de POST: /diesel/ingresos
        // Caches a buscar: /diesel/ingresos?fecha_inicio=...&...
        const baseUrl = `${API_BASE}${url}`;

        // Buscar todos los caches que empiecen con esta URL base
        const matchingCaches = allCache.filter(c => c.key.startsWith(baseUrl));

        for (const cached of matchingCaches) {
            if (cached.data) {
                let newData = { ...cached.data };
                // Crear item con ID temporal y flag offline
                const newItem = {
                    ...body,
                    id: `temp_${Date.now()}`,
                    _offlinePending: true,
                    estado: 'PENDIENTE',
                    proveedor: { nombre: `Proveedor ID: ${body.d_proveedor_id}` }, // Placeholder
                    total_litros: body.detalles?.reduce((sum, d) => sum + parseFloat(d.litros || 0), 0) || 0,
                    fecha: body.fecha || new Date().toISOString().split('T')[0]
                };

                if (Array.isArray(newData)) {
                    newData.unshift(newItem); // Agregar al inicio
                } else if (newData.data && Array.isArray(newData.data)) {
                    newData.data.unshift(newItem);
                }

                await db.apiCache.put({ ...cached, data: newData, timestamp: Date.now() });
                console.log('✅ Optimistic: Agregado nuevo item a cache', cached.key);
            }
        }
    }

    // Caso 2: PATCH - Actualizar estado (ej: recepcionar)
    if (method === 'PATCH' && body) {
        // URL de PATCH: /diesel/ingresos/123/recepcionar
        // Necesitamos actualizar el estado en listas de /diesel/ingresos?...

        // Detectar si es una URL de acción especial (contiene /recepcionar, /anular, etc)
        const actionPatterns = ['/recepcionar', '/anular', '/toggle'];
        let isActionUrl = actionPatterns.some(pattern => url.includes(pattern));

        if (isActionUrl) {
            // Extraer la URL base de la entidad: /diesel/ingresos/123/recepcionar -> /diesel/ingresos
            const parts = url.split('/');
            // Quitar los últimos 2 segmentos (id y acción)
            const entityBase = parts.slice(0, -2).join('/');
            const itemId = parseInt(parts[parts.length - 2]);
            const action = parts[parts.length - 1];

            const baseSearchUrl = `${API_BASE}${entityBase}`;
            const matchingCaches = allCache.filter(c => c.key.startsWith(baseSearchUrl));

            for (const cached of matchingCaches) {
                if (cached.data) {
                    let newData = { ...cached.data };
                    let list = Array.isArray(newData) ? newData : (newData.data && Array.isArray(newData.data) ? newData.data : null);

                    if (list) {
                        const index = list.findIndex(item => item.id === itemId);
                        if (index !== -1) {
                            // Aplicar cambios según la acción
                            if (action === 'recepcionar') {
                                list[index] = {
                                    ...list[index],
                                    estado: 'FINALIZADO',
                                    _offlinePending: true,
                                    ...body
                                };
                            } else if (action === 'anular') {
                                list[index] = {
                                    ...list[index],
                                    estado: 'ANULADO',
                                    _offlinePending: true
                                };
                            } else {
                                // Acción genérica
                                list[index] = { ...list[index], ...body, _offlinePending: true };
                            }

                            await db.apiCache.put({ ...cached, data: newData, timestamp: Date.now() });
                            console.log(`✅ Optimistic: Actualizado item ${itemId} en cache`, cached.key);
                        }
                    }
                }
            }
        } else {
            // PATCH simple a un item (URL: /diesel/tanques/123)
            const parts = url.split('/');
            const lastPart = parts[parts.length - 1];
            const listUrlPartial = url.substring(0, url.lastIndexOf('/'));
            const baseSearchUrl = `${API_BASE}${listUrlPartial}`;

            const matchingCaches = allCache.filter(c => c.key.startsWith(baseSearchUrl));

            for (const cached of matchingCaches) {
                if (cached.data) {
                    let newData = { ...cached.data };
                    let list = Array.isArray(newData) ? newData : (newData.data && Array.isArray(newData.data) ? newData.data : null);

                    if (list) {
                        const idToUpdate = parseInt(lastPart);
                        const index = list.findIndex(item => item.id === idToUpdate);
                        if (index !== -1) {
                            list[index] = { ...list[index], ...body, _offlinePending: true };
                            await db.apiCache.put({ ...cached, data: newData, timestamp: Date.now() });
                            console.log(`✅ Optimistic: Actualizado item ${idToUpdate} en cache`, cached.key);
                        }
                    }
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
