/**
 * Servicio de gestión de roles y accesos
 */

import { authFetch } from './authService';

const ENDPOINT_ROLES = '/roles';
const ENDPOINT_MENUS = '/menus-list';

/**
 * Listar todos los roles
 */
export async function getRoles() {
    try {
        const response = await authFetch(ENDPOINT_ROLES);
        const result = await response.json();
        return result.success ? result.data : [];
    } catch (error) {
        console.error('Error fetching roles:', error);
        return [];
    }
}

/**
 * Obtener un rol con sus menús
 */
export async function getRole(id) {
    try {
        const response = await authFetch(`${ENDPOINT_ROLES}/${id}`);
        const result = await response.json();
        return result.success ? result.data : null;
    } catch (error) {
        console.error('Error fetching role:', error);
        return null;
    }
}

/**
 * Obtener lista de menús disponibles
 */
export async function getMenusList() {
    try {
        const response = await authFetch(ENDPOINT_MENUS);
        const result = await response.json();
        return result.success ? result.data : [];
    } catch (error) {
        console.error('Error fetching menus:', error);
        return [];
    }
}

/**
 * Crear rol
 */
export async function createRole(data) {
    try {
        const response = await authFetch(ENDPOINT_ROLES, {
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
 * Actualizar rol
 */
export async function updateRole(id, data) {
    try {
        const response = await authFetch(`${ENDPOINT_ROLES}/${id}`, {
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
 * Eliminar rol
 */
export async function deleteRole(id) {
    try {
        const response = await authFetch(`${ENDPOINT_ROLES}/${id}`, {
            method: 'DELETE'
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: 'Error de conexión' };
    }
}
