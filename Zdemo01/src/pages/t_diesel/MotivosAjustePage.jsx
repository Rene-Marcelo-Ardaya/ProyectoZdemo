import React, { useState, useEffect, useCallback } from 'react';
import { ClipboardList, Plus, Pencil, Power, HelpCircle } from 'lucide-react';
import { getMotivosAjuste, getMotivoAjuste, createMotivoAjuste, updateMotivoAjuste, toggleMotivoAjuste } from '../../services/dieselService';

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

function useMotivosAjuste() {
    const [motivos, setMotivos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getMotivosAjuste();
            setMotivos(result.data || []);
        } catch (err) {
            setError('Error cargando datos');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { motivos, loading, error, refetch: fetchData };
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

export function MotivosAjustePage() {
    const { motivos, loading, error: loadError, refetch } = useMotivosAjuste();

    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState(null);
    const [formSuccess, setFormSuccess] = useState(null);
    const [editingItem, setEditingItem] = useState(null);

    const [form, setForm] = useState({ nombre: '' });

    const resetForm = useCallback(() => {
        setForm({ nombre: '' });
        setEditingItem(null);
        setFormError(null);
    }, []);

    const openCreate = () => {
        resetForm();
        setModalOpen(true);
    };

    const openEdit = async (item) => {
        const detail = await getMotivoAjuste(item.id);
        if (detail.data) {
            setEditingItem(item);
            setForm({ nombre: detail.data.nombre });
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
            const payload = { nombre: form.nombre };
            let result;
            if (editingItem) {
                result = await updateMotivoAjuste(editingItem.id, payload);
            } else {
                result = await createMotivoAjuste(payload);
            }

            if (result.success) {
                setFormSuccess(editingItem ? 'Motivo de ajuste actualizado' : 'Motivo de ajuste creado');
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
            const result = await toggleMotivoAjuste(item.id);
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

    return (
        <DSPage>
            <DSPageHeader
                title="Gestión de Motivos de Ajuste"
                icon={<ClipboardList size={22} />}
                actions={
                    <DSButton variant="primary" icon={<Plus size={16} />} onClick={openCreate}>
                        Nuevo Motivo
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
                title="Listado de Motivos de Ajuste"
                actions={<span className="diesel-panel__count">{motivos.length} motivos</span>}
            >
                <div className="ds-table-wrapper">
                    {loading ? (
                        <DSLoading text="Cargando..." />
                    ) : (
                        <table className="ds-table ds-table--striped ds-table--hover">
                            <thead>
                                <tr>
                                    <th style={{ width: '10%' }}>ID</th>
                                    <th style={{ width: '60%' }}>Nombre</th>
                                    <th style={{ width: '15%' }}>Estado</th>
                                    <th style={{ width: '15%' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {motivos.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="ds-table__empty">
                                            No hay motivos de ajuste registrados
                                        </td>
                                    </tr>
                                ) : (
                                    motivos.map(item => (
                                        <tr key={item.id}>
                                            <td>{item.id}</td>
                                            <td><strong>{item.nombre}</strong></td>
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
                title={editingItem ? 'Editar Motivo de Ajuste' : 'Nuevo Motivo de Ajuste'}
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

                <DSModalSection title="Información del Motivo">
                    <form className="diesel-form" onSubmit={e => e.preventDefault()}>
                        <FormField label="Nombre" required help="Ej: Reseteo de medidor, Derrame, Corrección.">
                            <input
                                type="text"
                                className="ds-field__control"
                                value={form.nombre}
                                onChange={handleChange('nombre')}
                                placeholder="Ej: Reseteo de medidor"
                            />
                        </FormField>
                    </form>
                </DSModalSection>
            </DSModal>
        </DSPage>
    );
}

export default MotivosAjustePage;
