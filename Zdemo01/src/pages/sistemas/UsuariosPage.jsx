import React, { useState, useEffect, useCallback } from 'react';
import { Users, UserPlus, Pencil, Trash2, Save, HelpCircle } from 'lucide-react';
import { getUsers, getRolesList, createUser, updateUser, deleteUser } from '../../services/userService';

// Importar componentes DS
import {
    DSPage,
    DSPageHeader,
    DSSection,
    DSAlert,
    DSButton,
    DSLoading,
    DSBadge,
    DSModal,
    SecuredButton,
    DSRefreshButton,
} from '../../ds-components';

import './UsuariosPage.css';

// ============================================
// CUSTOM HOOK: useUsuarios
// ============================================
function useUsuarios() {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [usersRes, rolesRes] = await Promise.all([getUsers(), getRolesList()]);
            setUsers(usersRes || []);
            setRoles(rolesRes || []);
        } catch (err) {
            setError('Error cargando datos');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { users, roles, loading, error, refetch: fetchData };
}

// ============================================
// COMPONENTE: Tooltip
// ============================================
function Tooltip({ text }) {
    return (
        <span className="usuarios-tooltip">
            <HelpCircle size={14} />
            <span className="usuarios-tooltip__text">{text}</span>
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
// COMPONENTE PRINCIPAL: UsuariosPage
// ============================================
export function UsuariosPage() {
    const { users, roles, loading, error: loadError, refetch } = useUsuarios();

    // Estado del formulario
    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState(null);
    const [formSuccess, setFormSuccess] = useState(null);
    const [editingUser, setEditingUser] = useState(null);

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role_id: '',
        is_active: true
    });

    // Reset form
    const resetForm = useCallback(() => {
        setForm({ name: '', email: '', password: '', role_id: '', is_active: true });
        setEditingUser(null);
        setFormError(null);
    }, []);

    // Abrir modal para crear
    const openCreate = () => {
        resetForm();
        setModalOpen(true);
    };

    // Abrir modal para editar
    const openEdit = (user) => {
        setEditingUser(user);
        setForm({
            name: user.name,
            email: user.email,
            password: '',
            role_id: user.role_id || '',
            is_active: user.is_active == 1 || user.is_active === true || user.is_active === 'Activo'
        });
        setFormError(null);
        setModalOpen(true);
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
        if (!form.name.trim()) return 'El nombre es requerido';
        if (!form.email.trim()) return 'El email es requerido';
        if (!form.email.includes('@')) return 'Email inválido';
        if (!editingUser && !form.password) return 'La contraseña es requerida';
        if (!form.role_id) return 'Debe seleccionar un rol';
        return null;
    };

    // Guardar usuario
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
                email: form.email,
                role_id: parseInt(form.role_id),
                is_active: form.is_active
            };

            if (form.password) {
                payload.password = form.password;
            }

            let result;
            if (editingUser) {
                result = await updateUser(editingUser.id, payload);
            } else {
                result = await createUser(payload);
            }

            if (result.success) {
                setFormSuccess(editingUser ? 'Usuario actualizado' : 'Usuario creado');
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

    // Eliminar usuario
    const handleDelete = async (user) => {
        if (!window.confirm(`¿Eliminar a "${user.name}"?`)) return;

        try {
            const result = await deleteUser(user.id);
            if (result.success) {
                setFormSuccess('Usuario eliminado');
                refetch();
                setTimeout(() => setFormSuccess(null), 3000);
            } else {
                alert(result.error || 'Error eliminando');
            }
        } catch (err) {
            alert('Error de conexión');
        }
    };

    const isUserActive = (user) => user.is_active == 1 || user.is_active === true || user.is_active === 'Activo';

    return (
        <DSPage>
            {/* HEADER */}
            <DSPageHeader
                title="Gestión de Usuarios"
                icon={<Users size={22} />}
                actions={
                    <SecuredButton
                        securityId="usuarios.crear"
                        securityDesc="Crear nuevo usuario"
                        variant="primary"
                        icon={<UserPlus size={16} />}
                        onClick={openCreate}
                    >
                        Nuevo Usuario
                    </SecuredButton>
                }
            />

            {/* ALERTAS */}
            {formSuccess && (
                <DSAlert variant="success" dismissible onDismiss={() => setFormSuccess(null)} className="usuarios-alert-margin">
                    {formSuccess}
                </DSAlert>
            )}
            {loadError && (
                <DSAlert variant="error" className="usuarios-alert-margin">
                    {loadError}
                </DSAlert>
            )}

            {/* TABLA */}
            <DSSection
                title="Listado de Usuarios"
                actions={
                    <div className="ds-section__actions-row">
                        <DSRefreshButton onClick={refetch} loading={loading} />
                        <span className="usuarios-panel__count">{users.length} registros</span>
                    </div>
                }
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
                                    <th style={{ width: '30%' }}>Email</th>
                                    <th style={{ width: '15%' }}>Rol</th>
                                    <th style={{ width: '10%' }}>Estado</th>
                                    <th style={{ width: '15%' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="ds-table__empty">
                                            No hay usuarios registrados
                                        </td>
                                    </tr>
                                ) : (
                                    users.map(user => (
                                        <tr key={user.id}>
                                            <td>{user.id}</td>
                                            <td>{user.name}</td>
                                            <td>{user.email}</td>
                                            <td>{user.roles || '-'}</td>
                                            <td>
                                                <DSBadge variant={isUserActive(user) ? 'success' : 'error'}>
                                                    {isUserActive(user) ? 'Activo' : 'Inactivo'}
                                                </DSBadge>
                                            </td>
                                            <td>
                                                <div className="ds-table__actions">
                                                    <SecuredButton
                                                        securityId="usuarios.editar"
                                                        securityDesc="Editar usuario"
                                                        size="sm"
                                                        iconOnly
                                                        icon={<Pencil size={15} />}
                                                        onClick={() => openEdit(user)}
                                                        title="Editar"
                                                    />
                                                    <SecuredButton
                                                        securityId="usuarios.eliminar"
                                                        securityDesc="Eliminar usuario"
                                                        size="sm"
                                                        variant="outline-danger"
                                                        iconOnly
                                                        icon={<Trash2 size={15} />}
                                                        onClick={() => handleDelete(user)}
                                                        title="Eliminar"
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
                title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
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
                    <DSAlert variant="error" dismissible onDismiss={() => setFormError(null)} className="usuarios-alert-margin">
                        {formError}
                    </DSAlert>
                )}

                <form className="usuarios-form" onSubmit={e => e.preventDefault()}>
                    <FormField
                        label="Nombre Completo"
                        required
                        help="Nombre y apellido del usuario. Será visible en el sistema."
                    >
                        <input
                            type="text"
                            className="ds-field__control"
                            value={form.name}
                            onChange={handleChange('name')}
                            placeholder="Ej: Juan Pérez"
                        />
                    </FormField>

                    <FormField
                        label="Correo Electrónico"
                        required
                        help="Email único para identificar al usuario. Se usa para notificaciones."
                    >
                        <input
                            type="email"
                            className="ds-field__control"
                            value={form.email}
                            onChange={handleChange('email')}
                            placeholder="correo@ejemplo.com"
                        />
                    </FormField>

                    <FormField
                        label={editingUser ? 'Contraseña (opcional)' : 'Contraseña'}
                        required={!editingUser}
                        help="Mínimo 6 caracteres. Al editar, dejar vacío para mantener la contraseña actual."
                    >
                        <input
                            type="password"
                            className="ds-field__control"
                            value={form.password}
                            onChange={handleChange('password')}
                            placeholder={editingUser ? 'Dejar vacío para mantener' : '••••••••'}
                        />
                    </FormField>

                    <FormField
                        label="Rol Asignado"
                        required
                        help="Define los permisos y menús que el usuario podrá ver."
                    >
                        <select
                            className="ds-field__control"
                            value={form.role_id}
                            onChange={handleChange('role_id')}
                        >
                            <option value="">-- Seleccionar --</option>
                            {roles.map(role => (
                                <option key={role.value} value={role.value}>
                                    {role.label}
                                </option>
                            ))}
                        </select>
                    </FormField>

                    <FormField
                        label="Estado"
                        help="Los usuarios inactivos no pueden iniciar sesión en el sistema."
                    >
                        <label className="usuarios-checkbox">
                            <input
                                type="checkbox"
                                checked={form.is_active}
                                onChange={handleChange('is_active')}
                            />
                            <span>Usuario Activo</span>
                        </label>
                    </FormField>
                </form>
            </DSModal>
        </DSPage>
    );
}

export default UsuariosPage;
