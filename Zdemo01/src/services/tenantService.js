/**
 * tenantService.js
 * 
 * Servicio para gestionar tenants desde el panel de Super Admin
 */

import { authFetch } from './authService';

const BASE_URL = '/super-admin';

/**
 * Helper para hacer requests y parsear JSON
 */
async function apiRequest(endpoint, options = {}) {
    const response = await authFetch(endpoint, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });
    return response.json();
}

/**
 * Obtener estadísticas del dashboard
 */
export const getStats = async () => {
    return apiRequest(`${BASE_URL}/stats`);
};

/**
 * Listar todos los tenants
 */
export const getTenants = async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${BASE_URL}/tenants?${queryString}` : `${BASE_URL}/tenants`;
    return apiRequest(url);
};

/**
 * Obtener un tenant por ID
 */
export const getTenant = async (id) => {
    return apiRequest(`${BASE_URL}/tenants/${id}`);
};

/**
 * Crear nuevo tenant
 */
export const createTenant = async (data) => {
    return apiRequest(`${BASE_URL}/tenants`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

/**
 * Actualizar tenant
 */
export const updateTenant = async (id, data) => {
    return apiRequest(`${BASE_URL}/tenants/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};

/**
 * Eliminar tenant
 */
export const deleteTenant = async (id) => {
    return apiRequest(`${BASE_URL}/tenants/${id}`, {
        method: 'DELETE',
    });
};

/**
 * Obtener planes disponibles
 */
export const getPlans = async () => {
    return apiRequest(`${BASE_URL}/plans`);
};

/**
 * Obtener un plan por ID
 */
export const getPlan = async (id) => {
    return apiRequest(`${BASE_URL}/plans/${id}`);
};

/**
 * Crear nuevo plan
 */
export const createPlan = async (data) => {
    return apiRequest(`${BASE_URL}/plans`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

/**
 * Actualizar plan
 */
export const updatePlan = async (id, data) => {
    return apiRequest(`${BASE_URL}/plans/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};

/**
 * Activar/Desactivar plan
 */
export const togglePlanActive = async (id) => {
    return apiRequest(`${BASE_URL}/plans/${id}/toggle-active`, {
        method: 'PATCH',
    });
};

/**
 * Eliminar plan
 */
export const deletePlan = async (id) => {
    return apiRequest(`${BASE_URL}/plans/${id}`, {
        method: 'DELETE',
    });
};

// =====================================================
// MÓDULOS
// =====================================================

/**
 * Listar todos los módulos
 */
export const getModules = async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${BASE_URL}/modules?${queryString}` : `${BASE_URL}/modules`;
    return apiRequest(url);
};

/**
 * Obtener un módulo por ID
 */
export const getModule = async (id) => {
    return apiRequest(`${BASE_URL}/modules/${id}`);
};

/**
 * Crear nuevo módulo
 */
export const createModule = async (data) => {
    return apiRequest(`${BASE_URL}/modules`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

/**
 * Actualizar módulo
 */
export const updateModule = async (id, data) => {
    return apiRequest(`${BASE_URL}/modules/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};

/**
 * Activar/Desactivar módulo
 */
export const toggleModuleActive = async (id) => {
    return apiRequest(`${BASE_URL}/modules/${id}/toggle-active`, {
        method: 'PATCH',
    });
};

/**
 * Eliminar módulo
 */
export const deleteModule = async (id) => {
    return apiRequest(`${BASE_URL}/modules/${id}`, {
        method: 'DELETE',
    });
};

// ============================================
// Audit Logs
// ============================================

/**
 * Listar logs de auditoría con filtros
 */
export const getAuditLogs = async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${BASE_URL}/audit-logs?${queryString}` : `${BASE_URL}/audit-logs`;
    return apiRequest(url);
};

/**
 * Obtener estadísticas de auditoría
 */
export const getAuditStats = async () => {
    return apiRequest(`${BASE_URL}/audit-logs/stats`);
};

/**
 * Obtener detalle de un log
 */
export const getAuditLog = async (id) => {
    return apiRequest(`${BASE_URL}/audit-logs/${id}`);
};

export default {
    getStats,
    getTenants,
    getTenant,
    createTenant,
    updateTenant,
    deleteTenant,
    getPlans,
    getPlan,
    createPlan,
    updatePlan,
    togglePlanActive,
    deletePlan,
    getModules,
    getModule,
    createModule,
    updateModule,
    toggleModuleActive,
    deleteModule,
    getAuditLogs,
    getAuditStats,
    getAuditLog,
};

