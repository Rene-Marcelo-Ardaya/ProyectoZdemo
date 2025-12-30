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

/**
 * DSRefreshButton - Botón de actualizar/refrescar para listados
 * 
 * @param {Object} props
 * @param {Function} props.onClick - Handler de click (típicamente refetch)
 * @param {boolean} props.loading - Si está cargando/refrescando
 * @param {string} props.label - Texto del botón (default: "Actualizar")
 * @param {string} props.className - Clases adicionales
 */
export function DSRefreshButton({
    onClick,
    loading = false,
    label = 'Actualizar',
    className = '',
    size = 'sm',
    ...rest
}) {
    // Importamos el icono inline para evitar dependencias circulares
    const RefreshIcon = () => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={loading ? 'ds-refresh-icon--spinning' : ''}
        >
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 16h5v5" />
        </svg>
    );

    return (
        <DSButton
            size={size}
            icon={<RefreshIcon />}
            onClick={onClick}
            disabled={loading}
            className={`ds-refresh-button ${className}`}
            {...rest}
        >
            {label}
        </DSButton>
    );
}
