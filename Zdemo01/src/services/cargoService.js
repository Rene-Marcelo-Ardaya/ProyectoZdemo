/**
 * Servicio de gestión de cargos - RRHH
 */

import { authFetch } from './authService';

const ENDPOINT_CARGOS = '/cargos';

/**
 * Listar todos los cargos
 */
export async function getCargos() {
    try {
        const response = await authFetch(ENDPOINT_CARGOS);
        const result = await response.json();
        return result.success ? result.data : [];
    } catch (error) {
        console.error('Error fetching cargos:', error);
        return [];
    }
}

/**
 * Obtener un cargo específico
 */
export async function getCargo(id) {
    try {
        const response = await authFetch(`${ENDPOINT_CARGOS}/${id}`);
        const result = await response.json();
        return result.success ? result.data : null;
    } catch (error) {
        console.error('Error fetching cargo:', error);
        return null;
    }
}

/**
 * Listar cargos activos (para combos)
 */
export async function getCargosActivos() {
    try {
        const response = await authFetch('/cargos-list');
        const result = await response.json();
        return result.success ? result.data : [];
    } catch (error) {
        console.error('Error fetching cargos activos:', error);
        return [];
    }
}

/**
 * Crear cargo
 */
export async function createCargo(data) {
    try {
        const response = await authFetch(ENDPOINT_CARGOS, {
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
 * Actualizar cargo
 */
export async function updateCargo(id, data) {
    try {
        const response = await authFetch(`${ENDPOINT_CARGOS}/${id}`, {
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
 * Eliminar cargo
 */
export async function deleteCargo(id) {
    try {
        const response = await authFetch(`${ENDPOINT_CARGOS}/${id}`, {
            method: 'DELETE'
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: 'Error de conexión' };
    }
}
