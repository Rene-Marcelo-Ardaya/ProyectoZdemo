/**
 * Servicio de gestión de usuarios
 */

import CONFIG from '../config';
import { authFetch } from './authService';

const ENDPOINT_USERS = '/users';
const ENDPOINT_ROLES = '/roles-list';

/**
 * Listar todos los usuarios
 */
export async function getUsers() {
    try {
        const response = await authFetch(ENDPOINT_USERS);
        const result = await response.json();
        return result.success ? result.data : [];
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
}

/**
 * Obtener lista de roles para combo
 */
export async function getRolesList() {
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
 * Crear usuario
 */
export async function createUser(data) {
    try {
        const response = await authFetch(ENDPOINT_USERS, {
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
 * Actualizar usuario
 */
export async function updateUser(id, data) {
    try {
        const response = await authFetch(`${ENDPOINT_USERS}/${id}`, {
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
 * Eliminar usuario
 */
export async function deleteUser(id) {
    try {
        const response = await authFetch(`${ENDPOINT_USERS}/${id}`, {
            method: 'DELETE'
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: 'Error de conexión' };
    }
}
