/**
 * WhatsApp Verification Service
 * API calls for WhatsApp verification endpoints
 */
import { authFetch } from './authService';

/**
 * Obtener estado de verificación WhatsApp
 */
export async function getWhatsappStatus(personalId) {
    const response = await authFetch(`/personal/${personalId}/whatsapp/status`);
    return response.json();
}

/**
 * Enviar código de verificación
 */
export async function sendVerificationCode(personalId, instanceName) {
    const response = await authFetch(`/personal/${personalId}/whatsapp/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instance_name: instanceName }),
    });
    return response.json();
}

/**
 * Verificar código recibido
 */
export async function verifyCode(personalId, code, whatsappJid) {
    const response = await authFetch(`/personal/${personalId}/whatsapp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, whatsapp_jid: whatsappJid }),
    });
    return response.json();
}

/**
 * Resetear verificación
 */
export async function resetVerification(personalId) {
    const response = await authFetch(`/personal/${personalId}/whatsapp/reset`, {
        method: 'DELETE',
    });
    return response.json();
}

export default {
    getWhatsappStatus,
    sendVerificationCode,
    verifyCode,
    resetVerification,
};
