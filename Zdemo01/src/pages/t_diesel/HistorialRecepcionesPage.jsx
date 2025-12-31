import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ClipboardList, Eye, RefreshCw, Filter, Image, Calendar } from 'lucide-react';
import { getIngresos, comboProveedores, getTanques } from '../../services/dieselService';
import CONFIG from '../../config';

import {
    DSPage,
    DSPageHeader,
    DSSection,
    DSAlert,
    DSButton,
    DSLoading,
    DSBadge,
    DSModal,
    DSRefreshButton,
} from '../../ds-components';

import './DieselPages.css';

// Utilidad para fechas
const getTodayStr = () => new Date().toISOString().split('T')[0];
const getDateMonthsAgo = (months) => {
    const d = new Date();
    d.setMonth(d.getMonth() - months);
    return d.toISOString().split('T')[0];
};

const INITIAL_FILTERS = {
    d_proveedor_id: '',
    fecha_inicio: getDateMonthsAgo(1), // Por defecto último mes
    fecha_fin: getTodayStr(),
    estado: 'FINALIZADO' // Solo mostrar finalizados por defecto
};

export function HistorialRecepcionesPage() {
    // Data state
    const [recepciones, setRecepciones] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter state
    const [filters, setFilters] = useState(INITIAL_FILTERS);

    // Modal para ver foto
    const [fotoModalOpen, setFotoModalOpen] = useState(false);
    const [fotoUrl, setFotoUrl] = useState(null);
    const [selectedRecepcion, setSelectedRecepcion] = useState(null);

    // Modal de detalle
    const [detalleModalOpen, setDetalleModalOpen] = useState(false);

    // Cargar combos
    useEffect(() => {
        const fetchCombos = async () => {
            try {
                const [provRes] = await Promise.all([comboProveedores()]);
                setProveedores(provRes.data || []);
            } catch (err) {
                console.error('Error cargando combos', err);
            }
        };
        fetchCombos();
    }, []);

    // Fetch recepciones (solo FINALIZADO)
    const fetchRecepciones = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (filters.d_proveedor_id) params.append('d_proveedor_id', filters.d_proveedor_id);
            if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
            if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);
            if (filters.estado) params.append('estado', filters.estado);

            const result = await getIngresos(params.toString());
            setRecepciones(result.data || []);
        } catch (err) {
            setError('Error cargando historial de recepciones');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchRecepciones();
    }, [fetchRecepciones]);

    // Filter handlers
    const handleFilterChange = (field) => (e) => {
        setFilters(prev => ({ ...prev, [field]: e.target.value }));
    };

    const handlePeriodShortcut = (months) => {
        setFilters(prev => ({
            ...prev,
            fecha_inicio: getDateMonthsAgo(months),
            fecha_fin: getTodayStr()
        }));
    };

    const resetFilters = () => {
        setFilters(INITIAL_FILTERS);
    };

    // Abrir modal de foto
    const openFotoModal = (recepcion) => {
        if (recepcion.foto_recepcion) {
            // Usar endpoint API para obtener la foto (evita problemas de symlink en Windows)
            const fotoApiUrl = `${CONFIG.API_BASE_URL}/diesel/ingresos/${recepcion.id}/foto`;
            setFotoUrl(fotoApiUrl);
            setSelectedRecepcion(recepcion);
            setFotoModalOpen(true);
        }
    };

    // Abrir modal de detalle
    const openDetalleModal = (recepcion) => {
        setSelectedRecepcion(recepcion);
        setDetalleModalOpen(true);
    };

    // Calcular totales
    const totales = useMemo(() => {
        return {
            litros: recepciones.reduce((sum, r) => sum + parseFloat(r.total_litros || 0), 0),
            importe: recepciones.reduce((sum, r) => sum + parseFloat(r.total || 0), 0),
            count: recepciones.length
        };
    }, [recepciones]);

    return (
        <DSPage>
            <DSPageHeader
                title="Historial de Recepciones"
                icon={<ClipboardList size={22} />}
            />

            {error && <DSAlert variant="error">{error}</DSAlert>}

            {/* FILTROS */}
            <DSSection className="diesel-filters-section">
                <div className="diesel-filters">
                    <div className="diesel-filters__row">
                        {/* Proveedor */}
                        <div className="diesel-filters__field">
                            <label className="ds-field__label">Proveedor</label>
                            <select
                                className="ds-field__control"
                                value={filters.d_proveedor_id}
                                onChange={handleFilterChange('d_proveedor_id')}
                            >
                                <option value="">Todos</option>
                                {proveedores.map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre}</option>
                                ))}
                            </select>
                        </div>

                        {/* Estado */}
                        <div className="diesel-filters__field">
                            <label className="ds-field__label">Estado</label>
                            <select
                                className="ds-field__control"
                                value={filters.estado}
                                onChange={handleFilterChange('estado')}
                            >
                                <option value="">Todos</option>
                                <option value="FINALIZADO">Finalizados</option>
                                <option value="PENDIENTE">Pendientes</option>
                                <option value="ANULADO">Anulados</option>
                            </select>
                        </div>

                        {/* Fecha Inicio */}
                        <div className="diesel-filters__field">
                            <label className="ds-field__label">Desde</label>
                            <input
                                type="date"
                                className="ds-field__control"
                                value={filters.fecha_inicio}
                                onChange={handleFilterChange('fecha_inicio')}
                            />
                        </div>

                        {/* Fecha Fin */}
                        <div className="diesel-filters__field">
                            <label className="ds-field__label">Hasta</label>
                            <input
                                type="date"
                                className="ds-field__control"
                                value={filters.fecha_fin}
                                onChange={handleFilterChange('fecha_fin')}
                            />
                        </div>
                    </div>

                    {/* Period shortcuts */}
                    <div className="diesel-filters__row diesel-filters__shortcuts">
                        <span className="diesel-filters__label">Período:</span>
                        <DSButton size="sm" variant="ghost" onClick={() => handlePeriodShortcut(1)}>1 mes</DSButton>
                        <DSButton size="sm" variant="ghost" onClick={() => handlePeriodShortcut(3)}>3 meses</DSButton>
                        <DSButton size="sm" variant="ghost" onClick={() => handlePeriodShortcut(6)}>6 meses</DSButton>
                        <DSButton size="sm" variant="ghost" onClick={() => handlePeriodShortcut(12)}>12 meses</DSButton>
                        <DSButton size="sm" variant="secondary" onClick={resetFilters} icon={<Filter size={14} />}>Limpiar</DSButton>
                    </div>
                </div>
            </DSSection>

            {/* RESUMEN */}
            <DSSection>
                <div className="diesel-summary-cards">
                    <div className="diesel-summary-card">
                        <span className="diesel-summary-card__label">Total Recepciones</span>
                        <span className="diesel-summary-card__value">{totales.count}</span>
                    </div>
                    <div className="diesel-summary-card">
                        <span className="diesel-summary-card__label">Total Litros</span>
                        <span className="diesel-summary-card__value">{totales.litros.toFixed(2)} L</span>
                    </div>
                    <div className="diesel-summary-card">
                        <span className="diesel-summary-card__label">Total Importe</span>
                        <span className="diesel-summary-card__value">Bs {totales.importe.toFixed(2)}</span>
                    </div>
                </div>
            </DSSection>

            {/* TABLA */}
            <DSSection
                actions={
                    <div className="ds-section__actions-row">
                        <DSRefreshButton onClick={fetchRecepciones} loading={loading} />
                        <span className="diesel-panel__count">{recepciones.length} registros</span>
                    </div>
                }
            >
                <div className="diesel-table-wrapper">
                    {loading ? <DSLoading /> : recepciones.length === 0 ? (
                        <div className="diesel-empty">No hay recepciones para el período seleccionado</div>
                    ) : (
                        <table className="diesel-table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Proveedor</th>
                                    <th>Chofer</th>
                                    <th>Placa</th>
                                    <th>Litros</th>
                                    <th>Total Bs</th>
                                    <th>Estado</th>
                                    <th>Foto</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {recepciones.map(row => (
                                    <tr key={row.id}>
                                        <td>{row.fecha}</td>
                                        <td>{row.proveedor?.nombre || row.proveedor?.razon_social || '-'}</td>
                                        <td>{row.nombre_chofer || '-'}</td>
                                        <td>{row.placa_vehiculo || '-'}</td>
                                        <td className="text-right">{parseFloat(row.total_litros).toFixed(2)}</td>
                                        <td className="text-right">{parseFloat(row.total).toFixed(2)}</td>
                                        <td>
                                            <DSBadge variant={
                                                row.estado === 'FINALIZADO' ? 'success' :
                                                    row.estado === 'PENDIENTE' ? 'warning' : 'error'
                                            }>
                                                {row.estado}
                                            </DSBadge>
                                        </td>
                                        <td>
                                            {row.foto_recepcion ? (
                                                <DSButton
                                                    size="sm"
                                                    variant="ghost"
                                                    icon={<Image size={16} />}
                                                    onClick={() => openFotoModal(row)}
                                                    title="Ver foto"
                                                />
                                            ) : (
                                                <span style={{ color: '#9ca3af', fontSize: '12px' }}>Sin foto</span>
                                            )}
                                        </td>
                                        <td>
                                            <DSButton
                                                size="sm"
                                                variant="ghost"
                                                icon={<Eye size={16} />}
                                                onClick={() => openDetalleModal(row)}
                                                title="Ver detalle"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </DSSection>

            {/* MODAL FOTO */}
            <DSModal
                isOpen={fotoModalOpen}
                onClose={() => setFotoModalOpen(false)}
                title={`Foto de Recepción - ${selectedRecepcion?.fecha || ''}`}
                size="lg"
            >
                {fotoUrl && (
                    <div style={{ textAlign: 'center' }}>
                        <img
                            src={fotoUrl}
                            alt="Foto de recepción"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '70vh',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                            }}
                        />
                        <p style={{ marginTop: '1rem', color: '#6b7280' }}>
                            Chofer: {selectedRecepcion?.nombre_chofer || 'No registrado'} |
                            Placa: {selectedRecepcion?.placa_vehiculo || 'No registrada'}
                        </p>
                    </div>
                )}
            </DSModal>

            {/* MODAL DETALLE */}
            <DSModal
                isOpen={detalleModalOpen}
                onClose={() => setDetalleModalOpen(false)}
                title={`Detalle Recepción #${selectedRecepcion?.numero_factura_dia || ''}`}
                size="md"
            >
                {selectedRecepcion && (
                    <>
                        <div className="diesel-view-info">
                            <p><strong>Fecha:</strong> {selectedRecepcion.fecha}</p>
                            <p><strong>Proveedor:</strong> {selectedRecepcion.proveedor?.nombre}</p>
                            <p><strong>Chofer:</strong> {selectedRecepcion.nombre_chofer || 'No registrado'}</p>
                            <p><strong>Placa:</strong> {selectedRecepcion.placa_vehiculo || 'No registrada'}</p>
                            <p><strong>Total Litros:</strong> {parseFloat(selectedRecepcion.total_litros).toFixed(2)}</p>
                            <p><strong>Total Bs:</strong> {parseFloat(selectedRecepcion.total).toFixed(2)}</p>
                            {selectedRecepcion.observaciones && (
                                <p><strong>Observaciones:</strong> {selectedRecepcion.observaciones}</p>
                            )}
                        </div>
                        <h4 className="diesel-view-subtitle">Distribución por Tanques:</h4>
                        <table className="diesel-view-table">
                            <thead>
                                <tr>
                                    <th>Tanque</th>
                                    <th>Litros</th>
                                    <th>Inicio</th>
                                    <th>Final</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(selectedRecepcion.detalles || []).map((det, idx) => (
                                    <tr key={idx}>
                                        <td>{det.tanque?.nombre || '-'}</td>
                                        <td className="text-right">{parseFloat(det.litros).toFixed(2)}</td>
                                        <td className="text-right">{det.inicio_tanque ? parseFloat(det.inicio_tanque).toFixed(2) : '-'}</td>
                                        <td className="text-right">{det.final_tanque ? parseFloat(det.final_tanque).toFixed(2) : '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}
            </DSModal>
        </DSPage>
    );
}

export default HistorialRecepcionesPage;
