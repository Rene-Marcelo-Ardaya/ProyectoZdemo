import React from 'react'
import { AlertTriangle, Inbox } from 'lucide-react'

/**
 * DSLoading - Componente de estado de carga
 * 
 * @param {Object} props
 * @param {string} props.text - Texto a mostrar
 * @param {'spinner'|'dots'|'pulse'|'bar'} props.type - Tipo de spinner
 * @param {'sm'|'md'|'lg'} props.size - Tamaño
 * @param {'default'|'inline'|'fullscreen'|'overlay'} props.variant - Variante
 * @param {boolean} props.animated - Si el texto tiene animación de puntos
 * @param {string} props.className - Clases adicionales
 */
export function DSLoading({
    text = 'Cargando...',
    type = 'spinner',
    size = 'md',
    variant = 'default',
    animated = false,
    className = '',
}) {
    const containerClasses = [
        'ds-loading',
        variant !== 'default' && `ds-loading--${variant}`,
        className,
    ]
        .filter(Boolean)
        .join(' ')

    const spinnerClasses = [
        'ds-loading__spinner',
        size !== 'md' && `ds-loading__spinner--${size}`,
    ]
        .filter(Boolean)
        .join(' ')

    const textClasses = [
        'ds-loading__text',
        animated && 'ds-loading__text--animated',
    ]
        .filter(Boolean)
        .join(' ')

    const renderSpinner = () => {
        switch (type) {
            case 'dots':
                return (
                    <div className="ds-loading__dots">
                        <span className="ds-loading__dot" />
                        <span className="ds-loading__dot" />
                        <span className="ds-loading__dot" />
                    </div>
                )
            case 'pulse':
                return <div className="ds-loading__pulse" />
            case 'bar':
                return (
                    <div className="ds-loading__bar">
                        <div className="ds-loading__bar-progress" />
                    </div>
                )
            default:
                return <div className={spinnerClasses} />
        }
    }

    return (
        <div className={containerClasses}>
            {renderSpinner()}
            {text && <span className={textClasses}>{text}</span>}
        </div>
    )
}

/**
 * DSSkeleton - Componente de skeleton loading
 * 
 * @param {'text'|'title'|'avatar'|'button'|'input'|'image'} props.type
 * @param {number} props.width - Ancho personalizado
 * @param {number} props.height - Alto personalizado
 * @param {string} props.className - Clases adicionales
 */
export function DSSkeleton({
    type = 'text',
    width,
    height,
    className = '',
    style = {},
}) {
    const classes = [
        'ds-skeleton',
        `ds-skeleton--${type}`,
        className,
    ]
        .filter(Boolean)
        .join(' ')

    const customStyle = {
        ...style,
        ...(width && { width }),
        ...(height && { height }),
    }

    return <div className={classes} style={customStyle} />
}

/**
 * DSSkeletonGroup - Grupo de skeletons
 */
export function DSSkeletonGroup({ children, className = '' }) {
    return <div className={`ds-skeleton-group ${className}`}>{children}</div>
}

/**
 * DSSkeletonRow - Fila de skeletons
 */
export function DSSkeletonRow({ children, className = '' }) {
    return <div className={`ds-skeleton-row ${className}`}>{children}</div>
}

/**
 * DSEmpty - Estado vacío
 * 
 * @param {string} props.title - Título
 * @param {string} props.message - Mensaje descriptivo
 * @param {React.ReactNode} props.icon - Icono personalizado
 * @param {React.ReactNode} props.action - Botón/acción
 * @param {string} props.className - Clases adicionales
 */
export function DSEmpty({
    title = 'Sin datos',
    message = 'No hay información para mostrar',
    icon,
    action,
    className = '',
}) {
    return (
        <div className={`ds-empty ${className}`}>
            <span className="ds-empty__icon">
                {icon || <Inbox size={40} />}
            </span>
            {title && <h3 className="ds-empty__title">{title}</h3>}
            {message && <p className="ds-empty__message">{message}</p>}
            {action && <div className="ds-empty__action">{action}</div>}
        </div>
    )
}

/**
 * DSErrorState - Estado de error
 * 
 * @param {string} props.title - Título
 * @param {string} props.message - Mensaje de error
 * @param {React.ReactNode} props.icon - Icono personalizado
 * @param {React.ReactNode} props.action - Botón para reintentar
 * @param {string} props.className - Clases adicionales
 */
export function DSErrorState({
    title = 'Error',
    message = 'Ha ocurrido un error inesperado',
    icon,
    action,
    className = '',
}) {
    return (
        <div className={`ds-error-state ${className}`}>
            <span className="ds-error-state__icon">
                {icon || <AlertTriangle size={40} />}
            </span>
            {title && <h3 className="ds-error-state__title">{title}</h3>}
            {message && <p className="ds-error-state__message">{message}</p>}
            {action && <div className="ds-error-state__action">{action}</div>}
        </div>
    )
}
