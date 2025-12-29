import React, { useState, useEffect, useCallback } from 'react';
import { Hammer, Plus, Pencil, Power, HelpCircle } from 'lucide-react';
import { getTrabajos, getTrabajo, createTrabajo, updateTrabajo, toggleTrabajo } from '../../services/dieselService';

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

// ============================================
// CUSTOM HOOK: useTrabajos
// ============================================
function useTrabajos() {
    const [trabajos, setTrabajos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getTrabajos();
            setTrabajos(result.data || []);
        } catch (err) {
            setError('Error cargando datos');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { trabajos, loading, error, refetch: fetchData };
}

// ============================================
// COMPONENTE: Tooltip
// ============================================
function Tooltip({ text }) {
    return (
        <span className="diesel-tooltip">
            <HelpCircle size={14} />
            <span className="diesel-tooltip__text">{text}</span>
        </span>
    );
}

// ============================================
// COMPONENTE: FormField
// ============================================
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

// ============================================
// COMPONENTE PRINCIPAL: TrabajosPage
// ============================================
export function TrabajosPage() {
    const { trabajos, loading, error: loadError, refetch } = useTrabajos();

    // Estado del formulario
    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState(null);
    const [formSuccess, setFormSuccess] = useState(null);
    const [editingItem, setEditingItem] = useState(null);

    const [form, setForm] = useState({
        nombre: ''
    });

    // Reset form
    const resetForm = useCallback(() => {
        setForm({ nombre: '' });
        setEditingItem(null);
        setFormError(null);
    }, []);

    // Abrir modal para crear
    const openCreate = () => {
        resetForm();
        setModalOpen(true);
    };

    // Abrir modal para editar
    const openEdit = async (item) => {
        const detail = await getTrabajo(item.id);
        if (detail.data) {
            setEditingItem(item);
            setForm({
                nombre: detail.data.nombre
            });
            setFormError(null);
            setModalOpen(true);
        }
    };

    // Cerrar modal
    const closeModal = () => {
        setModalOpen(false);
        resetForm();
    };

    // Manejar cambios del form
    const handleChange = (field) => (e) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
    };

    // Validar formulario
    const validateForm = () => {
        if (!form.nombre.trim()) return 'El nombre es requerido';
        return null;
    };

    // Guardar
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
                result = await updateTrabajo(editingItem.id, payload);
            } else {
                result = await createTrabajo(payload);
            }

            if (result.success) {
                setFormSuccess(editingItem ? 'Trabajo actualizado' : 'Trabajo creado');
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

    // Toggle activo/inactivo
    const handleToggle = async (item) => {
        const action = item.is_active ? 'desactivar' : 'activar';
        if (!window.confirm(`¿${action.charAt(0).toUpperCase() + action.slice(1)} "${item.nombre}"?`)) return;

        try {
            const result = await toggleTrabajo(item.id);
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
            {/* HEADER */}
            <DSPageHeader
                title="Gestión de Trabajos"
                icon={<Hammer size={22} />}
                actions={
                    <DSButton variant="primary" icon={<Plus size={16} />} onClick={openCreate}>
                        Nuevo Trabajo
                    </DSButton>
                }
            />

            {/* ALERTAS */}
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

            {/* TABLA */}
            <DSSection
                title="Listado de Trabajos"
                actions={<span className="diesel-panel__count">{trabajos.length} trabajos</span>}
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
                                {trabajos.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="ds-table__empty">
                                            No hay trabajos registrados
                                        </td>
                                    </tr>
                                ) : (
                                    trabajos.map(item => (
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

            {/* MODAL */}
            <DSModal
                isOpen={modalOpen}
                onClose={closeModal}
                title={editingItem ? 'Editar Trabajo' : 'Nuevo Trabajo'}
                size="md"
                footer={
                    <>
                        <DSButton onClick={closeModal} disabled={saving}>
                            Cancelar
                        </DSButton>
                        <DSButton
                            variant="primary"
                            onClick={handleSave}
                            disabled={saving}
                            loading={saving}
                        >
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

                <DSModalSection title="Información del Trabajo">
                    <form className="diesel-form" onSubmit={e => e.preventDefault()}>
                        <FormField
                            label="Nombre del Trabajo"
                            required
                            help="Tipo de trabajo que realizan las máquinas. Ej: Desmonte, Agricultura."
                        >
                            <input
                                type="text"
                                className="ds-field__control"
                                value={form.nombre}
                                onChange={handleChange('nombre')}
                                placeholder="Ej: Desmonte"
                            />
                        </FormField>
                    </form>
                </DSModalSection>
            </DSModal>
        </DSPage>
    );
}

export default TrabajosPage;
