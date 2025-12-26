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

export default {
    fetchTanques,
    getTanque,
    createTanque,
    updateTanque,
    deleteTanque,
    fetchTanquesActivos,
    fetchTanquesAlerta,
};
