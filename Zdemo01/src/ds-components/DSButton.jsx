import React from 'react'

/**
 * DSButton - Componente de botón reutilizable
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido del botón
 * @param {'default'|'primary'|'success'|'danger'|'warning'|'info'|'ghost'|'link'|'outline-primary'|'outline-success'|'outline-danger'} props.variant - Variante de color
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} props.size - Tamaño del botón
 * @param {boolean} props.disabled - Si está deshabilitado
 * @param {boolean} props.loading - Si está en estado de carga
 * @param {boolean} props.block - Si ocupa todo el ancho
 * @param {boolean} props.rounded - Si tiene bordes redondeados
 * @param {boolean} props.iconOnly - Si solo muestra un icono
 * @param {React.ReactNode} props.icon - Icono a mostrar
 * @param {React.ReactNode} props.iconRight - Icono a la derecha
 * @param {'button'|'submit'|'reset'} props.type - Tipo de botón HTML
 * @param {string} props.className - Clases adicionales
 * @param {Function} props.onClick - Handler de click
 */
export function DSButton({
    children,
    variant = 'default',
    size = 'md',
    disabled = false,
    loading = false,
    block = false,
    rounded = false,
    iconOnly = false,
    icon,
    iconRight,
    type = 'button',
    className = '',
    onClick,
    ...rest
}) {
    const classes = [
        'ds-button',
        variant !== 'default' && `ds-button--${variant}`,
        size !== 'md' && `ds-button--${size}`,
        disabled && 'ds-button--disabled',
        loading && 'ds-button--loading',
        block && 'ds-button--block',
        rounded && 'ds-button--rounded',
        iconOnly && 'ds-button--icon-only',
        className,
    ]
        .filter(Boolean)
        .join(' ')

    return (
        <button
            type={type}
            className={classes}
            disabled={disabled || loading}
            onClick={onClick}
            {...rest}
        >
            {icon && !loading && <span className="ds-button__icon">{icon}</span>}
            {children && <span className="ds-button__text">{children}</span>}
            {iconRight && !loading && <span className="ds-button__icon-right">{iconRight}</span>}
        </button>
    )
}

/**
 * DSButtonGroup - Grupo de botones
 */
export function DSButtonGroup({ children, vertical = false, className = '' }) {
    const classes = [
        'ds-button-group',
        vertical && 'ds-button-group--vertical',
        className,
    ]
        .filter(Boolean)
        .join(' ')

    return <div className={classes}>{children}</div>
}
