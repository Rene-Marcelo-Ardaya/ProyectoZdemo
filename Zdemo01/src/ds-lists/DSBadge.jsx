import React from 'react'

/**
 * DSBadge - Componente de badge/etiqueta
 * 
 * @param {React.ReactNode} props.children - Contenido del badge
 * @param {'success'|'error'|'danger'|'warning'|'info'|'neutral'|'primary'|'purple'} props.variant
 * @param {'default'|'pill'|'square'} props.shape
 * @param {'xs'|'sm'|'md'|'lg'} props.size
 * @param {boolean} props.outline - Si es solo borde
 * @param {boolean} props.dot - Si muestra punto indicador
 * @param {React.ReactNode} props.icon - Icono opcional
 * @param {string} props.className
 */
export function DSBadge({
    children,
    variant = 'neutral',
    shape = 'default',
    size = 'md',
    outline = false,
    dot = false,
    icon,
    className = '',
}) {
    const classes = [
        'ds-badge',
        `ds-badge--${variant}`,
        shape !== 'default' && `ds-badge--${shape}`,
        size !== 'md' && `ds-badge--${size}`,
        outline && 'ds-badge--outline',
        dot && 'ds-badge--dot',
        className,
    ]
        .filter(Boolean)
        .join(' ')

    return (
        <span className={classes}>
            {icon && <span>{icon}</span>}
            {children}
        </span>
    )
}

/**
 * DSCount - Badge para mostrar contadores
 */
export function DSCount({
    children,
    variant = 'default',
    icon,
    className = '',
}) {
    const classes = [
        'ds-count',
        variant !== 'default' && `ds-count--${variant}`,
        className,
    ]
        .filter(Boolean)
        .join(' ')

    return (
        <span className={classes}>
            {icon && <span>{icon}</span>}
            {children}
        </span>
    )
}

/**
 * DSCode - Para mostrar slugs/códigos
 */
export function DSCode({ children, className = '' }) {
    return <code className={`ds-code ${className}`}>{children}</code>
}
