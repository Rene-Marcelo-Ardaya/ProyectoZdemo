import React, { useState, useEffect } from 'react';
import {
    Building2,
    Users,
    CreditCard,
    MessageSquare,
    TrendingUp,
    AlertCircle
} from 'lucide-react';

/**
 * SuperAdminDashboard
 * 
 * Dashboard principal del panel de Super Admin con estadísticas generales.
 */
const SuperAdminDashboard = () => {
    const [stats, setStats] = useState({
        totalTenants: 0,
        activeTenants: 0,
        totalUsers: 0,
        totalWhatsappInstances: 0,
        trialTenants: 0,
        recentTenants: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            // Por ahora datos mock - se conectará al API después
            setStats({
                totalTenants: 12,
                activeTenants: 10,
                totalUsers: 85,
                totalWhatsappInstances: 28,
                trialTenants: 3,
                recentTenants: [
                    { id: 1, name: 'Empresa Demo', slug: 'demo', plan: 'Pro', createdAt: '2026-01-01' },
                    { id: 2, name: 'Empresa ABC', slug: 'abc', plan: 'Basic', createdAt: '2025-12-28' },
                    { id: 3, name: 'Corporación XYZ', slug: 'xyz', plan: 'Enterprise', createdAt: '2025-12-25' },
                ],
            });
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            icon: Building2,
            value: stats.totalTenants,
            label: 'Total Clientes',
            color: '#3b82f6',
        },
        {
            icon: Users,
            value: stats.totalUsers,
            label: 'Total Usuarios',
            color: '#10b981',
        },
        {
            icon: MessageSquare,
            value: stats.totalWhatsappInstances,
            label: 'Instancias WhatsApp',
            color: '#8b5cf6',
        },
        {
            icon: AlertCircle,
            value: stats.trialTenants,
            label: 'En Período de Prueba',
            color: '#f59e0b',
        },
    ];

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Cargando datos...</p>
            </div>
        );
    }

    return (
        <div className="super-admin-dashboard">
            <div className="super-admin-page-header">
                <h1>Dashboard</h1>
                <p>Bienvenido al panel de administración del SaaS</p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {statCards.map((card, index) => (
                    <div key={index} className="stat-card">
                        <div
                            className="stat-card-icon"
                            style={{ background: `linear-gradient(135deg, ${card.color} 0%, ${card.color}cc 100%)` }}
                        >
                            <card.icon size={24} />
                        </div>
                        <div className="stat-card-content">
                            <h3>{card.value}</h3>
                            <p>{card.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Tenants */}
            <div className="data-table-container">
                <div className="data-table-header">
                    <h2>Clientes Recientes</h2>
                    <button
                        className="btn-link"
                        onClick={() => window.location.href = '/super-admin/tenants'}
                    >
                        Ver todos
                    </button>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Slug</th>
                            <th>Plan</th>
                            <th>Fecha Registro</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.recentTenants.map((tenant) => (
                            <tr key={tenant.id}>
                                <td>{tenant.name}</td>
                                <td><code>{tenant.slug}</code></td>
                                <td>
                                    <span className={`plan-badge plan-${tenant.plan.toLowerCase()}`}>
                                        {tenant.plan}
                                    </span>
                                </td>
                                <td>{tenant.createdAt}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
