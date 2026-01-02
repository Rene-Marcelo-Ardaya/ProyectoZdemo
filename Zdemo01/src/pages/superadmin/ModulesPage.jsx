import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus,
    Edit,
    Trash2,
    RefreshCw,
    Puzzle,
    Power,
    PowerOff,
    Package,
    Layers,
    Users,
    // Iconos disponibles para módulos
    Settings,
    Database,
    MessageSquare,
    Bell,
    Shield,
    FileText,
    BarChart2,
    Calendar,
    Mail,
    ShoppingCart,
    Truck,
    CreditCard,
    Wallet,
    Building,
    Factory,
    Warehouse,
    Box,
    Gauge,
    Fuel,
    Zap,
    Globe,
    Code,
    Terminal,
    Smartphone,
    Laptop,
    Cloud,
    Lock,
    Key,
    Eye,
    Search,
    Filter,
    Download,
    Upload,
    Share2,
    Link,
    Bookmark,
    Star,
    Heart,
    CheckCircle,
    AlertCircle,
    Info,
    HelpCircle,
} from 'lucide-react';
import {
    DSPageHeader,
    DSButton,
    DSLoading,
    DSEmpty,
    DSModal,
    DSTextField,
    DSNumberField,
    DSTextArea,
    DSCheckbox,
} from '../../ds-components';
import { getModules, createModule, updateModule, toggleModuleActive, deleteModule } from '../../services/tenantService';
import './ModulesPage.css';

// Mapa de iconos disponibles
const AVAILABLE_ICONS = {
    puzzle: { icon: Puzzle, label: 'Puzzle' },
    settings: { icon: Settings, label: 'Ajustes' },
    database: { icon: Database, label: 'Base de datos' },
    message: { icon: MessageSquare, label: 'Mensaje' },
    bell: { icon: Bell, label: 'Notificaciones' },
    shield: { icon: Shield, label: 'Seguridad' },
    file: { icon: FileText, label: 'Documentos' },
    chart: { icon: BarChart2, label: 'Reportes' },
    calendar: { icon: Calendar, label: 'Calendario' },
    mail: { icon: Mail, label: 'Correo' },
    cart: { icon: ShoppingCart, label: 'Ventas' },
    truck: { icon: Truck, label: 'Logística' },
    credit: { icon: CreditCard, label: 'Pagos' },
    wallet: { icon: Wallet, label: 'Finanzas' },
    building: { icon: Building, label: 'Empresa' },
    factory: { icon: Factory, label: 'Producción' },
    warehouse: { icon: Warehouse, label: 'Almacén' },
    box: { icon: Box, label: 'Inventario' },
    gauge: { icon: Gauge, label: 'Medidores' },
    fuel: { icon: Fuel, label: 'Combustible' },
    zap: { icon: Zap, label: 'Energía' },
    globe: { icon: Globe, label: 'Web' },
    code: { icon: Code, label: 'API' },
    terminal: { icon: Terminal, label: 'Consola' },
    phone: { icon: Smartphone, label: 'Móvil' },
    laptop: { icon: Laptop, label: 'Desktop' },
    cloud: { icon: Cloud, label: 'Nube' },
    lock: { icon: Lock, label: 'Acceso' },
    key: { icon: Key, label: 'Claves' },
    users: { icon: Users, label: 'Usuarios' },
    layers: { icon: Layers, label: 'Capas' },
    package: { icon: Package, label: 'Paquete' },
};

/**
 * ModulesPage - Gestión de Módulos del SaaS
 */
const ModulesPage = () => {
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingModule, setEditingModule] = useState(null);
    const [saving, setSaving] = useState(false);
    const [filter, setFilter] = useState('all');

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        icon: 'puzzle',
        price_monthly: 0,
        is_active: true,
        is_addon: false,
        sort_order: 0,
    });

    const loadModules = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const params = {};
            if (filter === 'addon') params.is_addon = true;
            if (filter === 'core') params.is_addon = false;

            const response = await getModules(params);

            if (response.success) {
                setModules(response.data || []);
            } else {
                setError('Error al cargar los módulos');
            }
        } catch (err) {
            console.error('Error loading modules:', err);
            setError(err.response?.data?.error || 'Error al conectar con el servidor');
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        loadModules();
    }, [loadModules]);

    const resetForm = () => {
        setFormData({
            name: '',
            slug: '',
            description: '',
            icon: 'puzzle',
            price_monthly: 0,
            is_active: true,
            is_addon: false,
            sort_order: 0,
        });
        setEditingModule(null);
    };

    const openCreateModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (module) => {
        if ((module.plans_count || 0) > 0 || (module.tenants_count || 0) > 0) {
            alert('No se puede editar un módulo que está en uso');
            return;
        }
        setEditingModule(module);
        setFormData({
            name: module.name || '',
            slug: module.slug || '',
            description: module.description || '',
            icon: module.icon || 'puzzle',
            price_monthly: module.price_monthly || 0,
            is_active: module.is_active ?? true,
            is_addon: module.is_addon ?? false,
            sort_order: module.sort_order || 0,
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        resetForm();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            let response;
            if (editingModule) {
                response = await updateModule(editingModule.id, formData);
            } else {
                response = await createModule(formData);
            }

            if (response.success) {
                closeModal();
                loadModules();
            } else {
                setError(response.error || 'Error al guardar');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Error al guardar el módulo');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async (module) => {
        try {
            const response = await toggleModuleActive(module.id);
            if (response.success) {
                loadModules();
            } else {
                alert(response.error || 'Error al cambiar estado');
            }
        } catch (err) {
            alert(err.response?.data?.error || 'Error al cambiar estado');
        }
    };

    const handleDelete = async (module) => {
        const inUse = (module.plans_count || 0) > 0 || (module.tenants_count || 0) > 0;
        if (inUse) {
            alert('No se puede eliminar un módulo que está en uso');
            return;
        }

        if (!confirm(`¿Estás seguro de eliminar el módulo "${module.name}"?`)) {
            return;
        }

        try {
            const response = await deleteModule(module.id);
            if (response.success) {
                loadModules();
            } else {
                alert(response.error || 'Error al eliminar');
            }
        } catch (err) {
            alert(err.response?.data?.error || 'Error al eliminar');
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        if (field === 'name' && !editingModule) {
            const slug = value.toLowerCase()
                .replace(/[^a-z0-9\s_]/g, '')
                .replace(/\s+/g, '_')
                .replace(/_+/g, '_');
            setFormData(prev => ({ ...prev, slug }));
        }
    };

    // Renderizar icono desde el mapa o fallback
    const renderIcon = (iconKey, size = 22) => {
        const iconData = AVAILABLE_ICONS[iconKey];
        if (iconData) {
            const IconComponent = iconData.icon;
            return <IconComponent size={size} />;
        }
        return <Puzzle size={size} />;
    };

    // Stats
    const totalModules = modules.length;
    const coreModules = modules.filter(m => !m.is_addon).length;
    const addonModules = modules.filter(m => m.is_addon).length;

    if (loading && modules.length === 0) {
        return <DSLoading text="Cargando módulos..." />;
    }

    return (
        <div className="modules-page">
            <DSPageHeader
                title="Gestión de Módulos"
                subtitle="Configura las funcionalidades disponibles en la plataforma"
            />

            {/* Summary Stats */}
            <div className="modules-summary">
                <div className="modules-summary__item">
                    <div className="modules-summary__icon modules-summary__icon--blue">
                        <Puzzle size={18} />
                    </div>
                    <div className="modules-summary__text">
                        <span className="modules-summary__value">{totalModules}</span>
                        <span className="modules-summary__label">Total Módulos</span>
                    </div>
                </div>
                <div className="modules-summary__item">
                    <div className="modules-summary__icon modules-summary__icon--green">
                        <Package size={18} />
                    </div>
                    <div className="modules-summary__text">
                        <span className="modules-summary__value">{coreModules}</span>
                        <span className="modules-summary__label">Core</span>
                    </div>
                </div>
                <div className="modules-summary__item">
                    <div className="modules-summary__icon modules-summary__icon--purple">
                        <Layers size={18} />
                    </div>
                    <div className="modules-summary__text">
                        <span className="modules-summary__value">{addonModules}</span>
                        <span className="modules-summary__label">Add-ons</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="modules-actions" style={{ marginTop: '1.5rem' }}>
                <div className="modules-actions-left">
                    <div className="modules-filter-tabs">
                        <button
                            className={`modules-filter-tab ${filter === 'all' ? 'modules-filter-tab--active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            Todos
                        </button>
                        <button
                            className={`modules-filter-tab ${filter === 'core' ? 'modules-filter-tab--active' : ''}`}
                            onClick={() => setFilter('core')}
                        >
                            Core
                        </button>
                        <button
                            className={`modules-filter-tab ${filter === 'addon' ? 'modules-filter-tab--active' : ''}`}
                            onClick={() => setFilter('addon')}
                        >
                            Add-ons
                        </button>
                    </div>
                </div>
                <div className="modules-actions-buttons">
                    <DSButton
                        icon={<RefreshCw size={16} className={loading ? 'spin-animation' : ''} />}
                        variant="ghost"
                        onClick={loadModules}
                        disabled={loading}
                    >
                        Actualizar
                    </DSButton>
                    <DSButton
                        icon={<Plus size={16} />}
                        variant="primary"
                        onClick={openCreateModal}
                    >
                        Nuevo Módulo
                    </DSButton>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="tenants-error" style={{ marginTop: '1rem' }}>
                    <p>{error}</p>
                    <button onClick={loadModules}>Reintentar</button>
                </div>
            )}

            {/* Modules Grid */}
            {modules.length > 0 ? (
                <div className="modules-grid">
                    {modules.map((module) => {
                        const inUse = (module.plans_count || 0) > 0 || (module.tenants_count || 0) > 0;
                        return (
                            <div
                                key={module.id}
                                className={`module-card ${module.is_addon ? 'module-card--addon' : ''} ${!module.is_active ? 'module-card--inactive' : ''}`}
                            >
                                <div className="module-card__header">
                                    <div className="module-card__icon">
                                        {renderIcon(module.icon, 22)}
                                    </div>
                                    <div className="module-card__info">
                                        <h3 className="module-card__name">{module.name}</h3>
                                        <p className="module-card__slug">{module.slug}</p>
                                    </div>
                                    <span className={`module-badge ${module.is_addon ? 'module-badge--addon' : 'module-badge--core'}`}>
                                        {module.is_addon ? 'Add-on' : 'Core'}
                                    </span>
                                </div>

                                <div className="module-card__body">
                                    <p className="module-card__description">
                                        {module.description || 'Sin descripción'}
                                    </p>
                                </div>

                                <div className="module-card__meta">
                                    <span className={`module-card__price ${!module.price_monthly ? 'module-card__price--free' : ''}`}>
                                        {module.price_monthly ? `$${module.price_monthly}/mes` : 'Incluido'}
                                    </span>
                                    <div className="module-card__stats">
                                        <span className="module-card__stat">
                                            <Layers size={12} />
                                            <span className="module-card__stat-value">{module.plans_count || 0}</span>
                                            planes
                                        </span>
                                        <span className="module-card__stat">
                                            <Users size={12} />
                                            <span className="module-card__stat-value">{module.tenants_count || 0}</span>
                                            clientes
                                        </span>
                                    </div>
                                </div>

                                <div className="module-card__actions">
                                    <DSButton
                                        icon={<Edit size={14} />}
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => openEditModal(module)}
                                        disabled={inUse}
                                        title={inUse ? 'En uso' : 'Editar'}
                                    >
                                        Editar
                                    </DSButton>
                                    <DSButton
                                        icon={module.is_active ? <PowerOff size={14} /> : <Power size={14} />}
                                        variant={module.is_active ? 'warning' : 'success'}
                                        size="sm"
                                        onClick={() => handleToggleActive(module)}
                                    >
                                        {module.is_active ? 'Desactivar' : 'Activar'}
                                    </DSButton>
                                    <DSButton
                                        icon={<Trash2 size={14} />}
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleDelete(module)}
                                        disabled={inUse}
                                        title={inUse ? 'En uso' : 'Eliminar'}
                                    >
                                        Eliminar
                                    </DSButton>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <DSEmpty
                    title="No hay módulos"
                    description="Crea tu primer módulo de funcionalidad"
                />
            )}

            {/* Modal con Preview */}
            <DSModal
                isOpen={showModal}
                onClose={closeModal}
                title={editingModule ? 'Editar Módulo' : 'Nuevo Módulo'}
                icon={<Puzzle size={20} />}
                size="lg"
            >
                <div className="module-modal">
                    {/* Preview Card */}
                    <div className="module-modal__preview">
                        <div className="module-modal__preview-label">Vista previa</div>
                        <div className={`module-card module-card--preview ${formData.is_addon ? 'module-card--addon' : ''}`}>
                            <div className="module-card__header">
                                <div className="module-card__icon">
                                    {renderIcon(formData.icon, 22)}
                                </div>
                                <div className="module-card__info">
                                    <h3 className="module-card__name">{formData.name || 'Nombre del módulo'}</h3>
                                    <p className="module-card__slug">{formData.slug || 'slug_modulo'}</p>
                                </div>
                                <span className={`module-badge ${formData.is_addon ? 'module-badge--addon' : 'module-badge--core'}`}>
                                    {formData.is_addon ? 'Add-on' : 'Core'}
                                </span>
                            </div>
                            <div className="module-card__body">
                                <p className="module-card__description">
                                    {formData.description || 'Descripción del módulo...'}
                                </p>
                            </div>
                            <div className="module-card__meta">
                                <span className={`module-card__price ${!formData.price_monthly ? 'module-card__price--free' : ''}`}>
                                    {formData.price_monthly ? `$${formData.price_monthly}/mes` : 'Incluido'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="module-modal__form">
                        {/* Nombre y Slug */}
                        <div className="module-form__row">
                            <DSTextField
                                label="Nombre del módulo"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                required
                                placeholder="Ej: Gestión de Inventarios"
                                help="Nombre visible para los clientes"
                            />
                            <DSTextField
                                label="Slug (identificador)"
                                value={formData.slug}
                                onChange={(e) => handleInputChange('slug', e.target.value)}
                                required
                                placeholder="inventarios"
                                help="Solo letras, números y guión bajo"
                            />
                        </div>

                        {/* Descripción */}
                        <DSTextArea
                            label="Descripción"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Describe qué hace este módulo..."
                            rows={2}
                            help="Breve descripción de la funcionalidad"
                        />

                        {/* Selector de Iconos */}
                        <div className="module-form__field">
                            <label className="module-form__label">Icono</label>
                            <div className="module-form__icon-grid">
                                {Object.entries(AVAILABLE_ICONS).map(([key, { icon: Icon, label }]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        className={`module-form__icon-btn ${formData.icon === key ? 'module-form__icon-btn--selected' : ''}`}
                                        onClick={() => handleInputChange('icon', key)}
                                        title={label}
                                    >
                                        <Icon size={20} />
                                    </button>
                                ))}
                            </div>
                            <p className="module-form__help">Selecciona un icono para identificar el módulo</p>
                        </div>

                        {/* Precio y Orden */}
                        <div className="module-form__row">
                            <DSNumberField
                                label="Precio mensual ($)"
                                value={formData.price_monthly}
                                onChange={(e) => handleInputChange('price_monthly', parseFloat(e.target.value) || 0)}
                                min={0}
                                step={0.01}
                                help="0 = incluido en el plan"
                            />
                            <DSNumberField
                                label="Orden de visualización"
                                value={formData.sort_order}
                                onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value) || 0)}
                                min={0}
                                help="Orden en listados"
                            />
                        </div>

                        {/* Checkboxes */}
                        <div className="module-form__options">
                            <DSCheckbox
                                label="Módulo activo"
                                checked={formData.is_active}
                                onChange={(checked) => handleInputChange('is_active', checked)}
                                help="Los módulos inactivos no están disponibles"
                            />
                            <DSCheckbox
                                label="Es Add-on (compra por separado)"
                                checked={formData.is_addon}
                                onChange={(checked) => handleInputChange('is_addon', checked)}
                                help="Los add-ons se venden como extras"
                            />
                        </div>

                        {/* Actions */}
                        <div className="module-form__actions">
                            <DSButton variant="ghost" onClick={closeModal} type="button">
                                Cancelar
                            </DSButton>
                            <DSButton
                                variant="primary"
                                type="submit"
                                disabled={saving || !formData.name || !formData.slug}
                                icon={saving ? <RefreshCw size={16} className="spin-animation" /> : null}
                            >
                                {saving ? 'Guardando...' : (editingModule ? 'Actualizar' : 'Crear Módulo')}
                            </DSButton>
                        </div>
                    </form>
                </div>
            </DSModal>
        </div>
    );
};

export default ModulesPage;
