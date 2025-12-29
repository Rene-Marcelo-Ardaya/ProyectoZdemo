import React, { useState, useEffect, useCallback } from 'react';
import { Container, Plus, Pencil, Power, HelpCircle } from 'lucide-react';
import {
    getTanques,
    getTanque,
    createTanque,
    updateTanque,
    toggleTanque,
    comboUbicaciones
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
} from '../../ds-components';

import './DieselPages.css';

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

function Tooltip({ text }) {
    return (
        <span className="diesel-tooltip">
            <HelpCircle size={14} />
            <span className="diesel-tooltip__text">{text}</span>
        </span>
    );
}

function FormField({ label, children, required, help }) {
    return (
        <div className="ds-field">
            <label className="ds-field__label">
                <span className="ds-field__label-text">
                    {label}
                    {help && <Tooltip text={help} />}
                </span>
                {required && <span className="ds-field__required">*</span>}
            </label>
            <div className="ds-field__control-wrapper">
                {children}
            </div>
        </div>
    );
}

export function TanquesPage() {
    const { tanques, loading, error: loadError, refetch } = useTanques();
    const ubicaciones = useUbicaciones();

    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState(null);
    const [formSuccess, setFormSuccess] = useState(null);
    const [editingItem, setEditingItem] = useState(null);

    const [form, setForm] = useState({
        nombre: '',
        tipo: 'FIJO',
        d_ubicacion_fisica_id: '',
        capacidad_maxima: '',
        stock_actual: ''
    });

    const resetForm = useCallback(() => {
        setForm({ nombre: '', tipo: 'FIJO', d_ubicacion_fisica_id: '', capacidad_maxima: '', stock_actual: '' });
        setEditingItem(null);
        setFormError(null);
    }, []);

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

    const closeModal = () => {
        setModalOpen(false);
        resetForm();
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
                d_ubicacion_fisica_id: form.d_ubicacion_fisica_id,
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

    // Calcular porcentaje
    const calcPorcentaje = (stock, capacidad) => {
        if (!capacidad || capacidad <= 0) return 0;
        return Math.round((stock / capacidad) * 100);
    };

    return (
        <DSPage>
            <DSPageHeader
                title="Gestión de Tanques"
                icon={<Container size={22} />}
                actions={
                    <DSButton variant="primary" icon={<Plus size={16} />} onClick={openCreate}>
                        Nuevo Tanque
                    </DSButton>
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

            <DSSection
                title="Listado de Tanques"
                actions={<span className="diesel-panel__count">{tanques.length} tanques</span>}
            >
                <div className="ds-table-wrapper">
                    {loading ? (
                        <DSLoading text="Cargando..." />
                    ) : (
                        <table className="ds-table ds-table--striped ds-table--hover">
                            <thead>
                                <tr>
                                    <th style={{ width: '5%' }}>ID</th>
                                    <th style={{ width: '20%' }}>Nombre</th>
                                    <th style={{ width: '10%' }}>Tipo</th>
                                    <th style={{ width: '20%' }}>Ubicación</th>
                                    <th style={{ width: '15%' }}>Stock / Cap.</th>
                                    <th style={{ width: '10%' }}>%</th>
                                    <th style={{ width: '10%' }}>Estado</th>
                                    <th style={{ width: '10%' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tanques.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="ds-table__empty">
                                            No hay tanques registrados
                                        </td>
                                    </tr>
                                ) : (
                                    tanques.map(item => {
                                        const pct = calcPorcentaje(item.stock_actual, item.capacidad_maxima);
                                        return (
                                            <tr key={item.id}>
                                                <td>{item.id}</td>
                                                <td><strong>{item.nombre}</strong></td>
                                                <td>
                                                    <DSBadge variant={item.tipo === 'FIJO' ? 'info' : 'warning'}>
                                                        {item.tipo}
                                                    </DSBadge>
                                                </td>
                                                <td>{item.ubicacion?.nombre || '-'}</td>
                                                <td>{parseFloat(item.stock_actual).toFixed(0)} / {parseFloat(item.capacidad_maxima).toFixed(0)} L</td>
                                                <td>
                                                    <DSBadge variant={pct > 50 ? 'success' : pct > 20 ? 'warning' : 'error'}>
                                                        {pct}%
                                                    </DSBadge>
                                                </td>
                                                <td>
                                                    <DSBadge variant={item.is_active ? 'success' : 'error'}>
                                                        {item.is_active ? 'Activo' : 'Inactivo'}
                                                    </DSBadge>
                                                </td>
                                                <td>
                                                    <div className="ds-table__actions">
                                                        <DSButton
                                                            size="sm"
                                                            iconOnly
                                                            icon={<Pencil size={15} />}
                                                            onClick={() => openEdit(item)}
                                                            title="Editar"
                                                        />
                                                        <DSButton
                                                            size="sm"
                                                            variant={item.is_active ? 'outline-danger' : 'outline-success'}
                                                            iconOnly
                                                            icon={<Power size={15} />}
                                                            onClick={() => handleToggle(item)}
                                                            title={item.is_active ? 'Desactivar' : 'Activar'}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </DSSection>

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
                                    <option value="FIJO">FIJO</option>
                                    <option value="MOVIL">MÓVIL</option>
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
                                <FormField label="Stock Inicial (L)" help="Stock inicial al crear el tanque">
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
        </DSPage>
    );
}

export default TanquesPage;
