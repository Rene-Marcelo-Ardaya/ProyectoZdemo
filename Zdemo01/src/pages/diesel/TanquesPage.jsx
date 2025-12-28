import React, { useState, useEffect, useCallback } from 'react';
import {
    Fuel,
    Plus,
    Edit2,
    Trash2,
    Search,
    Save,
    AlertTriangle,
    Truck,
    Factory,
    MapPin,
    Bell,
    Settings,
} from 'lucide-react';
import {
    fetchTanques,
    createTanque,
    updateTanque,
    deleteTanque,
    fetchAlertConfigurations,
    createAlertConfiguration,
    updateAlertConfiguration,
    deleteAlertConfiguration,
    fetchEvolutionInstances,
    fetchWhatsAppGroups,
} from '../../services/dieselService';
import { fetchPersonal } from '../../services/personalService';

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
    DSFieldsGrid,
    DSEmpty,
    DSTooltip,
} from '../../ds-components';

import { SecuredButton } from '../../ds-forms/SecuredButton';

import './TanquesPage.css';

// ============================================
// COMPONENTE: TanqueGauge (Indicador Visual de Nivel)
// ============================================
function TanqueGauge({ nivel, capacidad, size = 'normal' }) {
    const porcentaje = capacidad > 0 ? Math.round((nivel / capacidad) * 100) : 0;

    let colorClass = 'gauge-high';
    if (porcentaje <= 20) colorClass = 'gauge-critical';
    else if (porcentaje <= 40) colorClass = 'gauge-low';
    else if (porcentaje <= 60) colorClass = 'gauge-medium';

    return (
        <div className={`tanque-gauge tanque-gauge--${size}`}>
            <div className="tanque-gauge__container">
                <div
                    className={`tanque-gauge__fill ${colorClass}`}
                    style={{ height: `${porcentaje}%` }}
                />
                <div className="tanque-gauge__label">{porcentaje}%</div>
            </div>
            <div className="tanque-gauge__info">
                <span className="tanque-gauge__nivel">{nivel.toLocaleString()} L</span>
                <span className="tanque-gauge__capacidad">/ {capacidad.toLocaleString()} L</span>
            </div>
        </div>
    );
}

// ============================================
// COMPONENTE: TanqueCard
// ============================================
function TanqueCard({ tanque, onEdit, onDelete }) {
    const esMovil = tanque.tipo === 'MOVIL';

    return (
        <div className={`tanque-card ${tanque.nivel_bajo ? 'tanque-card--alerta' : ''}`}>
            <div className="tanque-card__header">
                <div className="tanque-card__tipo">
                    {esMovil ? (
                        <Truck size={18} className="icon-movil" />
                    ) : (
                        <Factory size={18} className="icon-estatico" />
                    )}
                    <DSBadge variant={esMovil ? 'info' : 'default'} size="sm">
                        {tanque.tipo_descripcion}
                    </DSBadge>
                </div>
                {tanque.nivel_bajo && (
                    <DSBadge variant="warning" size="sm">
                        <AlertTriangle size={12} /> Nivel Bajo
                    </DSBadge>
                )}
            </div>

            <h3 className="tanque-card__nombre">{tanque.nombre}</h3>
            {tanque.codigo && (
                <span className="tanque-card__codigo">{tanque.codigo}</span>
            )}

            <TanqueGauge
                nivel={tanque.nivel_actual}
                capacidad={tanque.capacidad_litros}
            />

            <div className="tanque-card__detalles">
                {esMovil ? (
                    <>
                        <div className="tanque-card__detalle">
                            <Truck size={14} />
                            <span>Placa: <strong>{tanque.placa_cisterna}</strong></span>
                        </div>
                        {tanque.responsable && (
                            <div className="tanque-card__detalle">
                                <span>Responsable: {tanque.responsable.nombre_completo}</span>
                            </div>
                        )}
                    </>
                ) : (
                    tanque.ubicacion_fija && (
                        <div className="tanque-card__detalle">
                            <MapPin size={14} />
                            <span>{tanque.ubicacion_fija}</span>
                        </div>
                    )
                )}
            </div>

            <div className="tanque-card__footer">
                <DSBadge variant={tanque.is_active ? 'success' : 'neutral'} size="sm">
                    {tanque.is_active ? 'Activo' : 'Inactivo'}
                </DSBadge>
                <div className="tanque-card__actions">
                    <SecuredButton
                        securityId="diesel.tanques.editar"
                        securityDesc="Editar Tanque"
                        size="sm"
                        iconOnly
                        icon={<Edit2 size={14} />}
                        onClick={() => onEdit(tanque)}
                        title="Editar"
                    />
                    <SecuredButton
                        securityId="diesel.tanques.eliminar"
                        securityDesc="Eliminar Tanque"
                        size="sm"
                        variant="outline-danger"
                        iconOnly
                        icon={<Trash2 size={14} />}
                        onClick={() => onDelete(tanque)}
                        title="Eliminar"
                    />
                </div>
            </div>
        </div>
    );
}

// ============================================
// COMPONENTE: TanqueForm (Modal)
// ============================================
function TanqueForm({ isOpen, onClose, onSave, editData, responsables }) {
    const [form, setForm] = useState({
        nombre: '',
        codigo: '',
        tipo: 'ESTATICO',
        capacidad_litros: '',
        nivel_actual: '',
        nivel_minimo_alerta: '',
        ubicacion_fija: '',
        placa_cisterna: '',
        responsable_id: '',
        is_active: true,
        observaciones: '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (editData) {
            setForm({
                nombre: editData.nombre || '',
                codigo: editData.codigo || '',
                tipo: editData.tipo || 'ESTATICO',
                capacidad_litros: editData.capacidad_litros || '',
                nivel_actual: editData.nivel_actual || '',
                nivel_minimo_alerta: editData.nivel_minimo_alerta || '',
                ubicacion_fija: editData.ubicacion_fija || '',
                placa_cisterna: editData.placa_cisterna || '',
                responsable_id: editData.responsable_id || '',
                is_active: editData.is_active ?? true,
                observaciones: editData.observaciones || '',
            });
        } else {
            setForm({
                nombre: '',
                codigo: '',
                tipo: 'ESTATICO',
                capacidad_litros: '',
                nivel_actual: '0',
                nivel_minimo_alerta: '',
                ubicacion_fija: '',
                placa_cisterna: '',
                responsable_id: '',
                is_active: true,
                observaciones: '',
            });
        }
        setError(null);
    }, [editData, isOpen]);

    const handleChange = (field) => (e) => {
        const value = e.target ? e.target.value : e;
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!form.nombre.trim()) {
            setError('El nombre es requerido');
            return;
        }
        if (!form.capacidad_litros || parseFloat(form.capacidad_litros) <= 0) {
            setError('La capacidad debe ser mayor a 0');
            return;
        }
        if (form.tipo === 'MOVIL' && !form.placa_cisterna.trim()) {
            setError('La placa es requerida para tanques móviles');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const payload = {
                ...form,
                capacidad_litros: parseFloat(form.capacidad_litros),
                nivel_actual: parseFloat(form.nivel_actual) || 0,
                nivel_minimo_alerta: parseFloat(form.nivel_minimo_alerta) || 0,
                responsable_id: form.responsable_id ? parseInt(form.responsable_id) : null,
            };

            const result = editData
                ? await updateTanque(editData.id, payload)
                : await createTanque(payload);

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

    const tipoOptions = [
        { value: 'ESTATICO', label: '🏭 Estático (Fijo en planta)' },
        { value: 'MOVIL', label: '🚚 Móvil (Cisterna)' },
    ];

    const responsableOptions = [
        { value: '', label: 'Sin responsable asignado' },
        ...responsables.map(r => ({
            value: r.id.toString(),
            label: r.nombre_completo
        }))
    ];

    const esMovil = form.tipo === 'MOVIL';

    return (
        <DSModal
            isOpen={isOpen}
            onClose={onClose}
            title={editData ? 'Editar Tanque' : 'Nuevo Tanque'}
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

            <div className="tanque-form">
                {/* Tipo de Tanque */}
                <DSFieldsGrid columns={2}>
                    <DSComboBox
                        label="Tipo de Tanque"
                        value={form.tipo}
                        onChange={handleChange('tipo')}
                        options={tipoOptions}
                        required
                        editable={false}
                        tooltip="Estático: fijo en planta. Móvil: cisterna que va a campo."
                    />
                    <DSTextField
                        label="Código"
                        value={form.codigo}
                        onChange={handleChange('codigo')}
                        placeholder="TP-001"
                        tooltip="Código único de identificación"
                    />
                </DSFieldsGrid>

                {/* Nombre */}
                <DSTextField
                    label="Nombre del Tanque"
                    value={form.nombre}
                    onChange={handleChange('nombre')}
                    required
                    placeholder="Ej: Tanque Principal Base"
                />

                {/* Capacidad y Niveles */}
                <DSFieldsGrid columns={3}>
                    <DSTextField
                        label="Capacidad (Litros)"
                        value={form.capacidad_litros}
                        onChange={handleChange('capacidad_litros')}
                        type="number"
                        required
                        placeholder="10000"
                        tooltip="Capacidad máxima del tanque"
                    />
                    <DSTextField
                        label="Nivel Actual (Litros)"
                        value={form.nivel_actual}
                        onChange={handleChange('nivel_actual')}
                        type="number"
                        placeholder="0"
                        tooltip="Cantidad de combustible actualmente"
                    />
                    <DSTextField
                        label="Nivel Mínimo Alerta"
                        value={form.nivel_minimo_alerta}
                        onChange={handleChange('nivel_minimo_alerta')}
                        type="number"
                        placeholder="1000"
                        tooltip="Se mostrará alerta cuando el nivel sea menor o igual a este valor"
                    />
                </DSFieldsGrid>

                {/* Campos según tipo */}
                {esMovil ? (
                    <DSFieldsGrid columns={2}>
                        <DSTextField
                            label="Placa de Cisterna"
                            value={form.placa_cisterna}
                            onChange={handleChange('placa_cisterna')}
                            required
                            placeholder="ABC-1234"
                            tooltip="Placa del vehículo cisterna"
                        />
                        <DSComboBox
                            label="Responsable"
                            value={form.responsable_id}
                            onChange={handleChange('responsable_id')}
                            options={responsableOptions}
                            tooltip="Persona responsable de la cisterna"
                        />
                    </DSFieldsGrid>
                ) : (
                    <DSTextField
                        label="Ubicación"
                        value={form.ubicacion_fija}
                        onChange={handleChange('ubicacion_fija')}
                        placeholder="Ej: Planta Central - Zona de Despacho"
                        tooltip="Ubicación física del tanque"
                    />
                )}

                {/* Estado */}
                <DSFieldsGrid columns={2}>
                    <DSComboBox
                        label="Estado"
                        value={form.is_active ? 'true' : 'false'}
                        onChange={(e) => setForm(prev => ({
                            ...prev,
                            is_active: e.target.value === 'true'
                        }))}
                        options={[
                            { value: 'true', label: 'Activo' },
                            { value: 'false', label: 'Inactivo' },
                        ]}
                    />
                </DSFieldsGrid>

                {/* Observaciones */}
                <DSTextArea
                    label="Observaciones"
                    value={form.observaciones}
                    onChange={handleChange('observaciones')}
                    placeholder="Notas adicionales..."
                    rows={2}
                />
            </div>
        </DSModal>
    );
}

// ============================================
// CUSTOM HOOK: useTanques
// ============================================
const POLLING_INTERVAL = 60000; // 60 segundos

function useTanques() {
    const [tanques, setTanques] = useState([]);
    const [responsables, setResponsables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async (showLoading = true) => {
        if (showLoading) {
            setLoading(true);
        }
        setError(null);
        try {
            const [tanquesResult, personalResult] = await Promise.all([
                fetchTanques(),
                fetchPersonal()
            ]);

            if (tanquesResult.success) {
                setTanques(tanquesResult.data || []);
            } else {
                setError(tanquesResult.error || 'Error cargando tanques');
            }

            if (personalResult.success) {
                setResponsables(personalResult.data || []);
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    }, []);

    // Carga inicial
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Polling automático cada 60 segundos
    useEffect(() => {
        const interval = setInterval(() => {
            // Refetch silencioso (sin mostrar loading)
            fetchData(false);
        }, POLLING_INTERVAL);

        // Limpiar intervalo al desmontar
        return () => clearInterval(interval);
    }, [fetchData]);

    return { tanques, responsables, loading, error, refetch: fetchData };
}

// ============================================
// COMPONENTE PRINCIPAL: TanquesPage
// ============================================
export function TanquesPage() {
    const { tanques, responsables, loading, error: loadError, refetch } = useTanques();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterTipo, setFilterTipo] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [alert, setAlert] = useState(null);
    const [showAlertasModal, setShowAlertasModal] = useState(false);

    // Filtrar tanques
    const filteredTanques = tanques.filter(t => {
        // Filtro por búsqueda
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const matchSearch =
                t.nombre?.toLowerCase().includes(term) ||
                t.codigo?.toLowerCase().includes(term) ||
                t.placa_cisterna?.toLowerCase().includes(term) ||
                t.ubicacion_fija?.toLowerCase().includes(term);
            if (!matchSearch) return false;
        }
        // Filtro por tipo
        if (filterTipo && t.tipo !== filterTipo) return false;
        return true;
    });

    // Separar por tipo para mostrar
    const estaticos = filteredTanques.filter(t => t.tipo === 'ESTATICO');
    const moviles = filteredTanques.filter(t => t.tipo === 'MOVIL');

    const handleCreate = () => {
        setEditData(null);
        setModalOpen(true);
    };

    const handleEdit = (tanque) => {
        setEditData(tanque);
        setModalOpen(true);
    };

    const handleDelete = async (tanque) => {
        if (!window.confirm(`¿Eliminar el tanque "${tanque.nombre}"?`)) {
            return;
        }

        const result = await deleteTanque(tanque.id);
        if (result.success) {
            setAlert({ type: 'success', message: 'Tanque eliminado correctamente' });
            refetch();
        } else {
            setAlert({ type: 'error', message: result.error });
        }
    };

    const handleSave = () => {
        setAlert({ type: 'success', message: editData ? 'Tanque actualizado' : 'Tanque creado' });
        refetch();
    };

    if (loading) {
        return (
            <DSPage>
                <DSLoading text="Cargando tanques..." />
            </DSPage>
        );
    }

    return (
        <DSPage>
            <DSPageHeader
                title="Gestión de Tanques"
                icon={<Fuel size={22} />}
                actions={
                    <SecuredButton
                        securityId="diesel.tanques.crear"
                        securityDesc="Crear Nuevo Tanque"
                        variant="primary"
                        icon={<Plus size={16} />}
                        onClick={handleCreate}
                    >
                        Nuevo Tanque
                    </SecuredButton>
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

            {/* Barra de filtros */}
            <DSSection style={{ overflow: 'visible', marginBottom: '24px' }}>
                <div className="tanques-toolbar">
                    <div className="search-box">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, código, placa..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="tanques-filters">
                        <SecuredButton
                            securityId="DIESEL_ALERTAS_CONFIG"
                            securityDesc="Configurar Alertas de Tanques"
                            size="sm"
                            variant="outline"
                            icon={<Bell size={16} />}
                            onClick={() => setShowAlertasModal(true)}
                            style={{ marginRight: '8px' }}
                        >
                            Alertas
                        </SecuredButton>
                        <select
                            className="ds-combobox__select"
                            value={filterTipo}
                            onChange={(e) => setFilterTipo(e.target.value)}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: '1px solid var(--ds-fieldBorder)',
                                background: 'var(--ds-fieldBg)',
                                color: 'var(--ds-fieldText)',
                                minWidth: '180px',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="">Todos los tipos</option>
                            <option value="ESTATICO">🏭 Estáticos</option>
                            <option value="MOVIL">🚚 Móviles</option>
                        </select>
                        <DSButton size="sm" onClick={refetch}>
                            Actualizar
                        </DSButton>
                    </div>
                </div>
            </DSSection>

            {/* Tanques Estáticos */}
            {(filterTipo === '' || filterTipo === 'ESTATICO') && (
                <DSSection
                    title={
                        <span className="section-title-with-icon">
                            <Factory size={18} />
                            Tanques Estáticos
                            <DSBadge variant="neutral" size="sm">{estaticos.length}</DSBadge>
                        </span>
                    }
                >
                    {estaticos.length === 0 ? (
                        <DSEmpty
                            icon={<Factory size={48} />}
                            title="Sin tanques estáticos"
                            description="No hay tanques fijos registrados"
                        />
                    ) : (
                        <div className="tanques-grid">
                            {estaticos.map(tanque => (
                                <TanqueCard
                                    key={tanque.id}
                                    tanque={tanque}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </DSSection>
            )}

            {/* Tanques Móviles */}
            {(filterTipo === '' || filterTipo === 'MOVIL') && (
                <DSSection
                    title={
                        <span className="section-title-with-icon">
                            <Truck size={18} />
                            Tanques Móviles (Cisternas)
                            <DSBadge variant="neutral" size="sm">{moviles.length}</DSBadge>
                        </span>
                    }
                >
                    {moviles.length === 0 ? (
                        <DSEmpty
                            icon={<Truck size={48} />}
                            title="Sin tanques móviles"
                            description="No hay cisternas registradas"
                        />
                    ) : (
                        <div className="tanques-grid">
                            {moviles.map(tanque => (
                                <TanqueCard
                                    key={tanque.id}
                                    tanque={tanque}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </DSSection>
            )}

            {/* Modal de Formulario */}
            <TanqueForm
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                editData={editData}
                responsables={responsables}
            />

            {/* Modal de Alertas */}
            <AlertasConfigModal
                isOpen={showAlertasModal}
                onClose={() => setShowAlertasModal(false)}
                tanques={tanques}
            />
        </DSPage>
    );
}

// ============================================
// COMPONENTE: AlertasConfigModal
// ============================================
function AlertasConfigModal({ isOpen, onClose, tanques }) {
    const [alertConfigs, setAlertConfigs] = useState([]);
    const [evolutionInstances, setEvolutionInstances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingConfig, setEditingConfig] = useState(null);

    // Form state
    const [form, setForm] = useState({
        name: '',
        type: 'whatsapp',
        is_enabled: true,
        config: { instance: '', destination: '' },
        min_interval_minutes: 30,
        tanque_ids: [],
    });
    const [tanqueSearch, setTanqueSearch] = useState('');
    const [whatsappGroups, setWhatsappGroups] = useState([]);
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [destinationType, setDestinationType] = useState('group'); // 'group' o 'number'

    useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [isOpen]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [alertsResult, instancesResult] = await Promise.all([
                fetchAlertConfigurations(),
                fetchEvolutionInstances(),
            ]);
            if (alertsResult.success) setAlertConfigs(alertsResult.data);
            if (instancesResult.success) setEvolutionInstances(instancesResult.data);
        } catch (err) {
            setError('Error cargando datos');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        const payload = {
            ...form,
            tanque_ids: form.tanque_ids.length > 0 ? form.tanque_ids : tanques.map(t => t.id),
        };

        const result = editingConfig
            ? await updateAlertConfiguration(editingConfig.id, payload)
            : await createAlertConfiguration(payload);

        if (result.success) {
            loadData();
            setShowForm(false);
            setEditingConfig(null);
            resetForm();
        } else {
            setError(result.error);
        }
    };

    const handleEdit = async (config) => {
        const configData = config.config || { instance: '', destination: '' };

        // Detectar si es grupo o número por el formato del destino
        const isGroup = configData.destination?.includes('@g.us');
        setDestinationType(isGroup ? 'group' : 'number');

        setForm({
            name: config.name,
            type: config.type,
            is_enabled: config.is_enabled,
            config: configData,
            min_interval_minutes: config.min_interval_minutes,
            tanque_ids: config.tanques || [],
        });
        setEditingConfig(config);
        setShowForm(true);

        // Si es WhatsApp y tiene instancia, cargar grupos
        if (config.type === 'whatsapp' && configData.instance) {
            setLoadingGroups(true);
            const result = await fetchWhatsAppGroups(configData.instance);
            setLoadingGroups(false);
            if (result.success) setWhatsappGroups(result.data);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar esta configuración de alerta?')) return;
        const result = await deleteAlertConfiguration(id);
        if (result.success) loadData();
    };

    const resetForm = () => {
        setForm({
            name: '',
            type: 'whatsapp',
            is_enabled: true,
            config: { instance: '', destination: '' },
            min_interval_minutes: 30,
            tanque_ids: [],
        });
    };

    if (!isOpen) return null;

    return (
        <DSModal
            isOpen={isOpen}
            onClose={onClose}
            title="⚙️ Configuración de Alertas"
            size="large"
        >
            <div style={{ padding: '16px' }}>
                {loading ? (
                    <DSLoading />
                ) : error ? (
                    <DSAlert variant="error">{error}</DSAlert>
                ) : showForm ? (
                    /* Formulario de alerta */
                    <div className="alert-form">
                        <DSTextField
                            label="Nombre de la alerta"
                            value={form.name}
                            onChange={(v) => setForm({ ...form, name: v })}
                            placeholder="Ej: Alertas Gerencia"
                            required
                        />

                        <DSComboBox
                            label="Tipo de alerta"
                            value={form.type}
                            onChange={(v) => setForm({ ...form, type: v })}
                            options={[
                                { value: 'whatsapp', label: '📱 WhatsApp' },
                                { value: 'email', label: '📧 Email (próximamente)' },
                                { value: 'sms', label: '💬 SMS (próximamente)' },
                            ]}
                            required
                            editable={false}
                        />

                        {/* Advertencia solo para WhatsApp */}
                        {form.type === 'whatsapp' && (
                            <>
                                <DSAlert variant="warning" className="mb-3" style={{ marginTop: '12px' }}>
                                    <strong>⚠️ Importante:</strong> Este sistema utiliza una versión no oficial de la API de WhatsApp
                                    a través de Evolution API. El envío excesivo de mensajes puede resultar en bloqueo temporal
                                    o permanente del número de teléfono. Se recomienda:
                                    <ul style={{ margin: '8px 0 0 16px', padding: 0 }}>
                                        <li>Configurar intervalos mínimos de 30+ minutos</li>
                                        <li>Evitar enviar mensajes masivos</li>
                                    </ul>
                                </DSAlert>

                                <DSComboBox
                                    label="Instancia de Evolution API"
                                    value={form.config.instance}
                                    onChange={(v) => {
                                        setForm({ ...form, config: { ...form.config, instance: v, destination: '' } });
                                    }}
                                    options={evolutionInstances.map(i => ({ value: i.name, label: `${i.name} (${i.status})` }))}
                                    placeholder="Seleccionar instancia conectada"
                                    required
                                    editable={false}
                                />

                                <DSTextField
                                    label="Número de teléfono"
                                    value={form.config.destination}
                                    onChange={(v) => setForm({ ...form, config: { ...form.config, destination: v } })}
                                    placeholder="Ej: 59172345678"
                                    tooltip="Número con código de país sin el +"
                                    required
                                />
                            </>
                        )}

                        {form.type !== 'whatsapp' && (
                            <DSAlert variant="info" style={{ marginTop: '12px' }}>
                                Esta opción estará disponible próximamente.
                            </DSAlert>
                        )}

                        <DSTextField
                            label="Intervalo mínimo entre alertas (minutos)"
                            value={form.min_interval_minutes}
                            onChange={(v) => setForm({ ...form, min_interval_minutes: parseInt(v) || 30 })}
                            type="number"
                            tooltip="Tiempo mínimo entre alertas para evitar spam"
                        />

                        <div style={{ marginTop: '16px' }}>
                            <label style={{ fontWeight: 500, marginBottom: '8px', display: 'block' }}>
                                Tanques a monitorear:
                            </label>
                            <input
                                type="text"
                                placeholder="🔍 Buscar tanque..."
                                value={tanqueSearch}
                                onChange={(e) => setTanqueSearch(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    marginBottom: '8px',
                                    border: '1px solid var(--ds-fieldBorder)',
                                    borderRadius: '6px',
                                    background: 'var(--ds-fieldBg)',
                                    color: 'var(--ds-fieldText)',
                                }}
                            />
                            <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--ds-fieldBorder)', borderRadius: '6px', padding: '8px' }}>
                                {tanques
                                    .filter(t =>
                                        !tanqueSearch ||
                                        t.nombre?.toLowerCase().includes(tanqueSearch.toLowerCase()) ||
                                        t.codigo?.toLowerCase().includes(tanqueSearch.toLowerCase())
                                    )
                                    .map(t => (
                                        <label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
                                            <input
                                                type="checkbox"
                                                checked={form.tanque_ids.includes(t.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setForm({ ...form, tanque_ids: [...form.tanque_ids, t.id] });
                                                    } else {
                                                        setForm({ ...form, tanque_ids: form.tanque_ids.filter(id => id !== t.id) });
                                                    }
                                                }}
                                            />
                                            {t.tipo === 'MOVIL' ? '🚚' : '🏭'} {t.nombre} ({t.codigo})
                                        </label>
                                    ))}
                            </div>
                            <small style={{ color: 'var(--ds-fieldHint)' }}>
                                Si no seleccionas ninguno, se monitoreará todos los tanques.
                            </small>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--ds-fieldBorder)' }}>
                            <DSButton variant="ghost" onClick={() => { setShowForm(false); setEditingConfig(null); resetForm(); }}>
                                Cancelar
                            </DSButton>
                            <DSButton variant="primary" icon={<Save size={16} />} onClick={handleSubmit}>
                                {editingConfig ? 'Actualizar' : 'Guardar'}
                            </DSButton>
                        </div>
                    </div>
                ) : (
                    /* Lista de alertas */
                    <div>
                        <DSButton variant="primary" icon={<Plus size={16} />} onClick={() => setShowForm(true)} className="mb-3">
                            Nueva Alerta
                        </DSButton>

                        {alertConfigs.length === 0 ? (
                            <DSEmpty
                                icon={<Bell size={48} />}
                                title="Sin configuraciones"
                                description="No hay alertas configuradas"
                            />
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {alertConfigs.map(config => (
                                    <div
                                        key={config.id}
                                        style={{
                                            padding: '12px',
                                            border: '1px solid var(--ds-fieldBorder)',
                                            borderRadius: '8px',
                                            background: config.is_enabled ? 'var(--ds-cardBg)' : 'var(--ds-fieldDisabledBg)',
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <strong>{config.name}</strong>
                                                <DSBadge variant={config.is_enabled ? 'success' : 'default'} size="sm" style={{ marginLeft: '8px' }}>
                                                    {config.is_enabled ? 'Activo' : 'Inactivo'}
                                                </DSBadge>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <DSButton size="sm" variant="ghost" icon={<Edit2 size={14} />} onClick={() => handleEdit(config)} />
                                                <DSButton size="sm" variant="ghost" icon={<Trash2 size={14} />} onClick={() => handleDelete(config.id)} />
                                            </div>
                                        </div>
                                        <small style={{ color: 'var(--ds-fieldHint)' }}>
                                            📱 {config.type} | ⏱️ {config.min_interval_minutes} min | 🛢️ {config.tanques_nombres || 'Todos'}
                                        </small>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DSModal>
    );
}

export default TanquesPage;

