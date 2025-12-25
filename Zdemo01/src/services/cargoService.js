/**
 * Cargo Service
 * Comunicación con API para gestión de cargos
 */

import { authFetch } from './authService';

/**
 * Obtener lista de todos los cargos
 */
export async function fetchCargos() {
    try {
        const response = await authFetch('/cargos');
        const data = await response.json();
        
        if (!response.ok) {
            return { success: false, error: data.message || 'Error obteniendo cargos' };
        }
        
        return { success: true, data: data.data || [] };
    } catch (error) {
        console.error('Error fetching cargos:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

/**
 * Obtener lista de cargos activos (para selects)
 */
export async function fetchCargosActivos() {
    try {
        const response = await authFetch('/cargos/activos');
        const data = await response.json();
        
        if (!response.ok) {
            return { success: false, error: data.message || 'Error obteniendo cargos' };
        }
        
        return { success: true, data: data.data || [] };
    } catch (error) {
        console.error('Error fetching cargos activos:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

/**
 * Obtener un cargo por ID
 */
export async function getCargo(id) {
    try {
        const response = await authFetch(`/cargos/${id}`);
        const data = await response.json();
        
        if (!response.ok) {
            return { success: false, error: data.message || 'Error obteniendo cargo' };
        }
        
        return { success: true, data: data.data };
    } catch (error) {
        console.error('Error getting cargo:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

/**
 * Crear nuevo cargo
 */
export async function createCargo(cargoData) {
    try {
        const response = await authFetch('/cargos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cargoData),
        });
        const data = await response.json();
        
        if (!response.ok) {
            return { 
                success: false, 
                error: data.message || 'Error creando cargo',
                errors: data.errors 
            };
        }
        
        return { success: true, data: data.data, message: data.message };
    } catch (error) {
        console.error('Error creating cargo:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

/**
 * Actualizar cargo
 */
export async function updateCargo(id, cargoData) {
    try {
        const response = await authFetch(`/cargos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cargoData),
        });
        const data = await response.json();
        
        if (!response.ok) {
            return { 
                success: false, 
                error: data.message || 'Error actualizando cargo',
                errors: data.errors 
            };
        }
        
        return { success: true, message: data.message };
    } catch (error) {
        console.error('Error updating cargo:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

/**
 * Eliminar cargo
 */
export async function deleteCargo(id) {
    try {
        const response = await authFetch(`/cargos/${id}`, {
            method: 'DELETE',
        });
        const data = await response.json();
        
        if (!response.ok) {
            return { success: false, error: data.message || 'Error eliminando cargo' };
        }
        
        return { success: true, message: data.message };
    } catch (error) {
        console.error('Error deleting cargo:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

export default {
    fetchCargos,
    fetchCargosActivos,
    getCargo,
    createCargo,
    updateCargo,
    deleteCargo,
};
