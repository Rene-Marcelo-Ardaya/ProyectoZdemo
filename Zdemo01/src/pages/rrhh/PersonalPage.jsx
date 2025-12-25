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
    X,
    CheckCircle2,
    Briefcase,
    DollarSign,
} from 'lucide-react';
import {
    fetchPersonal,
    createPersonal,
    updatePersonal,
    deletePersonal,
    getAvailableUsers
} from '../../services/personalService';
import { fetchCargosActivos } from '../../services/cargoService';

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
    DSFieldsGrid,
    DSEmpty,
    DSTooltip,
} from '../../ds-components';

import WhatsappVerificationModal from '../../components/WhatsappVerificationModal';

import './PersonalPage.css';

// ============================================
// COMPONENTE: FormField con Tooltip
// ============================================
function FormField({ label, children, required, help }) {
    return (
        <div className="ds-field">
            <label className="ds-field__label">
                <span className="ds-field__label-text">
                    {label}
                    {help && <DSTooltip text={help} />}
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
// CUSTOM HOOK: usePersonal
// ============================================
function usePersonal() {
    const [personal, setPersonal] = useState([]);
    const [cargos, setCargos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [personalResult, cargosResult] = await Promise.all([
                fetchPersonal(),
                fetchCargosActivos()
            ]);

            if (personalResult.success) {
                setPersonal(personalResult.data || []);
            } else {
                setError(personalResult.error || 'Error cargando personal');
            }

            if (cargosResult.success) {
                setCargos(cargosResult.data || []);
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

    return { personal, cargos, loading, error, refetch: fetchData };
}

// ============================================
// COMPONENTE: PersonalTable
// ============================================
function PersonalTable({ data, onEdit, onDelete, onVerify, searchTerm }) {
    const filteredData = data.filter(p => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            p.nombre_completo?.toLowerCase().includes(term) ||
            p.ci?.toLowerCase().includes(term) ||
            p.celular?.includes(term) ||
            p.email_personal?.toLowerCase().includes(term) ||
            p.codigo_empleado?.toLowerCase().includes(term) ||
            p.cargo?.nombre?.toLowerCase().includes(term)
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
                        <th>Cargo</th>
                        <th>Contacto</th>
                        <th>Ingreso</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map(p => (
                        <tr key={p.id}>
                            <td>
                                <div className="personal-name">
                                    <strong>{p.nombre_completo}</strong>
                                    {p.codigo_empleado && (
                                        <span className="personal-code">
                                            {p.codigo_empleado}
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td>{p.ci || '-'}</td>
                            <td>
                                {p.cargo ? (
                                    <span className="personal-cargo-badge">
                                        <Briefcase size={12} />
                                        {p.cargo.nombre}
                                    </span>
                                ) : (
                                    <span className="text-muted">Sin cargo</span>
                                )}
                            </td>
                            <td>
                                <div className="personal-contact">
                                    {p.celular_completo && (
                                        <span className="personal-phone-row">
                                            <Phone size={12} />
                                            {p.celular_completo}
                                            {p.whatsapp?.status === 'verified' ? (
                                                <span className="whatsapp-verified" title="WhatsApp verificado">
                                                    <CheckCircle2 size={14} />
                                                </span>
                                            ) : p.celular && (
                                                <button
                                                    className="personal-verify-btn"
                                                    onClick={() => onVerify(p)}
                                                    title="Verificar WhatsApp"
                                                >
                                                    Verificar
                                                </button>
                                            )}
                                        </span>
                                    )}
                                    {p.email_personal && (
                                        <span><Mail size={12} /> {p.email_personal}</span>
                                    )}
                                </div>
                            </td>
                            <td>
                                {p.fecha_ingreso ? (
                                    <span className="personal-date">
                                        <Calendar size={12} />
                                        {p.fecha_ingreso}
                                    </span>
                                ) : '-'}
                            </td>
                            <td>
                                <DSBadge variant={p.estado_laboral === 'activo' ? 'success' : 'warning'}>
                                    {p.estado_laboral === 'activo' ? 'Activo' : 'Inactivo'}
                                </DSBadge>
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
                                        title="Desactivar"
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
function PersonalForm({ isOpen, onClose, onSave, editData, availableUsers, cargos }) {
    const [form, setForm] = useState({
        codigo_empleado: '',
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        ci: '',
        fecha_nacimiento: '',
        genero: '',
        codigo_pais: '591',
        celular: '',
        email_personal: '',
        direccion: '',
        ciudad: '',
        // Datos laborales
        cargo_id: '',
        fecha_ingreso: '',
        fecha_salida: '',
        salario: '',
        tipo_contrato: '',
        estado_laboral: 'activo',
        // Estado
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
                codigo_empleado: editData.codigo_empleado || '',
                nombre: editData.nombre || '',
                apellido_paterno: editData.apellido_paterno || '',
                apellido_materno: editData.apellido_materno || '',
                ci: editData.ci || '',
                fecha_nacimiento: editData.fecha_nacimiento || '',
                genero: editData.genero || '',
                codigo_pais: editData.codigo_pais || '591',
                celular: editData.celular || '',
                email_personal: editData.email_personal || '',
                direccion: editData.direccion || '',
                ciudad: editData.ciudad || '',
                // Datos laborales
                cargo_id: editData.cargo_id || '',
                fecha_ingreso: editData.fecha_ingreso || '',
                fecha_salida: editData.fecha_salida || '',
                salario: editData.salario || '',
                tipo_contrato: editData.tipo_contrato || '',
                estado_laboral: editData.estado_laboral || 'activo',
                // Estado
                is_active: editData.is_active ?? true,
                notas: editData.notas || '',
                user_ids: editData.users?.map(u => u.id) || [],
            });
        } else {
            setForm({
                codigo_empleado: '',
                nombre: '',
                apellido_paterno: '',
                apellido_materno: '',
                ci: '',
                fecha_nacimiento: '',
                genero: '',
                codigo_pais: '591',
                celular: '',
                email_personal: '',
                direccion: '',
                ciudad: '',
                cargo_id: '',
                fecha_ingreso: '',
                fecha_salida: '',
                salario: '',
                tipo_contrato: '',
                estado_laboral: 'activo',
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
        if (!form.nombre.trim() || !form.apellido_paterno.trim()) {
            setError('Nombre y apellido paterno son requeridos');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const payload = {
                ...form,
                cargo_id: form.cargo_id ? parseInt(form.cargo_id) : null,
                salario: form.salario ? parseFloat(form.salario) : null,
                fecha_nacimiento: form.fecha_nacimiento || null,
                fecha_ingreso: form.fecha_ingreso || null,
                fecha_salida: form.fecha_salida || null,
                apellido_materno: form.apellido_materno || null,
                genero: form.genero || null,
                direccion: form.direccion || null,
                tipo_contrato: form.tipo_contrato || null,
            };

            const result = editData
                ? await updatePersonal(editData.id, payload)
                : await createPersonal(payload);

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

    const estadoLaboralOptions = [
        { value: 'activo', label: 'Activo' },
        { value: 'inactivo', label: 'Inactivo' },
    ];

    const cargoOptions = [
        { value: '', label: 'Seleccionar cargo...' },
        ...cargos.map(c => ({ value: c.id.toString(), label: c.nombre }))
    ];

    return (
        <DSModal
            isOpen={isOpen}
            onClose={onClose}
            title={editData ? 'Editar Personal' : 'Nuevo Personal'}
            size="xl"
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
                    <h4><Users size={16} /> Datos Personales</h4>

                    <DSFieldsGrid columns={3}>
                        <DSTextField
                            label="Nombre"
                            value={form.nombre}
                            onChange={handleChange('nombre')}
                            required
                            placeholder="Nombre(s)"
                            tooltip="Nombre(s) del empleado"
                        />
                        <DSTextField
                            label="Apellido Paterno"
                            value={form.apellido_paterno}
                            onChange={handleChange('apellido_paterno')}
                            required
                            placeholder="Apellido paterno"
                            tooltip="Primer apellido del empleado"
                        />
                        <DSTextField
                            label="Apellido Materno"
                            value={form.apellido_materno}
                            onChange={handleChange('apellido_materno')}
                            placeholder="Apellido materno"
                            tooltip="Segundo apellido (opcional)"
                        />
                    </DSFieldsGrid>

                    <DSFieldsGrid columns={4}>
                        <DSTextField
                            label="Código Empleado"
                            value={form.codigo_empleado}
                            onChange={handleChange('codigo_empleado')}
                            placeholder="EMP-001"
                            tooltip="Código único de identificación interna"
                        />
                        <DSTextField
                            label="CI"
                            value={form.ci}
                            onChange={handleChange('ci')}
                            placeholder="Carnet de identidad"
                            tooltip="Carnet de identidad con extensión"
                        />
                        <DSComboBox
                            label="Género"
                            value={form.genero}
                            onChange={handleChange('genero')}
                            options={generoOptions}
                            tooltip="Género del empleado"
                        />
                        <DSDateField
                            label="Fecha Nacimiento"
                            value={form.fecha_nacimiento}
                            onChange={handleChange('fecha_nacimiento')}
                            tooltip="Fecha de nacimiento para calcular edad"
                        />
                    </DSFieldsGrid>

                    <DSFieldsGrid columns={2}>
                        <DSTextField
                            label="Ciudad"
                            value={form.ciudad}
                            onChange={handleChange('ciudad')}
                            placeholder="Ciudad de residencia"
                            tooltip="Ciudad donde reside el empleado"
                        />
                        <DSTextArea
                            label="Dirección"
                            value={form.direccion}
                            onChange={handleChange('direccion')}
                            placeholder="Dirección completa"
                            rows={2}
                            tooltip="Dirección de domicilio completa"
                        />
                    </DSFieldsGrid>
                </div>

                {/* Contacto */}
                <div className="form-section">
                    <h4><Phone size={16} /> Contacto</h4>
                    <DSFieldsGrid columns={3}>
                        <DSComboBox
                            label="Código País"
                            value={form.codigo_pais}
                            onChange={handleChange('codigo_pais')}
                            options={codigoPaisOptions}
                            tooltip="Código de país para WhatsApp"
                        />
                        <DSTextField
                            label="Celular"
                            value={form.celular}
                            onChange={handleChange('celular')}
                            placeholder="Número sin código de país"
                            tooltip="Solo el número, sin código de país"
                        />
                        <DSTextField
                            label="Email Personal"
                            value={form.email_personal}
                            onChange={handleChange('email_personal')}
                            type="email"
                            placeholder="correo@ejemplo.com"
                            tooltip="Correo electrónico personal"
                        />
                    </DSFieldsGrid>
                </div>

                {/* Datos Laborales */}
                <div className="form-section">
                    <h4><Briefcase size={16} /> Datos Laborales</h4>
                    <DSFieldsGrid columns={2}>
                        <DSComboBox
                            label="Cargo"
                            value={form.cargo_id}
                            onChange={handleChange('cargo_id')}
                            options={cargoOptions}
                            tooltip="Puesto de trabajo asignado"
                        />
                        <DSComboBox
                            label="Estado Laboral"
                            value={form.estado_laboral}
                            onChange={handleChange('estado_laboral')}
                            options={estadoLaboralOptions}
                            tooltip="Estado actual del empleado en la empresa"
                        />
                    </DSFieldsGrid>

                    <DSFieldsGrid columns={2}>
                        <DSDateField
                            label="Fecha de Ingreso"
                            value={form.fecha_ingreso}
                            onChange={handleChange('fecha_ingreso')}
                            tooltip="Fecha en que ingresó a la empresa"
                        />
                        <DSDateField
                            label="Fecha de Salida"
                            value={form.fecha_salida}
                            onChange={handleChange('fecha_salida')}
                            tooltip="Fecha de baja (si aplica)"
                        />
                    </DSFieldsGrid>

                    <DSFieldsGrid columns={2}>
                        <DSTextField
                            label="Salario"
                            value={form.salario}
                            onChange={handleChange('salario')}
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            tooltip="Salario mensual del empleado"
                        />
                        <DSTextField
                            label="Tipo de Contrato"
                            value={form.tipo_contrato}
                            onChange={handleChange('tipo_contrato')}
                            placeholder="Ej: Indefinido, Temporal..."
                            tooltip="Tipo de contrato laboral"
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
    const { personal, cargos, loading, error: loadError, refetch } = usePersonal();

    const [searchTerm, setSearchTerm] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [alert, setAlert] = useState(null);

    // WhatsApp Verification
    const [verifyModalOpen, setVerifyModalOpen] = useState(false);
    const [personaToVerify, setPersonaToVerify] = useState(null);

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
        if (!window.confirm(`¿Desactivar a "${persona.nombre_completo}"? Dejará de aparecer en el sistema.`)) {
            return;
        }

        const result = await deletePersonal(persona.id);
        if (result.success) {
            setAlert({ type: 'success', message: 'Personal desactivado correctamente' });
            refetch();
        } else {
            setAlert({ type: 'error', message: result.error });
        }
    };

    const handleSave = () => {
        setAlert({ type: 'success', message: editData ? 'Personal actualizado' : 'Personal creado' });
        refetch();
    };

    const handleVerify = (persona) => {
        setPersonaToVerify(persona);
        setVerifyModalOpen(true);
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
                                placeholder="Buscar por nombre, CI, cargo, celular..."
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
                        onVerify={handleVerify}
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
                cargos={cargos}
            />

            <WhatsappVerificationModal
                isOpen={verifyModalOpen}
                onClose={() => setVerifyModalOpen(false)}
                persona={personaToVerify}
                onVerified={() => {
                    refetch();
                    setAlert({ type: 'success', message: 'WhatsApp verificado correctamente' });
                }}
            />
        </DSPage>
    );
}

export default PersonalPage;
