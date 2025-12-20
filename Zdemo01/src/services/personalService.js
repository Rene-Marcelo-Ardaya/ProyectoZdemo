/**
 * Personal Service
 * Comunicación con API para gestión de personal (RRHH)
 */

import { authFetch } from './authService';

/**
 * Obtener lista de personal
 */
export async function fetchPersonal() {
    try {
        const response = await authFetch('/personal');
        const data = await response.json();
        
        if (!response.ok) {
            return { success: false, error: data.message || 'Error obteniendo personal' };
        }
        
        return { success: true, data: data.data || [] };
    } catch (error) {
        console.error('Error fetching personal:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

/**
 * Obtener un registro de personal por ID
 */
export async function getPersonal(id) {
    try {
        const response = await authFetch(`/personal/${id}`);
        const data = await response.json();
        
        if (!response.ok) {
            return { success: false, error: data.message || 'Error obteniendo personal' };
        }
        
        return { success: true, data: data.data };
    } catch (error) {
        console.error('Error getting personal:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

/**
 * Crear nuevo personal
 */
export async function createPersonal(personalData) {
    try {
        const response = await authFetch('/personal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(personalData),
        });
        const data = await response.json();
        
        if (!response.ok) {
            return { 
                success: false, 
                error: data.message || 'Error creando personal',
                errors: data.errors 
            };
        }
        
        return { success: true, data: data.data, message: data.message };
    } catch (error) {
        console.error('Error creating personal:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

/**
 * Actualizar personal
 */
export async function updatePersonal(id, personalData) {
    try {
        const response = await authFetch(`/personal/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(personalData),
        });
        const data = await response.json();
        
        if (!response.ok) {
            return { 
                success: false, 
                error: data.message || 'Error actualizando personal',
                errors: data.errors 
            };
        }
        
        return { success: true, message: data.message };
    } catch (error) {
        console.error('Error updating personal:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

/**
 * Eliminar personal
 */
export async function deletePersonal(id) {
    try {
        const response = await authFetch(`/personal/${id}`, {
            method: 'DELETE',
        });
        const data = await response.json();
        
        if (!response.ok) {
            return { success: false, error: data.message || 'Error eliminando personal' };
        }
        
        return { success: true, message: data.message };
    } catch (error) {
        console.error('Error deleting personal:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

/**
 * Obtener usuarios disponibles para vincular
 */
export async function getAvailableUsers() {
    try {
        const response = await authFetch('/personal/available-users');
        const data = await response.json();
        
        if (!response.ok) {
            return { success: false, error: data.message || 'Error obteniendo usuarios' };
        }
        
        return { success: true, data: data.data || [] };
    } catch (error) {
        console.error('Error getting available users:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

export default {
    fetchPersonal,
    getPersonal,
    createPersonal,
    updatePersonal,
    deletePersonal,
    getAvailableUsers,
};
