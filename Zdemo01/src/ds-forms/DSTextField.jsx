import React from 'react'
import { DSTooltip } from '../ds-overlays/DSTooltip'

// Campo de texto inspirado en Ext.form.TextField
export function DSTextField({
  label,
  name,
  value,
  onChange,
  placeholder,
  help,
  tooltip,
  error,
  required,
  disabled = false,
  type = 'text',
  step,
}) {
  return (
    <div className="ds-field">
      {label ? (
        <label className="ds-field__label" htmlFor={name}>
          <span className="ds-field__label-text">
            {label}
            {tooltip && <DSTooltip text={tooltip} position="right" />}
          </span>
          {required && <span className="ds-field__required">*</span>}
        </label>
      ) : null}
      <input
        id={name}
        name={name}
        className="ds-field__control"
        type={type}
        step={step}
        value={value}
        onChange={(e) => onChange?.(e.target.value, e)}
        placeholder={placeholder}
        disabled={disabled}
        style={{ background: disabled ? 'var(--ds-fieldDisabledBg, #e3eaf5)' : undefined }}
      />
      {help && !error ? <div className="ds-field__help">{help}</div> : null}
      {error ? <div className="ds-field__error">{error}</div> : null}
    </div>
  )
}

