import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Download, Plus, Trash2, Save, Eye, Search, Calendar, Filter, RefreshCw, HelpCircle } from 'lucide-react';
import {
    getIngresos,
    createIngreso,
    anularIngreso,
    comboProveedores,
    comboTiposPago,
    getTanques
} from '../../services/dieselService';

import {
    DSPage,
    DSPageHeader,
    DSSection,
    DSAlert,
    DSButton,
    DSLoading,
    DSBadge,
    DSModal,
    DSModalSection,
    DSGrid,
    DSFieldsGrid,
    DSEditableGrid,
    SecuredButton,
    DSRefreshButton,
} from '../../ds-components';

import './DieselPages.css';

// Hook para cargar combos
function useIngresoCombos() {
    const [proveedores, setProveedores] = useState([]);
    const [tiposPago, setTiposPago] = useState([]);
    const [tanques, setTanques] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCombos = useCallback(async () => {
        setLoading(true);
        try {
            const [provRes, pagoRes, tanqRes] = await Promise.all([
                comboProveedores(),
                comboTiposPago(),
                getTanques(true)
            ]);
            setProveedores(provRes.data || []);
            setTiposPago(pagoRes.data || []);
            setTanques(tanqRes.data || []);
        } catch (err) {
            console.error("Error cargando combos", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCombos();
    }, [fetchCombos]);

    return { proveedores, tiposPago, tanques, loading, refetch: fetchCombos };
}

// Utilidad para fechas
const getTodayStr = () => new Date().toISOString().split('T')[0];
const getDateMonthsAgo = (months) => {
    const d = new Date();
    d.setMonth(d.getMonth() - months);
    return d.toISOString().split('T')[0];
};

const INITIAL_FILTERS = {
    d_proveedor_id: '',
    d_tipo_pago_id: '',
    d_tanque_id: '',
    fecha_inicio: getTodayStr(),
    fecha_fin: getTodayStr(),
    proveedorSearch: ''
};

const INITIAL_FORM = {
    fecha: getTodayStr(),
    d_proveedor_id: '',
    d_tipo_pago_id: '',
    precio_unitario: '',
    observaciones: '',
    detalles: [{ id: Date.now(), d_tanque_id: '', litros: '' }]
};

export function IngresosPage() {
    const { proveedores, tiposPago, tanques, refetch: refetchCombos } = useIngresoCombos();

    // Data state
    const [ingresos, setIngresos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter state
    const [filters, setFilters] = useState(INITIAL_FILTERS);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewIngreso, setViewIngreso] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState(null);
    const [formSuccess, setFormSuccess] = useState(null);
    const [form, setForm] = useState(INITIAL_FORM);

    // Filtered proveedores for search
    const filteredProveedores = useMemo(() => {
        if (!filters.proveedorSearch) return proveedores;
        const search = filters.proveedorSearch.toLowerCase();
        return proveedores.filter(p =>
            (p.nombre || '').toLowerCase().includes(search) ||
            (p.razon_social || '').toLowerCase().includes(search)
        );
    }, [proveedores, filters.proveedorSearch]);

    // Fetch ingresos
    const fetchIngresos = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (filters.d_proveedor_id) params.append('d_proveedor_id', filters.d_proveedor_id);
            if (filters.d_tipo_pago_id) params.append('d_tipo_pago_id', filters.d_tipo_pago_id);
            if (filters.d_tanque_id) params.append('d_tanque_id', filters.d_tanque_id);
            if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
            if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);

            const result = await getIngresos(params.toString());
            setIngresos(result.data || []);
        } catch (err) {
            setError('Error cargando ingresos');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchIngresos();
    }, [fetchIngresos]);

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

    // Form handlers
    const resetForm = () => {
        setForm({
            ...INITIAL_FORM,
            detalles: [{ id: Date.now(), d_tanque_id: '', litros: '' }]
        });
        setFormError(null);
    };

    const openCreate = () => {
        resetForm();
        setModalOpen(true);
    };

    const closeModal = () => setModalOpen(false);

    const handleChange = (field) => (e) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
    };

    // Detalle handlers
    const handleAddDetalle = () => {
        setForm(prev => ({
            ...prev,
            detalles: [...prev.detalles, { id: Date.now(), d_tanque_id: '', litros: '' }]
        }));
    };

    const handleRemoveDetalle = (rowId) => {
        setForm(prev => ({
            ...prev,
            detalles: prev.detalles.filter(d => d.id !== rowId)
        }));
    };

    const handleDetalleChange = (rowId, field, value) => {
        setForm(prev => ({
            ...prev,
            detalles: prev.detalles.map(d =>
                d.id === rowId ? { ...d, [field]: value } : d
            )
        }));
    };

    // Cálculos
    const totalLitros = useMemo(() => {
        return form.detalles.reduce((sum, item) => sum + (parseFloat(item.litros) || 0), 0);
    }, [form.detalles]);

    const totalImporte = useMemo(() => {
        const precio = parseFloat(form.precio_unitario) || 0;
        return totalLitros * precio;
    }, [totalLitros, form.precio_unitario]);

    const getTanqueInfo = (tanqueId) => {
        return tanques.find(t => t.id === parseInt(tanqueId)) || null;
    };

    // Config grilla editable
    const detalleColumns = [
        {
            field: 'd_tanque_id',
            title: 'Tanque Destino',
            width: '40%',
            type: 'select',
            options: tanques.map(t => ({ value: t.id, label: t.nombre })),
        },
        {
            title: 'Stock Actual',
            width: '15%',
            editable: false,
            render: (row) => {
                const info = getTanqueInfo(row.d_tanque_id);
                return info ? parseFloat(info.stock_actual).toFixed(2) : '-';
            }
        },
        {
            field: 'litros',
            title: 'Litros',
            width: '20%',
            type: 'number',
        },
        {
            title: 'Stock Final',
            width: '15%',
            editable: false,
            render: (row) => {
                const info = getTanqueInfo(row.d_tanque_id);
                if (!info) return '-';
                const actual = parseFloat(info.stock_actual);
                const litros = parseFloat(row.litros) || 0;
                const final = actual + litros;
                const exceso = final > parseFloat(info.capacidad_maxima);
                return (
                    <span style={{ color: exceso ? '#dc2626' : '#16a34a', fontWeight: 'bold' }}>
                        {final.toFixed(2)} {exceso && '⚠️'}
                    </span>
                );
            }
        }
    ];

    // Validación
    const validate = () => {
        if (!form.fecha) return 'La fecha es obligatoria';
        if (!form.d_tipo_pago_id) return 'El tipo de pago es obligatorio';
        if (!form.d_proveedor_id) return 'El proveedor es obligatorio';
        if (!form.precio_unitario || parseFloat(form.precio_unitario) <= 0) return 'El precio unitario es inválido';

        for (const det of form.detalles) {
            if (!det.d_tanque_id) return 'Seleccione tanque en todas las filas';
            const litros = parseFloat(det.litros);
            if (!litros || litros <= 0) return 'Los litros deben ser mayor a 0';

            const tanque = getTanqueInfo(det.d_tanque_id);
            if (tanque) {
                const stock = parseFloat(tanque.stock_actual);
                const capacidad = parseFloat(tanque.capacidad_maxima);
                if ((stock + litros) > capacidad) {
                    return `Tanque ${tanque.nombre}: Capacidad excedida`;
                }
            }
        }
        return null;
    };

    const handleSubmit = async () => {
        const errorMsg = validate();
        if (errorMsg) {
            setFormError(errorMsg);
            return;
        }

        setSaving(true);
        setFormError(null);

        try {
            const payload = {
                ...form,
                detalles: form.detalles.map(d => ({
                    d_tanque_id: d.d_tanque_id,
                    litros: d.litros
                }))
            };

            const result = await createIngreso(payload);

            if (result.success) {
                setFormSuccess('Ingreso registrado con éxito');
                closeModal();
                fetchIngresos();
                refetchCombos(); // Actualizar stocks de tanques
                setTimeout(() => setFormSuccess(null), 3000);
            } else {
                setFormError(result.message || 'Error al guardar');
            }
        } catch (err) {
            setFormError('Error de conexión');
        } finally {
            setSaving(false);
        }
    };

    const handleAnular = async (item) => {
        if (!window.confirm(`¿Seguro que desea ANULAR el ingreso #${item.numero_factura_dia}?`)) return;
        try {
            const result = await anularIngreso(item.id);
            if (result.success) {
                setFormSuccess('Ingreso anulado');
                fetchIngresos();
                setTimeout(() => setFormSuccess(null), 3000);
            } else {
                alert(result.message);
            }
        } catch (err) {
            alert('Error de conexión');
        }
    };

    const openViewModal = (ingreso) => {
        setViewIngreso(ingreso);
        setViewModalOpen(true);
    };

    // Render helper for tanque column
    const renderTanqueColumn = (row) => {
        const detalles = row.detalles || [];
        if (detalles.length === 0) return '-';
        if (detalles.length === 1) {
            return detalles[0].tanque?.nombre || '-';
        }
        return (
            <DSButton size="sm" variant="ghost" icon={<Eye size={14} />} onClick={() => openViewModal(row)}>
                {detalles.length} tanques
            </DSButton>
        );
    };

    // Columns para la lista principal
    const gridColumns = [
        { field: 'fecha', key: 'fecha', label: 'Fecha', width: '90px' },
        {
            field: 'proveedor',
            key: 'proveedor',
            label: 'Proveedor',
            width: '180px',
        },
        {
            field: 'total_litros',
            key: 'cantidad',
            label: 'Cantidad',
            width: '90px',
        },
        {
            field: 'precio_unitario',
            key: 'precio',
            label: 'Precio',
            width: '80px',
        },
        {
            field: 'observaciones',
            key: 'obs',
            label: 'Obs',
            width: '150px',
        },
        {
            field: 'tanque',
            key: 'tanque',
            label: 'Tanque',
            width: '120px',
        },
        {
            field: 'estado',
            key: 'estado',
            label: 'Estado',
            width: '80px',
        },
        {
            field: 'actions',
            key: 'actions',
            label: '',
            width: '60px',
        }
    ];

    // Transform data for grid
    const gridData = useMemo(() => {
        return ingresos.map(row => ({
            id: row.id,
            fecha: row.fecha,
            proveedor: row.proveedor?.nombre || row.proveedor?.razon_social || '-',
            total_litros: parseFloat(row.total_litros).toFixed(2),
            precio_unitario: parseFloat(row.precio_unitario).toFixed(2),
            observaciones: row.observaciones || '-',
            tanque: renderTanqueColumn(row),
            estado: <DSBadge variant={row.estado === 'PENDIENTE' ? 'warning' : row.estado === 'FINALIZADO' ? 'success' : 'error'}>{row.estado}</DSBadge>,
            actions: row.estado === 'ACTIVO' ? (
                <DSButton size="sm" variant="ghost-danger" icon={<Trash2 size={16} />} onClick={() => handleAnular(row)} title="Anular" />
            ) : null,
            _raw: row
        }));
    }, [ingresos]);

    return (
        <DSPage>
            <DSPageHeader
                title="Ingresos de Combustible"
                icon={<Download size={22} />}
                actions={
                    <SecuredButton
                        securityId="ingresos.crear"
                        securityDesc="Registrar nuevo ingreso"
                        variant="primary"
                        icon={<Plus size={16} />}
                        onClick={openCreate}
                    >
                        Nuevo Ingreso
                    </SecuredButton>
                }
            />

            {formSuccess && (
                <DSAlert variant="success" dismissible onDismiss={() => setFormSuccess(null)} className="diesel-alert-margin">
                    {formSuccess}
                </DSAlert>
            )}

            {error && <DSAlert variant="error">{error}</DSAlert>}

            {/* FILTROS */}
            <DSSection className="diesel-filters-section">
                <div className="diesel-filters">
                    <div className="diesel-filters__row">
                        {/* Proveedor searchable */}
                        <div className="diesel-filters__field diesel-filters__field--wide">
                            <label className="ds-field__label">Proveedor</label>
                            <input
                                type="text"
                                className="ds-field__control"
                                placeholder="Buscar proveedor..."
                                value={filters.proveedorSearch}
                                onChange={handleFilterChange('proveedorSearch')}
                                list="proveedores-list"
                            />
                            <datalist id="proveedores-list">
                                {filteredProveedores.map(p => (
                                    <option key={p.id} value={p.nombre} data-id={p.id} />
                                ))}
                            </datalist>
                            <select
                                className="ds-field__control mt-1"
                                value={filters.d_proveedor_id}
                                onChange={handleFilterChange('d_proveedor_id')}
                            >
                                <option value="">Todos</option>
                                {filteredProveedores.map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre}</option>
                                ))}
                            </select>
                        </div>

                        {/* Tipo Pago */}
                        <div className="diesel-filters__field">
                            <label className="ds-field__label">Tipo Pago</label>
                            <select className="ds-field__control" value={filters.d_tipo_pago_id} onChange={handleFilterChange('d_tipo_pago_id')}>
                                <option value="">Todos</option>
                                {tiposPago.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                            </select>
                        </div>

                        {/* Tanque */}
                        <div className="diesel-filters__field">
                            <label className="ds-field__label">Tanque</label>
                            <select className="ds-field__control" value={filters.d_tanque_id} onChange={handleFilterChange('d_tanque_id')}>
                                <option value="">Todos</option>
                                {tanques.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                            </select>
                        </div>

                        {/* Fecha Inicio */}
                        <div className="diesel-filters__field">
                            <label className="ds-field__label">Desde</label>
                            <input type="date" className="ds-field__control" value={filters.fecha_inicio} onChange={handleFilterChange('fecha_inicio')} />
                        </div>

                        {/* Fecha Fin */}
                        <div className="diesel-filters__field">
                            <label className="ds-field__label">Hasta</label>
                            <input type="date" className="ds-field__control" value={filters.fecha_fin} onChange={handleFilterChange('fecha_fin')} />
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

            {/* TABLA */}
            <DSSection
                actions={
                    <div className="ds-section__actions-row">
                        <DSRefreshButton onClick={fetchIngresos} loading={loading} />
                        <span className="diesel-panel__count">{ingresos.length} registros</span>
                    </div>
                }
            >
                <div className="diesel-table-wrapper">
                    {loading ? <DSLoading /> : ingresos.length === 0 ? (
                        <div className="diesel-empty">No hay ingresos registrados para este período</div>
                    ) : (
                        <table className="diesel-table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Proveedor</th>
                                    <th>Cantidad</th>
                                    <th>Precio</th>
                                    <th>Obs</th>
                                    <th>Tanque</th>
                                    <th>Estado</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {ingresos.map(row => (
                                    <tr key={row.id}>
                                        <td>{row.fecha}</td>
                                        <td>{row.proveedor?.nombre || row.proveedor?.razon_social || '-'}</td>
                                        <td className="text-right">{parseFloat(row.total_litros).toFixed(2)}</td>
                                        <td className="text-right">{parseFloat(row.precio_unitario).toFixed(2)}</td>
                                        <td>{row.observaciones || '-'}</td>
                                        <td>{renderTanqueColumn(row)}</td>
                                        <td>
                                            <DSBadge variant={row.estado === 'PENDIENTE' ? 'warning' : row.estado === 'FINALIZADO' ? 'success' : 'error'}>
                                                {row._offlinePending && '☁️ '}
                                                {row.estado}
                                            </DSBadge>
                                        </td>
                                        <td>
                                            {row.estado !== 'ANULADO' && (
                                                <SecuredButton
                                                    securityId="ingresos.anular"
                                                    securityDesc="Anular ingreso"
                                                    size="sm"
                                                    variant="ghost-danger"
                                                    icon={<Trash2 size={16} />}
                                                    onClick={() => handleAnular(row)}
                                                    title="Anular"
                                                />
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </DSSection>

            {/* CREATE MODAL */}
            <DSModal
                isOpen={modalOpen}
                onClose={closeModal}
                title="Registrar Nueva Compra"
                size="lg"
                footer={
                    <div className="diesel-modal-footer">
                        <div className="diesel-modal-footer__totals">
                            <span>Total Litros: <strong>{totalLitros.toFixed(2)}</strong></span>
                            <span className="diesel-modal-footer__total">Total Bs: {totalImporte.toFixed(2)}</span>
                        </div>
                        <div className="diesel-modal-footer__actions">
                            <DSButton onClick={closeModal} disabled={saving}>Cancelar</DSButton>
                            <DSButton variant="primary" onClick={handleSubmit} disabled={saving} loading={saving} icon={<Save size={16} />}>Guardar</DSButton>
                        </div>
                    </div>
                }
            >
                {formError && <DSAlert variant="error" className="mb-4">{formError}</DSAlert>}

                <DSFieldsGrid columns={4} gap="md" className="mb-4">
                    <div className="col-span-1">
                        <label className="ds-field__label">
                            Fecha *
                            <span className="diesel-tooltip">
                                <HelpCircle size={14} />
                                <span className="diesel-tooltip__text">Fecha del día en que se recibió el combustible</span>
                            </span>
                        </label>
                        <input type="date" className="ds-field__control" value={form.fecha} onChange={handleChange('fecha')} />
                    </div>
                    <div className="col-span-1">
                        <div className="diesel-combo-header">
                            <label className="ds-field__label">
                                Tipo Pago *
                                <span className="diesel-tooltip">
                                    <HelpCircle size={14} />
                                    <span className="diesel-tooltip__text">Método de pago utilizado (contado, crédito, etc.)</span>
                                </span>
                            </label>
                            <button type="button" className="diesel-refresh-btn" onClick={refetchCombos} title="Actualizar lista">
                                <RefreshCw size={12} />
                            </button>
                        </div>
                        <select className="ds-field__control" value={form.d_tipo_pago_id} onChange={handleChange('d_tipo_pago_id')}>
                            <option value="">Seleccione...</option>
                            {tiposPago.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                        </select>
                    </div>
                    <div className="col-span-2">
                        <div className="diesel-combo-header">
                            <label className="ds-field__label">
                                Proveedor *
                                <span className="diesel-tooltip">
                                    <HelpCircle size={14} />
                                    <span className="diesel-tooltip__text">Empresa o persona que suministra el combustible</span>
                                </span>
                            </label>
                            <button type="button" className="diesel-refresh-btn" onClick={refetchCombos} title="Actualizar lista">
                                <RefreshCw size={12} />
                            </button>
                        </div>
                        <select className="ds-field__control" value={form.d_proveedor_id} onChange={handleChange('d_proveedor_id')}>
                            <option value="">Seleccione...</option>
                            {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                        </select>
                    </div>

                    <div className="col-span-1">
                        <label className="ds-field__label">
                            Precio Unitario (Bs) *
                            <span className="diesel-tooltip">
                                <HelpCircle size={14} />
                                <span className="diesel-tooltip__text">Precio por litro de combustible</span>
                            </span>
                        </label>
                        <input type="number" step="0.01" className="ds-field__control" value={form.precio_unitario} onChange={handleChange('precio_unitario')} />
                    </div>
                    <div className="col-span-2">
                        <label className="ds-field__label">
                            Observaciones
                            <span className="diesel-tooltip">
                                <HelpCircle size={14} />
                                <span className="diesel-tooltip__text">Notas adicionales sobre el ingreso</span>
                            </span>
                        </label>
                        <input type="text" className="ds-field__control" value={form.observaciones} onChange={handleChange('observaciones')} />
                    </div>
                </DSFieldsGrid>

                <div className="diesel-combo-header diesel-combo-header--section">
                    <span className="diesel-section-title">Distribución a Tanques</span>
                    <button type="button" className="diesel-refresh-btn" onClick={refetchCombos} title="Actualizar tanques y stocks">
                        <RefreshCw size={14} /> Actualizar
                    </button>
                </div>
                <DSEditableGrid
                    columns={detalleColumns}
                    data={form.detalles}
                    onChange={handleDetalleChange}
                    onRemove={handleRemoveDetalle}
                    onAdd={handleAddDetalle}
                    canRemove={form.detalles.length > 1}
                    emptyText="Agregue al menos un tanque"
                />
            </DSModal>

            {/* VIEW MODAL (Read-only) */}
            <DSModal
                isOpen={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                title={`Detalle Ingreso #${viewIngreso?.numero_factura_dia || ''}`}
                size="md"
            >
                {viewIngreso && (
                    <>
                        <div className="diesel-view-info">
                            <p><strong>Fecha:</strong> {viewIngreso.fecha}</p>
                            <p><strong>Proveedor:</strong> {viewIngreso.proveedor?.nombre}</p>
                            <p><strong>Total Litros:</strong> {parseFloat(viewIngreso.total_litros).toFixed(2)}</p>
                            <p><strong>Total Bs:</strong> {parseFloat(viewIngreso.total).toFixed(2)}</p>
                        </div>
                        <h4 className="diesel-view-subtitle">Distribución por Tanques:</h4>
                        <table className="diesel-view-table">
                            <thead>
                                <tr>
                                    <th>Tanque</th>
                                    <th>Litros</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(viewIngreso.detalles || []).map((det, idx) => (
                                    <tr key={idx}>
                                        <td>{det.tanque?.nombre || '-'}</td>
                                        <td>{parseFloat(det.litros).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}
            </DSModal>
        </DSPage >
    );
}

export default IngresosPage;
