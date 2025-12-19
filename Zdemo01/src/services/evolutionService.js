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
            return { success: false, error: data.message || data.error || 'Error en Evolution API' };
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

export default {
    fetchInstances,
    createInstance,
    deleteInstance,
    connectInstance,
    logoutInstance,
    restartInstance,
    getConnectionState,
    reconnectInstance,
};
