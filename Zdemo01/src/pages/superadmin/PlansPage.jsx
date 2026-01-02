import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus,
    Edit,
    Trash2,
    Check,
    Users,
    MessageSquare,
    HardDrive,
    RefreshCw,
    Layers,
    Power,
    PowerOff,
    CreditCard,
    Puzzle,
    Star
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
import { getPlans, createPlan, updatePlan, togglePlanActive, deletePlan, getModules } from '../../services/tenantService';
import './PlansPage.css';

/**
 * PlansPage - Gestión de Planes de Suscripción
 */
const PlansPage = () => {
    const [plans, setPlans] = useState([]);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        price_monthly: 0,
        price_yearly: 0,
        max_users: 5,
        max_whatsapp_instances: 1,
        storage_gb: 5,
        is_active: true,
        is_featured: false,
        sort_order: 0,
        module_ids: [],
    });

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [plansRes, modulesRes] = await Promise.all([
                getPlans(),
                getModules()
            ]);

            if (plansRes.success) {
                setPlans(plansRes.data || []);
            }
            if (modulesRes.success) {
                setModules(modulesRes.data || []);
            }
        } catch (err) {
            console.error('Error loading data:', err);
            setError('Error al conectar con el servidor');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const resetForm = () => {
        setFormData({
            name: '',
            slug: '',
            description: '',
            price_monthly: 0,
            price_yearly: 0,
            max_users: 5,
            max_whatsapp_instances: 1,
            storage_gb: 5,
            is_active: true,
            is_featured: false,
            sort_order: 0,
            module_ids: [],
        });
        setEditingPlan(null);
    };

    const openCreateModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (plan) => {
        if (plan.tenants_count > 0) {
            alert('No se puede editar un plan que tiene clientes activos');
            return;
        }
        setEditingPlan(plan);
        setFormData({
            name: plan.name || '',
            slug: plan.slug || '',
            description: plan.description || '',
            price_monthly: plan.price_monthly || 0,
            price_yearly: plan.price_yearly || 0,
            max_users: plan.max_users || 5,
            max_whatsapp_instances: plan.max_whatsapp_instances || 1,
            storage_gb: plan.storage_gb || 5,
            is_active: plan.is_active ?? true,
            is_featured: plan.is_featured ?? false,
            sort_order: plan.sort_order || 0,
            module_ids: plan.modules?.map(m => m.id) || [],
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
            if (editingPlan) {
                response = await updatePlan(editingPlan.id, formData);
            } else {
                response = await createPlan(formData);
            }

            if (response.success) {
                closeModal();
                loadData();
            } else {
                setError(response.error || 'Error al guardar');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Error al guardar el plan');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async (plan) => {
        try {
            const response = await togglePlanActive(plan.id);
            if (response.success) {
                loadData();
            } else {
                alert(response.error || 'Error al cambiar estado');
            }
        } catch (err) {
            alert(err.response?.data?.error || 'Error al cambiar estado');
        }
    };

    const handleDelete = async (plan) => {
        if (plan.tenants_count > 0) {
            alert('No se puede eliminar un plan con clientes activos');
            return;
        }

        if (!confirm(`¿Eliminar el plan "${plan.name}"?`)) return;

        try {
            const response = await deletePlan(plan.id);
            if (response.success) {
                loadData();
            } else {
                alert(response.error || 'Error al eliminar');
            }
        } catch (err) {
            alert(err.response?.data?.error || 'Error al eliminar');
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        if (field === 'name' && !editingPlan) {
            const slug = value.toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-');
            setFormData(prev => ({ ...prev, slug }));
        }
    };

    const toggleModule = (moduleId) => {
        setFormData(prev => {
            const current = prev.module_ids || [];
            if (current.includes(moduleId)) {
                return { ...prev, module_ids: current.filter(id => id !== moduleId) };
            } else {
                return { ...prev, module_ids: [...current, moduleId] };
            }
        });
    };

    // Separar módulos por tipo
    const coreModules = modules.filter(m => !m.is_addon && m.is_active);
    const addonModules = modules.filter(m => m.is_addon && m.is_active);

    // Stats
    const activePlans = plans.filter(p => p.is_active).length;
    const totalTenants = plans.reduce((sum, p) => sum + (p.tenants_count || 0), 0);

    if (loading && plans.length === 0) {
        return <DSLoading text="Cargando planes..." />;
    }

    return (
        <div className="plans-page">
            <DSPageHeader
                title="Gestión de Planes"
                subtitle="Configura los planes de suscripción disponibles"
            />

            {/* Summary Stats */}
            <div className="plans-summary">
                <div className="plans-summary__item">
                    <div className="plans-summary__icon plans-summary__icon--blue">
                        <Layers size={18} />
                    </div>
                    <div className="plans-summary__text">
                        <span className="plans-summary__value">{plans.length}</span>
                        <span className="plans-summary__label">Total Planes</span>
                    </div>
                </div>
                <div className="plans-summary__item">
                    <div className="plans-summary__icon plans-summary__icon--green">
                        <Check size={18} />
                    </div>
                    <div className="plans-summary__text">
                        <span className="plans-summary__value">{activePlans}</span>
                        <span className="plans-summary__label">Activos</span>
                    </div>
                </div>
                <div className="plans-summary__item">
                    <div className="plans-summary__icon plans-summary__icon--purple">
                        <Users size={18} />
                    </div>
                    <div className="plans-summary__text">
                        <span className="plans-summary__value">{totalTenants}</span>
                        <span className="plans-summary__label">Suscripciones</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="plans-actions" style={{ marginTop: '1.5rem' }}>
                <div />
                <div className="plans-actions-buttons">
                    <DSButton
                        icon={<RefreshCw size={16} className={loading ? 'spin-animation' : ''} />}
                        variant="ghost"
                        onClick={loadData}
                        disabled={loading}
                    >
                        Actualizar
                    </DSButton>
                    <DSButton
                        icon={<Plus size={16} />}
                        variant="primary"
                        onClick={openCreateModal}
                    >
                        Nuevo Plan
                    </DSButton>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="tenants-error" style={{ marginTop: '1rem' }}>
                    <p>{error}</p>
                    <button onClick={loadData}>Reintentar</button>
                </div>
            )}

            {/* Plans Grid */}
            {plans.length > 0 ? (
                <div className="plans-grid">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`plan-card ${plan.is_featured ? 'plan-card--featured' : ''} ${!plan.is_active ? 'plan-card--inactive' : ''}`}
                        >
                            <div className="plan-card__header">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h3 className="plan-card__name">{plan.name}</h3>
                                        <p className="plan-card__slug">/{plan.slug}</p>
                                    </div>
                                    <span className={`plan-status plan-status--${plan.is_active ? 'active' : 'inactive'}`}>
                                        {plan.is_active ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                            </div>

                            <div className="plan-card__pricing">
                                <div className="plan-card__price">
                                    <span className="plan-card__currency">$</span>
                                    <span className="plan-card__amount">{plan.price_monthly || 0}</span>
                                    <span className="plan-card__period">/mes</span>
                                </div>
                                {plan.price_yearly > 0 && plan.price_monthly > 0 && (
                                    <p className="plan-card__yearly">
                                        o ${plan.price_yearly}/año (ahorra {Math.round((1 - plan.price_yearly / (plan.price_monthly * 12)) * 100)}%)
                                    </p>
                                )}
                            </div>

                            <div className="plan-card__features">
                                <div className="plan-card__feature">
                                    <Users size={16} />
                                    <span className="plan-card__feature-value">
                                        {plan.max_users === -1 ? '∞' : (plan.max_users ?? 0)}
                                    </span>
                                    <span>usuarios</span>
                                </div>
                                <div className="plan-card__feature">
                                    <MessageSquare size={16} />
                                    <span className="plan-card__feature-value">
                                        {plan.max_whatsapp_instances === -1 ? '∞' : (plan.max_whatsapp_instances ?? 0)}
                                    </span>
                                    <span>WhatsApp</span>
                                </div>
                                <div className="plan-card__feature">
                                    <HardDrive size={16} />
                                    <span className="plan-card__feature-value">
                                        {plan.storage_gb === -1 ? '∞' : `${plan.storage_gb ?? 0}GB`}
                                    </span>
                                </div>
                            </div>

                            {/* Módulos incluidos */}
                            {plan.modules && plan.modules.length > 0 && (
                                <div className="plan-card__modules">
                                    <div className="plan-card__modules-label">
                                        <Puzzle size={12} />
                                        <span>{plan.modules.length} módulos</span>
                                    </div>
                                    <div className="plan-card__modules-list">
                                        {plan.modules.slice(0, 4).map(m => (
                                            <span key={m.id} className={`plan-card__module-badge ${m.is_addon ? 'plan-card__module-badge--addon' : ''}`}>
                                                {m.name}
                                            </span>
                                        ))}
                                        {plan.modules.length > 4 && (
                                            <span className="plan-card__module-badge plan-card__module-badge--more">
                                                +{plan.modules.length - 4}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="plan-card__stats">
                                <div className="plan-card__stat">
                                    <div className="plan-card__stat-value">{plan.tenants_count || 0}</div>
                                    <div className="plan-card__stat-label">Clientes</div>
                                </div>
                                <div className="plan-card__stat">
                                    <div className="plan-card__stat-value">{plan.modules_count || 0}</div>
                                    <div className="plan-card__stat-label">Módulos</div>
                                </div>
                            </div>

                            <div className="plan-card__actions">
                                <DSButton
                                    icon={<Edit size={14} />}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openEditModal(plan)}
                                    disabled={plan.tenants_count > 0}
                                    title={plan.tenants_count > 0 ? 'Tiene clientes' : 'Editar'}
                                >
                                    Editar
                                </DSButton>
                                <DSButton
                                    icon={plan.is_active ? <PowerOff size={14} /> : <Power size={14} />}
                                    variant={plan.is_active ? 'warning' : 'success'}
                                    size="sm"
                                    onClick={() => handleToggleActive(plan)}
                                >
                                    {plan.is_active ? 'Desactivar' : 'Activar'}
                                </DSButton>
                                <DSButton
                                    icon={<Trash2 size={14} />}
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleDelete(plan)}
                                    disabled={plan.tenants_count > 0}
                                >
                                    Eliminar
                                </DSButton>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <DSEmpty
                    title="No hay planes"
                    description="Crea tu primer plan de suscripción"
                />
            )}

            {/* Modal con Preview y Selector de Módulos */}
            <DSModal
                isOpen={showModal}
                onClose={closeModal}
                title={editingPlan ? 'Editar Plan' : 'Nuevo Plan'}
                icon={<CreditCard size={20} />}
                size="xl"
            >
                <div className="plan-modal">
                    {/* Preview */}
                    <div className="plan-modal__preview">
                        <div className="plan-modal__preview-label">Vista previa</div>
                        <div className={`plan-card plan-card--preview ${formData.is_featured ? 'plan-card--featured' : ''}`}>
                            <div className="plan-card__header">
                                <div>
                                    <h3 className="plan-card__name">{formData.name || 'Nombre del plan'}</h3>
                                    <p className="plan-card__slug">/{formData.slug || 'slug'}</p>
                                </div>
                            </div>
                            <div className="plan-card__pricing">
                                <div className="plan-card__price">
                                    <span className="plan-card__currency">$</span>
                                    <span className="plan-card__amount">{formData.price_monthly || 0}</span>
                                    <span className="plan-card__period">/mes</span>
                                </div>
                            </div>
                            <div className="plan-card__features">
                                <div className="plan-card__feature">
                                    <Users size={14} />
                                    <span className="plan-card__feature-value">
                                        {formData.max_users === -1 ? '∞' : formData.max_users}
                                    </span>
                                    <span>usuarios</span>
                                </div>
                                <div className="plan-card__feature">
                                    <MessageSquare size={14} />
                                    <span className="plan-card__feature-value">
                                        {formData.max_whatsapp_instances === -1 ? '∞' : formData.max_whatsapp_instances}
                                    </span>
                                    <span>WA</span>
                                </div>
                            </div>
                            {formData.module_ids.length > 0 && (
                                <div className="plan-card__modules" style={{ borderTop: '1px solid var(--sa-border-color)' }}>
                                    <div className="plan-card__modules-label">
                                        <Puzzle size={12} />
                                        <span>{formData.module_ids.length} módulos</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="plan-modal__form">
                        {/* Información básica */}
                        <div className="plan-form__section">
                            <h4 className="plan-form__section-title">Información Básica</h4>
                            <div className="plan-form__row">
                                <DSTextField
                                    label="Nombre del Plan"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    required
                                    placeholder="Ej: Professional"
                                    help="Nombre visible para clientes"
                                />
                                <DSTextField
                                    label="Slug (URL)"
                                    value={formData.slug}
                                    onChange={(e) => handleInputChange('slug', e.target.value)}
                                    required
                                    placeholder="professional"
                                    help="Solo minúsculas y guiones"
                                />
                            </div>
                            <DSTextArea
                                label="Descripción"
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Descripción del plan..."
                                rows={2}
                            />
                        </div>

                        {/* Precios */}
                        <div className="plan-form__section">
                            <h4 className="plan-form__section-title">Precios</h4>
                            <div className="plan-form__row">
                                <DSNumberField
                                    label="Precio Mensual ($)"
                                    value={formData.price_monthly}
                                    onChange={(e) => handleInputChange('price_monthly', parseFloat(e.target.value) || 0)}
                                    min={0}
                                    step={0.01}
                                />
                                <DSNumberField
                                    label="Precio Anual ($)"
                                    value={formData.price_yearly}
                                    onChange={(e) => handleInputChange('price_yearly', parseFloat(e.target.value) || 0)}
                                    min={0}
                                    step={0.01}
                                    help="Normalmente con descuento"
                                />
                            </div>
                        </div>

                        {/* Límites */}
                        <div className="plan-form__section">
                            <h4 className="plan-form__section-title">Límites</h4>
                            <div className="plan-form__row plan-form__row--3">
                                <DSNumberField
                                    label="Máx. Usuarios"
                                    value={formData.max_users}
                                    onChange={(e) => handleInputChange('max_users', parseInt(e.target.value) || 0)}
                                    min={-1}
                                    help="-1 = ilimitado"
                                />
                                <DSNumberField
                                    label="Máx. WhatsApp"
                                    value={formData.max_whatsapp_instances}
                                    onChange={(e) => handleInputChange('max_whatsapp_instances', parseInt(e.target.value) || 0)}
                                    min={-1}
                                />
                                <DSNumberField
                                    label="Storage (GB)"
                                    value={formData.storage_gb}
                                    onChange={(e) => handleInputChange('storage_gb', parseInt(e.target.value) || 0)}
                                    min={-1}
                                />
                            </div>
                        </div>

                        {/* Módulos */}
                        <div className="plan-form__section">
                            <h4 className="plan-form__section-title">
                                <Puzzle size={16} />
                                Módulos Incluidos
                                <span className="plan-form__section-count">{formData.module_ids.length} seleccionados</span>
                            </h4>

                            {coreModules.length > 0 && (
                                <div className="plan-form__modules-group">
                                    <span className="plan-form__modules-label">Core</span>
                                    <div className="plan-form__modules-grid">
                                        {coreModules.map(module => (
                                            <button
                                                key={module.id}
                                                type="button"
                                                className={`plan-form__module-btn ${formData.module_ids.includes(module.id) ? 'plan-form__module-btn--selected' : ''}`}
                                                onClick={() => toggleModule(module.id)}
                                            >
                                                <Check size={14} className="plan-form__module-check" />
                                                <span>{module.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {addonModules.length > 0 && (
                                <div className="plan-form__modules-group">
                                    <span className="plan-form__modules-label plan-form__modules-label--addon">Add-ons</span>
                                    <div className="plan-form__modules-grid">
                                        {addonModules.map(module => (
                                            <button
                                                key={module.id}
                                                type="button"
                                                className={`plan-form__module-btn plan-form__module-btn--addon ${formData.module_ids.includes(module.id) ? 'plan-form__module-btn--selected' : ''}`}
                                                onClick={() => toggleModule(module.id)}
                                            >
                                                <Check size={14} className="plan-form__module-check" />
                                                <span>{module.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {modules.length === 0 && (
                                <p className="plan-form__no-modules">No hay módulos disponibles. Créalos en la página de Módulos.</p>
                            )}
                        </div>

                        {/* Opciones */}
                        <div className="plan-form__section">
                            <h4 className="plan-form__section-title">Opciones</h4>
                            <div className="plan-form__row">
                                <DSNumberField
                                    label="Orden"
                                    value={formData.sort_order}
                                    onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value) || 0)}
                                    min={0}
                                />
                                <div className="plan-form__checkboxes">
                                    <DSCheckbox
                                        label="Plan activo"
                                        checked={formData.is_active}
                                        onChange={(checked) => handleInputChange('is_active', checked)}
                                    />
                                    <DSCheckbox
                                        label="Plan destacado (Popular)"
                                        checked={formData.is_featured}
                                        onChange={(checked) => handleInputChange('is_featured', checked)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="plan-form__actions">
                            <DSButton variant="ghost" onClick={closeModal} type="button">
                                Cancelar
                            </DSButton>
                            <DSButton
                                variant="primary"
                                type="submit"
                                disabled={saving || !formData.name || !formData.slug}
                                icon={saving ? <RefreshCw size={16} className="spin-animation" /> : null}
                            >
                                {saving ? 'Guardando...' : (editingPlan ? 'Actualizar' : 'Crear Plan')}
                            </DSButton>
                        </div>
                    </form>
                </div>
            </DSModal>
        </div>
    );
};

export default PlansPage;
