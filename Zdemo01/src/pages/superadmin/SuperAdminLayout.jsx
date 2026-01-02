import React, { useState } from 'react';
import {
    Building2,
    LayoutDashboard,
    CreditCard,
    Puzzle,
    FileText,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Settings
} from 'lucide-react';
import './SuperAdminLayout.css';

/**
 * SuperAdminLayout
 * 
 * Layout con sidebar para el panel de Super Admin.
 * Solo accesible para usuarios sin tenant_id y con rol super-admin.
 */
const SuperAdminLayout = ({ children, activePage, onNavigate, onBack }) => {
    const [collapsed, setCollapsed] = useState(false);

    const menuItems = [
        {
            key: 'dashboard',
            icon: LayoutDashboard,
            label: 'Dashboard',
        },
        {
            key: 'tenants',
            icon: Building2,
            label: 'Clientes (Tenants)',
        },
        {
            key: 'plans',
            icon: CreditCard,
            label: 'Planes',
        },
        {
            key: 'modules',
            icon: Puzzle,
            label: 'Módulos',
        },
        {
            key: 'audit-logs',
            icon: FileText,
            label: 'Logs de Auditoría',
        },
    ];

    return (
        <div className="super-admin-layout">
            {/* Sidebar */}
            <aside className={`super-admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    {!collapsed && (
                        <div className="sidebar-title">
                            <Building2 size={24} />
                            <span>Super Admin</span>
                        </div>
                    )}
                    <button
                        className="collapse-btn"
                        onClick={() => setCollapsed(!collapsed)}
                        title={collapsed ? 'Expandir' : 'Colapsar'}
                    >
                        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <button
                            key={item.key}
                            onClick={() => onNavigate(item.key)}
                            className={`sidebar-link ${activePage === item.key ? 'active' : ''}`}
                            title={collapsed ? item.label : undefined}
                        >
                            <item.icon size={20} />
                            {!collapsed && <span>{item.label}</span>}
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button
                        className="back-to-app-btn"
                        onClick={onBack}
                        title="Volver a la aplicación"
                    >
                        <LogOut size={20} />
                        {!collapsed && <span>Volver a la App</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`super-admin-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
                {children}
            </main>
        </div>
    );
};

export default SuperAdminLayout;
