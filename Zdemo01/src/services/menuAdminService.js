/**
 * Menu Admin Service
 * Servicio para administración de menús (CRUD) - Solo superusuarios
 */

import { authFetch } from './authService';

const ENDPOINT = '/menus';

/**
 * Obtener todos los menús con estructura jerárquica
 */
export async function getMenus() {
    try {
        const response = await authFetch(ENDPOINT);
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Error fetching menus:', error);
        throw error;
    }
}

/**
 * Obtener un menú específico por ID
 */
export async function getMenu(id) {
    try {
        const response = await authFetch(`${ENDPOINT}/${id}`);
        const data = await response.json();
        return data.data || null;
    } catch (error) {
        console.error('Error fetching menu:', error);
        throw error;
    }
}

/**
 * Obtener lista de menús padres para combo de selección
 */
export async function getParentMenus() {
    try {
        const response = await authFetch(`${ENDPOINT}/parents`);
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Error fetching parent menus:', error);
        return [];
    }
}

/**
 * Obtener lista de iconos disponibles
 */
export async function getAvailableIcons() {
    try {
        const response = await authFetch(`${ENDPOINT}/icons`);
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Error fetching icons:', error);
        // Lista fallback de iconos comunes
        return [
            'Home', 'Settings', 'Users', 'Lock', 'Shield', 'Wrench',
            'Menu', 'List', 'Folder', 'File', 'Database', 'Server',
            'MessageCircle', 'Mail', 'Bell', 'Calendar', 'Clock',
            'Search', 'Plus', 'Edit', 'Trash2', 'Eye', 'Download'
        ];
    }
}

/**
 * Crear un nuevo menú
 */
export async function createMenu(menuData) {
    try {
        const response = await authFetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(menuData)
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error creating menu:', error);
        return { success: false, error: error.message || 'Error al crear menú' };
    }
}

/**
 * Actualizar un menú existente
 */
export async function updateMenu(id, menuData) {
    try {
        const response = await authFetch(`${ENDPOINT}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(menuData)
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error updating menu:', error);
        return { success: false, error: error.message || 'Error al actualizar menú' };
    }
}

/**
 * Eliminar un menú
 */
export async function deleteMenu(id) {
    try {
        const response = await authFetch(`${ENDPOINT}/${id}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error deleting menu:', error);
        return { success: false, error: error.message || 'Error al eliminar menú' };
    }
}

