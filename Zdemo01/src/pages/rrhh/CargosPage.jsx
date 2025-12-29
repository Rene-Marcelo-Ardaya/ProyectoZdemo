import React, { useState, useEffect, useCallback } from 'react';
import { Briefcase, Plus, Pencil, Trash2, Save, Users, HelpCircle } from 'lucide-react';
import { getCargos, getCargo, createCargo, updateCargo, deleteCargo } from '../../services/cargoService';

// Importar componentes DS
import {
    DSPage,
    DSPageHeader,
    DSSection,
    DSAlert,
    DSButton,
    DSLoading,
    DSBadge,
    DSCount,
    DSModal,
    DSModalSection,
    SecuredButton,
} from '../../ds-components';

import './CargosPage.css';

// ============================================
// CUSTOM HOOK: useCargos
// ============================================
function useCargos() {
    const [cargos, setCargos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getCargos();
            setCargos(data || []);
        } catch (err) {
            setError('Error cargando datos');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { cargos, loading, error, refetch: fetchData };
}

// ============================================
// COMPONENTE: Tooltip
// ============================================
function Tooltip({ text }) {
    return (
        <span className="cargos-tooltip">
            <HelpCircle size={14} />
            <span className="cargos-tooltip__text">{text}</span>
        </span>
    );
}

// ============================================
// COMPONENTE: FormField
// ============================================
function FormField({ label, children, required, help }) {
    const labelContent = (
        <>
            {label}
            {help && <Tooltip text={help} />}
        </>
    );

    return (
        <div className="ds-field">
            <label className="ds-field__label">
                <span className="ds-field__label-text">{labelContent}</span>
                {required && <span className="ds-field__required">*</span>}
            </label>
            <div className="ds-field__control-wrapper">
                {children}
            </div>
        </div>
    );
}

// ============================================
// COMPONENTE PRINCIPAL: CargosPage
// ============================================
export function CargosPage() {
    const { cargos, loading, error: loadError, refetch } = useCargos();

    // Estado del formulario
    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState(null);
    const [formSuccess, setFormSuccess] = useState(null);
    const [editingCargo, setEditingCargo] = useState(null);

    const [form, setForm] = useState({
        nombre: '',
        descripcion: '',
        is_active: true
    });

    // Reset form
    const resetForm = useCallback(() => {
        setForm({ nombre: '', descripcion: '', is_active: true });
        setEditingCargo(null);
        setFormError(null);
    }, []);

    // Abrir modal para crear
    const openCreate = () => {
        resetForm();
        setModalOpen(true);
    };

    // Abrir modal para editar
    const openEdit = async (cargo) => {
        const cargoDetail = await getCargo(cargo.id);
        if (cargoDetail) {
            setEditingCargo(cargo);
            setForm({
                nombre: cargoDetail.nombre,
                descripcion: cargoDetail.descripcion || '',
                is_active: cargoDetail.is_active
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
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setForm(prev => ({ ...prev, [field]: value }));
    };

    // Validar formulario
    const validateForm = () => {
        if (!form.nombre.trim()) return 'El nombre es requerido';
        return null;
    };

    // Guardar cargo
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
                descripcion: form.descripcion,
                is_active: form.is_active
            };

            let result;
            if (editingCargo) {
                result = await updateCargo(editingCargo.id, payload);
            } else {
                result = await createCargo(payload);
            }

            if (result.success) {
                setFormSuccess(editingCargo ? 'Cargo actualizado' : 'Cargo creado');
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

    // Eliminar cargo
    const handleDelete = async (cargo) => {
        if (!window.confirm(`¿Eliminar cargo "${cargo.nombre}"?`)) return;

        try {
            const result = await deleteCargo(cargo.id);
            if (result.success) {
                setFormSuccess('Cargo eliminado');
                refetch();
                setTimeout(() => setFormSuccess(null), 3000);
            } else {
                alert(result.error || 'Error eliminando');
            }
        } catch (err) {
            alert('Error de conexión');
        }
    };

    return (
        <DSPage>
            {/* HEADER */}
            <DSPageHeader
                title="Gestión de Cargos"
                icon={<Briefcase size={22} />}
                actions={
                    <SecuredButton
                        securityId="cargos.crear"
                        securityDesc="Crear nuevo cargo"
                        variant="primary"
                        icon={<Plus size={16} />}
                        onClick={openCreate}
                    >
                        Nuevo Cargo
                    </SecuredButton>
                }
            />

            {/* ALERTAS */}
            {formSuccess && (
                <DSAlert variant="success" dismissible onDismiss={() => setFormSuccess(null)} className="cargos-alert-margin">
                    {formSuccess}
                </DSAlert>
            )}
            {loadError && (
                <DSAlert variant="error" className="cargos-alert-margin">
                    {loadError}
                </DSAlert>
            )}

            {/* TABLA */}
            <DSSection
                title="Listado de Cargos"
                actions={<span className="cargos-panel__count">{cargos.length} cargos</span>}
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
                                    <th style={{ width: '40%' }}>Descripción</th>
                                    <th style={{ width: '10%' }}>Personal</th>
                                    <th style={{ width: '10%' }}>Estado</th>
                                    <th style={{ width: '10%' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cargos.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="ds-table__empty">
                                            No hay cargos registrados
                                        </td>
                                    </tr>
                                ) : (
                                    cargos.map(cargo => (
                                        <tr key={cargo.id}>
                                            <td>{cargo.id}</td>
                                            <td><strong>{cargo.nombre}</strong></td>
                                            <td>{cargo.descripcion || '-'}</td>
                                            <td className="ds-table__center">
                                                <DSCount variant="purple" icon={<Users size={12} />}>
                                                    {cargo.personal_count}
                                                </DSCount>
                                            </td>
                                            <td>
                                                <DSBadge variant={cargo.is_active ? 'success' : 'error'}>
                                                    {cargo.is_active ? 'Activo' : 'Inactivo'}
                                                </DSBadge>
                                            </td>
                                            <td>
                                                <div className="ds-table__actions">
                                                    <SecuredButton
                                                        securityId="cargos.editar"
                                                        securityDesc="Editar cargo"
                                                        size="sm"
                                                        iconOnly
                                                        icon={<Pencil size={15} />}
                                                        onClick={() => openEdit(cargo)}
                                                        title="Editar"
                                                    />
                                                    <SecuredButton
                                                        securityId="cargos.eliminar"
                                                        securityDesc="Eliminar cargo"
                                                        size="sm"
                                                        variant="outline-danger"
                                                        iconOnly
                                                        icon={<Trash2 size={15} />}
                                                        onClick={() => handleDelete(cargo)}
                                                        title="Eliminar"
                                                        disabled={cargo.personal_count > 0}
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
                title={editingCargo ? 'Editar Cargo' : 'Nuevo Cargo'}
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
                            icon={!saving && <Save size={16} />}
                        >
                            {saving ? 'Guardando...' : 'Guardar'}
                        </DSButton>
                    </>
                }
            >
                {formError && (
                    <DSAlert variant="error" dismissible onDismiss={() => setFormError(null)} className="cargos-alert-margin">
                        {formError}
                    </DSAlert>
                )}

                <DSModalSection title="Información del Cargo">
                    <form className="cargos-form" onSubmit={e => e.preventDefault()}>
                        <FormField
                            label="Nombre del Cargo"
                            required
                            help="Nombre descriptivo del cargo. Ej: Gerente, Analista, Asistente."
                        >
                            <input
                                type="text"
                                className="ds-field__control"
                                value={form.nombre}
                                onChange={handleChange('nombre')}
                                placeholder="Ej: Gerente de Ventas"
                            />
                        </FormField>

                        <FormField
                            label="Descripción"
                            help="Descripción detallada de las funciones y responsabilidades del cargo."
                        >
                            <textarea
                                className="ds-field__control cargos-textarea"
                                value={form.descripcion}
                                onChange={handleChange('descripcion')}
                                placeholder="Descripción del cargo..."
                                rows={4}
                            />
                        </FormField>

                        <FormField
                            label="Estado"
                            help="Los cargos inactivos no se pueden asignar a personal."
                        >
                            <label className="cargos-checkbox">
                                <input
                                    type="checkbox"
                                    checked={form.is_active}
                                    onChange={handleChange('is_active')}
                                />
                                <span>Cargo Activo</span>
                            </label>
                        </FormField>
                    </form>
                </DSModalSection>
            </DSModal>
        </DSPage>
    );
}

export default CargosPage;
