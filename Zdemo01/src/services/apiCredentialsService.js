/**
 * Servicio para gestión de credenciales de APIs
 */

import { authFetch } from './authService';

/**
 * Obtener todas las credenciales (solo SuperAdmin)
 */
export async function getAllCredentials() {
    try {
        const response = await authFetch('/api-credentials');
        
        if (!response.ok) {
            if (response.status === 403) {
                return { success: false, error: 'Acceso denegado' };
            }
            return { success: false, error: 'Error al obtener credenciales' };
        }
        
        const data = await response.json();
        return { success: true, data: data.data };
    } catch (error) {
        console.error('Error obteniendo credenciales:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

/**
 * Obtener credenciales de un proveedor específico
 */
export async function getProviderCredentials(provider) {
    try {
        const response = await authFetch(`/api-credentials/${provider}`);
        
        if (!response.ok) {
            if (response.status === 403) {
                return { success: false, error: 'Acceso denegado' };
            }
            if (response.status === 404) {
                return { success: false, error: 'Proveedor no encontrado' };
            }
            return { success: false, error: 'Error al obtener credenciales' };
        }
        
        const data = await response.json();
        return { success: true, data: data.data };
    } catch (error) {
        console.error('Error obteniendo credenciales:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

/**
 * Actualizar credenciales de un proveedor
 */
export async function updateCredentials(provider, credentials) {
    try {
        const response = await authFetch(`/api-credentials/${provider}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credentials })
        });
        
        if (!response.ok) {
            if (response.status === 403) {
                return { success: false, error: 'Acceso denegado' };
            }
            if (response.status === 422) {
                const data = await response.json();
                return { success: false, error: data.message || 'Datos inválidos' };
            }
            return { success: false, error: 'Error al guardar credenciales' };
        }
        
        const data = await response.json();
        return { success: true, data: data };
    } catch (error) {
        console.error('Error guardando credenciales:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

/**
 * Probar conexión con un proveedor
 */
export async function testConnection(provider) {
    try {
        const response = await authFetch(`/api-credentials/${provider}/test`, {
            method: 'POST'
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error probando conexión:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

/**
 * Obtener credenciales públicas de un proveedor (sin auth)
 */
export async function getPublicCredentials(provider) {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/api-credentials/${provider}/public`);
        
        if (!response.ok) {
            return { success: false, error: 'Error al obtener credenciales' };
        }
        
        const data = await response.json();
        return { success: true, data: data.data };
    } catch (error) {
        console.error('Error obteniendo credenciales públicas:', error);
        return { success: false, error: 'Error de conexión' };
    }
}
