import React, { useEffect, useState } from 'react'
import { X } from 'lucide-react'

/**
 * DSModal - Componente de modal/diálogo
 * 
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {Function} props.onClose - Callback para cerrar el modal
 * @param {string} props.title - Título del modal
 * @param {React.ReactNode} props.icon - Icono del título
 * @param {React.ReactNode} props.children - Contenido del body
 * @param {React.ReactNode} props.footer - Contenido del footer
 * @param {'sm'|'md'|'lg'|'xl'|'full'} props.size - Tamaño del modal
 * @param {boolean} props.closeOnOverlay - Si se cierra al clickear el overlay
 * @param {boolean} props.closeOnEsc - Si se cierra con Escape
 * @param {'default'|'flush'|'white'} props.bodyStyle - Estilo del body
 * @param {'left'|'center'|'right'|'space-between'} props.footerAlign
 * @param {string} props.className
 */
export function DSModal({
    isOpen,
    onClose,
    title,
    icon,
    children,
    footer,
    size = 'md',
    closeOnOverlay = true,
    closeOnEsc = true,
    bodyStyle = 'default',
    footerAlign = 'right',
    className = '',
}) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (isOpen) {
            // Pequeño delay para la animación
            requestAnimationFrame(() => setVisible(true))
            // Prevenir scroll del body
            document.body.style.overflow = 'hidden'
        } else {
            setVisible(false)
            document.body.style.overflow = ''
        }

        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    useEffect(() => {
        if (!closeOnEsc || !isOpen) return

        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                onClose?.()
            }
        }

        document.addEventListener('keydown', handleEsc)
        return () => document.removeEventListener('keydown', handleEsc)
    }, [closeOnEsc, isOpen, onClose])

    if (!isOpen) return null

    const handleOverlayClick = (e) => {
        if (closeOnOverlay && e.target === e.currentTarget) {
            onClose?.()
        }
    }

    const overlayClasses = [
        'ds-modal-overlay',
        visible && 'ds-modal-overlay--visible',
    ]
        .filter(Boolean)
        .join(' ')

    const modalClasses = [
        'ds-modal',
        size !== 'md' && `ds-modal--${size}`,
        className,
    ]
        .filter(Boolean)
        .join(' ')

    const bodyClasses = [
        'ds-modal__body',
        bodyStyle !== 'default' && `ds-modal__body--${bodyStyle}`,
    ]
        .filter(Boolean)
        .join(' ')

    const footerClasses = [
        'ds-modal__footer',
        footerAlign !== 'right' && `ds-modal__footer--${footerAlign}`,
    ]
        .filter(Boolean)
        .join(' ')

    return (
        <div className={overlayClasses} onClick={handleOverlayClick}>
            <div className={modalClasses} role="dialog" aria-modal="true">
                <div className="ds-modal__header">
                    <h3 className="ds-modal__title">
                        {icon}
                        {title}
                    </h3>
                    <button
                        type="button"
                        className="ds-modal__close"
                        onClick={onClose}
                        aria-label="Cerrar"
                    >
                        <X size={18} />
                    </button>
                </div>
                <div className={bodyClasses}>{children}</div>
                {footer && <div className={footerClasses}>{footer}</div>}
            </div>
        </div>
    )
}

/**
 * DSModalSection - Sección dentro del modal
 */
export function DSModalSection({ title, icon, help, children, className = '' }) {
    return (
        <div className={`ds-modal-section ${className}`}>
            {title && (
                <h4 className="ds-modal-section__title">
                    {icon}
                    {title}
                </h4>
            )}
            {help && <div className="ds-modal-section__help">{help}</div>}
            {children}
        </div>
    )
}

/**
 * DSModalGrid - Grid layout dentro del modal
 */
export function DSModalGrid({ children, columns = 2, className = '' }) {
    const classes = [
        'ds-modal-grid',
        columns === 3 && 'ds-modal-grid--3',
        className,
    ]
        .filter(Boolean)
        .join(' ')

    return <div className={classes}>{children}</div>
}
