import React, { useState, useEffect, useCallback } from 'react';
import { Settings2, Plus, Pencil, Power, HelpCircle, Upload } from 'lucide-react';
import {
    getTiposMovimiento,
    getTipoMovimiento,
    createTipoMovimiento,
    updateTipoMovimiento,
    toggleTipoMovimiento,
    createTiposMovimientoBulk
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

function useTiposMovimiento() {
    const [tipos, setTipos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getTiposMovimiento();
            setTipos(result.data || []);
        } catch (err) {
            setError('Error cargando datos');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { tipos, loading, error, refetch: fetchData };
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

export function TiposMovimientoPage() {
    const { tipos, loading, error: loadError, refetch } = useTiposMovimiento();

    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState(null);
    const [formSuccess, setFormSuccess] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [bulkModalOpen, setBulkModalOpen] = useState(false);

    const [form, setForm] = useState({
        nombre: '',
        descripcion: ''
    });

    const resetForm = useCallback(() => {
        setForm({ nombre: '', descripcion: '' });
        setEditingItem(null);
        setFormError(null);
    }, []);

    const openCreate = () => {
        resetForm();
        setModalOpen(true);
    };

    const openEdit = async (item) => {
        const detail = await getTipoMovimiento(item.id);
        if (detail.data) {
            setEditingItem(item);
            setForm({
                nombre: detail.data.nombre || '',
                descripcion: detail.data.descripcion || ''
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
                descripcion: form.descripcion
            };

            let result;
            if (editingItem) {
                result = await updateTipoMovimiento(editingItem.id, payload);
            } else {
                result = await createTipoMovimiento(payload);
            }

            if (result.success) {
                setFormSuccess(editingItem ? 'Tipo actualizado' : 'Tipo creado');
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
            const result = await toggleTipoMovimiento(item.id);
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

    // Bulk import
    const bulkColumns = [
        { field: 'nombre', label: 'Nombre', required: true, placeholder: 'Ej: DONACIÓN', width: '1.5' },
        { field: 'descripcion', label: 'Descripción', placeholder: 'Descripción opcional', width: '2' }
    ];

    const handleBulkSave = async (rows) => {
        return await createTiposMovimientoBulk(rows);
    };

    const handleBulkSuccess = (result, message) => {
        setFormSuccess(message);
        refetch();
        setTimeout(() => setFormSuccess(null), 5000);
    };

    return (
        <DSPage>
            <DSPageHeader
                title="Tipos de Movimiento"
                icon={<Settings2 size={22} />}
                actions={
                    <div className="ds-header__actions-row">
                        <SecuredButton
                            securityId="tiposmovimiento.crear"
                            securityDesc="Ingreso masivo de tipos"
                            variant="secondary"
                            icon={<Upload size={16} />}
                            onClick={() => setBulkModalOpen(true)}
                        >
                            Ingreso Masivo
                        </SecuredButton>
                        <SecuredButton
                            securityId="tiposmovimiento.crear"
                            securityDesc="Crear nuevo tipo de movimiento"
                            variant="primary"
                            icon={<Plus size={16} />}
                            onClick={openCreate}
                        >
                            Nuevo Tipo
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
                title="Listado de Tipos"
                actions={
                    <div className="ds-section__actions-row">
                        <DSRefreshButton onClick={refetch} loading={loading} />
                        <span className="diesel-panel__count">{tipos.length} tipos</span>
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
                                    <th style={{ width: '30%' }}>Nombre</th>
                                    <th style={{ width: '35%' }}>Descripción</th>
                                    <th style={{ width: '10%' }}>Estado</th>
                                    <th style={{ width: '15%' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tipos.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="ds-table__empty">
                                            No hay tipos registrados
                                        </td>
                                    </tr>
                                ) : (
                                    tipos.map(item => (
                                        <tr key={item.id}>
                                            <td>{item.id}</td>
                                            <td><strong>{item.nombre}</strong></td>
                                            <td>{item.descripcion || '-'}</td>
                                            <td>
                                                <DSBadge variant={item.is_active ? 'success' : 'error'}>
                                                    {item.is_active ? 'Activo' : 'Inactivo'}
                                                </DSBadge>
                                            </td>
                                            <td>
                                                <div className="ds-table__actions">
                                                    <SecuredButton
                                                        securityId="tiposmovimiento.editar"
                                                        securityDesc="Editar tipo de movimiento"
                                                        size="sm"
                                                        iconOnly
                                                        icon={<Pencil size={15} />}
                                                        onClick={() => openEdit(item)}
                                                        title="Editar"
                                                    />
                                                    <SecuredButton
                                                        securityId="tiposmovimiento.toggle"
                                                        securityDesc="Activar/Desactivar tipo de movimiento"
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

            <DSModal
                isOpen={modalOpen}
                onClose={closeModal}
                title={editingItem ? 'Editar Tipo' : 'Nuevo Tipo de Movimiento'}
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

                <DSModalSection title="Información del Tipo">
                    <form className="diesel-form" onSubmit={e => e.preventDefault()}>
                        <FormField label="Nombre" required help="Ej: DONACIÓN, PRÉSTAMO, DEVOLUCIÓN">
                            <input
                                type="text"
                                className="ds-field__control"
                                value={form.nombre}
                                onChange={handleChange('nombre')}
                                placeholder="Ej: PRÉSTAMO"
                            />
                        </FormField>

                        <FormField label="Descripción" help="Breve descripción del motivo de este movimiento">
                            <textarea
                                className="ds-field__control"
                                rows="3"
                                value={form.descripcion}
                                onChange={handleChange('descripcion')}
                                placeholder="Descripción opcional..."
                            />
                        </FormField>
                    </form>
                </DSModalSection>
            </DSModal>

            <DSBulkImportModal
                isOpen={bulkModalOpen}
                onClose={() => setBulkModalOpen(false)}
                title="Ingreso Masivo de Tipos de Movimiento"
                columns={bulkColumns}
                onSave={handleBulkSave}
                onSuccess={handleBulkSuccess}
                entityName="tipo de movimiento"
            />
        </DSPage>
    );
}

export default TiposMovimientoPage;
