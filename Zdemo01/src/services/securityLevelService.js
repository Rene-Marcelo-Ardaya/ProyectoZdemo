/**
 * Security Level Service
 * Comunicación con API para gestión de niveles de seguridad
 */

import { authFetch } from './authService';

// ========================
// NIVELES DE SEGURIDAD
// ========================

/**
 * Obtener lista de todos los niveles de seguridad
 */
export async function fetchNiveles() {
    try {
        const response = await authFetch('/niveles-seguridad');
        const data = await response.json();
        
        if (!response.ok) {
            return { success: false, error: data.message || 'Error obteniendo niveles' };
        }
        
        return { success: true, data: data.data || [] };
    } catch (error) {
        console.error('Error fetching niveles:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

/**
 * Obtener lista de niveles activos (para selects)
 */
export async function fetchNivelesActivos() {
    try {
        const response = await authFetch('/niveles-seguridad/activos');
        const data = await response.json();
        
        if (!response.ok) {
            return { success: false, error: data.message || 'Error obteniendo niveles' };
        }
        
        return { success: true, data: data.data || [] };
    } catch (error) {
        console.error('Error fetching niveles activos:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

/**
 * Obtener un nivel por ID
 */
export async function getNivel(id) {
    try {
        const response = await authFetch(`/niveles-seguridad/${id}`);
        const data = await response.json();
        
        if (!response.ok) {
            return { success: false, error: data.message || 'Error obteniendo nivel' };
        }
        
        return { success: true, data: data.data };
    } catch (error) {
        console.error('Error getting nivel:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

/**
 * Crear nuevo nivel de seguridad
 */
export async function createNivel(nivelData) {
    try {
        const response = await authFetch('/niveles-seguridad', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(nivelData),
        });
        const data = await response.json();
        
        if (!response.ok) {
            return { 
                success: false, 
                error: data.message || 'Error creando nivel',
                errors: data.errors 
            };
        }
        
        return { success: true, data: data.data, message: data.message };
    } catch (error) {
        console.error('Error creating nivel:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

/**
 * Actualizar nivel de seguridad
 */
export async function updateNivel(id, nivelData) {
    try {
        const response = await authFetch(`/niveles-seguridad/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(nivelData),
        });
        const data = await response.json();
        
        if (!response.ok) {
            return { 
                success: false, 
                error: data.message || 'Error actualizando nivel',
                errors: data.errors 
            };
        }
        
        return { success: true, message: data.message };
    } catch (error) {
        console.error('Error updating nivel:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

/**
 * Eliminar nivel de seguridad
 */
export async function deleteNivel(id) {
    try {
        const response = await authFetch(`/niveles-seguridad/${id}`, {
            method: 'DELETE',
        });
        const data = await response.json();
        
        if (!response.ok) {
            return { success: false, error: data.message || 'Error eliminando nivel' };
        }
        
        return { success: true, message: data.message };
    } catch (error) {
        console.error('Error deleting nivel:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

// ========================
// COMPONENTES CON SEGURIDAD
// ========================

/**
 * Obtener todos los componentes con seguridad
 */
export async function fetchComponentesSecurity() {
    try {
        const response = await authFetch('/componentes-seguridad');
        const data = await response.json();
        
        if (!response.ok) {
            return { success: false, error: data.message || 'Error obteniendo componentes' };
        }
        
        return { success: true, data: data.data || [] };
    } catch (error) {
        console.error('Error fetching componentes security:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

/**
 * Asignar nivel de seguridad a un componente
 */
export async function setComponenteSecurity(componenteData) {
    try {
        const response = await authFetch('/componentes-seguridad', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(componenteData),
        });
        const data = await response.json();
        
        if (!response.ok) {
            return { success: false, error: data.message || 'Error asignando nivel' };
        }
        
        return { success: true, data: data.data, message: data.message };
    } catch (error) {
        console.error('Error setting component security:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

/**
 * Eliminar nivel de seguridad de un componente
 */
export async function removeComponenteSecurity(componenteId) {
    try {
        const response = await authFetch(`/componentes-seguridad/${componenteId}`, {
            method: 'DELETE',
        });
        const data = await response.json();
        
        if (!response.ok) {
            return { success: false, error: data.message || 'Error liberando componente' };
        }
        
        return { success: true, message: data.message };
    } catch (error) {
        console.error('Error removing component security:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

// ========================
// GESTIÓN DE MIEMBROS
// ========================

/**
 * Obtener miembros de un nivel de seguridad
 */
export async function fetchMiembros(nivelId) {
    try {
        const response = await authFetch(`/niveles-seguridad/${nivelId}/miembros`);
        const data = await response.json();
        
        if (!response.ok) {
            return { success: false, error: data.message || 'Error obteniendo miembros' };
        }
        
        return { success: true, data: data.data || [] };
    } catch (error) {
        console.error('Error fetching miembros:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

/**
 * Obtener empleados disponibles para agregar a un grupo
 */
export async function fetchEmpleadosDisponibles(nivelId) {
    try {
        const response = await authFetch(`/niveles-seguridad/${nivelId}/empleados-disponibles`);
        const data = await response.json();
        
        if (!response.ok) {
            return { success: false, error: data.message || 'Error obteniendo empleados' };
        }
        
        return { success: true, data: data.data || [] };
    } catch (error) {
        console.error('Error fetching empleados disponibles:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

/**
 * Agregar miembro(s) a un nivel de seguridad
 */
export async function addMiembro(nivelId, personaIds) {
    try {
        const response = await authFetch(`/niveles-seguridad/${nivelId}/miembros`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ persona_ids: personaIds }),
        });
        const data = await response.json();
        
        if (!response.ok) {
            return { success: false, error: data.message || 'Error agregando miembro' };
        }
        
        return { success: true, message: data.message };
    } catch (error) {
        console.error('Error adding miembro:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

/**
 * Remover miembro de un nivel de seguridad
 */
export async function removeMiembro(nivelId, personaId) {
    try {
        const response = await authFetch(`/niveles-seguridad/${nivelId}/miembros/${personaId}`, {
            method: 'DELETE',
        });
        const data = await response.json();
        
        if (!response.ok) {
            return { success: false, error: data.message || 'Error removiendo miembro' };
        }
        
        return { success: true, message: data.message };
    } catch (error) {
        console.error('Error removing miembro:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

export default {
    fetchNiveles,
    fetchNivelesActivos,
    getNivel,
    createNivel,
    updateNivel,
    deleteNivel,
    fetchComponentesSecurity,
    setComponenteSecurity,
    removeComponenteSecurity,
    fetchMiembros,
    fetchEmpleadosDisponibles,
    addMiembro,
    removeMiembro,
};
