import { authFetch } from './authService';

// =============================================
// NIVELES DE SEGURIDAD
// =============================================

// Obtener todos los niveles de seguridad
export async function fetchNiveles() {
    const response = await authFetch('/niveles-seguridad');
    const data = await response.json();
    return { success: response.ok, data: data.data || [] };
}

// Obtener niveles activos (para selects)
export async function fetchNivelesActivos() {
    const response = await authFetch('/niveles-seguridad/activos');
    const data = await response.json();
    return { success: response.ok, data: data.data || [] };
}

// Obtener un nivel por ID
export async function fetchNivel(id) {
    const response = await authFetch(`/niveles-seguridad/${id}`);
    const data = await response.json();
    return { success: response.ok, data: data.data };
}

// Crear nuevo nivel
export async function createNivel(nivelData) {
    const response = await authFetch('/niveles-seguridad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nivelData),
    });
    const data = await response.json();
    return { success: response.ok, data: data.data, message: data.message };
}

// Actualizar nivel
export async function updateNivel(id, nivelData) {
    const response = await authFetch(`/niveles-seguridad/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nivelData),
    });
    const data = await response.json();
    return { success: response.ok, data: data.data, message: data.message };
}

// Eliminar nivel
export async function deleteNivel(id) {
    const response = await authFetch(`/niveles-seguridad/${id}`, {
        method: 'DELETE',
    });
    const data = await response.json();
    return { success: response.ok, message: data.message };
}

// =============================================
// MIEMBROS DE NIVELES
// =============================================

// Obtener miembros de un nivel
export async function fetchMiembros(nivelId) {
    const response = await authFetch(`/niveles-seguridad/${nivelId}/miembros`);
    const data = await response.json();
    return { success: response.ok, data: data.data || [] };
}

// Agregar miembro(s) a un nivel
export async function addMiembro(nivelId, personaIds) {
    const response = await authFetch(`/niveles-seguridad/${nivelId}/miembros`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona_ids: Array.isArray(personaIds) ? personaIds : [personaIds] }),
    });
    const data = await response.json();
    return { success: response.ok, message: data.message };
}

// Quitar miembro de un nivel
export async function removeMiembro(nivelId, personaId) {
    const response = await authFetch(`/niveles-seguridad/${nivelId}/miembros/${personaId}`, {
        method: 'DELETE',
    });
    const data = await response.json();
    return { success: response.ok, message: data.message };
}

// Obtener empleados disponibles (sin nivel asignado)
export async function fetchEmpleadosDisponibles(nivelId) {
    const response = await authFetch(`/niveles-seguridad/${nivelId}/empleados-disponibles`);
    const data = await response.json();
    return { success: response.ok, data: data.data || [] };
}

// =============================================
// COMPONENTES PROTEGIDOS
// =============================================

// Obtener todos los componentes protegidos
export async function fetchComponentesSecurity() {
    const response = await authFetch('/componentes-seguridad');
    const data = await response.json();
    return { success: response.ok, data: data.data || [] };
}

// Asignar nivel a un componente (upsert)
export async function setComponenteSecurity(componenteData) {
    const response = await authFetch('/componentes-seguridad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(componenteData),
    });
    const data = await response.json();
    return { success: response.ok, data: data.data, message: data.message };
}

// Eliminar protección de un componente
export async function removeComponenteSecurity(componenteId) {
    const response = await authFetch(`/componentes-seguridad/${encodeURIComponent(componenteId)}`, {
        method: 'DELETE',
    });
    const data = await response.json();
    return { success: response.ok, message: data.message };
}
