import CONFIG from '../config';

/**
 * Servicio API para el Sistema de Gestión de Diesel
 * Prefijo: /api/diesel/
 */

const API_BASE = CONFIG.API_BASE_URL;

import { authFetch } from './authService';



// ============================================

// ============================================
// TRABAJOS
// ============================================
export async function getTrabajos(activos = false) {
  const params = activos ? '?activos=1' : '';
  const response = await authFetch(`/diesel/trabajos${params}`);
  return response.json();
}

export async function getTrabajo(id) {
  const response = await authFetch(`/diesel/trabajos/${id}`);
  return response.json();
}

export async function comboTrabajos() {
  const response = await authFetch('/diesel/trabajos/combo');
  return response.json();
}

export async function createTrabajo(data) {
  const response = await authFetch('/diesel/trabajos', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return response.json();
}

export async function updateTrabajo(id, data) {
  const response = await authFetch(`/diesel/trabajos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  return response.json();
}

export async function toggleTrabajo(id) {
  const response = await authFetch(`/diesel/trabajos/${id}/toggle`, {
    method: 'PATCH'
  });
  return response.json();
}

export async function createTrabajosBulk(trabajos) {
  const response = await authFetch('/diesel/trabajos/bulk', {
    method: 'POST',
    body: JSON.stringify({ trabajos })
  });
  return response.json();
}

// ============================================
// DIVISIONES
// ============================================
export async function getDivisiones(activos = false) {
  const params = activos ? '?activos=1' : '';
  const response = await authFetch(`/diesel/divisiones${params}`);
  return response.json();
}

export async function getDivision(id) {
  const response = await authFetch(`/diesel/divisiones/${id}`);
  return response.json();
}

export async function comboDivisiones() {
  const response = await authFetch('/diesel/divisiones/combo');
  return response.json();
}

export async function createDivision(data) {
  const response = await authFetch('/diesel/divisiones', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return response.json();
}

export async function updateDivision(id, data) {
  const response = await authFetch(`/diesel/divisiones/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  return response.json();
}

export async function toggleDivision(id) {
  const response = await authFetch(`/diesel/divisiones/${id}/toggle`, {
    method: 'PATCH'
  });
  return response.json();
}

export async function createDivisionesBulk(divisiones) {
  const response = await authFetch('/diesel/divisiones/bulk', {
    method: 'POST',
    body: JSON.stringify({ divisiones })
  });
  return response.json();
}

// ============================================
// PROVEEDORES
// ============================================
export async function getProveedores(activos = false) {
  const params = activos ? '?activos=1' : '';
  const response = await authFetch(`/diesel/proveedores${params}`);
  return response.json();
}

export async function getProveedor(id) {
  const response = await authFetch(`/diesel/proveedores/${id}`);
  return response.json();
}

export async function comboProveedores() {
  const response = await authFetch('/diesel/proveedores/combo');
  return response.json();
}

export async function createProveedor(data) {
  const response = await authFetch('/diesel/proveedores', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return response.json();
}

export async function updateProveedor(id, data) {
  const response = await authFetch(`/diesel/proveedores/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  return response.json();
}

export async function toggleProveedor(id) {
  const response = await authFetch(`/diesel/proveedores/${id}/toggle`, {
    method: 'PATCH'
  });
  return response.json();
}

export async function createProveedoresBulk(proveedores) {
  const response = await authFetch('/diesel/proveedores/bulk', {
    method: 'POST',
    body: JSON.stringify({ proveedores })
  });
  return response.json();
}

// ============================================
// TIPOS DE PAGO
// ============================================
export async function getTiposPago(activos = false) {
  const params = activos ? '?activos=1' : '';
  const response = await authFetch(`/diesel/tipos-pago${params}`);
  return response.json();
}

export async function getTipoPago(id) {
  const response = await authFetch(`/diesel/tipos-pago/${id}`);
  return response.json();
}

export async function comboTiposPago() {
  const response = await authFetch('/diesel/tipos-pago/combo');
  return response.json();
}

export async function createTipoPago(data) {
  const response = await authFetch('/diesel/tipos-pago', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return response.json();
}

export async function updateTipoPago(id, data) {
  const response = await authFetch(`/diesel/tipos-pago/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  return response.json();
}

export async function toggleTipoPago(id) {
  const response = await authFetch(`/diesel/tipos-pago/${id}/toggle`, {
    method: 'PATCH'
  });
  return response.json();
}

export async function createTiposPagoBulk(tiposPago) {
  const response = await authFetch('/diesel/tipos-pago/bulk', {
    method: 'POST',
    body: JSON.stringify({ tipos_pago: tiposPago })
  });
  return response.json();
}

// ============================================
// MOTIVOS DE AJUSTE
// ============================================
export async function getMotivosAjuste(activos = false) {
  const params = activos ? '?activos=1' : '';
  const response = await authFetch(`/diesel/motivos-ajuste${params}`);
  return response.json();
}

export async function getMotivoAjuste(id) {
  const response = await authFetch(`/diesel/motivos-ajuste/${id}`);
  return response.json();
}

export async function comboMotivosAjuste() {
  const response = await authFetch('/diesel/motivos-ajuste/combo');
  return response.json();
}

export async function createMotivoAjuste(data) {
  const response = await authFetch('/diesel/motivos-ajuste', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return response.json();
}

export async function updateMotivoAjuste(id, data) {
  const response = await authFetch(`/diesel/motivos-ajuste/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  return response.json();
}

export async function toggleMotivoAjuste(id) {
  const response = await authFetch(`/diesel/motivos-ajuste/${id}/toggle`, {
    method: 'PATCH'
  });
  return response.json();
}

export async function createMotivosAjusteBulk(motivosAjuste) {
  const response = await authFetch('/diesel/motivos-ajuste/bulk', {
    method: 'POST',
    body: JSON.stringify({ motivos_ajuste: motivosAjuste })
  });
  return response.json();
}

// ============================================
// UBICACIONES
// ============================================
export async function getUbicaciones(activos = false) {
  const params = activos ? '?activos=1' : '';
  const response = await authFetch(`/diesel/ubicaciones${params}`);
  return response.json();
}

export async function getUbicacion(id) {
  const response = await authFetch(`/diesel/ubicaciones/${id}`);
  return response.json();
}

export async function comboUbicaciones(divisionId = null) {
  const params = divisionId ? `?division_id=${divisionId}` : '';
  const response = await authFetch(`/diesel/ubicaciones/combo${params}`);
  return response.json();
}

export async function createUbicacion(data) {
  const response = await authFetch('/diesel/ubicaciones', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return response.json();
}

export async function updateUbicacion(id, data) {
  const response = await authFetch(`/diesel/ubicaciones/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  return response.json();
}

export async function toggleUbicacion(id) {
  const response = await authFetch(`/diesel/ubicaciones/${id}/toggle`, {
    method: 'PATCH'
  });
  return response.json();
}

export async function createUbicacionesBulk(ubicaciones) {
  const response = await authFetch('/diesel/ubicaciones/bulk', {
    method: 'POST',
    body: JSON.stringify({ ubicaciones })
  });
  return response.json();
}

// ============================================
// TANQUES
// ============================================
export async function getTanques(activos = false, ubicacionId = null) {
  const params = new URLSearchParams();
  if (activos) params.append('activos', '1');
  if (ubicacionId) params.append('ubicacion_id', ubicacionId);
  const queryString = params.toString() ? `?${params.toString()}` : '';
  const response = await authFetch(`/diesel/tanques${queryString}`);
  return response.json();
}

export async function getTanque(id) {
  const response = await authFetch(`/diesel/tanques/${id}`);
  return response.json();
}

export async function comboTanques(ubicacionId = null) {
  const params = ubicacionId ? `?ubicacion_id=${ubicacionId}` : '';
  const response = await authFetch(`/diesel/tanques/combo${params}`);
  return response.json();
}

export async function createTanque(data) {
  const response = await authFetch('/diesel/tanques', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return response.json();
}

export async function updateTanque(id, data) {
  const response = await authFetch(`/diesel/tanques/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  return response.json();
}

export async function toggleTanque(id) {
  const response = await authFetch(`/diesel/tanques/${id}/toggle`, {
    method: 'PATCH'
  });
  return response.json();
}

export async function adjustStock(id, nuevoStock) {
  const response = await authFetch(`/diesel/tanques/${id}/adjust-stock`, {
    method: 'PATCH',
    body: JSON.stringify({ nuevo_stock: nuevoStock })
  });
  return response.json();
}

export async function createTanquesBulk(tanques) {
  const response = await authFetch('/diesel/tanques/bulk', {
    method: 'POST',
    body: JSON.stringify({ tanques })
  });
  return response.json();
}

// ============================================
// MÁQUINAS
// ============================================
export async function getMaquinas(activos = false, divisionId = null) {
  const params = new URLSearchParams();
  if (activos) params.append('activos', '1');
  if (divisionId) params.append('division_id', divisionId);
  const queryString = params.toString() ? `?${params.toString()}` : '';
  const response = await authFetch(`/diesel/maquinas${queryString}`);
  return response.json();
}

export async function getMaquina(id) {
  const response = await authFetch(`/diesel/maquinas/${id}`);
  return response.json();
}

export async function comboMaquinas(divisionId = null) {
  const params = divisionId ? `?division_id=${divisionId}` : '';
  const response = await authFetch(`/diesel/maquinas/combo${params}`);
  return response.json();
}

export async function createMaquina(data) {
  const response = await authFetch('/diesel/maquinas', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return response.json();
}

export async function updateMaquina(id, data) {
  const response = await authFetch(`/diesel/maquinas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  return response.json();
}

export async function toggleMaquina(id) {
  const response = await authFetch(`/diesel/maquinas/${id}/toggle`, {
    method: 'PATCH'
  });
  return response.json();
}

export async function createMaquinasBulk(maquinas) {
  const response = await authFetch('/diesel/maquinas/bulk', {
    method: 'POST',
    body: JSON.stringify({ maquinas })
  });
  return response.json();
}

// =============================================
// TIPOS DE MOVIMIENTO
// =============================================
export async function getTiposMovimiento(activeOnly = false) {
  const params = activeOnly ? '?activos=1' : '';
  const response = await authFetch(`/diesel/tipos-movimiento${params}`);
  return response.json();
}
export async function getTipoMovimiento(id) {
  const response = await authFetch(`/diesel/tipos-movimiento/${id}`);
  return response.json();
}
export async function createTipoMovimiento(data) {
  const response = await authFetch('/diesel/tipos-movimiento', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return response.json();
}
export async function updateTipoMovimiento(id, data) {
  const response = await authFetch(`/diesel/tipos-movimiento/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  return response.json();
}
export async function toggleTipoMovimiento(id) {
  const response = await authFetch(`/diesel/tipos-movimiento/${id}/toggle`, {
    method: 'PATCH'
  });
  return response.json();
}

export async function createTiposMovimientoBulk(tiposMovimiento) {
  const response = await authFetch('/diesel/tipos-movimiento/bulk', {
    method: 'POST',
    body: JSON.stringify({ tipos_movimiento: tiposMovimiento })
  });
  return response.json();
}

// =============================================
// INGRESOS
// =============================================
export async function getIngresos(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  const response = await authFetch(`/diesel/ingresos?${params}`);
  return response.json();
}
export async function getIngreso(id) {
  const response = await authFetch(`/diesel/ingresos/${id}`);
  return response.json();
}
export async function createIngreso(data) {
  const response = await authFetch('/diesel/ingresos', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return response.json();
}
export async function anularIngreso(id) {
  const response = await authFetch(`/diesel/ingresos/${id}/anular`, {
    method: 'PATCH'
  });
  return response.json();
}
