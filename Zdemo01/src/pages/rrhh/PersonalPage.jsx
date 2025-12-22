import React, { useState, useEffect, useCallback } from 'react';
import { UserCircle, Plus, Pencil, Trash2, Save, HelpCircle, Briefcase, Phone, Mail, Calendar } from 'lucide-react';
import { getPersonal, getEmpleado, createEmpleado, updateEmpleado, deleteEmpleado } from '../../services/personalService';
import { getCargosActivos } from '../../services/cargoService';

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
    DSModalSection,
    DSModalGrid,
    DSSearchSelect,
} from '../../ds-components';

import './PersonalPage.css';

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
            const [personalData, cargosData] = await Promise.all([
                getPersonal(),
                getCargosActivos()
            ]);
            setPersonal(personalData || []);
            setCargos(cargosData || []);
        } catch (err) {
            setError('Error cargando datos');
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
// COMPONENTE: Tooltip
// ============================================
function Tooltip({ text }) {
    return (
        <span className="personal-tooltip">
            <HelpCircle size={14} />
            <span className="personal-tooltip__text">{text}</span>
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
// COMPONENTE: EstadoBadge
// ============================================
function EstadoBadge({ estado }) {
    const variants = {
        activo: 'success',
        inactivo: 'error',
        licencia: 'warning',
        vacaciones: 'info',
        baja_medica: 'warning'
    };
    const labels = {
        activo: 'Activo',
        inactivo: 'Inactivo',
        licencia: 'Licencia',
        vacaciones: 'Vacaciones',
        baja_medica: 'Baja Médica'
    };
    return <DSBadge variant={variants[estado] || 'default'}>{labels[estado] || estado}</DSBadge>;
}

// ============================================
// COMPONENTE PRINCIPAL: PersonalPage
// ============================================
export function PersonalPage() {
    const { personal, cargos, loading, error: loadError, refetch } = usePersonal();

    // Estado del formulario
    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState(null);
    const [formSuccess, setFormSuccess] = useState(null);
    const [editingEmpleado, setEditingEmpleado] = useState(null);

    const emptyForm = {
        codigo_empleado: '',
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        ci: '',
        fecha_nacimiento: '',
        genero: '',
        direccion: '',
        telefono: '',
        email: '',
        cargo_id: '',
        fecha_ingreso: '',
        fecha_salida: '',
        salario: '',
        tipo_contrato: '',
        estado: 'activo',
        observaciones: ''
    };

    const [form, setForm] = useState(emptyForm);

    // Reset form
    const resetForm = useCallback(() => {
        setForm(emptyForm);
        setEditingEmpleado(null);
        setFormError(null);
    }, []);

    // Abrir modal para crear
    const openCreate = () => {
        resetForm();
        // Generar código automático
        const nextCode = `EMP-${String(personal.length + 1).padStart(4, '0')}`;
        setForm(prev => ({ ...prev, codigo_empleado: nextCode }));
        setModalOpen(true);
    };

    // Abrir modal para editar
    const openEdit = async (empleado) => {
        const empleadoDetail = await getEmpleado(empleado.id);
        if (empleadoDetail) {
            setEditingEmpleado(empleado);
            setForm({
                codigo_empleado: empleadoDetail.codigo_empleado || '',
                nombre: empleadoDetail.nombre || '',
                apellido_paterno: empleadoDetail.apellido_paterno || '',
                apellido_materno: empleadoDetail.apellido_materno || '',
                ci: empleadoDetail.ci || '',
                fecha_nacimiento: empleadoDetail.fecha_nacimiento || '',
                genero: empleadoDetail.genero || '',
                direccion: empleadoDetail.direccion || '',
                telefono: empleadoDetail.telefono || '',
                email: empleadoDetail.email || '',
                cargo_id: empleadoDetail.cargo_id || '',
                fecha_ingreso: empleadoDetail.fecha_ingreso || '',
                fecha_salida: empleadoDetail.fecha_salida || '',
                salario: empleadoDetail.salario || '',
                tipo_contrato: empleadoDetail.tipo_contrato || '',
                estado: empleadoDetail.estado || 'activo',
                observaciones: empleadoDetail.observaciones || ''
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
        const value = e.target.value;
        setForm(prev => ({ ...prev, [field]: value }));
    };

    // Validar formulario
    const validateForm = () => {
        if (!form.codigo_empleado.trim()) return 'El código de empleado es requerido';
        if (!form.nombre.trim()) return 'El nombre es requerido';
        if (!form.apellido_paterno.trim()) return 'El apellido paterno es requerido';
        if (!form.ci.trim()) return 'El CI es requerido';
        if (!form.cargo_id) return 'El cargo es requerido';
        if (!form.fecha_ingreso) return 'La fecha de ingreso es requerida';
        return null;
    };

    // Guardar empleado
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
                ...form,
                cargo_id: parseInt(form.cargo_id),
                salario: form.salario ? parseFloat(form.salario) : null,
                fecha_nacimiento: form.fecha_nacimiento || null,
                fecha_salida: form.fecha_salida || null,
                apellido_materno: form.apellido_materno || null,
                genero: form.genero || null,
                direccion: form.direccion || null,
                telefono: form.telefono || null,
                email: form.email || null,
                tipo_contrato: form.tipo_contrato || null,
                observaciones: form.observaciones || null,
            };

            let result;
            if (editingEmpleado) {
                result = await updateEmpleado(editingEmpleado.id, payload);
            } else {
                result = await createEmpleado(payload);
            }

            if (result.success) {
                setFormSuccess(editingEmpleado ? 'Empleado actualizado' : 'Empleado creado');
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

    // Eliminar empleado
    const handleDelete = async (empleado) => {
        if (!window.confirm(`¿Eliminar empleado "${empleado.nombre_completo}"?`)) return;

        try {
            const result = await deleteEmpleado(empleado.id);
            if (result.success) {
                setFormSuccess('Empleado eliminado');
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
                title="Gestión de Personal"
                icon={<UserCircle size={22} />}
                actions={
                    <DSButton variant="primary" icon={<Plus size={16} />} onClick={openCreate}>
                        Nuevo Empleado
                    </DSButton>
                }
            />

            {/* ALERTAS */}
            {formSuccess && (
                <DSAlert variant="success" dismissible onDismiss={() => setFormSuccess(null)} className="personal-alert-margin">
                    {formSuccess}
                </DSAlert>
            )}
            {loadError && (
                <DSAlert variant="error" className="personal-alert-margin">
                    {loadError}
                </DSAlert>
            )}

            {/* TABLA */}
            <DSSection
                title="Listado de Personal"
                actions={<span className="personal-panel__count">{personal.length} empleados</span>}
            >
                <div className="ds-table-wrapper">
                    {loading ? (
                        <DSLoading text="Cargando..." />
                    ) : (
                        <table className="ds-table ds-table--striped ds-table--hover">
                            <thead>
                                <tr>
                                    <th style={{ width: '8%' }}>Código</th>
                                    <th style={{ width: '22%' }}>Nombre Completo</th>
                                    <th style={{ width: '10%' }}>CI</th>
                                    <th style={{ width: '15%' }}>Cargo</th>
                                    <th style={{ width: '12%' }}>Teléfono</th>
                                    <th style={{ width: '10%' }}>Ingreso</th>
                                    <th style={{ width: '10%' }}>Estado</th>
                                    <th style={{ width: '13%' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {personal.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="ds-table__empty">
                                            No hay personal registrado
                                        </td>
                                    </tr>
                                ) : (
                                    personal.map(emp => (
                                        <tr key={emp.id}>
                                            <td><code>{emp.codigo_empleado}</code></td>
                                            <td><strong>{emp.nombre_completo}</strong></td>
                                            <td>{emp.ci}</td>
                                            <td>
                                                <span className="personal-cargo-badge">
                                                    <Briefcase size={12} />
                                                    {emp.cargo_nombre}
                                                </span>
                                            </td>
                                            <td>
                                                {emp.telefono && (
                                                    <span className="personal-contact">
                                                        <Phone size={12} />
                                                        {emp.telefono}
                                                    </span>
                                                )}
                                            </td>
                                            <td>{emp.fecha_ingreso}</td>
                                            <td><EstadoBadge estado={emp.estado} /></td>
                                            <td>
                                                <div className="ds-table__actions">
                                                    <DSButton
                                                        size="sm"
                                                        iconOnly
                                                        icon={<Pencil size={15} />}
                                                        onClick={() => openEdit(emp)}
                                                        title="Editar"
                                                    />
                                                    <DSButton
                                                        size="sm"
                                                        variant="outline-danger"
                                                        iconOnly
                                                        icon={<Trash2 size={15} />}
                                                        onClick={() => handleDelete(emp)}
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
                title={editingEmpleado ? 'Editar Empleado' : 'Nuevo Empleado'}
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
                    <DSAlert variant="error" dismissible onDismiss={() => setFormError(null)} className="personal-alert-margin">
                        {formError}
                    </DSAlert>
                )}

                <DSModalGrid>
                    {/* Columna izquierda: Datos personales */}
                    <div>
                        <DSModalSection title="Datos Personales">
                            <form className="personal-form" onSubmit={e => e.preventDefault()}>
                                <div className="personal-form__row">
                                    <FormField label="Código Empleado" required help="Identificador único del empleado en el sistema">
                                        <input
                                            type="text"
                                            className="ds-field__control"
                                            value={form.codigo_empleado}
                                            onChange={handleChange('codigo_empleado')}
                                            placeholder="EMP-0001"
                                        />
                                    </FormField>
                                    <FormField label="CI" required help="Carnet de identidad del empleado">
                                        <input
                                            type="text"
                                            className="ds-field__control"
                                            value={form.ci}
                                            onChange={handleChange('ci')}
                                            placeholder="12345678"
                                        />
                                    </FormField>
                                </div>

                                <FormField label="Nombre" required help="Nombre(s) del empleado">
                                    <input
                                        type="text"
                                        className="ds-field__control"
                                        value={form.nombre}
                                        onChange={handleChange('nombre')}
                                        placeholder="Juan"
                                    />
                                </FormField>

                                <div className="personal-form__row">
                                    <FormField label="Apellido Paterno" required>
                                        <input
                                            type="text"
                                            className="ds-field__control"
                                            value={form.apellido_paterno}
                                            onChange={handleChange('apellido_paterno')}
                                            placeholder="Pérez"
                                        />
                                    </FormField>
                                    <FormField label="Apellido Materno">
                                        <input
                                            type="text"
                                            className="ds-field__control"
                                            value={form.apellido_materno}
                                            onChange={handleChange('apellido_materno')}
                                            placeholder="García"
                                        />
                                    </FormField>
                                </div>

                                <div className="personal-form__row">
                                    <FormField label="Fecha Nacimiento">
                                        <input
                                            type="date"
                                            className="ds-field__control"
                                            value={form.fecha_nacimiento}
                                            onChange={handleChange('fecha_nacimiento')}
                                        />
                                    </FormField>
                                    <FormField label="Género">
                                        <select
                                            className="ds-field__control"
                                            value={form.genero}
                                            onChange={handleChange('genero')}
                                        >
                                            <option value="">Seleccionar...</option>
                                            <option value="M">Masculino</option>
                                            <option value="F">Femenino</option>
                                            <option value="O">Otro</option>
                                        </select>
                                    </FormField>
                                </div>

                                <FormField label="Dirección">
                                    <input
                                        type="text"
                                        className="ds-field__control"
                                        value={form.direccion}
                                        onChange={handleChange('direccion')}
                                        placeholder="Av. Principal #123"
                                    />
                                </FormField>

                                <div className="personal-form__row">
                                    <FormField label="Teléfono">
                                        <input
                                            type="text"
                                            className="ds-field__control"
                                            value={form.telefono}
                                            onChange={handleChange('telefono')}
                                            placeholder="70012345"
                                        />
                                    </FormField>
                                    <FormField label="Email">
                                        <input
                                            type="email"
                                            className="ds-field__control"
                                            value={form.email}
                                            onChange={handleChange('email')}
                                            placeholder="correo@ejemplo.com"
                                        />
                                    </FormField>
                                </div>
                            </form>
                        </DSModalSection>
                    </div>

                    {/* Columna derecha: Datos laborales */}
                    <div>
                        <DSModalSection title="Datos Laborales" icon={<Briefcase size={16} />}>
                            <form className="personal-form" onSubmit={e => e.preventDefault()}>
                                <FormField label="Cargo" required help="Cargo o puesto de trabajo asignado">
                                    <DSSearchSelect
                                        options={cargos.map(cargo => ({ value: cargo.id, label: cargo.nombre }))}
                                        value={form.cargo_id}
                                        onChange={(val) => setForm(prev => ({ ...prev, cargo_id: val }))}
                                        placeholder="Seleccionar cargo..."
                                        searchPlaceholder="Buscar cargo..."
                                    />
                                </FormField>

                                <div className="personal-form__row">
                                    <FormField label="Fecha Ingreso" required help="Fecha en que ingresó a la empresa">
                                        <input
                                            type="date"
                                            className="ds-field__control"
                                            value={form.fecha_ingreso}
                                            onChange={handleChange('fecha_ingreso')}
                                        />
                                    </FormField>
                                    <FormField label="Fecha Salida" help="Fecha de baja o término de contrato">
                                        <input
                                            type="date"
                                            className="ds-field__control"
                                            value={form.fecha_salida}
                                            onChange={handleChange('fecha_salida')}
                                        />
                                    </FormField>
                                </div>

                                <div className="personal-form__row">
                                    <FormField label="Salario" help="Salario mensual en moneda local">
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="ds-field__control"
                                            value={form.salario}
                                            onChange={handleChange('salario')}
                                            placeholder="0.00"
                                        />
                                    </FormField>
                                    <FormField label="Tipo Contrato" help="Tipo de contrato laboral">
                                        <input
                                            type="text"
                                            className="ds-field__control"
                                            value={form.tipo_contrato}
                                            onChange={handleChange('tipo_contrato')}
                                            placeholder="Ej: Indefinido, Temporal..."
                                        />
                                    </FormField>
                                </div>

                                <FormField label="Estado" help="Estado laboral actual del empleado">
                                    <select
                                        className="ds-field__control"
                                        value={form.estado}
                                        onChange={handleChange('estado')}
                                    >
                                        <option value="activo">Activo</option>
                                        <option value="inactivo">Inactivo</option>
                                        <option value="licencia">Licencia</option>
                                        <option value="vacaciones">Vacaciones</option>
                                        <option value="baja_medica">Baja Médica</option>
                                    </select>
                                </FormField>

                                <FormField label="Observaciones">
                                    <textarea
                                        className="ds-field__control personal-textarea"
                                        value={form.observaciones}
                                        onChange={handleChange('observaciones')}
                                        placeholder="Notas adicionales..."
                                        rows={3}
                                    />
                                </FormField>
                            </form>
                        </DSModalSection>
                    </div>
                </DSModalGrid>
            </DSModal>
        </DSPage>
    );
}

export default PersonalPage;
