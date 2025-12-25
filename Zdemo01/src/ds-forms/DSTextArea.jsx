import React from 'react'
import { HelpCircle } from 'lucide-react'

// Campo multilinea inspirado en Ext.form.TextArea
export function DSTextArea({
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
  rows = 3,
}) {
  return (
    <div className="ds-field">
      {label ? (
        <label className="ds-field__label" htmlFor={name}>
          <span className="ds-field__label-text">
            {label}
            {tooltip && (
              <span className="ds-field__tooltip-icon" title={tooltip}>
                <HelpCircle size={14} />
              </span>
            )}
          </span>
          {required && <span className="ds-field__required">*</span>}
        </label>
      ) : null}
      <textarea
        id={name}
        name={name}
        className="ds-field__control"
        value={value}
        onChange={(e) => onChange?.(e.target.value, e)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        style={{ background: disabled ? 'var(--ds-fieldDisabledBg, #e3eaf5)' : undefined }}
      />
      {help && !error ? <div className="ds-field__help">{help}</div> : null}
      {error ? <div className="ds-field__error">{error}</div> : null}
    </div>
  )
}
