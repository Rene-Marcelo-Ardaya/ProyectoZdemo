import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Plus, Pencil, Trash2, Save, Loader2, Users, Menu as MenuIcon, ChevronRight, HelpCircle } from 'lucide-react';
import { getRoles, getRole, getMenusList, createRole, updateRole, deleteRole } from '../../services/roleService';

// Importar componentes DS
import {
    DSPage,
    DSPageHeader,
    DSSection,
    DSAlert,
    DSButton,
    DSLoading,
    DSField,
    DSBadge,
    DSCount,
    DSCode,
    DSModal,
    DSModalSection,
    DSModalGrid,
} from '../../ds-components';

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
// COMPONENTE: FormField (usando DSField base)
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
// COMPONENTE: MenuTree (Selector de menús)
// ============================================
function MenuTree({ menus, selectedIds, onChange }) {
    const toggleMenu = (menuId, children = []) => {
        const childIds = children.map(c => c.id);
        const allIds = [menuId, ...childIds];

        const isSelected = selectedIds.includes(menuId);

        if (isSelected) {
            onChange(selectedIds.filter(id => !allIds.includes(id)));
        } else {
            onChange([...new Set([...selectedIds, ...allIds])]);
        }
    };

    const toggleChild = (childId, parentId) => {
        const isSelected = selectedIds.includes(childId);
        let newIds;

        if (isSelected) {
            newIds = selectedIds.filter(id => id !== childId);
        } else {
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
            slug: editingRole ? prev.slug : slug
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
        <DSPage>
            {/* HEADER */}
            <DSPageHeader
                title="Control de Accesos"
                icon={<Shield size={22} />}
                actions={
                    <DSButton variant="primary" icon={<Plus size={16} />} onClick={openCreate}>
                        Nuevo Rol
                    </DSButton>
                }
            />

            {/* ALERTAS */}
            {formSuccess && (
                <DSAlert variant="success" dismissible onDismiss={() => setFormSuccess(null)} className="accesos-alert-margin">
                    {formSuccess}
                </DSAlert>
            )}
            {loadError && (
                <DSAlert variant="error" className="accesos-alert-margin">
                    {loadError}
                </DSAlert>
            )}

            {/* TABLA */}
            <DSSection
                title="Perfiles y Roles del Sistema"
                actions={<span className="accesos-panel__count">{roles.length} roles</span>}
            >
                <div className="ds-table-wrapper">
                    {loading ? (
                        <DSLoading text="Cargando..." />
                    ) : (
                        <table className="ds-table ds-table--striped ds-table--hover">
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
                                        <td colSpan="8" className="ds-table__empty">
                                            No hay roles registrados
                                        </td>
                                    </tr>
                                ) : (
                                    roles.map(role => (
                                        <tr key={role.id}>
                                            <td>{role.id}</td>
                                            <td><strong>{role.name}</strong></td>
                                            <td><DSCode>{role.slug}</DSCode></td>
                                            <td>{role.description || '-'}</td>
                                            <td className="ds-table__center">
                                                <DSCount>{role.menus_count}</DSCount>
                                            </td>
                                            <td className="ds-table__center">
                                                <DSCount variant="purple" icon={<Users size={12} />}>
                                                    {role.users_count}
                                                </DSCount>
                                            </td>
                                            <td>
                                                <DSBadge variant={role.is_active == 1 || role.is_active === true ? 'success' : 'error'}>
                                                    {role.is_active == 1 || role.is_active === true ? 'Activo' : 'Inactivo'}
                                                </DSBadge>
                                            </td>
                                            <td>
                                                <div className="ds-table__actions">
                                                    <DSButton
                                                        size="sm"
                                                        iconOnly
                                                        icon={<Pencil size={15} />}
                                                        onClick={() => openEdit(role)}
                                                        title="Editar"
                                                    />
                                                    <DSButton
                                                        size="sm"
                                                        variant="outline-danger"
                                                        iconOnly
                                                        icon={<Trash2 size={15} />}
                                                        onClick={() => handleDelete(role)}
                                                        title="Eliminar"
                                                        disabled={role.users_count > 0}
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
                title={editingRole ? 'Editar Rol' : 'Nuevo Rol'}
                size="xl"
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
                    <DSAlert variant="error" dismissible onDismiss={() => setFormError(null)} className="accesos-alert-margin">
                        {formError}
                    </DSAlert>
                )}

                <DSModalGrid>
                    {/* Columna izquierda: Datos del rol */}
                    <div>
                        <DSModalSection title="Información del Rol">
                            <form className="accesos-form" onSubmit={e => e.preventDefault()}>
                                <FormField
                                    label="Nombre del Rol"
                                    required
                                    help="Nombre descriptivo del rol. Ej: Administrador, Vendedor, Soporte."
                                >
                                    <input
                                        type="text"
                                        className="ds-field__control"
                                        value={form.name}
                                        onChange={handleNameChange}
                                        placeholder="Ej: Administrador"
                                    />
                                </FormField>

                                <FormField
                                    label="Identificador (slug)"
                                    required
                                    help="Código único para uso interno. Se genera automáticamente."
                                >
                                    <input
                                        type="text"
                                        className="ds-field__control"
                                        value={form.slug}
                                        onChange={handleChange('slug')}
                                        placeholder="admin"
                                        disabled={!!editingRole}
                                    />
                                </FormField>

                                <FormField
                                    label="Descripción"
                                    help="Breve explicación del propósito del rol."
                                >
                                    <textarea
                                        className="ds-field__control accesos-textarea"
                                        value={form.description}
                                        onChange={handleChange('description')}
                                        placeholder="Descripción del rol..."
                                        rows={3}
                                    />
                                </FormField>

                                <FormField
                                    label="Estado"
                                    help="Los roles inactivos no se pueden asignar."
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
                        </DSModalSection>
                    </div>

                    {/* Columna derecha: Menús */}
                    <div>
                        <DSModalSection
                            title="Menús Asignados"
                            icon={<MenuIcon size={16} />}
                            help="Selecciona los menús que este rol podrá visualizar:"
                        >
                            <MenuTree
                                menus={menus}
                                selectedIds={form.menu_ids}
                                onChange={(ids) => setForm(prev => ({ ...prev, menu_ids: ids }))}
                            />
                        </DSModalSection>
                    </div>
                </DSModalGrid>
            </DSModal>
        </DSPage>
    );
}

export default ControlAccesosPage;
