import React from 'react'
import { DSCheckbox } from './DSCheckbox'

// Grupo de checkboxes inspirado en Ext.form.CheckboxGroup
export function DSCheckboxGroup({ label, name, options = [], values = [], onChange, help, error }) {
  const toggle = (val) => {
    const exists = values.includes(val)
    const next = exists ? values.filter((v) => v !== val) : [...values, val]
    onChange?.(next)
  }

  return (
    <div className="ds-field">
      {label ? <div className="ds-field__label">{label}</div> : null}
      <div style={{ display: 'grid', gap: '6px' }}>
        {options.map((opt) => (
          <DSCheckbox
            key={opt.value}
            name={`${name}-${opt.value}`}
            label={opt.label}
            checked={values.includes(opt.value)}
            onChange={() => toggle(opt.value)}
          />
        ))}
      </div>
      {help && !error ? <div className="ds-field__help">{help}</div> : null}
      {error ? <div className="ds-field__error">{error}</div> : null}
    </div>
  )
}
