import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapPin, Plus, Pencil, Power, HelpCircle, Upload } from 'lucide-react';
import {
    getUbicaciones,
    getUbicacion,
    createUbicacion,
    updateUbicacion,
    toggleUbicacion,
    comboDivisiones,
    createUbicacionesBulk
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
    SecuredButton,
    DSRefreshButton,
    DSBulkImportModal,
} from '../../ds-components';

import './DieselPages.css';

function useUbicaciones() {
    const [ubicaciones, setUbicaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getUbicaciones();
            setUbicaciones(result.data || []);
        } catch (err) {
            setError('Error cargando datos');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { ubicaciones, loading, error, refetch: fetchData };
}

function useDivisiones() {
    const [divisiones, setDivisiones] = useState([]);

    useEffect(() => {
        const fetchDivisiones = async () => {
            try {
                const result = await comboDivisiones();
                setDivisiones(result.data || []);
            } catch (err) {
                console.error('Error cargando divisiones:', err);
            }
        };
        fetchDivisiones();
    }, []);

    return divisiones;
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

export function UbicacionesPage() {
    const { ubicaciones, loading, error: loadError, refetch } = useUbicaciones();
    const divisiones = useDivisiones();

    // Modal individual
    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState(null);
    const [formSuccess, setFormSuccess] = useState(null);
    const [editingItem, setEditingItem] = useState(null);

    const [form, setForm] = useState({
        nombre: '',
        d_division_id: ''
    });

    // Modal masivo
    const [bulkModalOpen, setBulkModalOpen] = useState(false);

    const resetForm = useCallback(() => {
        setForm({ nombre: '', d_division_id: '' });
        setEditingItem(null);
        setFormError(null);
    }, []);

    const openCreate = () => {
        resetForm();
        setModalOpen(true);
    };

    const openEdit = async (item) => {
        const detail = await getUbicacion(item.id);
        if (detail.data) {
            setEditingItem(item);
            setForm({
                nombre: detail.data.nombre || '',
                d_division_id: detail.data.d_division_id || ''
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
                d_division_id: form.d_division_id || null
            };

            let result;
            if (editingItem) {
                result = await updateUbicacion(editingItem.id, payload);
            } else {
                result = await createUbicacion(payload);
            }

            if (result.success) {
                setFormSuccess(editingItem ? 'Ubicación actualizada' : 'Ubicación creada');
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
            const result = await toggleUbicacion(item.id);
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

    // Bulk import columns con select dinámico para divisiones
    const bulkColumns = useMemo(() => [
        { field: 'nombre', label: 'Nombre', required: true, placeholder: 'Nombre de ubicación', width: '2' },
        {
            field: 'd_division_id',
            label: 'División',
            type: 'select',
            options: divisiones.map(d => ({ value: d.id, label: d.nombre })),
            placeholder: '-- Sin división --',
            width: '1.5'
        }
    ], [divisiones]);

    // Bulk save handler
    const handleBulkSave = async (rows) => {
        return await createUbicacionesBulk(rows);
    };

    // Bulk success handler
    const handleBulkSuccess = (result, message) => {
        setFormSuccess(message);
        refetch();
        setTimeout(() => setFormSuccess(null), 5000);
    };

    // Helper para obtener nombre de división
    const getDivisionNombre = (divisionId) => {
        const division = divisiones.find(d => d.id === divisionId);
        return division ? division.nombre : '-';
    };

    return (
        <DSPage>
            <DSPageHeader
                title="Gestión de Ubicaciones Físicas"
                icon={<MapPin size={22} />}
                actions={
                    <div className="ds-header__actions-row">
                        <SecuredButton
                            securityId="ubicaciones.crear"
                            securityDesc="Ingreso masivo de ubicaciones"
                            variant="secondary"
                            icon={<Upload size={16} />}
                            onClick={() => setBulkModalOpen(true)}
                        >
                            Ingreso Masivo
                        </SecuredButton>
                        <SecuredButton
                            securityId="ubicaciones.crear"
                            securityDesc="Crear nueva ubicación"
                            variant="primary"
                            icon={<Plus size={16} />}
                            onClick={openCreate}
                        >
                            Nueva Ubicación
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

            <DSSection
                title="Listado de Ubicaciones"
                actions={
                    <div className="ds-section__actions-row">
                        <DSRefreshButton onClick={refetch} loading={loading} />
                        <span className="diesel-panel__count">{ubicaciones.length} ubicaciones</span>
                    </div>
                }
            >
                <div className="ds-table-wrapper">
                    {loading ? (
                        <DSLoading text="Cargando..." />
                    ) : (
                        <table className="ds-table ds-table--striped ds-table--hover">
                            <thead>
                                <tr>
                                    <th style={{ width: '10%' }}>ID</th>
                                    <th style={{ width: '40%' }}>Nombre</th>
                                    <th style={{ width: '25%' }}>División</th>
                                    <th style={{ width: '10%' }}>Estado</th>
                                    <th style={{ width: '15%' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ubicaciones.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="ds-table__empty">
                                            No hay ubicaciones registradas
                                        </td>
                                    </tr>
                                ) : (
                                    ubicaciones.map(item => (
                                        <tr key={item.id}>
                                            <td>{item.id}</td>
                                            <td><strong>{item.nombre}</strong></td>
                                            <td>{item.division?.nombre || getDivisionNombre(item.d_division_id)}</td>
                                            <td>
                                                <DSBadge variant={item.is_active ? 'success' : 'error'}>
                                                    {item.is_active ? 'Activo' : 'Inactivo'}
                                                </DSBadge>
                                            </td>
                                            <td>
                                                <div className="ds-table__actions">
                                                    <SecuredButton
                                                        securityId="ubicaciones.editar"
                                                        securityDesc="Editar ubicación"
                                                        size="sm"
                                                        iconOnly
                                                        icon={<Pencil size={15} />}
                                                        onClick={() => openEdit(item)}
                                                        title="Editar"
                                                    />
                                                    <SecuredButton
                                                        securityId="ubicaciones.toggle"
                                                        securityDesc="Activar/Desactivar ubicación"
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
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </DSSection>

            {/* Modal Individual */}
            <DSModal
                isOpen={modalOpen}
                onClose={closeModal}
                title={editingItem ? 'Editar Ubicación' : 'Nueva Ubicación'}
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

                <DSModalSection title="Información de la Ubicación">
                    <form className="diesel-form" onSubmit={e => e.preventDefault()}>
                        <FormField label="Nombre" required help="Nombre de la ubicación física. Ej: Campamento Principal.">
                            <input
                                type="text"
                                className="ds-field__control"
                                value={form.nombre}
                                onChange={handleChange('nombre')}
                                placeholder="Ej: Campamento Principal"
                            />
                        </FormField>

                        <FormField label="División" help="División a la que pertenece esta ubicación (opcional).">
                            <select
                                className="ds-field__control"
                                value={form.d_division_id}
                                onChange={handleChange('d_division_id')}
                            >
                                <option value="">-- Sin división --</option>
                                {divisiones.map(div => (
                                    <option key={div.id} value={div.id}>{div.nombre}</option>
                                ))}
                            </select>
                        </FormField>
                    </form>
                </DSModalSection>
            </DSModal>

            {/* Modal Ingreso Masivo */}
            <DSBulkImportModal
                isOpen={bulkModalOpen}
                onClose={() => setBulkModalOpen(false)}
                title="Ingreso Masivo de Ubicaciones"
                columns={bulkColumns}
                onSave={handleBulkSave}
                onSuccess={handleBulkSuccess}
                entityName="ubicación"
            />
        </DSPage>
    );
}

export default UbicacionesPage;
