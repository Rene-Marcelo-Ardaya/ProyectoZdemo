/**
 * Tema personalizado - Se genera dinámicamente desde la configuración
 * Los colores se cargan de la API y se calculan variantes automáticamente
 */

/**
 * Genera colores derivados a partir de un color base
 */
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

function lighten(hex, percent) {
    const { r, g, b } = hexToRgb(hex);
    return rgbToHex(
        r + (255 - r) * percent,
        g + (255 - g) * percent,
        b + (255 - b) * percent
    );
}

function darken(hex, percent) {
    const { r, g, b } = hexToRgb(hex);
    return rgbToHex(r * (1 - percent), g * (1 - percent), b * (1 - percent));
}

/**
 * Genera un tema completo a partir de los colores de configuración
 */
export function generateCustomTheme(config) {
    const primary = config.primary_color || '#15428b';
    const secondary = config.secondary_color || '#4388cf';
    const bgColor = config.theme_bg_color || '#dfe8f6';
    const panelColor = config.theme_panel_color || '#99bbe8';
    const textColor = config.theme_text_color || '#1f2d3d';

    return {
        name: 'custom',
        tokens: {
            primaryBg: bgColor,
            primaryText: textColor,
            secondaryText: lighten(textColor, 0.3),
            panelBg: '#ffffff',
            panelHeaderBg: panelColor,
            panelBorder: darken(panelColor, 0.1),
            panelHeaderText: darken(textColor, 0.2),
            headerGradTop: lighten(bgColor, 0.1),
            headerGradBottom: bgColor,
            toolbarGradTop: lighten(bgColor, 0.1),
            toolbarGradBottom: bgColor,
            surfaceBg: lighten(bgColor, 0.3),
            surfaceBorder: darken(bgColor, 0.15),
            toolbarBg: panelColor,
            toolbarBorder: darken(panelColor, 0.1),
            fieldBg: '#ffffff',
            fieldText: textColor,
            fieldBorder: darken(panelColor, 0.1),
            fieldBorderHover: secondary,
            fieldBorderFocus: primary,
            fieldDisabledBg: lighten(bgColor, 0.2),
            selectionBg: lighten(primary, 0.7),
            selectionText: textColor,
            hoverBg: lighten(bgColor, 0.15),
            activeBg: lighten(primary, 0.6),
            successBg: '#dff3d8',
            successText: '#245c1c',
            warningBg: '#fff2cc',
            warningText: '#7a5b00',
            errorBg: '#fde2e1',
            errorText: '#7a1f1f',
            infoBg: lighten(primary, 0.75),
            infoText: primary,
            shadowSm: '0 1px 2px rgba(0, 0, 0, 0.08)',
            shadowMd: '0 3px 8px rgba(0, 0, 0, 0.12)',
        },
    };
}

// Tema por defecto (se reemplaza dinámicamente)
const custom = generateCustomTheme({});

export default custom;
