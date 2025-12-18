import React, { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'

/**
 * DSAlert - Componente de alerta/notificación reutilizable
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido/mensaje de la alerta
 * @param {'success'|'error'|'danger'|'warning'|'info'|'neutral'} props.variant - Variante de color
 * @param {string} props.title - Título opcional
 * @param {'sm'|'md'|'lg'} props.size - Tamaño
 * @param {'default'|'filled'|'outline'|'inline'|'banner'} props.style - Estilo visual
 * @param {boolean} props.dismissible - Si se puede cerrar
 * @param {boolean} props.showIcon - Si muestra icono
 * @param {React.ReactNode} props.icon - Icono personalizado
 * @param {Function} props.onDismiss - Callback cuando se cierra
 * @param {number} props.autoClose - Tiempo en ms para cerrar automáticamente
 * @param {boolean} props.animate - Si anima entrada/salida
 * @param {string} props.className - Clases adicionales
 */
export function DSAlert({
    children,
    variant = 'info',
    title,
    size = 'md',
    style = 'default',
    dismissible = false,
    showIcon = true,
    icon,
    onDismiss,
    autoClose,
    animate = true,
    className = '',
}) {
    const [visible, setVisible] = useState(true)
    const [closing, setClosing] = useState(false)

    useEffect(() => {
        if (autoClose && autoClose > 0) {
            const timer = setTimeout(() => {
                handleDismiss()
            }, autoClose)
            return () => clearTimeout(timer)
        }
    }, [autoClose])

    const handleDismiss = () => {
        if (animate) {
            setClosing(true)
            setTimeout(() => {
                setVisible(false)
                onDismiss?.()
            }, 200)
        } else {
            setVisible(false)
            onDismiss?.()
        }
    }

    if (!visible) return null

    // Iconos por defecto según variante
    const defaultIcons = {
        success: <CheckCircle size={16} />,
        error: <AlertCircle size={16} />,
        danger: <AlertCircle size={16} />,
        warning: <AlertTriangle size={16} />,
        info: <Info size={16} />,
        neutral: <Info size={16} />,
    }

    const displayIcon = icon || defaultIcons[variant]

    const classes = [
        'ds-alert',
        `ds-alert--${variant}`,
        size !== 'md' && `ds-alert--${size}`,
        style !== 'default' && `ds-alert--${style}`,
        animate && !closing && 'ds-alert--animate-in',
        closing && 'ds-alert--animate-out',
        className,
    ]
        .filter(Boolean)
        .join(' ')

    return (
        <div className={classes} role="alert">
            {showIcon && displayIcon && (
                <span className="ds-alert__icon">{displayIcon}</span>
            )}
            <div className="ds-alert__content">
                {title && <div className="ds-alert__title">{title}</div>}
                {children && <div className="ds-alert__message">{children}</div>}
            </div>
            {dismissible && (
                <button
                    type="button"
                    className="ds-alert__dismiss"
                    onClick={handleDismiss}
                    aria-label="Cerrar"
                >
                    <X size={14} />
                </button>
            )}
        </div>
    )
}
