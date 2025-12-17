import React from 'react'

// Campo numérico inspirado en Ext.form.NumberField
export function DSNumberField({
  label,
  name,
  value,
  onChange,
  placeholder,
  help,
  error,
  disabled = false,
  min,
  max,
  step,
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
        type="number"
        value={value}
        onChange={(e) => onChange?.(e.target.value === '' ? '' : Number(e.target.value), e)}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        style={{ background: disabled ? 'var(--ds-fieldDisabledBg, #e3eaf5)' : undefined }}
      />
      {help && !error ? <div className="ds-field__help">{help}</div> : null}
      {error ? <div className="ds-field__error">{error}</div> : null}
    </div>
  )
}
