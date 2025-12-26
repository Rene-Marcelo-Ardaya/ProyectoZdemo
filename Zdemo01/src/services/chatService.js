/**
 * Servicio de Chat
 * Maneja la comunicación con la API Laravel para chat
 * Incluye integración con Pusher para tiempo real
 */

import { authFetch, getToken } from './authService';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import CONFIG from '../config';

// Configurar Pusher globalmente
window.Pusher = Pusher;

// Instancia de Echo (se inicializa cuando hay sesión)
let echoInstance = null;

// Cache de credenciales de Pusher
let pusherCredentialsCache = null;

/**
 * Obtener credenciales de Pusher desde la API
 */
async function getPusherCredentials() {
    if (pusherCredentialsCache) {
        return pusherCredentialsCache;
    }
    
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api-credentials/pusher/public`);
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
                pusherCredentialsCache = data.data;
                return pusherCredentialsCache;
            }
        }
    } catch (error) {
        console.warn('Error obteniendo credenciales de Pusher:', error);
    }
    
    // Fallback: no hay credenciales
    return null;
}

/**
 * Inicializar Laravel Echo con Pusher
 * Ahora obtiene credenciales dinámicamente de la base de datos
 */
export async function initializeEcho() {
    if (echoInstance) return echoInstance;

    const token = getToken();
    if (!token) return null;

    try {
        // Obtener credenciales de la API
        const credentials = await getPusherCredentials();
        
        if (!credentials || !credentials.app_key) {
            console.warn('Credenciales de Pusher no configuradas');
            return null;
        }

        echoInstance = new Echo({
            broadcaster: 'pusher',
            key: credentials.app_key,
            cluster: credentials.app_cluster || 'mt1',
            forceTLS: true,
            authEndpoint: `${CONFIG.API_BASE_URL}/broadcasting/auth`,
            auth: {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            },
        });
        return echoInstance;
    } catch (error) {
        console.error('Error inicializando Echo:', error);
        return null;
    }
}


/**
 * Obtener instancia de Echo
 */
export function getEcho() {
    return echoInstance || initializeEcho();
}

/**
 * Desconectar Echo
 */
export function disconnectEcho() {
    if (echoInstance) {
        echoInstance.disconnect();
        echoInstance = null;
    }
}

/**
 * Suscribirse a un canal de conversación
 */
export function subscribeToConversation(conversationId, callbacks = {}) {
    const echo = getEcho();
    if (!echo) return null;

    const channel = echo.private(`conversation.${conversationId}`);

    if (callbacks.onMessage) {
        channel.listen('.message.sent', callbacks.onMessage);
    }

    if (callbacks.onStatusUpdate) {
        channel.listen('.message.status', callbacks.onStatusUpdate);
    }

    if (callbacks.onTyping) {
        channel.listen('.user.typing', callbacks.onTyping);
    }

    return channel;
}

/**
 * Desuscribirse de un canal de conversación
 */
export function unsubscribeFromConversation(conversationId) {
    const echo = getEcho();
    if (echo) {
        echo.leave(`conversation.${conversationId}`);
    }
}

/**
 * Obtener todas las conversaciones del usuario autenticado
 * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
 */
export async function getConversations() {
    try {
        const response = await authFetch('/conversations');

        if (!response.ok) {
            if (response.status === 401) {
                return { success: false, error: 'Sesión expirada' };
            }
            return { success: false, error: 'Error al obtener conversaciones' };
        }

        const data = await response.json();
        return { success: true, data: data.data || data };
    } catch (error) {
        console.error('Error obteniendo conversaciones:', error);
        return { success: false, error: 'Error de conexión con el servidor' };
    }
}

/**
 * Obtener mensajes de una conversación específica
 * @param {number} conversationId - ID de la conversación
 * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
 */
export async function getMessages(conversationId) {
    try {
        const response = await authFetch(`/conversations/${conversationId}`);

        if (!response.ok) {
            if (response.status === 401) {
                return { success: false, error: 'Sesión expirada' };
            }
            if (response.status === 403) {
                return { success: false, error: 'No tienes acceso a esta conversación' };
            }
            return { success: false, error: 'Error al obtener mensajes' };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('Error obteniendo mensajes:', error);
        return { success: false, error: 'Error de conexión con el servidor' };
    }
}

/**
 * Enviar un mensaje a una conversación
 * @param {number} conversationId - ID de la conversación
 * @param {string} body - Contenido del mensaje
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function sendMessage(conversationId, body) {
    try {
        const response = await authFetch('/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                conversation_id: conversationId,
                body: body
            }),
        });

        if (!response.ok) {
            if (response.status === 401) {
                return { success: false, error: 'Sesión expirada' };
            }
            if (response.status === 403) {
                return { success: false, error: 'No tienes acceso a esta conversación' };
            }
            if (response.status === 422) {
                const errorData = await response.json();
                return { success: false, error: errorData.message || 'Datos inválidos' };
            }
            return { success: false, error: 'Error al enviar mensaje' };
        }

        const data = await response.json();
        return { success: true, data: data.data || data };
    } catch (error) {
        console.error('Error enviando mensaje:', error);
        return { success: false, error: 'Error de conexión con el servidor' };
    }
}

/**
 * Marcar mensajes como leídos
 * @param {number} conversationId - ID de la conversación
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function markAsRead(conversationId) {
    try {
        const response = await authFetch('/messages/read', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                conversation_id: conversationId
            }),
        });

        if (!response.ok) {
            return { success: false, error: 'Error al marcar como leído' };
        }

        return { success: true };
    } catch (error) {
        console.error('Error marcando como leído:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

/**
 * Enviar indicador de "escribiendo"
 * @param {number} conversationId - ID de la conversación
 * @param {boolean} isTyping - Si está escribiendo
 * @returns {Promise<void>}
 */
export async function sendTyping(conversationId, isTyping = true) {
    try {
        await authFetch('/messages/typing', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                conversation_id: conversationId,
                is_typing: isTyping
            }),
        });
    } catch (error) {
        // Silenciar errores de typing
    }
}

/**
 * Buscar usuarios para iniciar una conversación
 * @param {string} query - Término de búsqueda (nombre o email)
 * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
 */
export async function searchUsers(query = '') {
    try {
        const response = await authFetch(`/users/search?q=${encodeURIComponent(query)}`);

        if (!response.ok) {
            if (response.status === 401) {
                return { success: false, error: 'Sesión expirada' };
            }
            return { success: false, error: 'Error al buscar usuarios' };
        }

        const data = await response.json();
        return { success: true, data: data.data || data };
    } catch (error) {
        console.error('Error buscando usuarios:', error);
        return { success: false, error: 'Error de conexión con el servidor' };
    }
}

/**
 * Crear una nueva conversación
 * @param {Array<number>} userIds - IDs de los usuarios a agregar
 * @param {string|null} name - Nombre del grupo (opcional)
 * @param {boolean} isGroup - Si es un grupo
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function createConversation(userIds, name = null, isGroup = false) {
    try {
        const response = await authFetch('/conversations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_ids: userIds,
                name: name,
                is_group: isGroup
            }),
        });

        if (!response.ok) {
            if (response.status === 401) {
                return { success: false, error: 'Sesión expirada' };
            }
            if (response.status === 422) {
                const errorData = await response.json();
                return { success: false, error: errorData.message || 'Datos inválidos' };
            }
            return { success: false, error: 'Error al crear conversación' };
        }

        const data = await response.json();
        return { success: true, data: data.data || data };
    } catch (error) {
        console.error('Error creando conversación:', error);
        return { success: false, error: 'Error de conexión con el servidor' };
    }
}

/**
 * Formatear timestamp para mostrar en el chat
 * @param {string} timestamp - Timestamp ISO
 * @returns {string} - Fecha/hora formateada
 */
export function formatMessageTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) {
        return 'Ahora';
    } else if (diffMins < 60) {
        return `${diffMins} min`;
    } else if (diffHours < 24) {
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
        return 'Ayer';
    } else if (diffDays < 7) {
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        return days[date.getDay()];
    } else {
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit'
        });
    }
}

/**
 * Obtener iniciales de un nombre
 * @param {string} name - Nombre completo
 * @returns {string} - Iniciales (máx 2 caracteres)
 */
export function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Generar color consistente basado en un ID
 * @param {number|string} id - ID para generar el color
 * @returns {string} - Color HSL
 */
export function getAvatarColor(id) {
    const colors = [
        'hsl(220, 80%, 55%)',  // Azul
        'hsl(280, 80%, 55%)',  // Púrpura
        'hsl(340, 80%, 55%)',  // Rosa
        'hsl(160, 70%, 45%)',  // Verde
        'hsl(25, 85%, 55%)',   // Naranja
        'hsl(190, 80%, 45%)',  // Cyan
        'hsl(45, 90%, 50%)',   // Amarillo
    ];
    const numId = typeof id === 'string' ? id.charCodeAt(0) + (id.charCodeAt(1) || 0) : id;
    return colors[numId % colors.length];
}

/**
 * Obtener icono de estado del mensaje
 * @param {string} status - Estado del mensaje (sent, delivered, read)
 * @returns {string} - Símbolo del estado
 */
export function getStatusIcon(status) {
    switch (status) {
        case 'sent':
            return '✓';
        case 'delivered':
            return '✓✓';
        case 'read':
            return '✓✓'; // Se muestra en azul via CSS
        default:
            return '';
    }
}

