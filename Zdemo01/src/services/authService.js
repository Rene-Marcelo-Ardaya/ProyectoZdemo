/**
 * Servicio de autenticación
 * Maneja la comunicación con la API Laravel
 */

import CONFIG from '../config';

import { saveMenu } from './menuService';

const API_BASE_URL = CONFIG.API_BASE_URL;

// Clave para almacenar el token en localStorage
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'userData';

/**
 * Realiza el login contra la API Laravel
 * @param {string} name - Nombre del usuario
 * @param {string} password - Contraseña
 * @returns {Promise<{success: boolean, error?: string, data?: object}>}
 */
export async function login(name, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ name, password }),
        });

        const result = await response.json();

        if (result.success) {
            // Guardar token
            localStorage.setItem(TOKEN_KEY, result.data.token);
            
            // Guardar datos del usuario
            const userData = {
                isAuthenticated: true,
                loginTime: new Date().toISOString(),
                ...result.data.user
            };
            localStorage.setItem(USER_KEY, JSON.stringify(userData));

            // Guardar Menús Dinámicos (si existen)
            if (result.data.menus) {
                saveMenu(result.data.menus);
            }

            return { success: true, data: userData, menus: result.data.menus };
        } else {
            return {
                success: false,
                error: result.error || 'Error de autenticación'
            };
        }
    } catch (error) {
        console.error('Error en login:', error);
        return {
            success: false,
            error: 'Error de conexión con el servidor'
        };
    }
}

/**
 * Cierra la sesión del usuario
 */
export async function logout() {
    const token = getToken();
    
    if (token) {
        try {
            await fetch(`${API_BASE_URL}/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });
        } catch (error) {
            console.error('Error en logout:', error);
        }
    }
    
    // Limpiar localStorage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

/**
 * Obtener token de localStorage
 * @returns {string|null}
 */
export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

/**
 * Obtener datos del usuario desde localStorage
 * @returns {object|null}
 */
export function getSession() {
    try {
        const data = localStorage.getItem(USER_KEY);
        if (data) {
            return JSON.parse(data);
        }
    } catch {
        localStorage.removeItem(USER_KEY);
    }
    return null;
}

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean}
 */
export function isAuthenticated() {
    const session = getSession();
    const token = getToken();
    return session?.isAuthenticated === true && !!token;
}

/**
 * Obtener perfil del usuario desde la API
 * @returns {Promise<object>}
 */
export async function getProfile() {
    const token = getToken();
    
    if (!token) {
        return { success: false, error: 'No hay sesión activa' };
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });
        return await response.json();
    } catch (error) {
        console.error('Error obteniendo perfil:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

/**
 * Helper para hacer requests autenticadas
 * @param {string} endpoint - Endpoint de la API (sin el base URL)
 * @param {object} options - Opciones de fetch
 * @returns {Promise<Response>}
 */
export async function authFetch(endpoint, options = {}) {
    const token = getToken();
    
    const headers = {
        'Accept': 'application/json',
        ...options.headers,
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });
}
