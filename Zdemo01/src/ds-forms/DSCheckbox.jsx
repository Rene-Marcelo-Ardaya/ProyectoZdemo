import React from 'react'

// Checkbox inspirado en Ext.form.Checkbox
export function DSCheckbox({ label, name, checked, onChange, disabled = false, help, error }) {
  return (
    <div className="ds-field">
      <label className="ds-check">
        <input
          type="checkbox"
          name={name}
          checked={!!checked}
          onChange={(e) => onChange?.(e.target.checked, e)}
          disabled={disabled}
        />
        <span>{label}</span>
      </label>
      {help && !error ? <div className="ds-field__help">{help}</div> : null}
      {error ? <div className="ds-field__error">{error}</div> : null}
    </div>
  )
}
