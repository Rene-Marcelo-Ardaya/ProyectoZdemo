import React from 'react'

// Campo de contraseña derivado de TextField
export function DSPasswordField({
  label,
  name,
  value,
  onChange,
  placeholder,
  help,
  error,
  disabled = false,
}) {
  return (
    <div className="ds-field">
      {label ? (
        <label className="ds-field__label" htmlFor={name}>
          {label}
        </label>
      ) : null}
      <input
        id={name}
        name={name}
        className="ds-field__control"
        type="password"
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
