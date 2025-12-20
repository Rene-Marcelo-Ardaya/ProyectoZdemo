import React, { useState, useEffect, useCallback } from 'react';
import {
    Users,
    Plus,
    Edit2,
    Trash2,
    Search,
    UserPlus,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Save,
    X
} from 'lucide-react';
import {
    fetchPersonal,
    createPersonal,
    updatePersonal,
    deletePersonal,
    getAvailableUsers
} from '../../services/personalService';

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
    DSTextField,
    DSTextArea,
    DSComboBox,
    DSDateField,
    DSField,
    DSFieldsGrid,
    DSFieldsRow,
    DSEmpty,
} from '../../ds-components';

import './PersonalPage.css';

// ============================================
// CUSTOM HOOK: usePersonal
// ============================================
function usePersonal() {
    const [personal, setPersonal] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchPersonal();
            if (result.success) {
                setPersonal(result.data || []);
            } else {
                setError(result.error || 'Error cargando personal');
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

    return { personal, loading, error, refetch: fetchData };
}

// ============================================
// COMPONENTE: PersonalTable
// ============================================
function PersonalTable({ data, onEdit, onDelete, searchTerm }) {
    const filteredData = data.filter(p => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            p.nombre_completo?.toLowerCase().includes(term) ||
            p.ci?.toLowerCase().includes(term) ||
            p.celular?.includes(term) ||
            p.email_personal?.toLowerCase().includes(term)
        );
    });

    if (filteredData.length === 0) {
        return (
            <DSEmpty
                icon={<Users size={48} />}
                title="No se encontró personal"
                description={searchTerm ? "Intenta con otros términos de búsqueda" : "Crea el primer registro de personal"}
            />
        );
    }

    return (
        <div className="personal-table">
            <table>
                <thead>
                    <tr>
                        <th>Nombre Completo</th>
                        <th>CI</th>
                        <th>Contacto</th>
                        <th>Ciudad</th>
                        <th>Estado</th>
                        <th>Usuarios</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map(p => (
                        <tr key={p.id}>
                            <td>
                                <div className="personal-name">
                                    <strong>{p.nombre_completo}</strong>
                                    {p.fecha_nacimiento && (
                                        <span className="personal-birth">
                                            <Calendar size={12} />
                                            {p.fecha_nacimiento}
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td>{p.ci || '-'}</td>
                            <td>
                                <div className="personal-contact">
                                    {p.celular_completo && (
                                        <span><Phone size={12} /> {p.celular_completo}</span>
                                    )}
                                    {p.email_personal && (
                                        <span><Mail size={12} /> {p.email_personal}</span>
                                    )}
                                </div>
                            </td>
                            <td>
                                {p.ciudad && (
                                    <span className="personal-city">
                                        <MapPin size={12} /> {p.ciudad}
                                    </span>
                                )}
                            </td>
                            <td>
                                <DSBadge variant={p.is_active ? 'success' : 'warning'}>
                                    {p.is_active ? 'Activo' : 'Inactivo'}
                                </DSBadge>
                            </td>
                            <td>
                                {p.users?.length > 0 ? (
                                    <div className="personal-users">
                                        {p.users.map(u => (
                                            <DSBadge key={u.id} variant="info" size="sm">
                                                {u.name}
                                            </DSBadge>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-muted">Sin vincular</span>
                                )}
                            </td>
                            <td>
                                <div className="personal-actions">
                                    <DSButton
                                        size="sm"
                                        iconOnly
                                        icon={<Edit2 size={14} />}
                                        onClick={() => onEdit(p)}
                                        title="Editar"
                                    />
                                    <DSButton
                                        size="sm"
                                        variant="outline-danger"
                                        iconOnly
                                        icon={<Trash2 size={14} />}
                                        onClick={() => onDelete(p)}
                                        title="Eliminar"
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
// COMPONENTE: PersonalForm
// ============================================
function PersonalForm({ isOpen, onClose, onSave, editData, availableUsers }) {
    const [form, setForm] = useState({
        nombre: '',
        apellidos: '',
        ci: '',
        fecha_nacimiento: '',
        genero: '',
        codigo_pais: '591',
        celular: '',
        email_personal: '',
        direccion: '',
        ciudad: '',
        is_active: true,
        notas: '',
        user_ids: [],
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [userSearch, setUserSearch] = useState('');

    useEffect(() => {
        if (editData) {
            setForm({
                nombre: editData.nombre || '',
                apellidos: editData.apellidos || '',
                ci: editData.ci || '',
                fecha_nacimiento: editData.fecha_nacimiento || '',
                genero: editData.genero || '',
                codigo_pais: editData.codigo_pais || '591',
                celular: editData.celular || '',
                email_personal: editData.email_personal || '',
                direccion: editData.direccion || '',
                ciudad: editData.ciudad || '',
                is_active: editData.is_active ?? true,
                notas: editData.notas || '',
                user_ids: editData.users?.map(u => u.id) || [],
            });
        } else {
            setForm({
                nombre: '',
                apellidos: '',
                ci: '',
                fecha_nacimiento: '',
                genero: '',
                codigo_pais: '591',
                celular: '',
                email_personal: '',
                direccion: '',
                ciudad: '',
                is_active: true,
                notas: '',
                user_ids: [],
            });
        }
        setError(null);
        setUserSearch('');
    }, [editData, isOpen]);

    const handleChange = (field) => (e) => {
        const value = e.target ? e.target.value : e;
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleUserToggle = (userId) => {
        setForm(prev => ({
            ...prev,
            user_ids: prev.user_ids.includes(userId)
                ? prev.user_ids.filter(id => id !== userId)
                : [...prev.user_ids, userId]
        }));
    };

    const handleSubmit = async () => {
        if (!form.nombre.trim() || !form.apellidos.trim()) {
            setError('Nombre y apellidos son requeridos');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const result = editData
                ? await updatePersonal(editData.id, form)
                : await createPersonal(form);

            if (result.success) {
                onSave();
                onClose();
            } else {
                setError(result.error || 'Error guardando');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setSaving(false);
        }
    };

    const generoOptions = [
        { value: '', label: 'Seleccionar...' },
        { value: 'M', label: 'Masculino' },
        { value: 'F', label: 'Femenino' },
        { value: 'O', label: 'Otro' },
    ];

    const codigoPaisOptions = [
        { value: '591', label: '+591 (Bolivia)' },
        { value: '54', label: '+54 (Argentina)' },
        { value: '55', label: '+55 (Brasil)' },
        { value: '56', label: '+56 (Chile)' },
        { value: '57', label: '+57 (Colombia)' },
        { value: '593', label: '+593 (Ecuador)' },
        { value: '595', label: '+595 (Paraguay)' },
        { value: '51', label: '+51 (Perú)' },
        { value: '598', label: '+598 (Uruguay)' },
        { value: '58', label: '+58 (Venezuela)' },
        { value: '1', label: '+1 (USA/Canada)' },
        { value: '34', label: '+34 (España)' },
    ];

    return (
        <DSModal
            isOpen={isOpen}
            onClose={onClose}
            title={editData ? 'Editar Personal' : 'Nuevo Personal'}
            size="lg"
            footer={
                <>
                    <DSButton onClick={onClose} disabled={saving}>
                        Cancelar
                    </DSButton>
                    <DSButton
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={saving}
                        loading={saving}
                        icon={!saving && <Save size={16} />}
                    >
                        {saving ? 'Guardando...' : 'Guardar'}
                    </DSButton>
                </>
            }
        >
            {error && (
                <DSAlert variant="error" dismissible onDismiss={() => setError(null)} className="mb-3">
                    {error}
                </DSAlert>
            )}

            <div className="personal-form">
                {/* Datos Personales */}
                <div className="form-section">
                    <h4>Datos Personales</h4>
                    <DSFieldsGrid columns={2}>
                        <DSTextField
                            label="Nombre"
                            value={form.nombre}
                            onChange={handleChange('nombre')}
                            required
                            placeholder="Nombre(s)"
                        />
                        <DSTextField
                            label="Apellidos"
                            value={form.apellidos}
                            onChange={handleChange('apellidos')}
                            required
                            placeholder="Apellido paterno y materno"
                        />
                    </DSFieldsGrid>

                    <DSFieldsGrid columns={3}>
                        <DSTextField
                            label="CI"
                            value={form.ci}
                            onChange={handleChange('ci')}
                            placeholder="Carnet de identidad"
                        />
                        <DSDateField
                            label="Fecha de Nacimiento"
                            value={form.fecha_nacimiento}
                            onChange={handleChange('fecha_nacimiento')}
                        />
                        <DSComboBox
                            label="Género"
                            value={form.genero}
                            onChange={handleChange('genero')}
                            options={generoOptions}
                        />
                    </DSFieldsGrid>
                </div>

                {/* Contacto */}
                <div className="form-section">
                    <h4>Contacto</h4>
                    <DSFieldsGrid columns={3}>
                        <DSComboBox
                            label="Código País"
                            value={form.codigo_pais}
                            onChange={handleChange('codigo_pais')}
                            options={codigoPaisOptions}
                        />
                        <DSTextField
                            label="Celular"
                            value={form.celular}
                            onChange={handleChange('celular')}
                            placeholder="Número sin código de país"
                        />
                        <DSTextField
                            label="Email Personal"
                            value={form.email_personal}
                            onChange={handleChange('email_personal')}
                            type="email"
                            placeholder="correo@ejemplo.com"
                        />
                    </DSFieldsGrid>

                    <DSFieldsGrid columns={2}>
                        <DSTextField
                            label="Ciudad"
                            value={form.ciudad}
                            onChange={handleChange('ciudad')}
                            placeholder="Ciudad de residencia"
                        />
                        <DSTextArea
                            label="Dirección"
                            value={form.direccion}
                            onChange={handleChange('direccion')}
                            placeholder="Dirección completa"
                            rows={2}
                        />
                    </DSFieldsGrid>
                </div>

                {/* Usuarios Vinculados */}
                <div className="form-section">
                    <h4>
                        <UserPlus size={16} /> Vincular Usuarios del Sistema
                    </h4>
                    <p className="form-section-help">
                        Selecciona los usuarios que corresponden a esta persona
                    </p>

                    {/* Buscador de usuarios */}
                    <div className="users-search">
                        <Search size={14} />
                        <input
                            type="text"
                            placeholder="Buscar usuario..."
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                        />
                        {userSearch && (
                            <button type="button" onClick={() => setUserSearch('')} className="users-search__clear">
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <div className="users-grid-container">
                        <div className="users-grid">
                            {availableUsers
                                .filter(user => {
                                    if (!userSearch) return true;
                                    const term = userSearch.toLowerCase();
                                    return user.name.toLowerCase().includes(term) ||
                                        user.email.toLowerCase().includes(term);
                                })
                                .map(user => (
                                    <label key={user.id} className={`user-checkbox ${form.user_ids.includes(user.id) ? 'selected' : ''}`}>
                                        <input
                                            type="checkbox"
                                            checked={form.user_ids.includes(user.id)}
                                            onChange={() => handleUserToggle(user.id)}
                                        />
                                        <div className="user-info">
                                            <span className="user-name">{user.name}</span>
                                            <span className="user-email">{user.email}</span>
                                        </div>
                                    </label>
                                ))}
                            {availableUsers.length === 0 && (
                                <p className="text-muted">No hay usuarios disponibles</p>
                            )}
                            {availableUsers.length > 0 && userSearch &&
                                availableUsers.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())).length === 0 && (
                                    <p className="text-muted">No se encontraron usuarios</p>
                                )}
                        </div>
                    </div>
                </div>

                {/* Notas */}
                <div className="form-section">
                    <DSTextArea
                        label="Notas"
                        value={form.notas}
                        onChange={handleChange('notas')}
                        placeholder="Notas adicionales..."
                        rows={2}
                    />
                </div>
            </div>
        </DSModal>
    );
}

// ============================================
// COMPONENTE PRINCIPAL: PersonalPage
// ============================================
export function PersonalPage() {
    const { personal, loading, error: loadError, refetch } = usePersonal();

    const [searchTerm, setSearchTerm] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [alert, setAlert] = useState(null);

    // Cargar usuarios disponibles
    useEffect(() => {
        const loadUsers = async () => {
            const result = await getAvailableUsers();
            if (result.success) {
                setAvailableUsers(result.data);
            }
        };
        loadUsers();
    }, []);

    const handleCreate = () => {
        setEditData(null);
        setModalOpen(true);
    };

    const handleEdit = (persona) => {
        setEditData(persona);
        setModalOpen(true);
    };

    const handleDelete = async (persona) => {
        if (!window.confirm(`¿Eliminar a "${persona.nombre_completo}"? Esta acción no se puede deshacer.`)) {
            return;
        }

        const result = await deletePersonal(persona.id);
        if (result.success) {
            setAlert({ type: 'success', message: 'Personal eliminado correctamente' });
            refetch();
        } else {
            setAlert({ type: 'error', message: result.error });
        }
    };

    const handleSave = () => {
        setAlert({ type: 'success', message: editData ? 'Personal actualizado' : 'Personal creado' });
        refetch();
    };

    return (
        <DSPage>
            <DSPageHeader
                title="Gestión de Personal"
                icon={<Users size={22} />}
                actions={
                    <DSButton variant="primary" icon={<Plus size={16} />} onClick={handleCreate}>
                        Nuevo Personal
                    </DSButton>
                }
            />

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

            <DSSection
                title="Personal Registrado"
                actions={
                    <div className="personal-toolbar">
                        <div className="search-box">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, CI, celular..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <DSButton size="sm" onClick={refetch}>
                            Actualizar
                        </DSButton>
                    </div>
                }
            >
                {loading ? (
                    <DSLoading text="Cargando personal..." />
                ) : (
                    <PersonalTable
                        data={personal}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        searchTerm={searchTerm}
                    />
                )}
            </DSSection>

            <PersonalForm
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                editData={editData}
                availableUsers={availableUsers}
            />
        </DSPage>
    );
}

export default PersonalPage;
