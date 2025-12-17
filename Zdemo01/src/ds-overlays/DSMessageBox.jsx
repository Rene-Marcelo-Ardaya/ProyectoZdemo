import React, { useEffect, useState } from 'react'
import { Check, X, AlertTriangle, Info, HelpCircle } from 'lucide-react'

/**
 * DSMessageBox - Minimalist Centered Design (SweetAlert Style)
 */
export function DSMessageBox({
    type = 'info',
    title,
    message,
    onConfirm,
    onCancel,
    onClose,
    confirmText = 'OK',
    cancelText = 'Cancelar',
    showCloseButton = false, // Usually no close button in this style, clicking outside or buttons is enough
    isVisible = true,
    isClosing = false
}) {
    const [animateIcon, setAnimateIcon] = useState(false)

    useEffect(() => {
        if (isVisible) {
            setTimeout(() => setAnimateIcon(true), 100)
        } else {
            setAnimateIcon(false)
        }
    }, [isVisible])

    const typeConfig = {
        success: {
            Icon: Check,
            defaultTitle: '¡Éxito!',
            color: '#a5dc86',
            btnClass: 'ds-btn--sw-success'
        },
        error: {
            Icon: X,
            defaultTitle: 'Error',
            color: '#f27474',
            btnClass: 'ds-btn--sw-error'
        },
        warning: {
            Icon: AlertTriangle,
            defaultTitle: 'Advertencia',
            color: '#f8bb86',
            btnClass: 'ds-btn--sw-warning'
        },
        info: {
            Icon: Info,
            defaultTitle: 'Información',
            color: '#3fc3ee',
            btnClass: 'ds-btn--sw-info'
        },
        question: {
            Icon: HelpCircle,
            defaultTitle: '¿Estás seguro?',
            color: '#87adbd',
            btnClass: 'ds-btn--sw-question'
        }
    }

    const config = typeConfig[type] || typeConfig.info
    const IconComponent = config.Icon
    const displayTitle = title || config.defaultTitle

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && onClose) {
            onClose()
        }
    }

    return (
        <div
            className={`ds-messagebox-backdrop ${isVisible && !isClosing ? 'is-visible' : ''} ${isClosing ? 'is-closing' : ''}`}
            onClick={handleBackdropClick}
        >
            <div className={`ds-messagebox ds-messagebox--centered ${isVisible && !isClosing ? 'is-visible' : ''} ${isClosing ? 'is-closing' : ''}`}>

                <div className="ds-messagebox__content-centered">
                    {/* Animated Icon Ring */}
                    <div className={`ds-sw-icon-ring ${animateIcon ? 'animate' : ''}`} style={{ borderColor: config.color }}>
                        <div className="ds-sw-icon-content" style={{ color: config.color }}>
                            <IconComponent size={32} strokeWidth={3} />
                        </div>
                    </div>

                    <h2 className="ds-sw-title">{displayTitle}</h2>
                    <p className="ds-sw-text">{message}</p>

                    <div className="ds-sw-actions">
                        {onCancel && (
                            <button className="ds-btn ds-btn--sw-cancel" onClick={onCancel}>
                                {cancelText}
                            </button>
                        )}
                        <button className={`ds-btn ${config.btnClass} ds-btn--sw-confirm`} onClick={onConfirm}>
                            {confirmText}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}
