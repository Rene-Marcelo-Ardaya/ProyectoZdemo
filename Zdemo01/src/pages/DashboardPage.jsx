import React from 'react';
import {
    BarChart3,
    CheckCircle2,
    Clock,
    Users,
    FileText,
    Search,
    ClipboardList,
    Settings,
    Calendar
} from 'lucide-react';
import '../styles/dashboard.css';

/**
 * Página de Dashboard
 * Panel principal después del login
 */
export function DashboardPage({ user }) {
    const currentDate = new Date().toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const userName = user?.name || user?.email || 'Usuario';

    // Stats de ejemplo (placeholder)
    const stats = [
        {
            icon: <BarChart3 size={24} />,
            iconClass: 'is-blue',
            value: '156',
            label: 'Total Registros',
            trend: '+12%',
            trendClass: 'is-up'
        },
        {
            icon: <CheckCircle2 size={24} />,
            iconClass: 'is-green',
            value: '89',
            label: 'Completados',
            trend: '+8%',
            trendClass: 'is-up'
        },
        {
            icon: <Clock size={24} />,
            iconClass: 'is-orange',
            value: '34',
            label: 'Pendientes',
            trend: '-3%',
            trendClass: 'is-down'
        },
        {
            icon: <Users size={24} />,
            iconClass: 'is-purple',
            value: '12',
            label: 'Usuarios Activos',
            trend: '+2%',
            trendClass: 'is-up'
        },
    ];

    // Acciones rápidas
    const quickActions = [
        { icon: <FileText size={20} />, title: 'Nuevo Registro', desc: 'Crear un nuevo registro' },
        { icon: <Search size={20} />, title: 'Buscar', desc: 'Buscar en el sistema' },
        { icon: <ClipboardList size={20} />, title: 'Reportes', desc: 'Ver reportes y estadísticas' },
        { icon: <Settings size={20} />, title: 'Configuración', desc: 'Ajustes del sistema' },
    ];

    return (
        <div className="dashboard">
            {/* Welcome section */}
            <div className="dashboard-welcome">
                <div className="dashboard-welcome__header">
                    <div>
                        <h1 className="dashboard-welcome__greeting">
                            Hola, <span className="dashboard-welcome__user">{userName}</span> 👋
                        </h1>
                        <p className="dashboard-welcome__subtitle">
                            Bienvenido al panel de control. Aquí tienes un resumen de tu actividad.
                        </p>
                    </div>
                    <div className="dashboard-welcome__date">
                        <Calendar size={16} style={{ marginRight: '8px' }} />
                        {currentDate}
                    </div>
                </div>
            </div>

            {/* Stats section */}
            <div className="dashboard-section">
                <h2 className="dashboard-section__title">Resumen General</h2>
                <p className="dashboard-section__desc">Estadísticas principales del sistema</p>
            </div>

            <div className="dashboard-stats">
                {stats.map((stat, index) => (
                    <div key={index} className="dashboard-stat-card">
                        <div className="dashboard-stat-card__header">
                            <div className={`dashboard-stat-card__icon ${stat.iconClass}`}>
                                {stat.icon}
                            </div>
                            <span className={`dashboard-stat-card__trend ${stat.trendClass}`}>
                                {stat.trend}
                            </span>
                        </div>
                        <p className="dashboard-stat-card__value">{stat.value}</p>
                        <p className="dashboard-stat-card__label">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Quick actions */}
            <div className="dashboard-section">
                <h2 className="dashboard-section__title">Acciones Rápidas</h2>
                <p className="dashboard-section__desc">Accede rápidamente a las funciones principales</p>
            </div>

            <div className="dashboard-actions">
                {quickActions.map((action, index) => (
                    <button key={index} className="dashboard-action-btn">
                        <div className="dashboard-action-btn__icon">
                            {action.icon}
                        </div>
                        <div className="dashboard-action-btn__text">
                            <p className="dashboard-action-btn__title">{action.title}</p>
                            <p className="dashboard-action-btn__desc">{action.desc}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default DashboardPage;
