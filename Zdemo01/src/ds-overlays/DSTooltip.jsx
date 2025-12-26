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

    const [actualPosition, setActualPosition] = useState(position);

    const updatePosition = useCallback(() => {
        if (!triggerRef.current) return;

        const rect = triggerRef.current.getBoundingClientRect();
        const offset = 8;
        const tooltipWidth = 320; // max-width del tooltip
        const tooltipHeight = 60; // altura aproximada
        const padding = 10; // margen de seguridad

        let top, left;
        let finalPosition = position;

        // Detectar si hay espacio arriba/abajo/izquierda/derecha
        const spaceTop = rect.top;
        const spaceBottom = window.innerHeight - rect.bottom;
        const spaceLeft = rect.left;
        const spaceRight = window.innerWidth - rect.right;

        // Si la posición deseada no tiene espacio, buscar alternativa
        if (position === 'top' && spaceTop < tooltipHeight + padding) {
            finalPosition = 'bottom';
        } else if (position === 'bottom' && spaceBottom < tooltipHeight + padding) {
            finalPosition = 'top';
        } else if (position === 'left' && spaceLeft < tooltipWidth + padding) {
            finalPosition = 'right';
        } else if (position === 'right' && spaceRight < tooltipWidth + padding) {
            finalPosition = 'left';
        }

        switch (finalPosition) {
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

        // Ajustar left para que no se salga de la pantalla horizontalmente
        const halfTooltip = tooltipWidth / 2;
        if (left - halfTooltip < padding) {
            left = halfTooltip + padding;
        } else if (left + halfTooltip > window.innerWidth - padding) {
            left = window.innerWidth - halfTooltip - padding;
        }

        setCoords({ top, left });
        setActualPosition(finalPosition);
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

        switch (actualPosition) {
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
                    className={`ds-tooltip__text ds-tooltip__text--${actualPosition}`}
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
