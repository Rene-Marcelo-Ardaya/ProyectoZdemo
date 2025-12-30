/**
 * Servicio de autenticación
 * Maneja la comunicación con la API Laravel
 */

import CONFIG from '../config';

import { saveMenu } from './menuService';

const API_BASE_URL = CONFIG.API_BASE_URL;

// Claves para localStorage
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'userData';
const SESSION_TIMEOUT_KEY = 'session_timeout_minutes';
const LOGIN_TIME_KEY = 'login_time';

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

            // Guardar session timeout (si existe)
            if (result.data.session_timeout_minutes !== undefined) {
                localStorage.setItem(SESSION_TIMEOUT_KEY, result.data.session_timeout_minutes ?? '');
            }
            // Guardar tiempo de login
            localStorage.setItem(LOGIN_TIME_KEY, Date.now().toString());

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
    localStorage.removeItem(SESSION_TIMEOUT_KEY);
    localStorage.removeItem(LOGIN_TIME_KEY);
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
import { db, queueRequest, cacheResponse, getCachedResponse } from '../db/db';

/**
 * Helper para hacer requests autenticadas con soporte Offline
 * @param {string} endpoint - Endpoint de la API (sin el base URL)
 * @param {object} options - Opciones de fetch
 * @returns {Promise<Response>}
 */
export async function authFetch(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
    };

<<<<<<< HEAD
=======
    // Agregar Content-Type si hay body y no está definido
    if (options.body && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

>>>>>>> origin/rm
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${API_BASE_URL}${endpoint}`;
    const method = options.method || 'GET';
    const isGet = method === 'GET';

    // Función auxiliar para retornar respuesta simulada
    const mockResponse = (data, status = 200, statusText = 'OK') => {
        return new Response(JSON.stringify(data), {
            status,
            statusText,
            headers: { 'Content-Type': 'application/json' }
        });
    };

    /**
     * Intenta obtener del cache si falla la red
     */
    const tryCacheOrOffline = async () => {
        if (isGet) {
            const cached = await getCachedResponse(url);
            if (cached) {
                console.log('📦 Sirviendo desde caché local:', url);
                return mockResponse(cached);
            }
            throw new Error('Sin conexión y sin caché disponible');
        } else if (method === 'POST' || method === 'PATCH') {
            // POST y PATCH permiten guardarse offline
            // - POST: Crear nuevos registros (ej: nuevo ingreso)
            // - PATCH: Operaciones únicas como recepcionar (solo ocurre una vez, sin conflictos)
            const added = await queueRequest(endpoint, method, options.body ? JSON.parse(options.body) : null);
            if (added) {
                return mockResponse({
                    success: true,
                    offline: true,
                    message: 'Guardado sin conexión'
                });
            }
            throw new Error('Error guardando en base de datos local');
        } else {
            // PUT/DELETE requieren conexión - no se permite offline
            // ═══════════════════════════════════════════════════════════════════
            // PUT (edición general) se bloquea porque puede causar conflictos 
            // "Last Write Wins" cuando múltiples usuarios editan el mismo registro.
            // PATCH se permite porque se usa para operaciones únicas (recepcionar).
            // DELETE se bloquea porque eliminar offline es peligroso.
            // ═══════════════════════════════════════════════════════════════════
            throw new Error('Editar o eliminar requiere conexión a internet');
        }
    };

    // Si el navegador dice que no hay red, ir directo a offline
    if (!navigator.onLine) {
        return tryCacheOrOffline();
    }

    try {
        const response = await fetch(url, { ...options, headers });

        // Si el servidor da error 5xx, tratar como offline (server down)
        if (response.status >= 500) {
            console.warn('⚠️ Servidor caído (5xx), pasando a modo offline');
            window.dispatchEvent(new Event('zdemo:offline-mode'));
            return tryCacheOrOffline();
        }

        // Si es GET exitoso, guardar en caché
        if (isGet && response.ok) {
            const clone = response.clone();
            clone.json().then(data => cacheResponse(url, data));
        }

        // Cualquier respuesta exitosa confirma que estamos online
        if (response.ok) {
            window.dispatchEvent(new Event('zdemo:online-mode'));
        }

        return response;
    } catch (error) {
        console.warn('⚠️ Error de red, pasando a modo offline:', error);
        window.dispatchEvent(new Event('zdemo:offline-mode'));
        return tryCacheOrOffline();
    }
}

/**
 * Obtener el timeout de sesión en minutos
 * @returns {number|null} - Minutos, null = sin límite
 */
export function getSessionTimeout() {
    const value = localStorage.getItem(SESSION_TIMEOUT_KEY);
    if (value === null || value === '') return null;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? null : parsed;
}

/**
 * Obtener el timestamp de login
 * @returns {number|null}
 */
export function getLoginTime() {
    const value = localStorage.getItem(LOGIN_TIME_KEY);
    if (!value) return null;
    return parseInt(value, 10);
}

/**
 * Verificar si la sesión ha expirado
 * @returns {{ expired: boolean, remainingMinutes: number|null }}
 */
export function checkSessionExpired() {
    const timeout = getSessionTimeout();
    const loginTime = getLoginTime();

    // Sin límite de sesión
    if (timeout === null || !loginTime) {
        return { expired: false, remainingMinutes: null };
    }

    const now = Date.now();
    const elapsed = (now - loginTime) / 1000 / 60; // en minutos
    const remaining = timeout - elapsed;

    return {
        expired: remaining <= 0,
        remainingMinutes: Math.max(0, Math.ceil(remaining))
    };
}

