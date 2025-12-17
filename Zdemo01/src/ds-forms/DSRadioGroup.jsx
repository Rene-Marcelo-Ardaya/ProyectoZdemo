import React from 'react'
import { DSRadio } from './DSRadio'

// Grupo de radios inspirado en Ext.form.RadioGroup
export function DSRadioGroup({ label, name, options = [], value, onChange, help, error }) {
  return (
    <div className="ds-field">
      {label ? <div className="ds-field__label">{label}</div> : null}
      <div style={{ display: 'grid', gap: '6px' }}>
        {options.map((opt) => (
          <DSRadio
            key={opt.value}
            name={name}
            label={opt.label}
            value={opt.value}
            checked={value === opt.value}
            onChange={onChange}
          />
        ))}
      </div>
      {help && !error ? <div className="ds-field__help">{help}</div> : null}
      {error ? <div className="ds-field__error">{error}</div> : null}
    </div>
  )
}
