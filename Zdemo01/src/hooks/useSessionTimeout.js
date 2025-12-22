import { useEffect, useState, useCallback } from 'react';
import { checkSessionExpired, logout } from '../services/authService';

/**
 * Hook para manejar el timeout de sesión
 * Verifica cada minuto si la sesión ha expirado
 * 
 * @param {function} onExpire - Callback cuando la sesión expira
 * @param {function} onWarning - Callback cuando quedan pocos minutos (opcional)
 * @param {number} warningMinutes - Minutos antes de expirar para mostrar advertencia (default: 5)
 */
export function useSessionTimeout(onExpire, onWarning, warningMinutes = 5) {
    const [remainingMinutes, setRemainingMinutes] = useState(null);
    const [warningShown, setWarningShown] = useState(false);

    const checkTimeout = useCallback(() => {
        const { expired, remainingMinutes: remaining } = checkSessionExpired();
        
        setRemainingMinutes(remaining);
        
        if (expired) {
            // Sesión expirada - logout automático
            logout();
            onExpire?.();
            return;
        }
        
        // Mostrar advertencia si quedan pocos minutos
        if (remaining !== null && remaining <= warningMinutes && !warningShown) {
            setWarningShown(true);
            onWarning?.(remaining);
        }
        
        // Resetear warning si el tiempo restante sube (por si acaso)
        if (remaining !== null && remaining > warningMinutes) {
            setWarningShown(false);
        }
    }, [onExpire, onWarning, warningMinutes, warningShown]);

    useEffect(() => {
        // Verificar inmediatamente al montar
        checkTimeout();
        
        // Verificar cada 30 segundos (más responsivo que 1 minuto)
        const interval = setInterval(checkTimeout, 30000);
        
        return () => clearInterval(interval);
    }, [checkTimeout]);

    return { remainingMinutes };
}

export default useSessionTimeout;
