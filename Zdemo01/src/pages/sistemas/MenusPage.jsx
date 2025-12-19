import React, { useState, useEffect, useCallback } from 'react';
import {
    Menu as MenuIcon,
    Plus,
    Pencil,
    Trash2,
    Save,
    ChevronRight,
    ChevronDown,
    HelpCircle,
    AlertTriangle,
    FolderTree,
    Link,
    Hash,
    Eye,
    EyeOff
} from 'lucide-react';
import {
    getMenus,
    getMenu,
    getParentMenus,
    getAvailableIcons,
    createMenu,
    updateMenu,
    deleteMenu
} from '../../services/menuAdminService';

// Importar componentes DS
import {
    DSPage,
    DSPageHeader,
    DSSection,
    DSAlert,
    DSButton,
    DSLoading,
    DSBadge,
    DSCode,
    DSCount,
    DSModal,
    DSModalSection,
} from '../../ds-components';

import './MenusPage.css';

// ============================================
// Mapeo de iconos de Lucide
// ============================================
import * as LucideIcons from 'lucide-react';

function getLucideIcon(iconName) {
    if (!iconName) return MenuIcon;
    const Icon = LucideIcons[iconName];
    return Icon || MenuIcon;
}

// ============================================
// CUSTOM HOOK: useMenus
// ============================================
function useMenus() {
    const [menus, setMenus] = useState([]);
    const [parentMenus, setParentMenus] = useState([]);
    const [icons, setIcons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [menusRes, parentsRes, iconsRes] = await Promise.all([
                getMenus(),
                getParentMenus(),
                getAvailableIcons()
            ]);
            setMenus(menusRes || []);
            setParentMenus(parentsRes || []);
            setIcons(iconsRes || []);
        } catch (err) {
            if (err.message?.includes('403') || err.message?.includes('Acceso denegado')) {
                setError('Acceso denegado. Esta sección es solo para superusuarios.');
            } else {
                setError('Error cargando datos');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { menus, parentMenus, icons, loading, error, refetch: fetchData };
}

// ============================================
// COMPONENTE: Tooltip
// ============================================
function Tooltip({ text }) {
    return (
        <span className="menus-tooltip">
            <HelpCircle size={14} />
            <span className="menus-tooltip__text">{text}</span>
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
// COMPONENTE: MenuTreeItem (fila de tabla expandible)
// ============================================
function MenuTreeItem({ menu, level = 0, onEdit, onDelete, expandedIds, toggleExpand }) {
    const hasChildren = menu.children && menu.children.length > 0;
    const isExpanded = expandedIds.includes(menu.id);
    const Icon = getLucideIcon(menu.icon);
    const isActive = menu.is_active == 1 || menu.is_active === true;

    return (
        <>
            <tr className={`menus-tree-row menus-tree-row--level-${level}`}>
                <td style={{ paddingLeft: `${level * 24 + 12}px` }}>
                    <div className="menus-tree-row__name">
                        {hasChildren ? (
                            <button
                                className="menus-tree-row__toggle"
                                onClick={() => toggleExpand(menu.id)}
                            >
                                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                        ) : (
                            <span className="menus-tree-row__spacer" />
                        )}
                        <Icon size={16} className="menus-tree-row__icon" />
                        <strong>{menu.name}</strong>
                    </div>
                </td>
                <td>
                    {menu.url ? (
                        <DSCode>{menu.url}</DSCode>
                    ) : (
                        <span className="menus-tree-row__no-url">—</span>
                    )}
                </td>
                <td>
                    <span className="menus-tree-row__icon-name">
                        <Icon size={14} />
                        {menu.icon || '—'}
                    </span>
                </td>
                <td className="ds-table__center">
                    <DSCount>{menu.order}</DSCount>
                </td>
                <td>
                    {menu.module ? (
                        <DSBadge variant="neutral">{menu.module}</DSBadge>
                    ) : '—'}
                </td>
                <td className="ds-table__center">
                    <DSCount variant="purple">{menu.roles_count || 0}</DSCount>
                </td>
                <td>
                    <DSBadge variant={isActive ? 'success' : 'error'}>
                        {isActive ? 'Activo' : 'Inactivo'}
                    </DSBadge>
                </td>
                <td>
                    <div className="ds-table__actions">
                        <DSButton
                            size="sm"
                            iconOnly
                            icon={<Pencil size={15} />}
                            onClick={() => onEdit(menu)}
                            title="Editar"
                        />
                        <DSButton
                            size="sm"
                            variant="outline-danger"
                            iconOnly
                            icon={<Trash2 size={15} />}
                            onClick={() => onDelete(menu)}
                            title="Eliminar"
                            disabled={hasChildren}
                        />
                    </div>
                </td>
            </tr>
            {hasChildren && isExpanded && menu.children.map(child => (
                <MenuTreeItem
                    key={child.id}
                    menu={child}
                    level={level + 1}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    expandedIds={expandedIds}
                    toggleExpand={toggleExpand}
                />
            ))}
        </>
    );
}

// ============================================
// COMPONENTE: IconPicker
// ============================================
function IconPicker({ icons, value, onChange }) {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const filteredIcons = icons.filter(icon =>
        icon.toLowerCase().includes(search.toLowerCase())
    );

    const SelectedIcon = getLucideIcon(value);

    return (
        <div className="menus-icon-picker">
            <button
                type="button"
                className="menus-icon-picker__trigger ds-field__control"
                onClick={() => setIsOpen(!isOpen)}
            >
                <SelectedIcon size={18} />
                <span>{value || 'Seleccionar icono...'}</span>
                <ChevronDown size={16} />
            </button>

            {isOpen && (
                <div className="menus-icon-picker__dropdown">
                    <input
                        type="text"
                        className="menus-icon-picker__search"
                        placeholder="Buscar icono..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        autoFocus
                    />
                    <div className="menus-icon-picker__grid">
                        {filteredIcons.slice(0, 48).map(iconName => {
                            const IconComp = getLucideIcon(iconName);
                            return (
                                <button
                                    key={iconName}
                                    type="button"
                                    className={`menus-icon-picker__item ${value === iconName ? 'is-selected' : ''}`}
                                    onClick={() => {
                                        onChange(iconName);
                                        setIsOpen(false);
                                        setSearch('');
                                    }}
                                    title={iconName}
                                >
                                    <IconComp size={20} />
                                </button>
                            );
                        })}
                    </div>
                    {filteredIcons.length === 0 && (
                        <div className="menus-icon-picker__empty">
                            No se encontraron iconos
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ============================================
// COMPONENTE PRINCIPAL: MenusPage
// ============================================
export function MenusPage() {
    const { menus, parentMenus, icons, loading, error: loadError, refetch } = useMenus();

    // Estado del formulario
    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState(null);
    const [formSuccess, setFormSuccess] = useState(null);
    const [editingMenu, setEditingMenu] = useState(null);
    const [expandedIds, setExpandedIds] = useState([]);

    const [form, setForm] = useState({
        name: '',
        url: '',
        icon: '',
        parent_id: '',
        order: 0,
        module: '',
        is_active: true
    });

    // Expandir todos por defecto al cargar
    useEffect(() => {
        if (menus.length > 0 && expandedIds.length === 0) {
            setExpandedIds(menus.map(m => m.id));
        }
    }, [menus]);

    const toggleExpand = (id) => {
        setExpandedIds(prev =>
            prev.includes(id)
                ? prev.filter(x => x !== id)
                : [...prev, id]
        );
    };

    // Reset form
    const resetForm = useCallback(() => {
        setForm({
            name: '',
            url: '',
            icon: '',
            parent_id: '',
            order: 0,
            module: '',
            is_active: true
        });
        setEditingMenu(null);
        setFormError(null);
    }, []);

    // Abrir modal para crear
    const openCreate = (parentId = null) => {
        resetForm();
        if (parentId) {
            const parent = menus.find(m => m.id === parentId);
            setForm(prev => ({
                ...prev,
                parent_id: parentId,
                module: parent?.module || ''
            }));
        }
        setModalOpen(true);
    };

    // Abrir modal para editar
    const openEdit = async (menu) => {
        const menuDetail = await getMenu(menu.id);
        if (menuDetail) {
            setEditingMenu(menu);
            setForm({
                name: menuDetail.name,
                url: menuDetail.url || '',
                icon: menuDetail.icon || '',
                parent_id: menuDetail.parent_id || '',
                order: menuDetail.order || 0,
                module: menuDetail.module || '',
                is_active: menuDetail.is_active == 1 || menuDetail.is_active === true
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
        const value = e.target.type === 'checkbox'
            ? e.target.checked
            : e.target.type === 'number'
                ? parseInt(e.target.value) || 0
                : e.target.value;
        setForm(prev => ({ ...prev, [field]: value }));
    };

    // Validar formulario
    const validateForm = () => {
        if (!form.name.trim()) return 'El nombre es requerido';
        return null;
    };

    // Guardar menú
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
                url: form.url || null,
                icon: form.icon || null,
                parent_id: form.parent_id || null,
                order: form.order,
                module: form.module || null,
                is_active: form.is_active
            };

            let result;
            if (editingMenu) {
                result = await updateMenu(editingMenu.id, payload);
            } else {
                result = await createMenu(payload);
            }

            if (result.success) {
                setFormSuccess(editingMenu ? 'Menú actualizado' : 'Menú creado');
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

    // Eliminar menú
    const handleDelete = async (menu) => {
        if (!window.confirm(`¿Eliminar menú "${menu.name}"?`)) return;

        try {
            const result = await deleteMenu(menu.id);
            if (result.success) {
                setFormSuccess('Menú eliminado');
                refetch();
                setTimeout(() => setFormSuccess(null), 3000);
            } else {
                alert(result.error || 'Error eliminando');
            }
        } catch (err) {
            alert('Error de conexión');
        }
    };

    // Contar total de menús (padres + hijos)
    const totalMenus = menus.reduce((acc, m) => acc + 1 + (m.children?.length || 0), 0);

    // Si hay error de acceso, mostrar alerta
    if (loadError && loadError.includes('Acceso denegado')) {
        return (
            <DSPage>
                <DSPageHeader
                    title="Administración de Menús"
                    icon={<FolderTree size={22} />}
                />
                <DSAlert variant="error" className="menus-alert-margin">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertTriangle size={20} />
                        <span>{loadError}</span>
                    </div>
                </DSAlert>
            </DSPage>
        );
    }

    return (
        <DSPage>
            {/* HEADER */}
            <DSPageHeader
                title="Administración de Menús"
                icon={<FolderTree size={22} />}
                actions={
                    <DSButton variant="primary" icon={<Plus size={16} />} onClick={() => openCreate()}>
                        Nuevo Menú
                    </DSButton>
                }
            />

            {/* ALERTAS */}
            {formSuccess && (
                <DSAlert variant="success" dismissible onDismiss={() => setFormSuccess(null)} className="menus-alert-margin">
                    {formSuccess}
                </DSAlert>
            )}
            {loadError && (
                <DSAlert variant="error" className="menus-alert-margin">
                    {loadError}
                </DSAlert>
            )}

            {/* INFO BOX */}
            <DSAlert variant="info" className="menus-alert-margin">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={16} />
                    <span>
                        <strong>Solo Superusuarios:</strong> Esta sección permite administrar los menús del sistema.
                        Los cambios afectan a la navegación de todos los roles.
                    </span>
                </div>
            </DSAlert>

            {/* TABLA */}
            <DSSection
                title="Estructura de Menús"
                actions={<span className="menus-panel__count">{totalMenus} menús</span>}
            >
                <div className="ds-table-wrapper">
                    {loading ? (
                        <DSLoading text="Cargando..." />
                    ) : (
                        <table className="ds-table ds-table--striped ds-table--hover menus-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '22%' }}>Nombre</th>
                                    <th style={{ width: '18%' }}>URL</th>
                                    <th style={{ width: '12%' }}>Icono</th>
                                    <th style={{ width: '8%' }}>Orden</th>
                                    <th style={{ width: '12%' }}>Módulo</th>
                                    <th style={{ width: '8%' }}>Roles</th>
                                    <th style={{ width: '10%' }}>Estado</th>
                                    <th style={{ width: '10%' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {menus.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="ds-table__empty">
                                            No hay menús registrados
                                        </td>
                                    </tr>
                                ) : (
                                    menus.map(menu => (
                                        <MenuTreeItem
                                            key={menu.id}
                                            menu={menu}
                                            level={0}
                                            onEdit={openEdit}
                                            onDelete={handleDelete}
                                            expandedIds={expandedIds}
                                            toggleExpand={toggleExpand}
                                        />
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
                title={editingMenu ? 'Editar Menú' : 'Nuevo Menú'}
                size="lg"
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
                    <DSAlert variant="error" dismissible onDismiss={() => setFormError(null)} className="menus-alert-margin">
                        {formError}
                    </DSAlert>
                )}

                <DSModalSection title="Información del Menú">
                    <form className="menus-form" onSubmit={e => e.preventDefault()}>
                        <div className="menus-form__row">
                            <FormField
                                label="Nombre"
                                required
                                help="Nombre que se mostrará en la barra de navegación."
                            >
                                <input
                                    type="text"
                                    className="ds-field__control"
                                    value={form.name}
                                    onChange={handleChange('name')}
                                    placeholder="Ej: Usuarios"
                                />
                            </FormField>

                            <FormField
                                label="URL"
                                help="Ruta del sistema. Dejar vacío para menús padre."
                            >
                                <div className="menus-url-input">
                                    <Link size={16} />
                                    <input
                                        type="text"
                                        className="ds-field__control"
                                        value={form.url}
                                        onChange={handleChange('url')}
                                        placeholder="/modulo/pagina"
                                    />
                                </div>
                            </FormField>
                        </div>

                        <div className="menus-form__row">
                            <FormField
                                label="Icono"
                                help="Icono de Lucide que se mostrará junto al menú."
                            >
                                <IconPicker
                                    icons={icons}
                                    value={form.icon}
                                    onChange={(iconName) => setForm(prev => ({ ...prev, icon: iconName }))}
                                />
                            </FormField>

                            <FormField
                                label="Menú Padre"
                                help="Dejar vacío para crear un menú de nivel superior."
                            >
                                <select
                                    className="ds-field__control"
                                    value={form.parent_id}
                                    onChange={handleChange('parent_id')}
                                    disabled={editingMenu && editingMenu.children_count > 0}
                                >
                                    <option value="">— Ninguno (Menú Principal) —</option>
                                    {parentMenus
                                        .filter(p => p.id !== editingMenu?.id)
                                        .map(parent => (
                                            <option key={parent.id} value={parent.id}>
                                                {parent.name}
                                            </option>
                                        ))}
                                </select>
                            </FormField>
                        </div>

                        <div className="menus-form__row menus-form__row--three">
                            <FormField
                                label="Orden"
                                help="Número para ordenar menús (menor = primero)."
                            >
                                <div className="menus-order-input">
                                    <Hash size={16} />
                                    <input
                                        type="number"
                                        className="ds-field__control"
                                        value={form.order}
                                        onChange={handleChange('order')}
                                        min="0"
                                    />
                                </div>
                            </FormField>

                            <FormField
                                label="Módulo"
                                help="Agrupador lógico del sistema (ej: Sistemas, Ventas)."
                            >
                                <input
                                    type="text"
                                    className="ds-field__control"
                                    value={form.module}
                                    onChange={handleChange('module')}
                                    placeholder="Ej: Sistemas"
                                />
                            </FormField>

                            <FormField
                                label="Estado"
                                help="Los menús inactivos no se muestran en la navegación."
                            >
                                <label className="menus-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={form.is_active}
                                        onChange={handleChange('is_active')}
                                    />
                                    <span>{form.is_active ? <Eye size={16} /> : <EyeOff size={16} />}</span>
                                    <span>Menú Activo</span>
                                </label>
                            </FormField>
                        </div>
                    </form>
                </DSModalSection>
            </DSModal>
        </DSPage>
    );
}

export default MenusPage;
