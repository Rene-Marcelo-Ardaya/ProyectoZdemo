import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    Clock,
    RefreshCw,
    Building,
    Users,
    MessageSquare,
    Power,
    PowerOff,
    Globe,
    Mail,
    Calendar
} from 'lucide-react';
import {
    DSPageHeader,
    DSButton,
    DSLoading,
    DSEmpty,
    DSModal,
    DSTextField,
    DSTextArea,
    DSCheckbox,
    DSNumberField,
} from '../../ds-components';
import { getTenants, createTenant, updateTenant, deleteTenant, getPlans } from '../../services/tenantService';
import './TenantsPage.css';

/**
 * TenantsPage - Gestión de Clientes del SaaS
 */
const TenantsPage = () => {
    const [tenants, setTenants] = useState([]);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // all, active, trial, inactive
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingTenant, setEditingTenant] = useState(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        domain: '',
        email: '',
        plan_id: '',
        is_active: true,
        trial_ends_at: '',
        settings: {},
    });

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [tenantsRes, plansRes] = await Promise.all([
                getTenants({ search: searchTerm }),
                getPlans()
            ]);

            if (tenantsRes.success) {
                let data = tenantsRes.data.data || tenantsRes.data || [];

                // Filtrar por estado
                if (filter === 'active') {
                    data = data.filter(t => t.is_active && !isInTrial(t));
                } else if (filter === 'trial') {
                    data = data.filter(t => isInTrial(t));
                } else if (filter === 'inactive') {
                    data = data.filter(t => !t.is_active);
                }

                setTenants(data);
            }

            if (plansRes.success) {
                setPlans(plansRes.data || []);
            }
        } catch (err) {
            console.error('Error loading data:', err);
            setError('Error al conectar con el servidor');
        } finally {
            setLoading(false);
        }
    }, [searchTerm, filter]);

    useEffect(() => {
        loadData();
    }, []);

    // Búsqueda con debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            loadData();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, filter]);

    const isInTrial = (tenant) => {
        if (!tenant.trial_ends_at || !tenant.is_active) return false;
        return new Date(tenant.trial_ends_at) > new Date();
    };

    const resetForm = () => {
        setFormData({
            name: '',
            slug: '',
            domain: '',
            email: '',
            plan_id: '',
            is_active: true,
            trial_ends_at: '',
            settings: {},
        });
        setEditingTenant(null);
    };

    const openCreateModal = () => {
        resetForm();
        // Set default trial (14 days)
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 14);
        setFormData(prev => ({
            ...prev,
            trial_ends_at: trialEnd.toISOString().split('T')[0]
        }));
        setShowModal(true);
    };

    const openEditModal = (tenant) => {
        setEditingTenant(tenant);
        setFormData({
            name: tenant.name || '',
            slug: tenant.slug || '',
            domain: tenant.domain || '',
            email: tenant.email || '',
            plan_id: tenant.plan_id || '',
            is_active: tenant.is_active ?? true,
            trial_ends_at: tenant.trial_ends_at ? tenant.trial_ends_at.split('T')[0] : '',
            settings: tenant.settings || {},
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
            const dataToSend = {
                ...formData,
                plan_id: formData.plan_id || null,
            };

            let response;
            if (editingTenant) {
                response = await updateTenant(editingTenant.id, dataToSend);
            } else {
                response = await createTenant(dataToSend);
            }

            if (response.success) {
                closeModal();
                loadData();
            } else {
                setError(response.error || 'Error al guardar');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async (tenant) => {
        try {
            const response = await updateTenant(tenant.id, {
                is_active: !tenant.is_active
            });
            if (response.success) {
                loadData();
            } else {
                alert(response.error || 'Error al cambiar estado');
            }
        } catch (err) {
            alert(err.response?.data?.error || 'Error');
        }
    };

    const handleDelete = async (tenant) => {
        if (!confirm(`¿Eliminar "${tenant.name}"?\n\nEsta acción no se puede deshacer.`)) {
            return;
        }

        try {
            const response = await deleteTenant(tenant.id);
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

        if (field === 'name' && !editingTenant) {
            const slug = value.toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-');
            setFormData(prev => ({ ...prev, slug }));
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusBadge = (tenant) => {
        if (!tenant.is_active) {
            return (
                <span className="tenant-status tenant-status--inactive">
                    <XCircle size={14} /> Inactivo
                </span>
            );
        }
        if (isInTrial(tenant)) {
            return (
                <span className="tenant-status tenant-status--trial">
                    <Clock size={14} /> Trial
                </span>
            );
        }
        return (
            <span className="tenant-status tenant-status--active">
                <CheckCircle size={14} /> Activo
            </span>
        );
    };

    const getPlanBadge = (plan) => {
        if (!plan) return <span className="tenant-plan">Sin plan</span>;
        return (
            <span className={`tenant-plan tenant-plan--${plan.slug}`}>
                {plan.name}
            </span>
        );
    };

    // Stats
    const activeTenants = tenants.filter(t => t.is_active && !isInTrial(t)).length;
    const trialTenants = tenants.filter(t => isInTrial(t)).length;
    const inactiveTenants = tenants.filter(t => !t.is_active).length;

    if (loading && tenants.length === 0) {
        return <DSLoading text="Cargando clientes..." />;
    }

    return (
        <div className="tenants-page">
            <DSPageHeader
                title="Gestión de Clientes"
                subtitle="Administra todos los clientes (tenants) de la plataforma"
            />

            {/* Stats */}
            <div className="tenants-summary">
                <div className="tenants-summary__item">
                    <div className="tenants-summary__icon tenants-summary__icon--blue">
                        <Building size={18} />
                    </div>
                    <div className="tenants-summary__text">
                        <span className="tenants-summary__value">{tenants.length}</span>
                        <span className="tenants-summary__label">Total Clientes</span>
                    </div>
                </div>
                <div className="tenants-summary__item">
                    <div className="tenants-summary__icon tenants-summary__icon--green">
                        <CheckCircle size={18} />
                    </div>
                    <div className="tenants-summary__text">
                        <span className="tenants-summary__value">{activeTenants}</span>
                        <span className="tenants-summary__label">Activos</span>
                    </div>
                </div>
                <div className="tenants-summary__item">
                    <div className="tenants-summary__icon tenants-summary__icon--yellow">
                        <Clock size={18} />
                    </div>
                    <div className="tenants-summary__text">
                        <span className="tenants-summary__value">{trialTenants}</span>
                        <span className="tenants-summary__label">En Trial</span>
                    </div>
                </div>
                <div className="tenants-summary__item">
                    <div className="tenants-summary__icon tenants-summary__icon--red">
                        <XCircle size={18} />
                    </div>
                    <div className="tenants-summary__text">
                        <span className="tenants-summary__value">{inactiveTenants}</span>
                        <span className="tenants-summary__label">Inactivos</span>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="tenants-error">
                    <p>{error}</p>
                    <button onClick={loadData}>Reintentar</button>
                </div>
            )}

            {/* Actions */}
            <div className="tenants-actions">
                <div className="tenants-actions-left">
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, slug o email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="tenants-filter-tabs">
                        <button
                            className={`tenants-filter-tab ${filter === 'all' ? 'tenants-filter-tab--active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            Todos
                        </button>
                        <button
                            className={`tenants-filter-tab ${filter === 'active' ? 'tenants-filter-tab--active' : ''}`}
                            onClick={() => setFilter('active')}
                        >
                            Activos
                        </button>
                        <button
                            className={`tenants-filter-tab ${filter === 'trial' ? 'tenants-filter-tab--active' : ''}`}
                            onClick={() => setFilter('trial')}
                        >
                            Trial
                        </button>
                        <button
                            className={`tenants-filter-tab ${filter === 'inactive' ? 'tenants-filter-tab--active' : ''}`}
                            onClick={() => setFilter('inactive')}
                        >
                            Inactivos
                        </button>
                    </div>
                </div>
                <div className="tenants-actions-buttons">
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
                        Nuevo Cliente
                    </DSButton>
                </div>
            </div>

            {/* Table */}
            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Plan</th>
                            <th>Estado</th>
                            <th>Usuarios</th>
                            <th>WhatsApp</th>
                            <th>Registro</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tenants.map((tenant) => (
                            <tr key={tenant.id} className={!tenant.is_active ? 'row--inactive' : ''}>
                                <td>
                                    <div className="tenant-cell-info">
                                        <span className="tenant-cell-name">{tenant.name}</span>
                                        <span className="tenant-cell-domain">{tenant.slug}.tuapp.com</span>
                                    </div>
                                </td>
                                <td>{getPlanBadge(tenant.plan)}</td>
                                <td>{getStatusBadge(tenant)}</td>
                                <td>{tenant.users_count ?? 0}</td>
                                <td>{tenant.whatsapp_instances_count ?? 0}</td>
                                <td>{formatDate(tenant.created_at)}</td>
                                <td>
                                    <div className="tenant-actions">
                                        <button
                                            className="tenant-action-btn"
                                            onClick={() => openEditModal(tenant)}
                                            title="Editar"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            className={`tenant-action-btn ${tenant.is_active ? 'tenant-action-btn--warning' : 'tenant-action-btn--success'}`}
                                            onClick={() => handleToggleActive(tenant)}
                                            title={tenant.is_active ? 'Desactivar' : 'Activar'}
                                        >
                                            {tenant.is_active ? <PowerOff size={16} /> : <Power size={16} />}
                                        </button>
                                        <button
                                            className="tenant-action-btn tenant-action-btn--danger"
                                            onClick={() => handleDelete(tenant)}
                                            title="Eliminar"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {tenants.length === 0 && !loading && (
                    <DSEmpty
                        title="No hay clientes"
                        description="No se encontraron clientes con los criterios de búsqueda"
                    />
                )}
            </div>

            {/* Modal */}
            <DSModal
                isOpen={showModal}
                onClose={closeModal}
                title={editingTenant ? 'Editar Cliente' : 'Nuevo Cliente'}
                icon={<Building size={20} />}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="tenant-form">
                    {/* Información básica */}
                    <div className="tenant-form__section">
                        <h4 className="tenant-form__section-title">Información Básica</h4>
                        <div className="tenant-form__row">
                            <DSTextField
                                label="Nombre de la empresa"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                required
                                placeholder="Empresa S.A."
                                help="Nombre comercial del cliente"
                            />
                            <DSTextField
                                label="Slug (subdominio)"
                                value={formData.slug}
                                onChange={(e) => handleInputChange('slug', e.target.value)}
                                required
                                placeholder="empresa"
                                help="empresa.tuapp.com"
                            />
                        </div>
                        <div className="tenant-form__row">
                            <DSTextField
                                label="Dominio personalizado"
                                value={formData.domain}
                                onChange={(e) => handleInputChange('domain', e.target.value)}
                                placeholder="app.empresa.com"
                                help="Opcional, requiere configuración DNS"
                            />
                            <DSTextField
                                label="Email de contacto"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                type="email"
                                placeholder="admin@empresa.com"
                            />
                        </div>
                    </div>

                    {/* Plan y suscripción */}
                    <div className="tenant-form__section">
                        <h4 className="tenant-form__section-title">Plan y Suscripción</h4>
                        <div className="tenant-form__row">
                            <div className="tenant-form__field">
                                <label className="tenant-form__label">Plan asignado</label>
                                <select
                                    className="tenant-form__select"
                                    value={formData.plan_id}
                                    onChange={(e) => handleInputChange('plan_id', e.target.value)}
                                >
                                    <option value="">Sin plan</option>
                                    {plans.filter(p => p.is_active).map(plan => (
                                        <option key={plan.id} value={plan.id}>
                                            {plan.name} - ${plan.price_monthly}/mes
                                        </option>
                                    ))}
                                </select>
                                <p className="tenant-form__help">El plan determina los límites y módulos disponibles</p>
                            </div>
                            <DSTextField
                                label="Fin del período trial"
                                value={formData.trial_ends_at}
                                onChange={(e) => handleInputChange('trial_ends_at', e.target.value)}
                                type="date"
                                help="Fecha hasta la cual el cliente está en trial"
                            />
                        </div>
                    </div>

                    {/* Estado */}
                    <div className="tenant-form__section">
                        <h4 className="tenant-form__section-title">Estado</h4>
                        <div className="tenant-form__options">
                            <DSCheckbox
                                label="Cliente activo"
                                checked={formData.is_active}
                                onChange={(checked) => handleInputChange('is_active', checked)}
                                help="Los clientes inactivos no pueden acceder a la plataforma"
                            />
                        </div>
                    </div>

                    {/* Selected Plan Preview */}
                    {formData.plan_id && (
                        <div className="tenant-form__plan-preview">
                            {(() => {
                                const selectedPlan = plans.find(p => p.id === parseInt(formData.plan_id));
                                if (!selectedPlan) return null;
                                return (
                                    <>
                                        <div className="tenant-form__plan-header">
                                            <span className="tenant-form__plan-name">{selectedPlan.name}</span>
                                            <span className="tenant-form__plan-price">${selectedPlan.price_monthly}/mes</span>
                                        </div>
                                        <div className="tenant-form__plan-limits">
                                            <span><Users size={14} /> {selectedPlan.max_users === -1 ? '∞' : selectedPlan.max_users} usuarios</span>
                                            <span><MessageSquare size={14} /> {selectedPlan.max_whatsapp_instances === -1 ? '∞' : selectedPlan.max_whatsapp_instances} WhatsApp</span>
                                            <span>{selectedPlan.modules_count || 0} módulos</span>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="tenant-form__actions">
                        <DSButton variant="ghost" onClick={closeModal} type="button">
                            Cancelar
                        </DSButton>
                        <DSButton
                            variant="primary"
                            type="submit"
                            disabled={saving || !formData.name || !formData.slug}
                            icon={saving ? <RefreshCw size={16} className="spin-animation" /> : null}
                        >
                            {saving ? 'Guardando...' : (editingTenant ? 'Actualizar' : 'Crear Cliente')}
                        </DSButton>
                    </div>
                </form>
            </DSModal>
        </div>
    );
};

export default TenantsPage;
