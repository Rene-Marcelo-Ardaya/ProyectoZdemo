import React from 'react'

// Campo de hora simple (placeholder para time-picker)
export function DSTimeField({
  label,
  name,
  value,
  onChange,
  placeholder = 'Selecciona hora',
  help,
  error,
  disabled = false,
  stepMinutes = 30,
}) {
  const [open, setOpen] = React.useState(false)

  const slots = React.useMemo(() => {
    const out = []
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += stepMinutes) {
        out.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
      }
    }
    return out
  }, [stepMinutes])

  const display = value || ''

  return (
    <div className={`ds-field ds-time ${open ? 'is-open' : ''}`}>
      {label ? (
        <label className="ds-field__label" htmlFor={name}>
          {label}
        </label>
      ) : null}
      <div className="ds-time__control">
        <input
          id={name}
          name={name}
          className="ds-field__control"
          value={display}
          placeholder={placeholder}
          readOnly
          onFocus={() => setOpen(true)}
          disabled={disabled}
          style={{ background: disabled ? 'var(--ds-fieldDisabledBg, #e3eaf5)' : undefined }}
        />
        <span className="ds-time__icon">⏱</span>
      </div>
      {open ? (
        <div className="ds-time__menu">
          {slots.map((slot) => (
            <div
              key={slot}
              className={`ds-time__option ${slot === value ? 'is-selected' : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange?.(slot)
                setOpen(false)
              }}
            >
              {slot}
            </div>
          ))}
        </div>
      ) : null}
      {help && !error ? <div className="ds-field__help">{help}</div> : null}
      {error ? <div className="ds-field__error">{error}</div> : null}
    </div>
  )
}
