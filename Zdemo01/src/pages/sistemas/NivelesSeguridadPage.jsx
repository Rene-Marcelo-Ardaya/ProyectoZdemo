import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Shield, Plus, Pencil, Trash2, Save, Users, Box, X, UserPlus, Search } from 'lucide-react';
import {
    fetchNiveles, getNivel, createNivel, updateNivel, deleteNivel,
    fetchMiembros, fetchEmpleadosDisponibles, addMiembro, removeMiembro
} from '../../services/securityLevelService';
import { useSecurity } from '../../core/SecurityContext';

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
                setError(result.error || 'Error cargando niveles');
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
// COMPONENTE: ColorPreview
// ============================================
function ColorPreview({ color, nombre }) {
    return (
        <div className="niveles-color-preview">
            <span
                className="niveles-color-preview__dot"
                style={{ background: color }}
            />
            <span className="niveles-color-preview__nombre">{nombre}</span>
        </div>
    );
}

// ============================================
// COMPONENTE: NivelesTable
// ============================================
function NivelesTable({ data, onEdit, onDelete, onViewMembers }) {
    if (data.length === 0) {
        return (
            <DSEmpty
                icon={<Shield size={48} />}
                title="No hay niveles de seguridad"
                description="Crea el primer nivel para comenzar a proteger componentes"
            />
        );
    }

    return (
        <div className="niveles-table">
            <table>
                <thead>
                    <tr>
                        <th style={{ width: '5%' }}>ID</th>
                        <th style={{ width: '30%' }}>Nombre</th>
                        <th style={{ width: '25%' }}>Descripción</th>
                        <th style={{ width: '12%' }}>Personal</th>
                        <th style={{ width: '12%' }}>Componentes</th>
                        <th style={{ width: '8%' }}>Estado</th>
                        <th style={{ width: '8%' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(nivel => (
                        <tr key={nivel.id}>
                            <td>{nivel.id}</td>
                            <td>
                                <ColorPreview
                                    color={nivel.color}
                                    nombre={nivel.nombre}
                                />
                            </td>
                            <td className="niveles-description">{nivel.descripcion || '-'}</td>
                            <td className="niveles-count">
                                <span className="niveles-count-badge">
                                    <Users size={12} />
                                    {nivel.personal_count}
                                </span>
                            </td>
                            <td className="niveles-count">
                                <span className="niveles-count-badge">
                                    <Box size={12} />
                                    {nivel.componentes_count}
                                </span>
                            </td>
                            <td>
                                <DSBadge variant={nivel.is_active ? 'success' : 'warning'}>
                                    {nivel.is_active ? 'Activo' : 'Inactivo'}
                                </DSBadge>
                            </td>
                            <td>
                                <div className="niveles-actions">
                                    <DSButton
                                        size="sm"
                                        variant="outline"
                                        iconOnly
                                        icon={<Users size={14} />}
                                        onClick={() => onViewMembers(nivel)}
                                        title="Gestionar Personal"
                                    />
                                    <DSButton
                                        size="sm"
                                        iconOnly
                                        icon={<Pencil size={14} />}
                                        onClick={() => onEdit(nivel)}
                                        title="Editar"
                                    />
                                    <DSButton
                                        size="sm"
                                        variant="outline-danger"
                                        iconOnly
                                        icon={<Trash2 size={14} />}
                                        onClick={() => onDelete(nivel)}
                                        title="Eliminar"
                                        disabled={nivel.personal_count > 0 || nivel.componentes_count > 0}
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

// Helper para determinar si un color es claro
function isLightColor(hexColor) {
    if (!hexColor) return true;
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155;
}

// ============================================
// COMPONENTE PRINCIPAL: NivelesSeguridadPage
// ============================================
export function NivelesSeguridadPage() {
    const { niveles, loading, error: loadError, refetch } = useNiveles();
    const { refreshNiveles } = useSecurity();

    // Estado del formulario
    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState(null);
    const [alert, setAlert] = useState(null);
    const [editingNivel, setEditingNivel] = useState(null);

    const [form, setForm] = useState({
        nombre: '',
        color: '#6b7280',
        descripcion: '',
        is_active: true
    });

    // Estado para modal de miembros
    const [miembrosModalOpen, setMiembrosModalOpen] = useState(false);
    const [selectedNivel, setSelectedNivel] = useState(null);
    const [miembros, setMiembros] = useState([]);
    const [empleadosDisponibles, setEmpleadosDisponibles] = useState([]);
    const [loadingMiembros, setLoadingMiembros] = useState(false);
    const [searchEmpleado, setSearchEmpleado] = useState('');

    // Reset form
    const resetForm = useCallback(() => {
        setForm({ nombre: '', color: '#6b7280', descripcion: '', is_active: true });
        setEditingNivel(null);
        setFormError(null);
    }, []);

    // Abrir modal para crear
    const openCreate = () => {
        resetForm();
        setModalOpen(true);
    };

    // Abrir modal para editar
    const openEdit = async (nivel) => {
        const result = await getNivel(nivel.id);
        if (result.success) {
            setEditingNivel(nivel);
            setForm({
                nombre: result.data.nombre,
                color: result.data.color || '#6b7280',
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
            const payload = {
                nombre: form.nombre,
                color: form.color || '#6b7280',
                descripcion: form.descripcion || null,
                is_active: form.is_active
            };

            let result;
            if (editingNivel) {
                result = await updateNivel(editingNivel.id, payload);
            } else {
                result = await createNivel(payload);
            }

            if (result.success) {
                setAlert({ type: 'success', message: editingNivel ? 'Nivel actualizado' : 'Nivel creado' });
                closeModal();
                refetch();
                refreshNiveles(); // Actualizar en SecurityContext
            } else {
                setFormError(result.error || 'Error guardando');
            }
        } catch (err) {
            setFormError('Error de conexión');
        } finally {
            setSaving(false);
        }
    };

    // Eliminar nivel
    const handleDelete = async (nivel) => {
        if (nivel.personal_count > 0 || nivel.componentes_count > 0) {
            setAlert({
                type: 'error',
                message: `No se puede eliminar: el nivel tiene ${nivel.personal_count} empleado(s) y ${nivel.componentes_count} componente(s) asociado(s)`
            });
            return;
        }

        if (!window.confirm(`¿Eliminar nivel "${nivel.nombre}"?`)) return;

        try {
            const result = await deleteNivel(nivel.id);
            if (result.success) {
                setAlert({ type: 'success', message: 'Nivel eliminado' });
                refetch();
                refreshNiveles(); // Actualizar en SecurityContext
            } else {
                setAlert({ type: 'error', message: result.error || 'Error eliminando' });
            }
        } catch (err) {
            setAlert({ type: 'error', message: 'Error de conexión' });
        }
    };

    // ============================================
    // HANDLERS DE MIEMBROS
    // ============================================

    const openMiembrosModal = async (nivel) => {
        setSelectedNivel(nivel);
        setMiembrosModalOpen(true);
        setLoadingMiembros(true);
        setSearchEmpleado('');

        try {
            const [miembrosRes, empleadosRes] = await Promise.all([
                fetchMiembros(nivel.id),
                fetchEmpleadosDisponibles(nivel.id)
            ]);

            if (miembrosRes.success) {
                setMiembros(miembrosRes.data || []);
            }
            if (empleadosRes.success) {
                setEmpleadosDisponibles(empleadosRes.data || []);
            }
        } catch (error) {
            console.error('Error loading miembros:', error);
        } finally {
            setLoadingMiembros(false);
        }
    };

    const closeMiembrosModal = () => {
        setMiembrosModalOpen(false);
        setSelectedNivel(null);
        setMiembros([]);
        setEmpleadosDisponibles([]);
        setSearchEmpleado('');
    };

    const handleAddMiembro = async (personaId) => {
        if (!selectedNivel) return;

        const result = await addMiembro(selectedNivel.id, [personaId]);
        if (result.success) {
            // Refresh members and available list
            const [miembrosRes, empleadosRes] = await Promise.all([
                fetchMiembros(selectedNivel.id),
                fetchEmpleadosDisponibles(selectedNivel.id)
            ]);
            if (miembrosRes.success) setMiembros(miembrosRes.data || []);
            if (empleadosRes.success) setEmpleadosDisponibles(empleadosRes.data || []);
            refetch(); // Refresh main table counts
        } else {
            setAlert({ type: 'error', message: result.error });
        }
    };

    const handleRemoveMiembro = async (personaId) => {
        if (!selectedNivel) return;

        const result = await removeMiembro(selectedNivel.id, personaId);
        if (result.success) {
            // Refresh members and available list
            const [miembrosRes, empleadosRes] = await Promise.all([
                fetchMiembros(selectedNivel.id),
                fetchEmpleadosDisponibles(selectedNivel.id)
            ]);
            if (miembrosRes.success) setMiembros(miembrosRes.data || []);
            if (empleadosRes.success) setEmpleadosDisponibles(empleadosRes.data || []);
            refetch(); // Refresh main table counts
        } else {
            setAlert({ type: 'error', message: result.error });
        }
    };

    // Filtrar empleados disponibles por búsqueda
    const filteredEmpleados = useMemo(() => {
        if (!searchEmpleado.trim()) return empleadosDisponibles;
        const term = searchEmpleado.toLowerCase();
        return empleadosDisponibles.filter(e =>
            e.nombre_completo?.toLowerCase().includes(term) ||
            e.cargo?.toLowerCase().includes(term)
        );
    }, [empleadosDisponibles, searchEmpleado]);

    return (
        <DSPage>
            {/* HEADER */}
            <DSPageHeader
                title="Niveles de Seguridad"
                icon={<Shield size={22} />}
                actions={
                    <DSButton variant="primary" icon={<Plus size={16} />} onClick={openCreate}>
                        Nuevo Nivel
                    </DSButton>
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
                title="Listado de Niveles"
                actions={<span className="niveles-panel__count">{niveles.length} niveles</span>}
            >
                {loading ? (
                    <DSLoading text="Cargando niveles..." />
                ) : (
                    <NivelesTable
                        data={niveles}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                        onViewMembers={openMiembrosModal}
                    />
                )}
            </DSSection>

            {/* MODAL */}
            <DSModal
                isOpen={modalOpen}
                onClose={closeModal}
                title={editingNivel ? 'Editar Nivel' : 'Nuevo Nivel de Seguridad'}
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

                <div className="niveles-form">
                    <DSTextField
                        label="Nombre del Grupo"
                        value={form.nombre}
                        onChange={handleChange('nombre')}
                        required
                        placeholder="Ej: Administradores, RRHH, Ventas"
                    />

                    <FormField
                        label="Color"
                        help="Se usa para identificar visualmente este nivel en tablas y badges"
                    >
                        <div className="niveles-color-picker">
                            <input
                                type="color"
                                value={form.color}
                                onChange={handleChange('color')}
                                className="niveles-color-input"
                            />
                            <input
                                type="text"
                                value={form.color}
                                onChange={handleChange('color')}
                                className="niveles-color-text"
                                placeholder="#6b7280"
                                maxLength={7}
                            />
                        </div>
                    </FormField>

                    <DSTextArea
                        label="Descripción"
                        value={form.descripcion}
                        onChange={handleChange('descripcion')}
                        placeholder="Descripción del nivel de seguridad..."
                        rows={3}
                        help="Explica brevemente qué tipo de usuarios o roles deberían tener este nivel"
                    />

                    <FormField
                        label="Estado"
                        help="Solo los niveles activos pueden asignarse a empleados y componentes"
                    >
                        <label className="niveles-checkbox">
                            <input
                                type="checkbox"
                                checked={form.is_active}
                                onChange={handleChange('is_active')}
                            />
                            <span>Nivel Activo</span>
                        </label>
                    </FormField>
                </div>
            </DSModal>

            {/* MODAL DE MIEMBROS */}
            <DSModal
                isOpen={miembrosModalOpen}
                onClose={closeMiembrosModal}
                title={`Miembros: ${selectedNivel?.nombre || ''}`}
                icon={<Users size={20} />}
                size="md"
            >
                {loadingMiembros ? (
                    <DSLoading text="Cargando miembros..." />
                ) : (
                    <div className="miembros-modal">
                        {/* Lista de miembros actuales */}
                        <div className="miembros-modal__section">
                            <h4 className="miembros-modal__title">
                                Miembros Actuales ({miembros.length})
                            </h4>
                            {miembros.length === 0 ? (
                                <p className="miembros-modal__empty">No hay miembros en este grupo</p>
                            ) : (
                                <ul className="miembros-modal__list">
                                    {miembros.map(m => (
                                        <li key={m.id} className="miembros-modal__item">
                                            <div className="miembros-modal__info">
                                                <span className="miembros-modal__name">{m.nombre_completo}</span>
                                                {m.cargo && <span className="miembros-modal__cargo">{m.cargo}</span>}
                                            </div>
                                            <button
                                                className="miembros-modal__remove"
                                                onClick={() => handleRemoveMiembro(m.id)}
                                                title="Quitar del grupo"
                                            >
                                                <X size={16} />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Agregar nuevos miembros */}
                        <div className="miembros-modal__section">
                            <h4 className="miembros-modal__title">
                                <UserPlus size={16} /> Agregar Miembros
                            </h4>

                            {/* Buscador */}
                            <div className="miembros-modal__search">
                                <Search size={14} className="miembros-modal__search-icon" />
                                <input
                                    type="text"
                                    placeholder="Buscar empleado..."
                                    value={searchEmpleado}
                                    onChange={(e) => setSearchEmpleado(e.target.value)}
                                    className="miembros-modal__search-input"
                                />
                            </div>

                            {/* Lista de empleados disponibles */}
                            <div className="miembros-modal__available">
                                {filteredEmpleados.length === 0 ? (
                                    <p className="miembros-modal__empty">
                                        {searchEmpleado ? 'No se encontraron empleados' : 'No hay empleados disponibles'}
                                    </p>
                                ) : (
                                    <ul className="miembros-modal__list miembros-modal__list--available">
                                        {filteredEmpleados.slice(0, 10).map(e => (
                                            <li key={e.id} className="miembros-modal__item miembros-modal__item--available">
                                                <div className="miembros-modal__info">
                                                    <span className="miembros-modal__name">{e.nombre_completo}</span>
                                                    {e.cargo && <span className="miembros-modal__cargo">{e.cargo}</span>}
                                                    {e.nivel_actual && (
                                                        <span className="miembros-modal__current-group">
                                                            Actualmente en: {e.nivel_actual}
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    className="miembros-modal__add"
                                                    onClick={() => handleAddMiembro(e.id)}
                                                    title="Agregar al grupo"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </li>
                                        ))}
                                        {filteredEmpleados.length > 10 && (
                                            <li className="miembros-modal__more">
                                                +{filteredEmpleados.length - 10} más...
                                            </li>
                                        )}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </DSModal>
        </DSPage >
    );
}

export default NivelesSeguridadPage;
