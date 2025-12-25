import React, { useState, useEffect, useCallback } from 'react';
import { Briefcase, Plus, Pencil, Trash2, Save, Users } from 'lucide-react';
import { fetchCargos, getCargo, createCargo, updateCargo, deleteCargo } from '../../services/cargoService';

import {
    DSPage,
    DSPageHeader,
    DSSection,
    DSAlert,
    DSButton,
    DSLoading,
    DSBadge,
    DSModal,
    DSTextField,
    DSTextArea,
    DSEmpty,
    DSTooltip,
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
            const result = await fetchCargos();
            if (result.success) {
                setCargos(result.data || []);
            } else {
                setError(result.error || 'Error cargando cargos');
            }
        } catch (err) {
            setError('Error de conexión');
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
// COMPONENTE: FormField
// ============================================
function FormField({ label, children, required, help }) {
    const labelContent = (
        <>
            {label}
            {help && <DSTooltip text={help} />}
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
// COMPONENTE: CargosTable
// ============================================
function CargosTable({ data, onEdit, onDelete }) {
    if (data.length === 0) {
        return (
            <DSEmpty
                icon={<Briefcase size={48} />}
                title="No hay cargos registrados"
                description="Crea el primer cargo para comenzar"
            />
        );
    }

    return (
        <div className="cargos-table">
            <table>
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
                    {data.map(cargo => (
                        <tr key={cargo.id}>
                            <td>{cargo.id}</td>
                            <td><strong>{cargo.nombre}</strong></td>
                            <td className="cargos-description">{cargo.descripcion || '-'}</td>
                            <td className="cargos-count">
                                <span className="cargos-count-badge">
                                    <Users size={12} />
                                    {cargo.personal_count}
                                </span>
                            </td>
                            <td>
                                <DSBadge variant={cargo.is_active ? 'success' : 'warning'}>
                                    {cargo.is_active ? 'Activo' : 'Inactivo'}
                                </DSBadge>
                            </td>
                            <td>
                                <div className="cargos-actions">
                                    <SecuredButton
                                        securityId="cargos.editar"
                                        securityDesc="Editar cargo"
                                        size="sm"
                                        iconOnly
                                        icon={<Pencil size={14} />}
                                        onClick={() => onEdit(cargo)}
                                        title="Editar"
                                    />
                                    <SecuredButton
                                        securityId="cargos.eliminar"
                                        securityDesc="Eliminar cargo"
                                        size="sm"
                                        variant="outline-danger"
                                        iconOnly
                                        icon={<Trash2 size={14} />}
                                        onClick={() => onDelete(cargo)}
                                        title="Eliminar"
                                        disabled={cargo.personal_count > 0}
                                    />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
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
    const [alert, setAlert] = useState(null);
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
        const result = await getCargo(cargo.id);
        if (result.success) {
            setEditingCargo(cargo);
            setForm({
                nombre: result.data.nombre,
                descripcion: result.data.descripcion || '',
                is_active: result.data.is_active
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
        const value = e.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e;
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
                descripcion: form.descripcion || null,
                is_active: form.is_active
            };

            let result;
            if (editingCargo) {
                result = await updateCargo(editingCargo.id, payload);
            } else {
                result = await createCargo(payload);
            }

            if (result.success) {
                setAlert({ type: 'success', message: editingCargo ? 'Cargo actualizado' : 'Cargo creado' });
                closeModal();
                refetch();
            } else {
                setFormError(result.error || 'Error guardando');
            }
        } catch (err) {
            setFormError('Error de conexión');
        } finally {
            setSaving(false);
        }
    };

    // Eliminar cargo
    const handleDelete = async (cargo) => {
        if (cargo.personal_count > 0) {
            setAlert({ type: 'error', message: `No se puede eliminar: el cargo tiene ${cargo.personal_count} empleado(s) asignado(s)` });
            return;
        }

        if (!window.confirm(`¿Eliminar cargo "${cargo.nombre}"?`)) return;

        try {
            const result = await deleteCargo(cargo.id);
            if (result.success) {
                setAlert({ type: 'success', message: 'Cargo eliminado' });
                refetch();
            } else {
                setAlert({ type: 'error', message: result.error || 'Error eliminando' });
            }
        } catch (err) {
            setAlert({ type: 'error', message: 'Error de conexión' });
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
            {alert && (
                <DSAlert
                    variant={alert.type}
                    dismissible
                    onDismiss={() => setAlert(null)}
                    className="mb-3"
                >
                    {alert.message}
                </DSAlert>
            )}
            {loadError && (
                <DSAlert variant="error" className="mb-3">
                    {loadError}
                </DSAlert>
            )}

            {/* TABLA */}
            <DSSection
                title="Listado de Cargos"
                actions={<span className="cargos-panel__count">{cargos.length} cargos</span>}
            >
                {loading ? (
                    <DSLoading text="Cargando cargos..." />
                ) : (
                    <CargosTable
                        data={cargos}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                    />
                )}
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
                    <DSAlert variant="error" dismissible onDismiss={() => setFormError(null)} className="mb-3">
                        {formError}
                    </DSAlert>
                )}

                <div className="cargos-form">
                    <DSTextField
                        label="Nombre del Cargo"
                        value={form.nombre}
                        onChange={handleChange('nombre')}
                        required
                        placeholder="Ej: Gerente de Ventas"
                        help="Nombre descriptivo del cargo"
                    />

                    <DSTextArea
                        label="Descripción"
                        value={form.descripcion}
                        onChange={handleChange('descripcion')}
                        placeholder="Descripción de funciones y responsabilidades..."
                        rows={4}
                        help="Descripción detallada de las funciones del cargo"
                    />

                    <FormField
                        label="Estado"
                        help="Los cargos inactivos no se pueden asignar a personal"
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
                </div>
            </DSModal>
        </DSPage>
    );
}

export default CargosPage;
