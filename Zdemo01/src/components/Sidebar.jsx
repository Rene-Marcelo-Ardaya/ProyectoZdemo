import React, { useState, useEffect, useCallback } from 'react';
import './Sidebar.css';
import { getMenuIconComponent, getSubmenuIconComponent } from '../services/menuService';
import { getImageUrl } from '../services/settingService';
import {
    Home,
    User,
    LogOut,
    X,
    Menu,
    ChevronRight
} from 'lucide-react';

// Logo estático como fallback
import { BrandLogo } from './common/BrandLogo';

/**
 * Sidebar con menús desplegables - RESPONSIVE y con TEMA
 * El logo se carga dinámicamente desde la configuración con fallback a inicial
 */
export function Sidebar({ menus = [], activePage, onNavigate, user, onLogout, isCollapsed, onToggle, appConfig = {} }) {
    const [expandedMenus, setExpandedMenus] = useState({});
    const [isOpen, setIsOpen] = useState(false);
    // Internal isCollapsed removed, using prop

    // Auto-expand menu based on activePage
    useEffect(() => {
        if (!activePage || !menus.length || isCollapsed) return;

        menus.forEach(menu => {
            const hasActiveSub = menu.submenus?.some(sub => sub.rutaReact === activePage);
            if (hasActiveSub) {
                setExpandedMenus(prev => ({
                    ...prev,
                    [menu.codMenu]: true
                }));
            }
        });
    }, [activePage, menus, isCollapsed]);

    const toggleMenu = useCallback((codMenu) => {
        if (isCollapsed) {
            if (onToggle) onToggle(); // Expand sidebar if trying to open a menu
        }
        setExpandedMenus(prev => ({
            ...prev,
            [codMenu]: !prev[codMenu]
        }));
    }, [isCollapsed, onToggle]);

    const handleSubmenuClick = (rutaReact) => {
        if (onNavigate) {
            onNavigate(rutaReact);
        }
        // Cerrar sidebar en móvil después de navegar
        setIsOpen(false);
    };

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const handleCollapseClick = () => {
        if (onToggle) onToggle();
        setExpandedMenus({}); // Close all menus when collapsing
    };

    return (
        <>
            {/* Botón hamburguesa para móvil */}
            <button
                className="sidebar__toggle"
                onClick={toggleSidebar}
                aria-label="Toggle Sidebar"
                aria-expanded={isOpen}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay para cerrar en móvil */}
            <div
                className={`sidebar__overlay ${isOpen ? 'is-visible' : ''}`}
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
            />

            <aside className={`sidebar ${isOpen ? 'is-open' : ''} ${isCollapsed ? 'is-collapsed' : ''}`}>
                {/* Header con logo */}
                <div className="sidebar__header">
                    <div className="sidebar__logo">
                        <BrandLogo
                            src={appConfig.logo_sidebar ? getImageUrl(appConfig.logo_sidebar) : null}
                            alt={appConfig.app_name || "App"}
                            className="sidebar__logo-img"
                        />
                    </div>
                    {/* Botón colapsar desktop */}
                    <button
                        className="sidebar__collapse-btn"
                        onClick={handleCollapseClick}
                        title={isCollapsed ? "Expandir" : "Colapsar"}
                    >
                        {isCollapsed ? <ChevronRight size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Label */}
                {!isCollapsed && (
                    <div className="sidebar__menu-label">
                        <span>Navegación</span>
                    </div>
                )}

                {/* Navegación */}
                <nav className="sidebar__nav" role="navigation">
                    {/* Dashboard siempre visible */}
                    <div className="sidebar__menu-group">
                        <button
                            className={`sidebar__menu-header no-submenu ${activePage === 'dashboard' ? 'is-active' : ''}`}
                            onClick={() => handleSubmenuClick('dashboard')}
                            aria-current={activePage === 'dashboard' ? 'page' : undefined}
                            title={isCollapsed ? "Dashboard" : ""}
                        >
                            <span className="sidebar__menu-icon"><Home size={18} /></span>
                            {!isCollapsed && <span className="sidebar__menu-title">Dashboard</span>}
                        </button>
                    </div>

                    {/* Menús dinámicos - filtrar Chat/Comunicación (se accede via widget flotante) */}
                    {menus
                        .filter(menu => {
                            const name = (menu.descripcion || menu.codMenu || '').toLowerCase();
                            return !name.includes('chat') && !name.includes('comunicación') && !name.includes('comunicacion');
                        })
                        .map((menu) => {
                            const isExpanded = !!expandedMenus[menu.codMenu];
                            const MenuIcon = getMenuIconComponent(menu.descripcion || menu.codMenu);
                            return (
                                <div key={menu.codMenu} className="sidebar__menu-group">
                                    <button
                                        className={`sidebar__menu-header ${isExpanded ? 'is-expanded' : ''}`}
                                        onClick={() => toggleMenu(menu.codMenu)}
                                        aria-expanded={isExpanded}
                                        title={isCollapsed ? menu.descripcion : ""}
                                    >
                                        <span className="sidebar__menu-icon"><MenuIcon size={18} /></span>
                                        {!isCollapsed && (
                                            <>
                                                <span className="sidebar__menu-title">{menu.descripcion}</span>
                                                <span className={`sidebar__menu-arrow ${isExpanded ? 'rotated' : ''}`}>
                                                    <ChevronRight size={16} />
                                                </span>
                                            </>
                                        )}
                                    </button>

                                    <div
                                        className={`sidebar__submenu-wrapper ${isExpanded ? 'expanded' : ''}`}
                                        aria-hidden={!isExpanded}
                                    >
                                        <ul className="sidebar__submenu">
                                            {menu.submenus?.map((sub) => {
                                                const SubIcon = getSubmenuIconComponent(sub.rutaReact || sub.descripcion);
                                                return (
                                                    <li key={sub.codSubMenu}>
                                                        <button
                                                            className={`sidebar__submenu-item ${activePage === sub.rutaReact ? 'is-active' : ''}`}
                                                            onClick={() => handleSubmenuClick(sub.rutaReact)}
                                                            role="menuitem"
                                                        >
                                                            <span className="sidebar__submenu-icon"><SubIcon size={14} /></span>
                                                            <span className="sidebar__submenu-text">{sub.descripcion}</span>
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                </div>
                            );
                        })}
                </nav>

                {/* Footer */}
                <div className="sidebar__footer">
                    <div className="sidebar__user-info">
                        <div className="sidebar__user-avatar">
                            <User size={20} />
                        </div>
                        {!isCollapsed && (
                            <div className="sidebar__user-details">
                                <span className="sidebar__user-name">
                                    {user?.name || user?.email || 'Usuario'}
                                </span>
                                <span className="sidebar__user-role">
                                    {user?.role || 'Usuario'}
                                </span>
                            </div>
                        )}
                    </div>
                    <button
                        className="sidebar__logout-btn"
                        onClick={onLogout}
                        title="Cerrar Sesión"
                    >
                        <LogOut size={18} />
                        {!isCollapsed && <span>Cerrar Sesión</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
