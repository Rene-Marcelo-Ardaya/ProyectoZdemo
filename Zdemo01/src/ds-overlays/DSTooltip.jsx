import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle } from 'lucide-react';
import './DSTooltip.css';

/**
 * DSTooltip - Componente de tooltip reutilizable que funciona dentro de modales
 * Usa un portal para renderizar el tooltip fuera del contenedor del modal
 */
export function DSTooltip({
    text,
    icon,
    iconSize = 14,
    position = 'top',
    className = '',
    children
}) {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const triggerRef = useRef(null);
    const tooltipRef = useRef(null);

    const Icon = icon || <HelpCircle size={iconSize} />;

    const updatePosition = useCallback(() => {
        if (!triggerRef.current) return;

        const rect = triggerRef.current.getBoundingClientRect();
        const offset = 8;

        let top, left;

        switch (position) {
            case 'bottom':
                top = rect.bottom + offset;
                left = rect.left + rect.width / 2;
                break;
            case 'left':
                top = rect.top + rect.height / 2;
                left = rect.left - offset;
                break;
            case 'right':
                top = rect.top + rect.height / 2;
                left = rect.right + offset;
                break;
            case 'top':
            default:
                top = rect.top - offset;
                left = rect.left + rect.width / 2;
                break;
        }

        setCoords({ top, left });
    }, [position]);

    const showTooltip = useCallback(() => {
        updatePosition();
        setIsVisible(true);
    }, [updatePosition]);

    const hideTooltip = useCallback(() => {
        setIsVisible(false);
    }, []);

    // Update position on scroll/resize
    useEffect(() => {
        if (!isVisible) return;

        const handleScroll = () => updatePosition();
        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('resize', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleScroll);
        };
    }, [isVisible, updatePosition]);

    const getTooltipStyle = () => {
        const style = {
            position: 'fixed',
            zIndex: 99999,
        };

        switch (position) {
            case 'bottom':
                style.top = coords.top;
                style.left = coords.left;
                style.transform = 'translateX(-50%)';
                break;
            case 'left':
                style.top = coords.top;
                style.left = coords.left;
                style.transform = 'translate(-100%, -50%)';
                break;
            case 'right':
                style.top = coords.top;
                style.left = coords.left;
                style.transform = 'translateY(-50%)';
                break;
            case 'top':
            default:
                style.top = coords.top;
                style.left = coords.left;
                style.transform = 'translate(-50%, -100%)';
                break;
        }

        return style;
    };

    return (
        <>
            <span
                ref={triggerRef}
                className={`ds-tooltip ${className}`}
                onMouseEnter={showTooltip}
                onMouseLeave={hideTooltip}
                onFocus={showTooltip}
                onBlur={hideTooltip}
            >
                {children || Icon}
            </span>
            {isVisible && createPortal(
                <span
                    ref={tooltipRef}
                    className={`ds-tooltip__text ds-tooltip__text--${position}`}
                    style={getTooltipStyle()}
                >
                    {text}
                </span>,
                document.body
            )}
        </>
    );
}

/**
 * DSHelpIcon - Versión simplificada solo con ícono de ayuda
 */
export function DSHelpIcon({ text, size = 14 }) {
    return <DSTooltip text={text} iconSize={size} />;
}

export default DSTooltip;
