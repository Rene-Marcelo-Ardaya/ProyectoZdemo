/**
 * Configuración global de la aplicación
 * 
 * Para usar con ngrok, crear archivo .env.local con:
 * VITE_API_URL=https://tu-url-api.ngrok-free.app/api
 */

const CONFIG = {
    // URL base de la API Laravel
    // Prioridad: Variable de entorno > localhost en dev > /api en producción
    API_BASE_URL: import.meta.env.VITE_API_URL || 
                  (import.meta.env.DEV ? 'http://localhost:8000/api' : '/api')
};

export default CONFIG;

