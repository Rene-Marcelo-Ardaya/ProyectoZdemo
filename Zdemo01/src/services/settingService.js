/**
 * Servicio de configuración del sistema
 */

import { authFetch } from './authService';
import CONFIG from '../config';

const ENDPOINT_PUBLIC = '/config/public';
const ENDPOINT_SETTINGS = '/settings';

/**
 * Obtener configuración pública (sin auth - para login y carga inicial)
 */
export async function getPublicConfig() {
    try {
        const response = await fetch(`${CONFIG.API_URL}${ENDPOINT_PUBLIC}`, {
            headers: { 'Accept': 'application/json' }
        });
        const result = await response.json();
        
        if (result.success) {
            // Guardar en localStorage para uso inmediato
            localStorage.setItem('appConfig', JSON.stringify(result.data));
            return result.data;
        }
        return {};
    } catch (error) {
        console.error('Error fetching public config:', error);
        // Intentar cargar desde cache
        const cached = localStorage.getItem('appConfig');
        return cached ? JSON.parse(cached) : {};
    }
}

/**
 * Obtener configuración desde localStorage (sincrónico)
 */
export function getStoredConfig() {
    try {
        const cached = localStorage.getItem('appConfig');
        return cached ? JSON.parse(cached) : {};
    } catch {
        return {};
    }
}

/**
 * Obtener todas las configuraciones (requiere auth)
 */
export async function getAllSettings() {
    try {
        const response = await authFetch(ENDPOINT_SETTINGS);
        const result = await response.json();
        return result.success ? result.data : {};
    } catch (error) {
        console.error('Error fetching settings:', error);
        return {};
    }
}

/**
 * Actualizar una configuración de texto
 */
export async function updateSetting(key, value) {
    try {
        const response = await authFetch(`${ENDPOINT_SETTINGS}/${key}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value })
        });
        const result = await response.json();
        
        if (result.success) {
            // Refrescar cache
            await getPublicConfig();
        }
        
        return result;
    } catch (error) {
        return { success: false, error: 'Error de conexión' };
    }
}

/**
 * Subir imagen para una configuración
 */
export async function uploadSettingImage(key, file) {
    try {
        const formData = new FormData();
        formData.append('image', file);

        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${CONFIG.API_URL}${ENDPOINT_SETTINGS}/${key}/upload`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Refrescar cache
            await getPublicConfig();
        }
        
        return result;
    } catch (error) {
        return { success: false, error: 'Error subiendo imagen' };
    }
}

/**
 * Actualizar múltiples configuraciones
 */
export async function bulkUpdateSettings(settings) {
    try {
        const response = await authFetch(ENDPOINT_SETTINGS, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ settings })
        });
        const result = await response.json();
        
        if (result.success) {
            await getPublicConfig();
        }
        
        return result;
    } catch (error) {
        return { success: false, error: 'Error de conexión' };
    }
}

/**
 * Eliminar imagen de una configuración (borra archivo del servidor)
 */
export async function deleteSettingImage(key) {
    try {
        const response = await authFetch(`${ENDPOINT_SETTINGS}/${key}/image`, {
            method: 'DELETE'
        });
        const result = await response.json();
        
        if (result.success) {
            await getPublicConfig();
        }
        
        return result;
    } catch (error) {
        return { success: false, error: 'Error eliminando imagen' };
    }
}

/**
 * Obtener URL completa de una imagen almacenada
 */
export function getImageUrl(path) {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${CONFIG.API_URL.replace('/api', '')}/storage/${path}`;
}

/**
 * Aplicar configuración dinámica al DOM (favicon, título)
 */
export function applyConfigToDOM(config) {
    // Título de la página
    if (config.app_name) {
        document.title = config.app_name;
    }

    // Favicon
    if (config.favicon) {
        const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = getImageUrl(config.favicon);
        document.head.appendChild(link);
    }

    // Meta theme-color (para móviles)
    if (config.primary_color) {
        let meta = document.querySelector("meta[name='theme-color']");
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = 'theme-color';
            document.head.appendChild(meta);
        }
        meta.content = config.primary_color;
    }
}
