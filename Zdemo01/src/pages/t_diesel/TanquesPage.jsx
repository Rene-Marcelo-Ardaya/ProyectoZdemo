import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Plus, Pencil, Power, Search, Truck, Factory, MapPin, AlertTriangle, Droplets, Upload, Users } from 'lucide-react';
import {
    getTanques,
    getTanque,
    createTanque,
    updateTanque,
    toggleTanque,
    comboUbicaciones,
    adjustStock,
    createTanquesBulk,
    getTanquePersonal,
    assignTanquePersonal
} from '../../services/dieselService';

import { getPersonal } from '../../services/personalService';

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
    SecuredButton,
    DSRefreshButton,
    DSBulkImportModal
} from '../../ds-components';

import './TanquesPage.css';

// =============================================
// COMPONENTE: Gauge Visual de Nivel
// =============================================
function TanqueGauge({ nivel, capacidad }) {
    const porcentaje = capacidad > 0 ? Math.round((nivel / capacidad) * 100) : 0;

    let colorClass = 'gauge-high';
    if (porcentaje <= 20) colorClass = 'gauge-critical';
    else if (porcentaje <= 40) colorClass = 'gauge-low';
    else if (porcentaje <= 60) colorClass = 'gauge-medium';

    return (
        <div className="tanque-gauge">
            <div className="tanque-gauge__container">
                <div
                    className={`tanque-gauge__fill ${colorClass}`}
                    style={{ height: `${Math.min(porcentaje, 100)}%` }}
                />
                <div className="tanque-gauge__label">{porcentaje}%</div>
            </div>
            <div className="tanque-gauge__info">
                <span className="tanque-gauge__nivel">{parseFloat(nivel).toLocaleString()} L</span>
                <span className="tanque-gauge__capacidad">/ {parseFloat(capacidad).toLocaleString()} L</span>
            </div>
        </div>
    );
}

// =============================================
// COMPONENTE: Tarjeta de Tanque
// =============================================
function TanqueCard({ tanque, onEdit, onToggle, onAdjustStock, onAssignPersonal }) {
    const esMovil = tanque.tipo === 'MOVIL';
    const porcentaje = tanque.capacidad_maxima > 0
        ? (tanque.stock_actual / tanque.capacidad_maxima) * 100
        : 0;
    const nivelBajo = porcentaje <= 20;

    const cardClass = [
        'tanque-card',
        nivelBajo && tanque.is_active ? 'tanque-card--alerta' : '',
        !tanque.is_active ? 'tanque-card--inactivo' : ''
    ].filter(Boolean).join(' ');

    return (
        <div className={cardClass}>
            <div className="tanque-card__header">
                <div className="tanque-card__tipo">
                    {esMovil ? (
                        <Truck size={18} className="icon-movil" />
                    ) : (
                        <Factory size={18} className="icon-fijo" />
                    )}
                    <DSBadge variant={esMovil ? 'info' : 'default'} size="sm">
                        {esMovil ? 'Móvil' : 'Fijo'}
                    </DSBadge>
                </div>
                {nivelBajo && tanque.is_active && (
                    <DSBadge variant="warning" size="sm">
                        <AlertTriangle size={12} /> Bajo
                    </DSBadge>
                )}
            </div>

            <h3 className="tanque-card__nombre">{tanque.nombre}</h3>

            {tanque.ubicacion?.nombre && (
                <div className="tanque-card__ubicacion">
                    <MapPin size={14} />
                    <span>{tanque.ubicacion.nombre}</span>
                </div>
            )}

            <TanqueGauge
                nivel={tanque.stock_actual}
                capacidad={tanque.capacidad_maxima}
            />

            <div className="tanque-card__footer">
                <DSBadge variant={tanque.is_active ? 'success' : 'error'} size="sm">
                    {tanque.is_active ? 'Activo' : 'Inactivo'}
                </DSBadge>
                <div className="tanque-card__actions">
                    <SecuredButton
                        securityId="tanques.editar"
                        securityDesc="Ajustar Stock"
                        size="sm"
                        variant="secondary"
                        iconOnly
                        icon={<Droplets size={14} />}
                        onClick={() => onAdjustStock(tanque)}
                        title="Ajustar Stock"
                    />
                    <SecuredButton
                        securityId="tanques.editar"
                        securityDesc="Asignar Personal"
                        size="sm"
                        variant="secondary"
                        iconOnly
                        icon={<Users size={14} />}
                        onClick={() => onAssignPersonal(tanque)}
                        title="Asignar Personal"
                        style={{ marginRight: '0.25rem' }}
                    />
                    <SecuredButton
                        securityId="tanques.editar"
                        securityDesc="Editar tanque"
                        size="sm"
                        iconOnly
                        icon={<Pencil size={14} />}
                        onClick={() => onEdit(tanque)}
                        title="Editar"
                    />
                    <SecuredButton
                        securityId="tanques.toggle"
                        securityDesc="Activar/Desactivar tanque"
                        size="sm"
                        variant={tanque.is_active ? 'outline-danger' : 'outline-success'}
                        iconOnly
                        icon={<Power size={14} />}
                        onClick={() => onToggle(tanque)}
                        title={tanque.is_active ? 'Desactivar' : 'Activar'}
                    />
                </div>
            </div>
        </div>
    );
}

// =============================================
// COMPONENTE: Modal Asignación Personal
// =============================================
function TanquePersonalModal({ isOpen, onClose, tanque, onSave, loading }) {
    const [personalList, setPersonalList] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingData, setLoadingData] = useState(false);

    useEffect(() => {
        if (isOpen && tanque) {
            loadData();
        }
    }, [isOpen, tanque]);

    const loadData = async () => {
        setLoadingData(true);
        try {
            const [allPersonal, assigned] = await Promise.all([
                getPersonal(),
                getTanquePersonal(tanque.id)
            ]);

            setPersonalList(allPersonal || []);
            const assignedIds = (assigned.data || []).map(p => p.id);
            setSelectedIds(assignedIds);
        } catch (error) {
            console.error('Error loading personal data', error);
        } finally {
            setLoadingData(false);
        }
    };

    const toggleSelection = (id) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(pId => pId !== id)
                : [...prev, id]
        );
    };

    const filteredPersonal = personalList.filter(p => {
        const nombreCompleto = `${p.nombre} ${p.apellido_paterno} ${p.apellido_materno || ''}`.toLowerCase();
        return nombreCompleto.includes(searchTerm.toLowerCase());
    });

    return (
        <DSModal
            isOpen={isOpen}
            onClose={onClose}
            title={`Asignar Personal - ${tanque?.nombre}`}
            size="md"
            footer={
                <>
                    <DSButton onClick={onClose} disabled={loading}>Cancelar</DSButton>
                    <DSButton variant="primary" onClick={() => onSave(selectedIds)} disabled={loading || loadingData} loading={loading}>
                        Guardar Asignación
                    </DSButton>
                </>
            }
        >
            <DSModalSection>
                <div className="tanques-search" style={{ marginBottom: '1rem' }}>
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Buscar personal..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="ds-field__control"
                    />
                </div>

                {loadingData ? (
                    <DSLoading text="Cargando personal..." />
                ) : (
                    <div className="personal-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {filteredPersonal.map(p => (
                            <label key={p.id} className="personal-item" style={{ display: 'flex', alignItems: 'center', padding: '0.5rem', borderBottom: '1px solid #eee', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(p.id)}
                                    onChange={() => toggleSelection(p.id)}
                                    style={{ marginRight: '0.75rem' }}
                                />
                                <div>
                                    <div style={{ fontWeight: 500 }}>{p.nombre} {p.apellido_paterno} {p.apellido_materno}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{p.ci} - {p.cargo?.nombre || 'Sin cargo'}</div>
                                </div>
                            </label>
                        ))}
                        {filteredPersonal.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '1rem', color: '#666' }}>No se encontraron resultados</div>
                        )}
                    </div>
                )}
            </DSModalSection>
        </DSModal>
    );
}

// =============================================
// HOOK: useTanques
// =============================================
function useTanques() {
    const [tanques, setTanques] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getTanques();
            setTanques(result.data || []);
        } catch (err) {
            setError('Error cargando datos');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { tanques, loading, error, refetch: fetchData };
}

function useUbicaciones() {
    const [ubicaciones, setUbicaciones] = useState([]);

    useEffect(() => {
        const fetchUbicaciones = async () => {
            try {
                const result = await comboUbicaciones();
                setUbicaciones(result.data || []);
            } catch (err) {
                console.error('Error cargando ubicaciones:', err);
            }
        };
        fetchUbicaciones();
    }, []);

    return ubicaciones;
}

// =============================================
// COMPONENTE: Empty State
// =============================================
function TanquesEmpty({ icon: Icon, title, description }) {
    return (
        <div className="tanques-empty">
            <Icon size={48} />
            <h4 className="tanques-empty__title">{title}</h4>
            <p className="tanques-empty__desc">{description}</p>
        </div>
    );
}

// =============================================
// COMPONENTE: Formulario Modal
// =============================================
function FormField({ label, children, required }) {
    return (
        <div className="ds-field">
            <label className="ds-field__label">
                <span className="ds-field__label-text">{label}</span>
                {required && <span className="ds-field__required">*</span>}
            </label>
            <div className="ds-field__control-wrapper">
                {children}
            </div>
        </div>
    );
}

// =============================================
// COMPONENTE PRINCIPAL: TanquesPage
// =============================================
export function TanquesPage() {
    const { tanques, loading, error: loadError, refetch } = useTanques();
    const ubicaciones = useUbicaciones();

    // Filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTipo, setFilterTipo] = useState('');

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [stockModalOpen, setStockModalOpen] = useState(false);
    const [bulkModalOpen, setBulkModalOpen] = useState(false);
    const [personalModalOpen, setPersonalModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState(null);
    const [formSuccess, setFormSuccess] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [stockItem, setStockItem] = useState(null);
    const [assigningTanque, setAssigningTanque] = useState(null);

    const [form, setForm] = useState({
        nombre: '',
        tipo: 'FIJO',
        d_ubicacion_fisica_id: '',
        capacidad_maxima: '',
        stock_actual: ''
    });

    const [newStock, setNewStock] = useState('');

    const resetForm = useCallback(() => {
        setForm({ nombre: '', tipo: 'FIJO', d_ubicacion_fisica_id: '', capacidad_maxima: '', stock_actual: '' });
        setEditingItem(null);
        setFormError(null);
    }, []);

    // Filtrar tanques
    const filteredTanques = tanques.filter(t => {
        // Búsqueda por texto
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const matchSearch =
                t.nombre?.toLowerCase().includes(term) ||
                t.ubicacion?.nombre?.toLowerCase().includes(term);
            if (!matchSearch) return false;
        }
        // Filtro por tipo
        if (filterTipo && t.tipo !== filterTipo) return false;
        return true;
    });

    // Separar por tipo
    const tanquesFijos = filteredTanques.filter(t => t.tipo === 'FIJO');
    const tanquesMoviles = filteredTanques.filter(t => t.tipo === 'MOVIL');

    const openCreate = () => {
        resetForm();
        setModalOpen(true);
    };

    const openEdit = async (item) => {
        const detail = await getTanque(item.id);
        if (detail.data) {
            setEditingItem(item);
            setForm({
                nombre: detail.data.nombre || '',
                tipo: detail.data.tipo || 'FIJO',
                d_ubicacion_fisica_id: detail.data.d_ubicacion_fisica_id || '',
                capacidad_maxima: detail.data.capacidad_maxima || '',
                stock_actual: detail.data.stock_actual || ''
            });
            setFormError(null);
            setModalOpen(true);
        }
    };

    const openStockAdjust = (item) => {
        setStockItem(item);
        setNewStock(item.stock_actual);
        setFormError(null);
        setStockModalOpen(true);
    };



    const openAssignPersonal = (tanque) => {
        setAssigningTanque(tanque);
        setPersonalModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setStockModalOpen(false);
        setBulkModalOpen(false);
        setPersonalModalOpen(false);
        setAssigningTanque(null);
        resetForm();
        setNewStock('');
        setStockItem(null);
    };

    const handleSavePersonal = async (selectedIds) => {
        setSaving(true);
        try {
            const result = await assignTanquePersonal(assigningTanque.id, selectedIds);
            if (result.success) {
                setFormSuccess('Personal asignado correctamente');
                closeModal();
            } else {
                setFormError('Error al asignar personal');
            }
        } catch (error) {
            setFormError('Error de conexión');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field) => (e) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
    };

    const validateForm = () => {
        if (!form.nombre.trim()) return 'El nombre es requerido';
        if (!form.d_ubicacion_fisica_id) return 'La ubicación es requerida';
        if (!form.capacidad_maxima || parseFloat(form.capacidad_maxima) <= 0) return 'La capacidad máxima es requerida';
        return null;
    };

    const handleSave = async () => {
        const validationError = validateForm();
        if (validationError) {
            setFormError(validationError);
            return;
        }

        setSaving(true);
        setFormError(null);

        try {
            const payload = {
                nombre: form.nombre,
                tipo: form.tipo,
                d_ubicacion_fisica_id: parseInt(form.d_ubicacion_fisica_id),
                capacidad_maxima: parseFloat(form.capacidad_maxima),
                stock_actual: form.stock_actual ? parseFloat(form.stock_actual) : 0
            };

            let result;
            if (editingItem) {
                // No enviar stock_actual en update
                delete payload.stock_actual;
                result = await updateTanque(editingItem.id, payload);
            } else {
                result = await createTanque(payload);
            }

            if (result.success) {
                setFormSuccess(editingItem ? 'Tanque actualizado' : 'Tanque creado');
                closeModal();
                refetch();
                setTimeout(() => setFormSuccess(null), 3000);
            } else {
                setFormError(result.error || result.message || 'Error guardando');
            }
        } catch (err) {
            setFormError('Error de conexión');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveStock = async () => {
        if (newStock === '' || parseFloat(newStock) < 0) {
            setFormError('El stock debe ser válido');
            return;
        }

        if (parseFloat(newStock) > parseFloat(stockItem.capacidad_maxima)) {
            setFormError(`El stock no puede superar la capacidad máxima (${stockItem.capacidad_maxima} L)`);
            return;
        }

        setSaving(true);
        setFormError(null);

        try {
            const result = await adjustStock(stockItem.id, parseFloat(newStock));

            if (result.success) {
                setFormSuccess('Stock actualizado');
                closeModal();
                refetch();
                setTimeout(() => setFormSuccess(null), 3000);
            } else {
                setFormError(result.error || result.message || 'Error guardando');
            }
        } catch (err) {
            setFormError('Error de conexión');
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (item) => {
        const action = item.is_active ? 'desactivar' : 'activar';
        if (!window.confirm(`¿${action.charAt(0).toUpperCase() + action.slice(1)} "${item.nombre}"?`)) return;

        try {
            const result = await toggleTanque(item.id);
            if (result.success) {
                setFormSuccess(result.message);
                refetch();
                setTimeout(() => setFormSuccess(null), 3000);
            } else {
                alert(result.error || 'Error en la operación');
            }
        } catch (err) {
            alert('Error de conexión');
        }
    };

    // Bulk Columns
    const bulkColumns = useMemo(() => [
        { field: 'nombre', label: 'Nombre', required: true, placeholder: 'Ej: Tanque Principal', width: '25%' },
        {
            field: 'tipo',
            label: 'Tipo',
            type: 'select',
            options: [{ value: 'FIJO', label: 'Fijo' }, { value: 'MOVIL', label: 'Móvil' }],
            required: true,
            width: '15%'
        },
        {
            field: 'd_ubicacion_fisica_id',
            label: 'Ubicación',
            type: 'select',
            options: ubicaciones.map(u => ({ value: u.id, label: u.nombre })),
            required: true,
            placeholder: '-- Seleccionar --',
            width: '20%'
        },
        { field: 'capacidad_maxima', label: 'Capacidad (L)', type: 'number', required: true, placeholder: 'Ej: 5000', width: '20%' },
        { field: 'stock_actual', label: 'Stock Actual (L)', type: 'number', placeholder: 'Ej: 1000', width: '20%' }
    ], [ubicaciones]);

    const handleBulkSave = async (rows) => {
        return await createTanquesBulk(rows);
    };

    const handleBulkSuccess = (result, message) => {
        setFormSuccess(message);
        refetch();
        setTimeout(() => setFormSuccess(null), 5000);
    };

    return (
        <DSPage>
            <DSPageHeader
                title="Gestión de Tanques"
                icon={<Container size={22} />}
                actions={
                    <div className="ds-header__actions-row">
                        <SecuredButton
                            securityId="tanques.crear"
                            securityDesc="Ingreso masivo de tanques"
                            variant="secondary"
                            icon={<Upload size={16} />}
                            onClick={() => setBulkModalOpen(true)}
                        >
                            Ingreso Masivo
                        </SecuredButton>
                        <SecuredButton
                            securityId="tanques.crear"
                            securityDesc="Crear nuevo tanque"
                            variant="primary"
                            icon={<Plus size={16} />}
                            onClick={openCreate}
                        >
                            Nuevo Tanque
                        </SecuredButton>
                    </div>
                }
            />

            {formSuccess && (
                <DSAlert variant="success" dismissible onDismiss={() => setFormSuccess(null)} className="diesel-alert-margin">
                    {formSuccess}
                </DSAlert>
            )}
            {loadError && (
                <DSAlert variant="error" className="diesel-alert-margin">
                    {loadError}
                </DSAlert>
            )}

            {/* TOOLBAR: Búsqueda y Filtros */}
            <DSSection style={{ overflow: 'visible' }}>
                <div className="tanques-toolbar">
                    <div className="tanques-search">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o ubicación..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="tanques-toolbar__filters">
                        <select
                            className="ds-field__control"
                            value={filterTipo}
                            onChange={(e) => setFilterTipo(e.target.value)}
                            style={{ width: '160px' }}
                        >
                            <option value="">Todos los tipos</option>
                            <option value="FIJO">🏭 Fijos</option>
                            <option value="MOVIL">🚚 Móviles</option>
                        </select>
                        <DSRefreshButton onClick={refetch} loading={loading} />
                    </div>
                </div>
            </DSSection>

            {loading ? (
                <DSLoading text="Cargando tanques..." />
            ) : (
                <>
                    {/* TANQUES FIJOS */}
                    {(filterTipo === '' || filterTipo === 'FIJO') && (
                        <DSSection
                            title={
                                <span className="tanques-section-title">
                                    <Factory size={18} />
                                    Tanques Fijos
                                    <DSBadge variant="neutral" size="sm">{tanquesFijos.length}</DSBadge>
                                </span>
                            }
                        >
                            {tanquesFijos.length === 0 ? (
                                <TanquesEmpty
                                    icon={Factory}
                                    title="Sin tanques fijos"
                                    description="No hay tanques fijos registrados"
                                />
                            ) : (
                                <div className="tanques-grid">
                                    {tanquesFijos.map(tanque => (
                                        <TanqueCard
                                            key={tanque.id}
                                            tanque={tanque}
                                            onEdit={openEdit}
                                            onToggle={handleToggle}
                                            onAdjustStock={openStockAdjust}
                                            onAssignPersonal={openAssignPersonal}
                                        />
                                    ))}
                                </div>
                            )}
                        </DSSection>
                    )}

                    {/* TANQUES MÓVILES */}
                    {(filterTipo === '' || filterTipo === 'MOVIL') && (
                        <DSSection
                            title={
                                <span className="tanques-section-title">
                                    <Truck size={18} />
                                    Tanques Móviles (Cisternas)
                                    <DSBadge variant="neutral" size="sm">{tanquesMoviles.length}</DSBadge>
                                </span>
                            }
                        >
                            {tanquesMoviles.length === 0 ? (
                                <TanquesEmpty
                                    icon={Truck}
                                    title="Sin tanques móviles"
                                    description="No hay cisternas registradas"
                                />
                            ) : (
                                <div className="tanques-grid">
                                    {tanquesMoviles.map(tanque => (
                                        <TanqueCard
                                            key={tanque.id}
                                            tanque={tanque}
                                            onEdit={openEdit}
                                            onToggle={handleToggle}
                                            onAdjustStock={openStockAdjust}
                                            onAssignPersonal={openAssignPersonal}
                                        />
                                    ))}
                                </div>
                            )}
                        </DSSection>
                    )}
                </>
            )}

            {/* MODAL: Crear/Editar */}
            <DSModal
                isOpen={modalOpen}
                onClose={closeModal}
                title={editingItem ? 'Editar Tanque' : 'Nuevo Tanque'}
                size="md"
                footer={
                    <>
                        <DSButton onClick={closeModal} disabled={saving}>Cancelar</DSButton>
                        <DSButton variant="primary" onClick={handleSave} disabled={saving} loading={saving}>
                            {saving ? 'Guardando...' : 'Guardar'}
                        </DSButton>
                    </>
                }
            >
                {formError && (
                    <DSAlert variant="error" dismissible onDismiss={() => setFormError(null)} className="diesel-alert-margin">
                        {formError}
                    </DSAlert>
                )}

                <DSModalSection title="Información del Tanque">
                    <form className="diesel-form" onSubmit={e => e.preventDefault()}>
                        <FormField label="Nombre" required>
                            <input
                                type="text"
                                className="ds-field__control"
                                value={form.nombre}
                                onChange={handleChange('nombre')}
                                placeholder="Ej: Tanque Principal M1"
                            />
                        </FormField>

                        <div className="diesel-form-grid">
                            <FormField label="Tipo" required>
                                <select
                                    className="ds-field__control"
                                    value={form.tipo}
                                    onChange={handleChange('tipo')}
                                >
                                    <option value="FIJO">🏭 Fijo</option>
                                    <option value="MOVIL">🚚 Móvil</option>
                                </select>
                            </FormField>

                            <FormField label="Ubicación" required>
                                <select
                                    className="ds-field__control"
                                    value={form.d_ubicacion_fisica_id}
                                    onChange={handleChange('d_ubicacion_fisica_id')}
                                >
                                    <option value="">-- Seleccionar --</option>
                                    {ubicaciones.map(ub => (
                                        <option key={ub.id} value={ub.id}>{ub.nombre}</option>
                                    ))}
                                </select>
                            </FormField>
                        </div>

                        <div className="diesel-form-grid">
                            <FormField label="Capacidad Máxima (L)" required>
                                <input
                                    type="number"
                                    className="ds-field__control"
                                    value={form.capacidad_maxima}
                                    onChange={handleChange('capacidad_maxima')}
                                    placeholder="Ej: 10000"
                                    min="1"
                                />
                            </FormField>

                            {!editingItem && (
                                <FormField label="Stock Inicial (L)">
                                    <input
                                        type="number"
                                        className="ds-field__control"
                                        value={form.stock_actual}
                                        onChange={handleChange('stock_actual')}
                                        placeholder="Ej: 5000"
                                        min="0"
                                    />
                                </FormField>
                            )}
                        </div>
                    </form>
                </DSModalSection>
            </DSModal>

            {/* MODAL: Ajuste de Stock */}
            {stockItem && (
                <DSModal
                    isOpen={stockModalOpen}
                    onClose={closeModal}
                    title={`Ajuste de Stock: ${stockItem.nombre}`}
                    size="sm"
                    footer={
                        <>
                            <DSButton onClick={closeModal} disabled={saving}>Cancelar</DSButton>
                            <DSButton variant="warning" onClick={handleSaveStock} disabled={saving} loading={saving}>
                                {saving ? 'Guardando...' : 'Ajustar Stock'}
                            </DSButton>
                        </>
                    }
                >
                    {formError && (
                        <DSAlert variant="error" dismissible onDismiss={() => setFormError(null)} className="diesel-alert-margin">
                            {formError}
                        </DSAlert>
                    )}
                    <DSModalSection>
                        <p className="diesel-text-sm" style={{ marginBottom: '1rem' }}>
                            Capacidad Máxima: <strong>{stockItem.capacidad_maxima} L</strong>
                        </p>
                        <FormField label="Nuevo Stock Actual (L)" required>
                            <input
                                type="number"
                                className="ds-field__control"
                                value={newStock}
                                onChange={(e) => setNewStock(e.target.value)}
                                placeholder="0.00"
                                min="0"
                                max={stockItem.capacidad_maxima}
                            />
                        </FormField>
                    </DSModalSection>
                </DSModal>
            )}

            <DSBulkImportModal
                isOpen={bulkModalOpen}
                onClose={() => setBulkModalOpen(false)}
                title="Ingreso Masivo de Tanques"
                columns={bulkColumns}
                onSave={handleBulkSave}
                onSuccess={handleBulkSuccess}
                entityName="tanque"
                initialRow={{ tipo: 'FIJO' }}
            />

            <TanquePersonalModal
                isOpen={personalModalOpen}
                onClose={closeModal}
                tanque={assigningTanque}
                onSave={handleSavePersonal}
                loading={saving}
            />
        </DSPage>
    );
}

export default TanquesPage;
