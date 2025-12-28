/**
 * Diesel Service
 * Comunicación con API para gestión de combustible diésel
 */

import { authFetch } from './authService';

// ============================================
// TANQUES
// ============================================

/**
 * Obtener lista de tanques
 * @param {Object} filters - Filtros opcionales { tipo, activos, nivel_bajo }
 */
export async function fetchTanques(filters = {}) {
    try {
        const params = new URLSearchParams();
        if (filters.tipo) params.append('tipo', filters.tipo);
        if (filters.activos) params.append('activos', 'true');
        if (filters.nivel_bajo) params.append('nivel_bajo', 'true');
        
        const url = `/diesel/tanques${params.toString() ? `?${params}` : ''}`;
        const response = await authFetch(url);
        const data = await response.json();
        
        if (!response.ok) {
            return { success: false, error: data.message || 'Error obteniendo tanques' };
        }
        
        return { success: true, data: data.data || [] };
    } catch (error) {
        console.error('Error fetching tanques:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

/**
 * Obtener un tanque por ID
 */
export async function getTanque(id) {
    try {
        const response = await authFetch(`/diesel/tanques/${id}`);
        const data = await response.json();
        
        if (!response.ok) {
            return { success: false, error: data.message || 'Error obteniendo tanque' };
        }
        
        return { success: true, data: data.data };
    } catch (error) {
        console.error('Error getting tanque:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

/**
 * Crear nuevo tanque
 */
export async function createTanque(tanqueData) {
    try {
        const response = await authFetch('/diesel/tanques', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(tanqueData),
        });
        const data = await response.json();
        
        if (!response.ok) {
            return { 
                success: false, 
                error: data.message || 'Error creando tanque',
                errors: data.errors 
            };
        }
        
        return { success: true, data: data.data, message: data.message };
    } catch (error) {
        console.error('Error creating tanque:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

/**
 * Actualizar tanque
 */
export async function updateTanque(id, tanqueData) {
    try {
        const response = await authFetch(`/diesel/tanques/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(tanqueData),
        });
        const data = await response.json();
        
        if (!response.ok) {
            return { 
                success: false, 
                error: data.message || 'Error actualizando tanque',
                errors: data.errors 
            };
        }
        
        return { success: true, message: data.message };
    } catch (error) {
        console.error('Error updating tanque:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

/**
 * Eliminar tanque
 */
export async function deleteTanque(id) {
    try {
        const response = await authFetch(`/diesel/tanques/${id}`, {
            method: 'DELETE',
        });
        const data = await response.json();
        
        if (!response.ok) {
            return { success: false, error: data.message || 'Error eliminando tanque' };
        }
        
        return { success: true, message: data.message };
    } catch (error) {
        console.error('Error deleting tanque:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

/**
 * Obtener tanques activos (para selects)
 * @param {String} tipo - Filtro opcional: 'ESTATICO' o 'MOVIL'
 */
export async function fetchTanquesActivos(tipo = null) {
    try {
        const url = tipo 
            ? `/diesel/tanques/activos?tipo=${tipo}`
            : '/diesel/tanques/activos';
        const response = await authFetch(url);
        const data = await response.json();
        
        if (!response.ok) {
            return { success: false, error: data.message || 'Error obteniendo tanques' };
        }
        
        return { success: true, data: data.data || [] };
    } catch (error) {
        console.error('Error fetching tanques activos:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

/**
 * Obtener tanques con nivel bajo (alertas)
 */
export async function fetchTanquesAlerta() {
    try {
        const response = await authFetch('/diesel/tanques/alertas');
        const data = await response.json();
        
        if (!response.ok) {
            return { success: false, error: data.message || 'Error obteniendo alertas' };
        }
        
        return { success: true, data: data.data || [], count: data.count };
    } catch (error) {
        console.error('Error fetching alertas tanques:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

// ============================================
// CONFIGURACIÓN DE ALERTAS
// ============================================

/**
 * Obtener configuraciones de alertas
 */
export async function fetchAlertConfigurations() {
    try {
        const response = await authFetch('/diesel/alertas');
        const data = await response.json();
        
        if (!response.ok) {
            return { success: false, error: data.message || 'Error obteniendo alertas' };
        }
        
        return { success: true, data: data.data || [] };
    } catch (error) {
        console.error('Error fetching alert configs:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

/**
 * Obtener una configuración de alerta por ID
 */
export async function getAlertConfiguration(id) {
    try {
        const response = await authFetch(`/diesel/alertas/${id}`);
        const data = await response.json();
        
        if (!response.ok) {
            return { success: false, error: data.message || 'Error obteniendo alerta' };
        }
        
        return { success: true, data: data.data };
    } catch (error) {
        console.error('Error getting alert config:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

/**
 * Crear configuración de alerta
 */
export async function createAlertConfiguration(alertData) {
    try {
        const response = await authFetch('/diesel/alertas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(alertData),
        });
        const data = await response.json();
        
        if (!response.ok) {
            return { success: false, error: data.message || 'Error creando alerta', errors: data.errors };
        }
        
        return { success: true, data: data.data, message: data.message };
    } catch (error) {
        console.error('Error creating alert config:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

/**
 * Actualizar configuración de alerta
 */
export async function updateAlertConfiguration(id, alertData) {
    try {
        const response = await authFetch(`/diesel/alertas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(alertData),
        });
        const data = await response.json();
        
        if (!response.ok) {
            return { success: false, error: data.message || 'Error actualizando alerta' };
        }
        
        return { success: true, message: data.message };
    } catch (error) {
        console.error('Error updating alert config:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

/**
 * Eliminar configuración de alerta
 */
export async function deleteAlertConfiguration(id) {
    try {
        const response = await authFetch(`/diesel/alertas/${id}`, { method: 'DELETE' });
        const data = await response.json();
        
        if (!response.ok) {
            return { success: false, error: data.message || 'Error eliminando alerta' };
        }
        
        return { success: true, message: data.message };
    } catch (error) {
        console.error('Error deleting alert config:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

/**
 * Obtener instancias de Evolution API disponibles
 */
export async function fetchEvolutionInstances() {
    try {
        const response = await authFetch('/diesel/alertas/evolution-instances');
        const data = await response.json();
        
        if (!response.ok) {
            return { success: false, error: data.message || 'Error obteniendo instancias' };
        }
        
        return { success: true, data: data.data || [] };
    } catch (error) {
        console.error('Error fetching evolution instances:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

/**
 * Probar envío de alerta
 */
export async function testAlertConfiguration(alertId, tanqueId) {
    try {
        const response = await authFetch(`/diesel/alertas/${alertId}/test`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tanque_id: tanqueId }),
        });
        const data = await response.json();
        
        return { success: data.success, message: data.message };
    } catch (error) {
        console.error('Error testing alert:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

/**
 * Obtener grupos de WhatsApp de una instancia
 */
export async function fetchWhatsAppGroups(instance) {
    try {
        const response = await authFetch(`/diesel/alertas/whatsapp-groups?instance=${encodeURIComponent(instance)}`);
        const data = await response.json();
        
        if (!response.ok || !data.success) {
            return { success: false, error: data.error || 'Error obteniendo grupos' };
        }
        
        return { success: true, data: data.data || [] };
    } catch (error) {
        console.error('Error fetching WhatsApp groups:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

export default {
    fetchTanques,
    getTanque,
    createTanque,
    updateTanque,
    deleteTanque,
    fetchTanquesActivos,
    fetchTanquesAlerta,
    // Alertas
    fetchAlertConfigurations,
    getAlertConfiguration,
    createAlertConfiguration,
    updateAlertConfiguration,
    deleteAlertConfiguration,
    fetchEvolutionInstances,
    testAlertConfiguration,
    fetchWhatsAppGroups,
};

