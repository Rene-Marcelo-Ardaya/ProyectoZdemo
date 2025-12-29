import React, { useState, useEffect, useCallback } from 'react';
import { Cog, Plus, Pencil, Power, HelpCircle } from 'lucide-react';
import {
    getMaquinas,
    getMaquina,
    createMaquina,
    updateMaquina,
    toggleMaquina,
    comboDivisiones
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
} from '../../ds-components';

import './DieselPages.css';

function useMaquinas() {
    const [maquinas, setMaquinas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getMaquinas();
            setMaquinas(result.data || []);
        } catch (err) {
            setError('Error cargando datos');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { maquinas, loading, error, refetch: fetchData };
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

export function MaquinasPage() {
    const { maquinas, loading, error: loadError, refetch } = useMaquinas();
    const divisiones = useDivisiones();

    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState(null);
    const [formSuccess, setFormSuccess] = useState(null);
    const [editingItem, setEditingItem] = useState(null);

    const [form, setForm] = useState({
        codigo: '',
        d_division_id: ''
    });

    const resetForm = useCallback(() => {
        setForm({ codigo: '', d_division_id: '' });
        setEditingItem(null);
        setFormError(null);
    }, []);

    const openCreate = () => {
        resetForm();
        setModalOpen(true);
    };

    const openEdit = async (item) => {
        const detail = await getMaquina(item.id);
        if (detail.data) {
            setEditingItem(item);
            setForm({
                codigo: detail.data.codigo || '',
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
        if (!form.codigo.trim()) return 'El código es requerido';
        if (!form.d_division_id) return 'La división es requerida';
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
                codigo: form.codigo,
                d_division_id: form.d_division_id
            };

            let result;
            if (editingItem) {
                result = await updateMaquina(editingItem.id, payload);
            } else {
                result = await createMaquina(payload);
            }

            if (result.success) {
                setFormSuccess(editingItem ? 'Máquina actualizada' : 'Máquina creada');
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
        if (!window.confirm(`¿${action.charAt(0).toUpperCase() + action.slice(1)} "${item.codigo}"?`)) return;

        try {
            const result = await toggleMaquina(item.id);
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
                title="Gestión de Máquinas"
                icon={<Cog size={22} />}
                actions={
                    <SecuredButton
                        securityId="maquinas.crear"
                        securityDesc="Crear nueva máquina"
                        variant="primary"
                        icon={<Plus size={16} />}
                        onClick={openCreate}
                    >
                        Nueva Máquina
                    </SecuredButton>
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
                title="Listado de Máquinas"
                actions={<span className="diesel-panel__count">{maquinas.length} máquinas</span>}
            >
                <div className="ds-table-wrapper">
                    {loading ? (
                        <DSLoading text="Cargando..." />
                    ) : (
                        <table className="ds-table ds-table--striped ds-table--hover">
                            <thead>
                                <tr>
                                    <th style={{ width: '10%' }}>ID</th>
                                    <th style={{ width: '30%' }}>Código</th>
                                    <th style={{ width: '30%' }}>División</th>
                                    <th style={{ width: '15%' }}>Estado</th>
                                    <th style={{ width: '15%' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {maquinas.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="ds-table__empty">
                                            No hay máquinas registradas
                                        </td>
                                    </tr>
                                ) : (
                                    maquinas.map(item => (
                                        <tr key={item.id}>
                                            <td>{item.id}</td>
                                            <td><strong>{item.codigo}</strong></td>
                                            <td>{item.division?.nombre || '-'}</td>
                                            <td>
                                                <DSBadge variant={item.is_active ? 'success' : 'error'}>
                                                    {item.is_active ? 'Activo' : 'Inactivo'}
                                                </DSBadge>
                                            </td>
                                            <td>
                                                <div className="ds-table__actions">
                                                    <SecuredButton
                                                        securityId="maquinas.editar"
                                                        securityDesc="Editar máquina"
                                                        size="sm"
                                                        iconOnly
                                                        icon={<Pencil size={15} />}
                                                        onClick={() => openEdit(item)}
                                                        title="Editar"
                                                    />
                                                    <SecuredButton
                                                        securityId="maquinas.toggle"
                                                        securityDesc="Activar/Desactivar máquina"
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
                title={editingItem ? 'Editar Máquina' : 'Nueva Máquina'}
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

                <DSModalSection title="Información de la Máquina">
                    <form className="diesel-form" onSubmit={e => e.preventDefault()}>
                        <FormField label="Código" required help="Código único de la máquina. Ej: D6M, JD-8430">
                            <input
                                type="text"
                                className="ds-field__control"
                                value={form.codigo}
                                onChange={handleChange('codigo')}
                                placeholder="Ej: D6M"
                            />
                        </FormField>

                        <FormField label="División" required help="División a la que pertenece esta máquina.">
                            <select
                                className="ds-field__control"
                                value={form.d_division_id}
                                onChange={handleChange('d_division_id')}
                            >
                                <option value="">-- Seleccionar --</option>
                                {divisiones.map(div => (
                                    <option key={div.id} value={div.id}>{div.nombre}</option>
                                ))}
                            </select>
                        </FormField>
                    </form>
                </DSModalSection>
            </DSModal>
        </DSPage>
    );
}

export default MaquinasPage;
