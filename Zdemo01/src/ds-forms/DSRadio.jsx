import React from 'react'

// Radio inspirado en Ext.form.Radio
export function DSRadio({ label, name, value, checked, onChange, disabled = false, help, error }) {
  return (
    <div className="ds-field">
      <label className="ds-check">
        <input
          type="radio"
          name={name}
          value={value}
          checked={!!checked}
          onChange={(e) => onChange?.(e.target.value, e)}
          disabled={disabled}
        />
        <span>{label}</span>
      </label>
      {help && !error ? <div className="ds-field__help">{help}</div> : null}
      {error ? <div className="ds-field__error">{error}</div> : null}
    </div>
  )
}
