import React from 'react'
import { ChevronRight } from 'lucide-react'

/**
 * DSPage - Wrapper para páginas
 * 
 * @param {React.ReactNode} props.children - Contenido de la página
 * @param {'default'|'flush'|'compact'} props.padding - Padding de la página
 * @param {boolean} props.centered - Si centra el contenido con max-width
 * @param {string} props.className - Clases adicionales
 */
export function DSPage({
    children,
    padding = 'default',
    centered = false,
    className = '',
}) {
    const classes = [
        'ds-page',
        padding !== 'default' && `ds-page--${padding}`,
        centered && 'ds-page--centered',
        className,
    ]
        .filter(Boolean)
        .join(' ')

    return <div className={classes}>{children}</div>
}

/**
 * DSPageHeader - Header de página con título y acciones
 * 
 * @param {string} props.title - Título de la página
 * @param {string} props.subtitle - Subtítulo opcional
 * @param {React.ReactNode} props.icon - Icono
 * @param {React.ReactNode} props.actions - Botones/acciones
 * @param {boolean} props.noBorder - Sin borde inferior
 * @param {string} props.className - Clases adicionales
 */
export function DSPageHeader({
    title,
    subtitle,
    icon,
    actions,
    noBorder = false,
    className = '',
}) {
    const classes = [
        'ds-page-header',
        noBorder && 'ds-page-header--no-border',
        className,
    ]
        .filter(Boolean)
        .join(' ')

    return (
        <header className={classes}>
            <div className="ds-page-header__left">
                {icon && <span className="ds-page-header__icon">{icon}</span>}
                <div>
                    <h1 className="ds-page-header__title">{title}</h1>
                    {subtitle && <p className="ds-page-header__subtitle">{subtitle}</p>}
                </div>
            </div>
            {actions && <div className="ds-page-header__actions">{actions}</div>}
        </header>
    )
}

/**
 * DSPageContent - Contenedor de contenido de página
 * 
 * @param {React.ReactNode} props.children
 * @param {'default'|'compact'|'relaxed'} props.spacing
 * @param {string} props.className
 */
export function DSPageContent({
    children,
    spacing = 'default',
    className = '',
}) {
    const classes = [
        'ds-page-content',
        spacing !== 'default' && `ds-page-content--${spacing}`,
        className,
    ]
        .filter(Boolean)
        .join(' ')

    return <div className={classes}>{children}</div>
}

/**
 * DSPageGrid - Grid de layout para páginas
 * 
 * @param {React.ReactNode} props.children
 * @param {2|3|'sidebar-left'|'sidebar-right'} props.columns
 * @param {string} props.className
 */
export function DSPageGrid({
    children,
    columns = 2,
    className = '',
}) {
    const columnClass = typeof columns === 'number'
        ? `ds-page-grid--${columns}`
        : `ds-page-grid--${columns}`

    const classes = [
        'ds-page-grid',
        columnClass,
        className,
    ]
        .filter(Boolean)
        .join(' ')

    return <div className={classes}>{children}</div>
}

/**
 * DSBreadcrumbs - Navegación de breadcrumbs
 * 
 * @param {Array<{label: string, href?: string}>} props.items - Items del breadcrumb
 * @param {string} props.className
 */
export function DSBreadcrumbs({ items = [], className = '' }) {
    return (
        <nav className={`ds-breadcrumbs ${className}`}>
            {items.map((item, index) => {
                const isLast = index === items.length - 1
                return (
                    <React.Fragment key={index}>
                        {item.href && !isLast ? (
                            <a href={item.href} className="ds-breadcrumb">
                                {item.label}
                            </a>
                        ) : (
                            <span className={`ds-breadcrumb ${isLast ? 'ds-breadcrumb--current' : ''}`}>
                                {item.label}
                            </span>
                        )}
                        {!isLast && (
                            <span className="ds-breadcrumb-separator">
                                <ChevronRight size={10} />
                            </span>
                        )}
                    </React.Fragment>
                )
            })}
        </nav>
    )
}

/**
 * DSToolbar - Barra de herramientas
 * 
 * @param {React.ReactNode} props.children
 * @param {boolean} props.flat - Estilo plano
 * @param {string} props.className
 */
export function DSToolbar({ children, flat = false, className = '' }) {
    const classes = [
        'ds-toolbar',
        flat && 'ds-toolbar--flat',
        className,
    ]
        .filter(Boolean)
        .join(' ')

    return <div className={classes}>{children}</div>
}

/**
 * DSToolbarGroup - Grupo de elementos en toolbar
 */
export function DSToolbarGroup({ children, className = '' }) {
    return <div className={`ds-toolbar__group ${className}`}>{children}</div>
}

/**
 * DSToolbarSeparator - Separador vertical en toolbar
 */
export function DSToolbarSeparator() {
    return <div className="ds-toolbar__separator" />
}

/**
 * DSToolbarSpacer - Espaciador flexible en toolbar
 */
export function DSToolbarSpacer() {
    return <div className="ds-toolbar__spacer" />
}
