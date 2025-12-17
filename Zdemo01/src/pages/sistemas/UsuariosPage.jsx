import React, { useState, useEffect, useCallback } from 'react';
import { Users, UserPlus, Pencil, Trash2, X, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { getUsers, getRolesList, createUser, updateUser, deleteUser } from '../../services/userService';
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
// COMPONENTE: Modal
// ============================================
function Modal({ isOpen, onClose, title, children, footer }) {
    if (!isOpen) return null;

    return (
        <div className="usuarios-modal-overlay" onClick={onClose}>
            <div className="usuarios-modal" onClick={e => e.stopPropagation()}>
                <div className="usuarios-modal__header">
                    <span className="usuarios-modal__title">{title}</span>
                    <button className="usuarios-modal__close" onClick={onClose} type="button">
                        <X size={18} />
                    </button>
                </div>
                <div className="usuarios-modal__body">
                    {children}
                </div>
                {footer && (
                    <div className="usuarios-modal__footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================
// COMPONENTE: FormField
// ============================================
function FormField({ label, children, required }) {
    return (
        <div className="usuarios-form__field">
            <label className="usuarios-form__label">
                {label}
                {required && <span className="usuarios-form__required">*</span>}
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
        <div className={`usuarios-alert usuarios-alert--${type}`}>
            <Icon size={16} />
            <span>{message}</span>
            {onDismiss && (
                <button onClick={onDismiss} className="usuarios-alert__dismiss">
                    <X size={14} />
                </button>
            )}
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

    return (
        <div className="usuarios-page">
            {/* HEADER */}
            <div className="usuarios-page__header">
                <div className="usuarios-page__title">
                    <Users size={22} />
                    <h1>Gestión de Usuarios</h1>
                </div>
                <button className="usuarios-btn usuarios-btn--primary" onClick={openCreate}>
                    <UserPlus size={16} />
                    <span>Nuevo Usuario</span>
                </button>
            </div>

            {/* ALERTAS */}
            <Alert type="success" message={formSuccess} onDismiss={() => setFormSuccess(null)} />
            <Alert type="error" message={loadError} />

            {/* TABLA */}
            <div className="usuarios-panel">
                <div className="usuarios-panel__header">
                    <span>Listado de Usuarios</span>
                    <span className="usuarios-panel__count">{users.length} registros</span>
                </div>
                <div className="usuarios-table-wrapper">
                    {loading ? (
                        <div className="usuarios-loading">
                            <Loader2 size={24} className="spin" />
                            <span>Cargando...</span>
                        </div>
                    ) : (
                        <table className="usuarios-table">
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
                                        <td colSpan="6" className="usuarios-table__empty">
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
                                                <span className={`usuarios-badge ${user.is_active == 1 || user.is_active === true || user.is_active === 'Activo' ? 'is-active' : 'is-inactive'}`}>
                                                    {user.is_active == 1 || user.is_active === true || user.is_active === 'Activo' ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="usuarios-actions">
                                                    <button
                                                        className="usuarios-btn usuarios-btn--icon"
                                                        onClick={() => openEdit(user)}
                                                        title="Editar"
                                                    >
                                                        <Pencil size={15} />
                                                    </button>
                                                    <button
                                                        className="usuarios-btn usuarios-btn--icon usuarios-btn--danger"
                                                        onClick={() => handleDelete(user)}
                                                        title="Eliminar"
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
                title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                footer={
                    <>
                        <button className="usuarios-btn" onClick={closeModal} disabled={saving}>
                            Cancelar
                        </button>
                        <button
                            className="usuarios-btn usuarios-btn--primary"
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

                <form className="usuarios-form" onSubmit={e => e.preventDefault()}>
                    <FormField label="Nombre Completo" required>
                        <input
                            type="text"
                            className="usuarios-input"
                            value={form.name}
                            onChange={handleChange('name')}
                            placeholder="Ej: Juan Pérez"
                        />
                    </FormField>

                    <FormField label="Correo Electrónico" required>
                        <input
                            type="email"
                            className="usuarios-input"
                            value={form.email}
                            onChange={handleChange('email')}
                            placeholder="correo@ejemplo.com"
                        />
                    </FormField>

                    <FormField label={editingUser ? 'Contraseña (opcional)' : 'Contraseña'} required={!editingUser}>
                        <input
                            type="password"
                            className="usuarios-input"
                            value={form.password}
                            onChange={handleChange('password')}
                            placeholder={editingUser ? 'Dejar vacío para mantener' : '••••••••'}
                        />
                    </FormField>

                    <FormField label="Rol Asignado" required>
                        <select
                            className="usuarios-input usuarios-select"
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

                    <FormField label="Estado">
                        <label className="usuarios-checkbox">
                            <input
                                type="checkbox"
                                checked={form.is_active}
                                onChange={handleChange('is_active')}
                            />
                            <span className="usuarios-checkbox__mark"></span>
                            <span>Usuario Activo</span>
                        </label>
                    </FormField>
                </form>
            </Modal>
        </div>
    );
}

export default UsuariosPage;
