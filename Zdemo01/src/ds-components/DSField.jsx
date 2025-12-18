import React from 'react'
import { HelpCircle, AlertCircle, CheckCircle } from 'lucide-react'

/**
 * DSField - Wrapper para campos de formulario con label, help y error
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - El input/control del campo
 * @param {string} props.label - Label del campo
 * @param {string} props.name - Nombre/ID del campo
 * @param {string} props.help - Texto de ayuda
 * @param {string} props.error - Mensaje de error
 * @param {string} props.success - Mensaje de éxito
 * @param {boolean} props.required - Si es requerido (muestra *)
 * @param {boolean} props.optional - Si es opcional (muestra texto)
 * @param {string} props.tooltip - Tooltip de ayuda
 * @param {'sm'|'md'|'lg'} props.size - Tamaño
 * @param {'vertical'|'horizontal'|'inline'} props.layout - Layout
 * @param {string} props.className - Clases adicionales
 */
export function DSField({
    children,
    label,
    name,
    help,
    error,
    success,
    required = false,
    optional = false,
    tooltip,
    size = 'md',
    layout = 'vertical',
    className = '',
}) {
    const fieldClasses = [
        'ds-field',
        size !== 'md' && `ds-field--${size}`,
        layout !== 'vertical' && `ds-field--${layout}`,
        error && 'ds-field--error',
        success && 'ds-field--success',
        className,
    ]
        .filter(Boolean)
        .join(' ')

    return (
        <div className={fieldClasses}>
            {label && (
                <label className="ds-field__label" htmlFor={name}>
                    <span className="ds-field__label-text">{label}</span>
                    {required && <span className="ds-field__required">*</span>}
                    {optional && <span className="ds-field__optional">(opcional)</span>}
                    {tooltip && (
                        <span className="ds-field__tooltip" title={tooltip}>
                            <HelpCircle size={12} />
                        </span>
                    )}
                </label>
            )}
            <div className="ds-field__control-wrapper">
                {children}
            </div>
            {help && !error && !success && (
                <div className="ds-field__help">{help}</div>
            )}
            {error && (
                <div className="ds-field__error">
                    <AlertCircle size={11} />
                    {error}
                </div>
            )}
            {success && !error && (
                <div className="ds-field__success">
                    <CheckCircle size={11} />
                    {success}
                </div>
            )}
        </div>
    )
}

/**
 * DSFieldInput - Input básico estilizado
 */
export function DSFieldInput({
    name,
    type = 'text',
    value,
    onChange,
    placeholder,
    disabled = false,
    readOnly = false,
    icon,
    iconRight,
    prefix,
    suffix,
    className = '',
    ...rest
}) {
    const hasIconLeft = !!icon
    const hasIconRight = !!iconRight
    const hasPrefix = !!prefix
    const hasSuffix = !!suffix

    const wrapperClasses = [
        'ds-field__control-wrapper',
        hasPrefix && 'ds-field__control-wrapper--with-prefix',
        hasSuffix && 'ds-field__control-wrapper--with-suffix',
    ]
        .filter(Boolean)
        .join(' ')

    const inputClasses = [
        'ds-field__control',
        hasIconLeft && 'ds-field__control--with-icon-left',
        hasIconRight && 'ds-field__control--with-icon-right',
        className,
    ]
        .filter(Boolean)
        .join(' ')

    return (
        <div className={wrapperClasses}>
            {prefix && <span className="ds-field__addon ds-field__addon--prefix">{prefix}</span>}
            {icon && <span className="ds-field__icon">{icon}</span>}
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={(e) => onChange?.(e.target.value, e)}
                placeholder={placeholder}
                disabled={disabled}
                readOnly={readOnly}
                className={inputClasses}
                {...rest}
            />
            {iconRight && <span className="ds-field__icon ds-field__icon--right">{iconRight}</span>}
            {suffix && <span className="ds-field__addon ds-field__addon--suffix">{suffix}</span>}
        </div>
    )
}

/**
 * DSFieldsGrid - Grid de campos
 */
export function DSFieldsGrid({ children, columns = 2, className = '' }) {
    const classes = [
        'ds-fields-grid',
        `ds-fields-grid--${columns}`,
        className,
    ]
        .filter(Boolean)
        .join(' ')

    return <div className={classes}>{children}</div>
}

/**
 * DSFieldsRow - Fila de campos
 */
export function DSFieldsRow({ children, className = '' }) {
    return <div className={`ds-fields-row ${className}`}>{children}</div>
}

/**
 * DSColorField - Campo de color con picker y input de texto
 */
export function DSColorField({
    name,
    value,
    onChange,
    disabled = false,
    className = '',
}) {
    return (
        <div className={`ds-field__control-wrapper ${className}`} style={{ display: 'flex', gap: '6px' }}>
            <input
                type="color"
                value={value}
                onChange={(e) => onChange?.(e.target.value, e)}
                disabled={disabled}
                className="ds-field__color-picker"
            />
            <input
                id={name}
                name={name}
                type="text"
                value={value}
                onChange={(e) => onChange?.(e.target.value, e)}
                disabled={disabled}
                className="ds-field__control ds-field__color-input"
                maxLength={7}
            />
        </div>
    )
}
