import React, { useMemo, useState } from 'react'

// Date picker simple con calendario propio (mes actual) inspirado en Ext DateField
export function DSDateField({
  label,
  name,
  value,
  onChange,
  placeholder = 'Selecciona fecha',
  help,
  error,
  disabled = false,
}) {
  const [open, setOpen] = useState(false)
  const [anchorDate, setAnchorDate] = useState(() => (value ? new Date(value) : new Date()))

  const startOfMonth = useMemo(() => new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1), [anchorDate])
  const daysInMonth = useMemo(
    () => new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0).getDate(),
    [anchorDate],
  )
  const startWeekday = startOfMonth.getDay() // 0-6

  const weeks = useMemo(() => {
    const cells = []
    for (let i = 0; i < startWeekday; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)
    const out = []
    for (let i = 0; i < cells.length; i += 7) {
      out.push(cells.slice(i, i + 7))
    }
    return out
  }, [daysInMonth, startWeekday])

  const display = useMemo(() => {
    if (!value) return ''
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return ''
    return d.toISOString().slice(0, 10)
  }, [value])

  const handleSelect = (day) => {
    const next = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), day)
    onChange?.(next.toISOString().slice(0, 10))
    setOpen(false)
  }

  const changeMonth = (delta) => {
    const next = new Date(anchorDate)
    next.setMonth(anchorDate.getMonth() + delta)
    setAnchorDate(next)
  }

  return (
    <div className={`ds-field ds-date ${open ? 'is-open' : ''}`}>
      {label ? (
        <label className="ds-field__label" htmlFor={name}>
          {label}
        </label>
      ) : null}
      <div className="ds-date__control">
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
        <span className="ds-date__icon">📅</span>
      </div>
      {open ? (
        <div className="ds-date__popover">
          <div className="ds-date__header">
            <button type="button" className="ds-btn ds-btn--ghost ds-btn--sm" onClick={() => changeMonth(-1)}>
              ◀
            </button>
            <div className="ds-date__title">
              {anchorDate.toLocaleString('default', { month: 'short' })} {anchorDate.getFullYear()}
            </div>
            <button type="button" className="ds-btn ds-btn--ghost ds-btn--sm" onClick={() => changeMonth(1)}>
              ▶
            </button>
          </div>
          <div className="ds-date__weekdays">
            {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((wd) => (
              <span key={wd}>{wd}</span>
            ))}
          </div>
          <div className="ds-date__grid">
            {weeks.map((week, wi) => (
              <div key={wi} className="ds-date__row">
                {week.map((day, di) => {
                  if (!day) return <span key={di} className="ds-date__cell is-empty" />
                  const isSelected = display && Number(display.slice(-2)) === day
                  return (
                    <button
                      type="button"
                      key={di}
                      className={`ds-date__cell ${isSelected ? 'is-selected' : ''}`}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelect(day)}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {help && !error ? <div className="ds-field__help">{help}</div> : null}
      {error ? <div className="ds-field__error">{error}</div> : null}
    </div>
  )
}
