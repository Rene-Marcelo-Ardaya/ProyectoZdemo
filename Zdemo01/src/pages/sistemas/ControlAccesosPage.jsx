import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Plus, Pencil, Trash2, X, Save, Loader2, AlertCircle, CheckCircle, Users, Menu as MenuIcon, ChevronRight, HelpCircle } from 'lucide-react';
import { getRoles, getRole, getMenusList, createRole, updateRole, deleteRole } from '../../services/roleService';
import './ControlAccesosPage.css';

// ============================================
// CUSTOM HOOK: useRoles
// ============================================
function useRoles() {
    const [roles, setRoles] = useState([]);
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [rolesRes, menusRes] = await Promise.all([getRoles(), getMenusList()]);
            setRoles(rolesRes || []);
            setMenus(menusRes || []);
        } catch (err) {
            setError('Error cargando datos');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { roles, menus, loading, error, refetch: fetchData };
}

// ============================================
// COMPONENTE: Modal
// ============================================
function Modal({ isOpen, onClose, title, children, footer, wide }) {
    if (!isOpen) return null;

    return (
        <div className="accesos-modal-overlay" onClick={onClose}>
            <div className={`accesos-modal ${wide ? 'accesos-modal--wide' : ''}`} onClick={e => e.stopPropagation()}>
                <div className="accesos-modal__header">
                    <span className="accesos-modal__title">{title}</span>
                    <button className="accesos-modal__close" onClick={onClose} type="button">
                        <X size={18} />
                    </button>
                </div>
                <div className="accesos-modal__body">
                    {children}
                </div>
                {footer && (
                    <div className="accesos-modal__footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================
// COMPONENTE: Tooltip
// ============================================
function Tooltip({ text }) {
    return (
        <span className="accesos-tooltip">
            <HelpCircle size={14} />
            <span className="accesos-tooltip__text">{text}</span>
        </span>
    );
}

// ============================================
// COMPONENTE: FormField
// ============================================
function FormField({ label, children, required, help }) {
    return (
        <div className="accesos-form__field">
            <label className="accesos-form__label">
                {label}
                {required && <span className="accesos-form__required">*</span>}
                {help && <Tooltip text={help} />}
            </label>
            {children}
        </div>
    );
}

// ============================================
// COMPONENTE: Alert
// ============================================
function Alert({ type = 'error', message, onDismiss }) {
    if (!message) return null;
    const Icon = type === 'error' ? AlertCircle : CheckCircle;

    return (
        <div className={`accesos-alert accesos-alert--${type}`}>
            <Icon size={16} />
            <span>{message}</span>
            {onDismiss && (
                <button onClick={onDismiss} className="accesos-alert__dismiss">
                    <X size={14} />
                </button>
            )}
        </div>
    );
}

// ============================================
// COMPONENTE: MenuTree (Selector de menús)
// ============================================
function MenuTree({ menus, selectedIds, onChange }) {
    const toggleMenu = (menuId, children = []) => {
        const childIds = children.map(c => c.id);
        const allIds = [menuId, ...childIds];

        const isSelected = selectedIds.includes(menuId);

        if (isSelected) {
            // Deseleccionar este y sus hijos
            onChange(selectedIds.filter(id => !allIds.includes(id)));
        } else {
            // Seleccionar este y sus hijos
            onChange([...new Set([...selectedIds, ...allIds])]);
        }
    };

    const toggleChild = (childId, parentId) => {
        const isSelected = selectedIds.includes(childId);
        let newIds;

        if (isSelected) {
            newIds = selectedIds.filter(id => id !== childId);
        } else {
            // Asegurar que el padre esté seleccionado
            newIds = [...new Set([...selectedIds, childId, parentId])];
        }
        onChange(newIds);
    };

    return (
        <div className="accesos-menu-tree">
            {menus.map(menu => (
                <div key={menu.id} className="accesos-menu-tree__group">
                    <label className="accesos-menu-tree__parent">
                        <input
                            type="checkbox"
                            checked={selectedIds.includes(menu.id)}
                            onChange={() => toggleMenu(menu.id, menu.children || [])}
                        />
                        <MenuIcon size={14} />
                        <span>{menu.name}</span>
                    </label>
                    {menu.children && menu.children.length > 0 && (
                        <div className="accesos-menu-tree__children">
                            {menu.children.map(child => (
                                <label key={child.id} className="accesos-menu-tree__child">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(child.id)}
                                        onChange={() => toggleChild(child.id, menu.id)}
                                    />
                                    <ChevronRight size={12} />
                                    <span>{child.name}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

// ============================================
// COMPONENTE PRINCIPAL: ControlAccesosPage
// ============================================
export function ControlAccesosPage() {
    const { roles, menus, loading, error: loadError, refetch } = useRoles();

    // Estado del formulario
    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState(null);
    const [formSuccess, setFormSuccess] = useState(null);
    const [editingRole, setEditingRole] = useState(null);

    const [form, setForm] = useState({
        name: '',
        slug: '',
        description: '',
        is_active: true,
        menu_ids: []
    });

    // Reset form
    const resetForm = useCallback(() => {
        setForm({ name: '', slug: '', description: '', is_active: true, menu_ids: [] });
        setEditingRole(null);
        setFormError(null);
    }, []);

    // Abrir modal para crear
    const openCreate = () => {
        resetForm();
        setModalOpen(true);
    };

    // Abrir modal para editar
    const openEdit = async (role) => {
        // Cargar detalle del rol con sus menús
        const roleDetail = await getRole(role.id);
        if (roleDetail) {
            setEditingRole(role);
            setForm({
                name: roleDetail.name,
                slug: roleDetail.slug,
                description: roleDetail.description || '',
                is_active: roleDetail.is_active == 1 || roleDetail.is_active === true,
                menu_ids: roleDetail.menu_ids || []
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

    // Generar slug automático
    const handleNameChange = (e) => {
        const name = e.target.value;
        const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        setForm(prev => ({
            ...prev,
            name,
            slug: editingRole ? prev.slug : slug // Solo auto-generar en creación
        }));
    };

    // Validar formulario
    const validateForm = () => {
        if (!form.name.trim()) return 'El nombre es requerido';
        if (!form.slug.trim()) return 'El identificador es requerido';
        return null;
    };

    // Guardar rol
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
                name: form.name,
                slug: form.slug,
                description: form.description,
                is_active: form.is_active,
                menu_ids: form.menu_ids
            };

            let result;
            if (editingRole) {
                result = await updateRole(editingRole.id, payload);
            } else {
                result = await createRole(payload);
            }

            if (result.success) {
                setFormSuccess(editingRole ? 'Rol actualizado' : 'Rol creado');
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

    // Eliminar rol
    const handleDelete = async (role) => {
        if (!window.confirm(`¿Eliminar rol "${role.name}"?`)) return;

        try {
            const result = await deleteRole(role.id);
            if (result.success) {
                setFormSuccess('Rol eliminado');
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
        <div className="accesos-page">
            {/* HEADER */}
            <div className="accesos-page__header">
                <div className="accesos-page__title">
                    <Shield size={22} />
                    <h1>Control de Accesos</h1>
                </div>
                <button className="accesos-btn accesos-btn--primary" onClick={openCreate}>
                    <Plus size={16} />
                    <span>Nuevo Rol</span>
                </button>
            </div>

            {/* ALERTAS */}
            <Alert type="success" message={formSuccess} onDismiss={() => setFormSuccess(null)} />
            <Alert type="error" message={loadError} />

            {/* TABLA */}
            <div className="accesos-panel">
                <div className="accesos-panel__header">
                    <span>Perfiles y Roles del Sistema</span>
                    <span className="accesos-panel__count">{roles.length} roles</span>
                </div>
                <div className="accesos-table-wrapper">
                    {loading ? (
                        <div className="accesos-loading">
                            <Loader2 size={24} className="spin" />
                            <span>Cargando...</span>
                        </div>
                    ) : (
                        <table className="accesos-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '5%' }}>ID</th>
                                    <th style={{ width: '20%' }}>Nombre</th>
                                    <th style={{ width: '15%' }}>Identificador</th>
                                    <th style={{ width: '25%' }}>Descripción</th>
                                    <th style={{ width: '8%' }}>Menús</th>
                                    <th style={{ width: '8%' }}>Usuarios</th>
                                    <th style={{ width: '8%' }}>Estado</th>
                                    <th style={{ width: '11%' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {roles.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="accesos-table__empty">
                                            No hay roles registrados
                                        </td>
                                    </tr>
                                ) : (
                                    roles.map(role => (
                                        <tr key={role.id}>
                                            <td>{role.id}</td>
                                            <td><strong>{role.name}</strong></td>
                                            <td><code className="accesos-code">{role.slug}</code></td>
                                            <td>{role.description || '-'}</td>
                                            <td className="accesos-center">
                                                <span className="accesos-count">{role.menus_count}</span>
                                            </td>
                                            <td className="accesos-center">
                                                <span className="accesos-count accesos-count--users">
                                                    <Users size={12} /> {role.users_count}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`accesos-badge ${role.is_active == 1 || role.is_active === true ? 'is-active' : 'is-inactive'}`}>
                                                    {role.is_active == 1 || role.is_active === true ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="accesos-actions">
                                                    <button
                                                        className="accesos-btn accesos-btn--icon"
                                                        onClick={() => openEdit(role)}
                                                        title="Editar"
                                                    >
                                                        <Pencil size={15} />
                                                    </button>
                                                    <button
                                                        className="accesos-btn accesos-btn--icon accesos-btn--danger"
                                                        onClick={() => handleDelete(role)}
                                                        title="Eliminar"
                                                        disabled={role.users_count > 0}
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* MODAL */}
            <Modal
                isOpen={modalOpen}
                onClose={closeModal}
                title={editingRole ? 'Editar Rol' : 'Nuevo Rol'}
                wide={true}
                footer={
                    <>
                        <button className="accesos-btn" onClick={closeModal} disabled={saving}>
                            Cancelar
                        </button>
                        <button
                            className="accesos-btn accesos-btn--primary"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                            <span>{saving ? 'Guardando...' : 'Guardar'}</span>
                        </button>
                    </>
                }
            >
                <Alert type="error" message={formError} onDismiss={() => setFormError(null)} />

                <div className="accesos-form-grid">
                    {/* Columna izquierda: Datos del rol */}
                    <div className="accesos-form-col">
                        <h3 className="accesos-form-section">Información del Rol</h3>

                        <form className="accesos-form" onSubmit={e => e.preventDefault()}>
                            <FormField
                                label="Nombre del Rol"
                                required
                                help="Nombre descriptivo del rol. Ej: Administrador, Vendedor, Soporte."
                            >
                                <input
                                    type="text"
                                    className="accesos-input"
                                    value={form.name}
                                    onChange={handleNameChange}
                                    placeholder="Ej: Administrador"
                                />
                            </FormField>

                            <FormField
                                label="Identificador (slug)"
                                required
                                help="Código único para uso interno. Se genera automáticamente. No se puede cambiar después de crear."
                            >
                                <input
                                    type="text"
                                    className="accesos-input"
                                    value={form.slug}
                                    onChange={handleChange('slug')}
                                    placeholder="admin"
                                    disabled={!!editingRole}
                                />
                            </FormField>

                            <FormField
                                label="Descripción"
                                help="Breve explicación del propósito del rol y sus responsabilidades."
                            >
                                <textarea
                                    className="accesos-input accesos-textarea"
                                    value={form.description}
                                    onChange={handleChange('description')}
                                    placeholder="Descripción del rol..."
                                    rows={3}
                                />
                            </FormField>

                            <FormField
                                label="Estado"
                                help="Los roles inactivos no se pueden asignar a nuevos usuarios."
                            >
                                <label className="accesos-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={form.is_active}
                                        onChange={handleChange('is_active')}
                                    />
                                    <span>Rol Activo</span>
                                </label>
                            </FormField>
                        </form>
                    </div>

                    {/* Columna derecha: Menús */}
                    <div className="accesos-form-col">
                        <h3 className="accesos-form-section">
                            <MenuIcon size={16} /> Menús Asignados
                        </h3>
                        <div className="accesos-form-section-help">
                            Selecciona los menús que este rol podrá visualizar:
                        </div>
                        <MenuTree
                            menus={menus}
                            selectedIds={form.menu_ids}
                            onChange={(ids) => setForm(prev => ({ ...prev, menu_ids: ids }))}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default ControlAccesosPage;
