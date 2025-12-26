import React, { useState } from 'react';

/**
 * DSNavTabs - Tabs de navegación horizontal con iconos
 * 
 * @param {Object} props
 * @param {Array} props.tabs - Array de tabs: { key, label, icon, badge, disabled }
 * @param {string} props.activeKey - Tab activo controlado externamente
 * @param {string} props.defaultActiveKey - Tab activo por defecto
 * @param {Function} props.onChange - Callback cuando cambia el tab
 * @param {'default'|'pills'|'underline'} props.variant - Estilo visual
 * @param {'sm'|'md'|'lg'} props.size - Tamaño
 * @param {boolean} props.fullWidth - Si ocupa todo el ancho
 * @param {string} props.className - Clases adicionales
 */
export function DSNavTabs({
    tabs = [],
    activeKey,
    defaultActiveKey,
    onChange,
    variant = 'default',
    size = 'md',
    fullWidth = false,
    className = '',
}) {
    const [internalActive, setInternalActive] = useState(
        defaultActiveKey || (tabs[0] && tabs[0].key)
    );

    // Si es controlado usar activeKey, si no usar estado interno
    const currentActive = activeKey !== undefined ? activeKey : internalActive;

    const handleSelect = (key) => {
        if (activeKey === undefined) {
            setInternalActive(key);
        }
        onChange?.(key);
    };

    const containerClasses = [
        'ds-nav-tabs',
        `ds-nav-tabs--${variant}`,
        `ds-nav-tabs--${size}`,
        fullWidth && 'ds-nav-tabs--full-width',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={containerClasses}>
            <div className="ds-nav-tabs__list" role="tablist">
                {tabs.map((tab) => {
                    const isActive = tab.key === currentActive;
                    const isDisabled = tab.disabled;

                    const tabClasses = [
                        'ds-nav-tabs__tab',
                        isActive && 'is-active',
                        isDisabled && 'is-disabled',
                    ]
                        .filter(Boolean)
                        .join(' ');

                    return (
                        <button
                            key={tab.key}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            aria-disabled={isDisabled}
                            className={tabClasses}
                            onClick={() => !isDisabled && handleSelect(tab.key)}
                            disabled={isDisabled}
                        >
                            {tab.icon && (
                                <span className="ds-nav-tabs__icon">{tab.icon}</span>
                            )}
                            <span className="ds-nav-tabs__label">{tab.label}</span>
                            {tab.badge !== undefined && (
                                <span className="ds-nav-tabs__badge">{tab.badge}</span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default DSNavTabs;
