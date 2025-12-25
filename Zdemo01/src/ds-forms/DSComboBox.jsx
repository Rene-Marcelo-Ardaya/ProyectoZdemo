import React, { useMemo, useState, useRef } from 'react'
import { HelpCircle } from 'lucide-react'

// ComboBox con input editable y filtrado simple
export function DSComboBox({
  label,
  name,
  value,
  options = [],
  onChange,
  placeholder = 'Selecciona...',
  help,
  tooltip,
  error,
  required,
  disabled = false,
  editable = true,
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  const filtered = useMemo(() => {
    if (!editable || !query) return options
    return options.filter((opt) => opt.label.toLowerCase().includes(query.toLowerCase()))
  }, [editable, options, query])

  const currentLabel = useMemo(() => {
    const match = options.find((opt) => opt.value === value)
    return match ? match.label : ''
  }, [options, value])

  const displayValue = editable ? query || currentLabel : currentLabel

  const handleSelect = (opt) => {
    onChange?.(opt.value)
    setQuery('')
    setOpen(false)
  }

  const handleArrowClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (open) {
      setOpen(false)
      inputRef.current?.blur()
    } else {
      setOpen(true)
      inputRef.current?.focus()
    }
  }

  return (
    <div className={`ds-field ds-combo ${open ? 'is-open' : ''}`}>
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
      <div className="ds-combo__control">
        <input
          ref={inputRef}
          id={name}
          name={name}
          className="ds-field__control"
          value={displayValue}
          onChange={(e) => {
            setQuery(e.target.value)
            if (!editable) return
            if (!open) setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            setTimeout(() => setOpen(false), 150) // permitir click en opciones
          }}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={!editable}
          style={{ background: disabled ? 'var(--ds-fieldDisabledBg, #e3eaf5)' : undefined }}
        />
        <span
          className="ds-combo__arrow"
          onMouseDown={handleArrowClick}
          style={{ cursor: 'pointer', pointerEvents: 'auto' }}
        >
          {open ? '▲' : '▼'}
        </span>
        {open ? (
          <div className="ds-combo__menu">
            {filtered.length === 0 ? (
              <div className="ds-combo__option is-empty">Sin resultados</div>
            ) : (
              filtered.map((opt) => (
                <div
                  key={opt.value}
                  className={`ds-combo__option ${opt.value === value ? 'is-selected' : ''}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(opt)}
                >
                  {opt.label}
                </div>
              ))
            )}
          </div>
        ) : null}
      </div>
      {help && !error ? <div className="ds-field__help">{help}</div> : null}
      {error ? <div className="ds-field__error">{error}</div> : null}
    </div>
  )
}
