import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Plus, Pencil, Trash2, Save, Users, UserPlus, UserMinus, HelpCircle, Palette } from 'lucide-react';
import {
    fetchNiveles,
    createNivel,
    updateNivel,
    deleteNivel,
    fetchMiembros,
    addMiembro,
    removeMiembro,
    fetchEmpleadosDisponibles
} from '../../services/securityLevelService';

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
} from '../../ds-components';

import './NivelesSeguridadPage.css';

// ============================================
// CUSTOM HOOK: useNiveles
// ============================================
function useNiveles() {
    const [niveles, setNiveles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchNiveles();
            if (result.success) {
                setNiveles(result.data || []);
            } else {
                setError('Error cargando niveles');
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

    return { niveles, loading, error, refetch: fetchData };
}

// ============================================
// COMPONENTE: Tooltip
// ============================================
function Tooltip({ text }) {
    return (
        <span className="niveles-tooltip">
            <HelpCircle size={14} />
            <span className="niveles-tooltip__text">{text}</span>
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
// COMPONENTE: ColorPicker simple
// ============================================
const PRESET_COLORS = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#6b7280', // gray
];

function ColorPicker({ value, onChange }) {
    return (
        <div className="niveles-color-picker">
            <div className="niveles-color-picker__presets">
                {PRESET_COLORS.map(color => (
                    <button
                        key={color}
                        type="button"
                        className={`niveles-color-picker__swatch ${value === color ? 'is-selected' : ''}`}
                        style={{ background: color }}
                        onClick={() => onChange(color)}
                        title={color}
                    />
                ))}
            </div>
            <input
                type="color"
                value={value || '#6b7280'}
                onChange={(e) => onChange(e.target.value)}
                className="niveles-color-picker__input"
            />
        </div>
    );
}

// ============================================
// COMPONENTE: MiembrosModal
// ============================================
function MiembrosModal({ isOpen, onClose, nivel, onUpdate }) {
    const [miembros, setMiembros] = useState([]);
    const [disponibles, setDisponibles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedToAdd, setSelectedToAdd] = useState([]);

    useEffect(() => {
        if (isOpen && nivel) {
            loadData();
        }
    }, [isOpen, nivel]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [miembrosRes, disponiblesRes] = await Promise.all([
                fetchMiembros(nivel.id),
                fetchEmpleadosDisponibles(nivel.id)
            ]);
            setMiembros(miembrosRes.data || []);
            setDisponibles(disponiblesRes.data || []);
        } catch (err) {
            console.error('Error loading members:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMiembros = async () => {
        if (selectedToAdd.length === 0) return;
        setSaving(true);
        try {
            await addMiembro(nivel.id, selectedToAdd);
            setSelectedToAdd([]);
            await loadData();
            onUpdate();
        } catch (err) {
            console.error('Error adding members:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveMiembro = async (personaId) => {
        if (!window.confirm('¿Quitar este empleado del grupo?')) return;
        setSaving(true);
        try {
            await removeMiembro(nivel.id, personaId);
            await loadData();
            onUpdate();
        } catch (err) {
            console.error('Error removing member:', err);
        } finally {
            setSaving(false);
        }
    };

    const toggleSelected = (id) => {
        setSelectedToAdd(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    return (
        <DSModal
            isOpen={isOpen}
            onClose={onClose}
            title={`Miembros de "${nivel?.nombre}"`}
            icon={<Users size={20} />}
            size="lg"
        >
            {loading ? (
                <DSLoading text="Cargando miembros..." />
            ) : (
                <div className="niveles-miembros">
                    {/* Miembros actuales */}
                    <DSModalSection title="Miembros Actuales" icon={<Users size={16} />}>
                        {miembros.length === 0 ? (
                            <p className="niveles-miembros__empty">No hay miembros en este grupo</p>
                        ) : (
                            <div className="niveles-miembros__list">
                                {miembros.map(m => (
                                    <div key={m.id} className="niveles-miembros__item">
                                        <div className="niveles-miembros__info">
                                            <strong>{m.nombre} {m.apellido_paterno} {m.apellido_materno}</strong>
                                            <span className="niveles-miembros__meta">
                                                CI: {m.ci} • {m.cargo?.nombre || 'Sin cargo'}
                                            </span>
                                        </div>
                                        <DSButton
                                            size="sm"
                                            variant="outline-danger"
                                            iconOnly
                                            icon={<UserMinus size={14} />}
                                            onClick={() => handleRemoveMiembro(m.id)}
                                            disabled={saving}
                                            title="Quitar del grupo"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </DSModalSection>

                    {/* Agregar miembros */}
                    <DSModalSection title="Agregar Miembros" icon={<UserPlus size={16} />}>
                        {disponibles.length === 0 ? (
                            <p className="niveles-miembros__empty">No hay empleados disponibles</p>
                        ) : (
                            <>
                                <div className="niveles-miembros__list niveles-miembros__list--selectable">
                                    {disponibles.map(e => (
                                        <label key={e.id} className="niveles-miembros__item niveles-miembros__item--selectable">
                                            <input
                                                type="checkbox"
                                                checked={selectedToAdd.includes(e.id)}
                                                onChange={() => toggleSelected(e.id)}
                                            />
                                            <div className="niveles-miembros__info">
                                                <strong>{e.nombre} {e.apellido_paterno} {e.apellido_materno}</strong>
                                                <span className="niveles-miembros__meta">
                                                    CI: {e.ci} • {e.cargo?.nombre || 'Sin cargo'}
                                                </span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                <div className="niveles-miembros__actions">
                                    <DSButton
                                        variant="primary"
                                        icon={<UserPlus size={16} />}
                                        onClick={handleAddMiembros}
                                        disabled={selectedToAdd.length === 0 || saving}
                                        loading={saving}
                                    >
                                        Agregar Seleccionados ({selectedToAdd.length})
                                    </DSButton>
                                </div>
                            </>
                        )}
                    </DSModalSection>
                </div>
            )}
        </DSModal>
    );
}

// ============================================
// COMPONENTE PRINCIPAL: NivelesSeguridadPage
// ============================================
export function NivelesSeguridadPage() {
    const { niveles, loading, error: loadError, refetch } = useNiveles();

    // Estado del formulario
    const [modalOpen, setModalOpen] = useState(false);
    const [miembrosModalOpen, setMiembrosModalOpen] = useState(false);
    const [selectedNivel, setSelectedNivel] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState(null);
    const [formSuccess, setFormSuccess] = useState(null);
    const [editingNivel, setEditingNivel] = useState(null);

    const [form, setForm] = useState({
        nombre: '',
        color: '#3b82f6',
        descripcion: '',
        is_active: true,
    });

    // Reset form
    const resetForm = useCallback(() => {
        setForm({ nombre: '', color: '#3b82f6', descripcion: '', is_active: true });
        setEditingNivel(null);
        setFormError(null);
    }, []);

    // Abrir modal para crear
    const openCreate = () => {
        resetForm();
        setModalOpen(true);
    };

    // Abrir modal para editar
    const openEdit = (nivel) => {
        setEditingNivel(nivel);
        setForm({
            nombre: nivel.nombre,
            color: nivel.color || '#6b7280',
            descripcion: nivel.descripcion || '',
            is_active: nivel.is_active === true || nivel.is_active == 1,
        });
        setFormError(null);
        setModalOpen(true);
    };

    // Abrir modal de miembros
    const openMiembros = (nivel) => {
        setSelectedNivel(nivel);
        setMiembrosModalOpen(true);
    };

    // Cerrar modales
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

    // Guardar nivel
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
            if (editingNivel) {
                result = await updateNivel(editingNivel.id, form);
            } else {
                result = await createNivel(form);
            }

            if (result.success) {
                setFormSuccess(editingNivel ? 'Grupo actualizado' : 'Grupo creado');
                closeModal();
                refetch();
                setTimeout(() => setFormSuccess(null), 3000);
            } else {
                setFormError(result.message || 'Error guardando');
            }
        } catch (err) {
            setFormError('Error de conexión');
        } finally {
            setSaving(false);
        }
    };

    // Eliminar nivel
    const handleDelete = async (nivel) => {
        if (nivel.personal_count > 0) {
            alert('No se puede eliminar: hay empleados asignados a este grupo');
            return;
        }
        if (!window.confirm(`¿Eliminar grupo "${nivel.nombre}"?`)) return;

        try {
            const result = await deleteNivel(nivel.id);
            if (result.success) {
                setFormSuccess('Grupo eliminado');
                refetch();
                setTimeout(() => setFormSuccess(null), 3000);
            } else {
                alert(result.message || 'Error eliminando');
            }
        } catch (err) {
            alert('Error de conexión');
        }
    };

    return (
        <DSPage>
            {/* HEADER */}
            <DSPageHeader
                title="Grupos de Seguridad"
                icon={<Shield size={22} />}
                actions={
                    <DSButton variant="primary" icon={<Plus size={16} />} onClick={openCreate}>
                        Nuevo Grupo
                    </DSButton>
                }
            />

            {/* ALERTAS */}
            {formSuccess && (
                <DSAlert variant="success" dismissible onDismiss={() => setFormSuccess(null)} className="niveles-alert-margin">
                    {formSuccess}
                </DSAlert>
            )}
            {loadError && (
                <DSAlert variant="error" className="niveles-alert-margin">
                    {loadError}
                </DSAlert>
            )}

            {/* TABLA */}
            <DSSection
                title="Grupos de Seguridad del Sistema"
                actions={<span className="niveles-panel__count">{niveles.length} grupos</span>}
            >
                <div className="ds-table-wrapper">
                    {loading ? (
                        <DSLoading text="Cargando..." />
                    ) : (
                        <table className="ds-table ds-table--striped ds-table--hover">
                            <thead>
                                <tr>
                                    <th style={{ width: '5%' }}>ID</th>
                                    <th style={{ width: '8%' }}>Color</th>
                                    <th style={{ width: '20%' }}>Nombre</th>
                                    <th style={{ width: '30%' }}>Descripción</th>
                                    <th style={{ width: '10%' }}>Miembros</th>
                                    <th style={{ width: '10%' }}>Componentes</th>
                                    <th style={{ width: '8%' }}>Estado</th>
                                    <th style={{ width: '12%' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {niveles.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="ds-table__empty">
                                            No hay grupos de seguridad registrados
                                        </td>
                                    </tr>
                                ) : (
                                    niveles.map(nivel => (
                                        <tr key={nivel.id}>
                                            <td>{nivel.id}</td>
                                            <td>
                                                <span
                                                    className="niveles-color-dot"
                                                    style={{ background: nivel.color || '#6b7280' }}
                                                    title={nivel.color}
                                                />
                                            </td>
                                            <td><strong>{nivel.nombre}</strong></td>
                                            <td>{nivel.descripcion || '-'}</td>
                                            <td className="ds-table__center">
                                                <DSCount variant="purple" icon={<Users size={12} />}>
                                                    {nivel.personal_count || 0}
                                                </DSCount>
                                            </td>
                                            <td className="ds-table__center">
                                                <DSCount>
                                                    {nivel.componentes_count || 0}
                                                </DSCount>
                                            </td>
                                            <td>
                                                <DSBadge variant={nivel.is_active ? 'success' : 'error'}>
                                                    {nivel.is_active ? 'Activo' : 'Inactivo'}
                                                </DSBadge>
                                            </td>
                                            <td>
                                                <div className="ds-table__actions">
                                                    <DSButton
                                                        size="sm"
                                                        iconOnly
                                                        icon={<Users size={15} />}
                                                        onClick={() => openMiembros(nivel)}
                                                        title="Gestionar Miembros"
                                                    />
                                                    <DSButton
                                                        size="sm"
                                                        iconOnly
                                                        icon={<Pencil size={15} />}
                                                        onClick={() => openEdit(nivel)}
                                                        title="Editar"
                                                    />
                                                    <DSButton
                                                        size="sm"
                                                        variant="outline-danger"
                                                        iconOnly
                                                        icon={<Trash2 size={15} />}
                                                        onClick={() => handleDelete(nivel)}
                                                        title="Eliminar"
                                                        disabled={(nivel.personal_count || 0) > 0}
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

            {/* MODAL CREAR/EDITAR */}
            <DSModal
                isOpen={modalOpen}
                onClose={closeModal}
                title={editingNivel ? 'Editar Grupo' : 'Nuevo Grupo de Seguridad'}
                icon={<Shield size={20} />}
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
                    <DSAlert variant="error" dismissible onDismiss={() => setFormError(null)} className="niveles-alert-margin">
                        {formError}
                    </DSAlert>
                )}

                <DSModalSection title="Información del Grupo">
                    <form className="niveles-form" onSubmit={e => e.preventDefault()}>
                        <FormField
                            label="Nombre del Grupo"
                            required
                            help="Nombre identificativo del grupo. Ej: Administración, Operaciones."
                        >
                            <input
                                type="text"
                                className="ds-field__control"
                                value={form.nombre}
                                onChange={handleChange('nombre')}
                                placeholder="Ej: Administración"
                            />
                        </FormField>

                        <FormField
                            label="Color"
                            help="Color para identificar visualmente el grupo."
                        >
                            <ColorPicker
                                value={form.color}
                                onChange={(color) => setForm(prev => ({ ...prev, color }))}
                            />
                        </FormField>

                        <FormField
                            label="Descripción"
                            help="Breve explicación del propósito del grupo."
                        >
                            <textarea
                                className="ds-field__control niveles-textarea"
                                value={form.descripcion}
                                onChange={handleChange('descripcion')}
                                placeholder="Descripción del grupo..."
                                rows={3}
                            />
                        </FormField>

                        <FormField
                            label="Estado"
                            help="Los grupos inactivos no se pueden asignar a componentes."
                        >
                            <label className="niveles-checkbox">
                                <input
                                    type="checkbox"
                                    checked={form.is_active}
                                    onChange={handleChange('is_active')}
                                />
                                <span>Grupo Activo</span>
                            </label>
                        </FormField>
                    </form>
                </DSModalSection>
            </DSModal>

            {/* MODAL MIEMBROS */}
            <MiembrosModal
                isOpen={miembrosModalOpen}
                onClose={() => setMiembrosModalOpen(false)}
                nivel={selectedNivel}
                onUpdate={refetch}
            />
        </DSPage>
    );
}

export default NivelesSeguridadPage;
