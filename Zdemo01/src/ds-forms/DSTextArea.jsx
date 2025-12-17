import React from 'react'

// Campo multilinea inspirado en Ext.form.TextArea
export function DSTextArea({
  label,
  name,
  value,
  onChange,
  placeholder,
  help,
  error,
  disabled = false,
  rows = 3,
}) {
  return (
    <div className="ds-field">
      {label ? (
        <label className="ds-field__label" htmlFor={name}>
          {label}
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
