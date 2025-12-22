/**
 * Servicio de gestión de personal - RRHH
 */

import { authFetch } from './authService';

const ENDPOINT_PERSONAL = '/personal';

/**
 * Listar todo el personal
 */
export async function getPersonal() {
    try {
        const response = await authFetch(ENDPOINT_PERSONAL);
        const result = await response.json();
        return result.success ? result.data : [];
    } catch (error) {
        console.error('Error fetching personal:', error);
        return [];
    }
}

/**
 * Obtener un empleado específico
 */
export async function getEmpleado(id) {
    try {
        const response = await authFetch(`${ENDPOINT_PERSONAL}/${id}`);
        const result = await response.json();
        return result.success ? result.data : null;
    } catch (error) {
        console.error('Error fetching empleado:', error);
        return null;
    }
}

/**
 * Obtener estadísticas de personal
 */
export async function getPersonalStats() {
    try {
        const response = await authFetch(`${ENDPOINT_PERSONAL}/stats`);
        const result = await response.json();
        return result.success ? result.data : null;
    } catch (error) {
        console.error('Error fetching stats:', error);
        return null;
    }
}

/**
 * Crear empleado
 */
export async function createEmpleado(data) {
    try {
        const response = await authFetch(ENDPOINT_PERSONAL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: 'Error de conexión' };
    }
}

/**
 * Actualizar empleado
 */
export async function updateEmpleado(id, data) {
    try {
        const response = await authFetch(`${ENDPOINT_PERSONAL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: 'Error de conexión' };
    }
}

/**
 * Eliminar empleado
 */
export async function deleteEmpleado(id) {
    try {
        const response = await authFetch(`${ENDPOINT_PERSONAL}/${id}`, {
            method: 'DELETE'
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: 'Error de conexión' };
    }
}
