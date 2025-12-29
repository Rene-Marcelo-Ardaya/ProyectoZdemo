import React, { useState, useEffect, useCallback } from 'react';
import { Truck, Plus, Pencil, Power, HelpCircle } from 'lucide-react';
import { getProveedores, getProveedor, createProveedor, updateProveedor, toggleProveedor } from '../../services/dieselService';

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

function useProveedores() {
    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getProveedores();
            setProveedores(result.data || []);
        } catch (err) {
            setError('Error cargando datos');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { proveedores, loading, error, refetch: fetchData };
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

export function ProveedoresPage() {
    const { proveedores, loading, error: loadError, refetch } = useProveedores();

    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState(null);
    const [formSuccess, setFormSuccess] = useState(null);
    const [editingItem, setEditingItem] = useState(null);

    const [form, setForm] = useState({
        nombre: '',
        razon_social: '',
        nit: '',
        telefono: '',
        celular: '',
        direccion: ''
    });

    const resetForm = useCallback(() => {
        setForm({ nombre: '', razon_social: '', nit: '', telefono: '', celular: '', direccion: '' });
        setEditingItem(null);
        setFormError(null);
    }, []);

    const openCreate = () => {
        resetForm();
        setModalOpen(true);
    };

    const openEdit = async (item) => {
        const detail = await getProveedor(item.id);
        if (detail.data) {
            setEditingItem(item);
            setForm({
                nombre: detail.data.nombre || '',
                razon_social: detail.data.razon_social || '',
                nit: detail.data.nit || '',
                telefono: detail.data.telefono || '',
                celular: detail.data.celular || '',
                direccion: detail.data.direccion || ''
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
            let result;
            if (editingItem) {
                result = await updateProveedor(editingItem.id, form);
            } else {
                result = await createProveedor(form);
            }

            if (result.success) {
                setFormSuccess(editingItem ? 'Proveedor actualizado' : 'Proveedor creado');
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
            const result = await toggleProveedor(item.id);
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
                title="Gestión de Proveedores"
                icon={<Truck size={22} />}
                actions={
                    <DSButton variant="primary" icon={<Plus size={16} />} onClick={openCreate}>
                        Nuevo Proveedor
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
                title="Listado de Proveedores"
                actions={<span className="diesel-panel__count">{proveedores.length} proveedores</span>}
            >
                <div className="ds-table-wrapper">
                    {loading ? (
                        <DSLoading text="Cargando..." />
                    ) : (
                        <table className="ds-table ds-table--striped ds-table--hover">
                            <thead>
                                <tr>
                                    <th style={{ width: '5%' }}>ID</th>
                                    <th style={{ width: '25%' }}>Nombre</th>
                                    <th style={{ width: '15%' }}>NIT</th>
                                    <th style={{ width: '15%' }}>Teléfono</th>
                                    <th style={{ width: '15%' }}>Celular</th>
                                    <th style={{ width: '10%' }}>Estado</th>
                                    <th style={{ width: '15%' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {proveedores.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="ds-table__empty">
                                            No hay proveedores registrados
                                        </td>
                                    </tr>
                                ) : (
                                    proveedores.map(item => (
                                        <tr key={item.id}>
                                            <td>{item.id}</td>
                                            <td><strong>{item.nombre}</strong></td>
                                            <td>{item.nit || '-'}</td>
                                            <td>{item.telefono || '-'}</td>
                                            <td>{item.celular || '-'}</td>
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
                title={editingItem ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                size="lg"
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

                <DSModalSection title="Información del Proveedor">
                    <form className="diesel-form" onSubmit={e => e.preventDefault()}>
                        <div className="diesel-form-grid">
                            <FormField label="Nombre" required>
                                <input
                                    type="text"
                                    className="ds-field__control"
                                    value={form.nombre}
                                    onChange={handleChange('nombre')}
                                    placeholder="Nombre comercial"
                                />
                            </FormField>
                            <FormField label="Razón Social">
                                <input
                                    type="text"
                                    className="ds-field__control"
                                    value={form.razon_social}
                                    onChange={handleChange('razon_social')}
                                    placeholder="Razón social"
                                />
                            </FormField>
                            <FormField label="NIT">
                                <input
                                    type="text"
                                    className="ds-field__control"
                                    value={form.nit}
                                    onChange={handleChange('nit')}
                                    placeholder="Número de NIT"
                                />
                            </FormField>
                            <FormField label="Teléfono">
                                <input
                                    type="text"
                                    className="ds-field__control"
                                    value={form.telefono}
                                    onChange={handleChange('telefono')}
                                    placeholder="Teléfono fijo"
                                />
                            </FormField>
                            <FormField label="Celular">
                                <input
                                    type="text"
                                    className="ds-field__control"
                                    value={form.celular}
                                    onChange={handleChange('celular')}
                                    placeholder="Número de celular"
                                />
                            </FormField>
                            <div className="diesel-form-grid--full">
                                <FormField label="Dirección">
                                    <textarea
                                        className="ds-field__control diesel-textarea"
                                        value={form.direccion}
                                        onChange={handleChange('direccion')}
                                        placeholder="Dirección del proveedor"
                                        rows={3}
                                    />
                                </FormField>
                            </div>
                        </div>
                    </form>
                </DSModalSection>
            </DSModal>
        </DSPage>
    );
}

export default ProveedoresPage;
