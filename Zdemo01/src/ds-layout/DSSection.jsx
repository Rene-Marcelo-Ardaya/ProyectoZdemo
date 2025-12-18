import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

/**
 * DSSection - Componente de sección/panel con header
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido del body
 * @param {string} props.title - Título del header
 * @param {string} props.subtitle - Subtítulo opcional
 * @param {React.ReactNode} props.icon - Icono del header
 * @param {React.ReactNode} props.actions - Acciones en el header (botones)
 * @param {React.ReactNode} props.footer - Contenido del footer
 * @param {'default'|'primary'|'success'|'warning'|'danger'|'info'} props.variant - Variante de color
 * @param {'default'|'flat'|'borderless'|'elevated'|'seamless'} props.style - Estilo visual
 * @param {'default'|'compact'} props.size - Tamaño
 * @param {'default'|'flush'|'sm'|'lg'} props.bodyPadding - Padding del body
 * @param {'left'|'center'|'right'|'space-between'} props.footerAlign - Alineación del footer
 * @param {boolean} props.collapsible - Si es colapsable
 * @param {boolean} props.defaultCollapsed - Si inicia colapsado
 * @param {string} props.className - Clases adicionales
 */
export function DSSection({
    children,
    title,
    subtitle,
    icon,
    actions,
    footer,
    variant = 'default',
    style = 'default',
    size = 'default',
    bodyPadding = 'default',
    footerAlign = 'right',
    collapsible = false,
    defaultCollapsed = false,
    className = '',
}) {
    const [collapsed, setCollapsed] = useState(defaultCollapsed)

    const handleToggle = () => {
        if (collapsible) {
            setCollapsed(!collapsed)
        }
    }

    const sectionClasses = [
        'ds-section',
        variant !== 'default' && `ds-section--${variant}`,
        style !== 'default' && `ds-section--${style}`,
        size !== 'default' && `ds-section--${size}`,
        collapsible && 'ds-section--collapsible',
        collapsed && 'ds-section--collapsed',
        className,
    ]
        .filter(Boolean)
        .join(' ')

    const bodyClasses = [
        'ds-section__body',
        bodyPadding !== 'default' && `ds-section__body--${bodyPadding}`,
    ]
        .filter(Boolean)
        .join(' ')

    const footerClasses = [
        'ds-section__footer',
        footerAlign !== 'right' && `ds-section__footer--${footerAlign}`,
    ]
        .filter(Boolean)
        .join(' ')

    // Solo renderizar header si hay título, icono o acciones
    const hasHeader = title || icon || actions

    return (
        <div className={sectionClasses}>
            {hasHeader && (
                <div className="ds-section__header" onClick={handleToggle}>
                    {icon && <span className="ds-section__header-icon">{icon}</span>}
                    {title && (
                        <h2 className="ds-section__title">
                            {title}
                            {subtitle && <span className="ds-section__subtitle">{subtitle}</span>}
                        </h2>
                    )}
                    {actions && <div className="ds-section__actions">{actions}</div>}
                    {collapsible && (
                        <span className="ds-section__collapse-icon">
                            <ChevronDown size={12} />
                        </span>
                    )}
                </div>
            )}
            {children && <div className={bodyClasses}>{children}</div>}
            {footer && <div className={footerClasses}>{footer}</div>}
        </div>
    )
}

/**
 * DSSubsection - Subsección dentro de un DSSection
 */
export function DSSubsection({ children, title, className = '' }) {
    return (
        <div className={`ds-subsection ${className}`}>
            {title && <h4 className="ds-subsection__title">{title}</h4>}
            {children}
        </div>
    )
}

/**
 * DSSectionDivider - Divisor dentro de un DSSection
 */
export function DSSectionDivider({ dashed = false, className = '' }) {
    const classes = [
        'ds-section__divider',
        dashed && 'ds-section__divider--dashed',
        className,
    ]
        .filter(Boolean)
        .join(' ')

    return <div className={classes} />
}
