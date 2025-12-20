/**
 * Evolution API Service
 * Comunicación con Evolution API v2.1.1 para gestión de instancias WhatsApp
 */

const EVOLUTION_API_URL = import.meta.env.VITE_EVOLUTION_API_URL || 'http://localhost:8080';
const EVOLUTION_API_KEY = import.meta.env.VITE_EVOLUTION_API_KEY || 'your-evolution-api-key';

/**
 * Realizar petición a Evolution API
 */
async function evolutionFetch(endpoint, options = {}) {
    const url = `${EVOLUTION_API_URL}${endpoint}`;
    
    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'apikey': EVOLUTION_API_KEY,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            console.error('Evolution API Error Response:', data);
            return { success: false, error: data.message || data.error || JSON.stringify(data) };
        }
        
        return { success: true, data };
    } catch (error) {
        console.error('Evolution API Error:', error);
        return { success: false, error: 'Error de conexión con Evolution API' };
    }
}

/**
 * Obtener todas las instancias
 */
export async function fetchInstances() {
    return evolutionFetch('/instance/fetchInstances');
}

/**
 * Crear nueva instancia
 */
export async function createInstance(instanceData) {
    const payload = {
        instanceName: instanceData.instanceName,
        integration: instanceData.integration || 'WHATSAPP-BAILEYS',
        qrcode: instanceData.qrcode !== false,
        // Opcionales
        ...(instanceData.number && { number: instanceData.number }),
        ...(instanceData.webhook && { webhook: instanceData.webhook }),
    };

    return evolutionFetch('/instance/create', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

/**
 * Eliminar instancia
 */
export async function deleteInstance(instanceName) {
    return evolutionFetch(`/instance/delete/${instanceName}`, {
        method: 'DELETE',
    });
}

/**
 * Conectar instancia (obtener QR)
 */
export async function connectInstance(instanceName) {
    return evolutionFetch(`/instance/connect/${instanceName}`, {
        method: 'GET',
    });
}

/**
 * Desconectar/Logout instancia
 */
export async function logoutInstance(instanceName) {
    return evolutionFetch(`/instance/logout/${instanceName}`, {
        method: 'DELETE',
    });
}

/**
 * Reiniciar instancia
 */
export async function restartInstance(instanceName) {
    return evolutionFetch(`/instance/restart/${instanceName}`, {
        method: 'PUT',
    });
}

/**
 * Obtener estado de conexión de una instancia
 */
export async function getConnectionState(instanceName) {
    return evolutionFetch(`/instance/connectionState/${instanceName}`, {
        method: 'GET',
    });
}

/**
 * Reconectar instancia (eliminar y recrear para obtener nuevo QR)
 * Evolution API v2 solo devuelve QR al crear la instancia
 * Luego debemos hacer polling hasta que el QR esté listo
 */
export async function reconnectInstance(instanceName) {
    // Primero eliminar la instancia existente
    const deleteResult = await deleteInstance(instanceName);
    if (!deleteResult.success) {
        console.warn('Delete failed, trying to create anyway:', deleteResult.error);
    }
    
    // Esperar un momento para que se procese la eliminación
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Crear de nuevo con QR
    const createResult = await createInstance({
        instanceName,
        qrcode: true,
    });

    if (!createResult.success) {
        return createResult;
    }

    // Hacer polling para obtener el QR
    const maxAttempts = 15;
    const delayMs = 2000;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
        
        const connectResult = await connectInstance(instanceName);
        console.log(`Polling attempt ${attempt + 1}:`, connectResult);
        
        if (connectResult.success && connectResult.data) {
            const data = connectResult.data;
            
            // Verificar si hay QR en la respuesta
            if (data.base64 || data.code || 
                (data.qrcode && (data.qrcode.base64 || data.qrcode.code))) {
                return {
                    success: true,
                    data: data.qrcode || data
                };
            }
            
            // Si el count > 0, ya hay un QR generándose
            if (data.count > 0 || (data.qrcode && data.qrcode.count > 0)) {
                continue; // Seguir esperando
            }
        }
    }

    // Si después de polling no hay QR, devolver los datos de creación
    return {
        success: true,
        data: createResult.data,
        warning: 'QR generándose, intenta conectar de nuevo en unos segundos'
    };
}

// ============================================
// MESSAGING FUNCTIONS
// ============================================

/**
 * Obtener solo las instancias conectadas (estado "open")
 */
export async function getConnectedInstances() {
    const result = await fetchInstances();
    if (!result.success) return result;

    const connected = (result.data || []).filter(instance => {
        // El estado está directamente en connectionStatus
        const state = instance.connectionStatus;
        return state === 'open' || state === 'connected';
    });

    return { success: true, data: connected };
}

/**
 * Formatear número de teléfono para WhatsApp
 * @param {string} countryCode - Código de país sin +
 * @param {string} phoneNumber - Número de teléfono
 */
function formatWhatsAppNumber(countryCode, phoneNumber) {
    // Limpiar caracteres no numéricos
    const cleanCode = (countryCode || '').replace(/\D/g, '');
    const cleanNumber = (phoneNumber || '').replace(/\D/g, '');
    return `${cleanCode}${cleanNumber}`;
}

/**
 * Enviar mensaje de texto
 * @param {string} instanceName - Nombre de la instancia
 * @param {string} number - Número completo con código de país
 * @param {string} text - Texto del mensaje
 */
export async function sendTextMessage(instanceName, number, text) {
    return evolutionFetch(`/message/sendText/${instanceName}`, {
        method: 'POST',
        body: JSON.stringify({
            number: number,
            text: text,
        }),
    });
}

/**
 * Enviar mensaje de audio
 * @param {string} instanceName - Nombre de la instancia
 * @param {string} number - Número completo con código de país
 * @param {string} audioBase64 - Audio codificado en base64
 */
export async function sendAudioMessage(instanceName, number, audioBase64) {
    return evolutionFetch(`/message/sendWhatsAppAudio/${instanceName}`, {
        method: 'POST',
        body: JSON.stringify({
            number: number,
            audio: audioBase64,
            encoding: true, // Indica que es base64
        }),
    });
}

/**
 * Enviar media (documento, imagen, video)
 * Evolution API format: https://doc.evolution-api.com/
 * @param {string} instanceName - Nombre de la instancia
 * @param {string} number - Número completo con código de país
 * @param {string} mediaBase64 - Media codificado en base64
 * @param {string} mimetype - Tipo MIME del archivo
 * @param {string} fileName - Nombre del archivo
 * @param {string} caption - Caption opcional
 */
export async function sendMediaMessage(instanceName, number, mediaBase64, mimetype, fileName, caption = '') {
    // Determinar el tipo de media basado en mimetype
    let mediatype = 'document';
    if (mimetype.startsWith('image/')) mediatype = 'image';
    else if (mimetype.startsWith('video/')) mediatype = 'video';
    else if (mimetype.startsWith('audio/')) mediatype = 'audio';

    return evolutionFetch(`/message/sendMedia/${instanceName}`, {
        method: 'POST',
        body: JSON.stringify({
            number: number,
            mediatype: mediatype,
            media: mediaBase64, // Solo base64 puro, sin prefijo data:
            mimetype: mimetype,
            fileName: fileName,
            caption: caption || undefined,
        }),
    });
}

/**
 * Convertir File a Base64
 */
export function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // Extraer solo la parte base64 (sin el prefijo data:...)
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });
}

/**
 * Obtener historial de mensajes con un contacto
 * @param {string} instanceName - Nombre de la instancia
 * @param {string} phoneNumber - Número completo con código de país
 * @param {number} limit - Cantidad de mensajes a obtener
 */
export async function fetchMessages(instanceName, phoneNumber, limit = 50) {
    // Formatear el JID de WhatsApp
    const remoteJid = `${phoneNumber.replace(/\D/g, '')}@s.whatsapp.net`;
    
    return evolutionFetch(`/chat/findMessages/${instanceName}`, {
        method: 'POST',
        body: JSON.stringify({
            where: {
                key: {
                    remoteJid: remoteJid
                }
            },
            limit: limit
        }),
    });
}

/**
 * Obtener la URL base para WebSocket
 */
export function getWebSocketUrl() {
    // Convertir http a ws
    return EVOLUTION_API_URL.replace('http://', 'ws://').replace('https://', 'wss://');
}

/**
 * Obtener la API key para WebSocket
 */
export function getApiKey() {
    return EVOLUTION_API_KEY;
}

export default {
    fetchInstances,
    createInstance,
    deleteInstance,
    connectInstance,
    logoutInstance,
    restartInstance,
    getConnectionState,
    reconnectInstance,
    // Messaging
    getConnectedInstances,
    sendTextMessage,
    sendAudioMessage,
    sendMediaMessage,
    fileToBase64,
    formatWhatsAppNumber,
    fetchMessages,
    getWebSocketUrl,
    getApiKey,
};
