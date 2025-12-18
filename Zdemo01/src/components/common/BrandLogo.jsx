import React, { useState, useEffect } from 'react';
import './BrandLogo.css';

/**
 * Componente que muestra un logo o una inicial si no hay imagen
 * @param {string} src - URL de la imagen (opcional)
 * @param {string} alt - Texto alternativo (usado para la inicial)
 * @param {string} className - Clases CSS adicionales
 * @param {boolean} large - Si es true, usa estilos más grandes (para login)
 */
export function BrandLogo({ src, alt, className = '', large = false, primaryColor, secondaryColor }) {
    const [hasError, setHasError] = useState(false);

    // Resetear estado de error cuando cambia el src
    useEffect(() => {
        setHasError(false);
    }, [src]);

    const showImage = src && !hasError;
    // Texto a mostrar (el alt completo o un default)
    const text = alt ? alt : 'App';

    if (showImage) {
        return (
            <img
                src={src}
                alt={alt}
                className={`brand-logo-img ${className}`}
                onError={() => setHasError(true)}
            />
        );
    }

    const style = {};
    if (primaryColor) {
        style.color = primaryColor;
    }

    return (
        <div
            className={`brand-logo-fallback ${large ? 'brand-logo-fallback--large' : ''} ${className}`}
            style={style}
        >
            <span className="brand-logo-text">{text}</span>
        </div>
    );
}
