import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { Calendar, ChevronLeft, ChevronRight, X, HelpCircle } from 'lucide-react'
import '../styles/DSDateField.css'

/**
 * DSDateField - Selector de fecha moderno y accesible
 * 
 * Características:
 * - Calendario desplegable con navegación por mes/año
 * - Clic fuera o Escape para cerrar
 * - Soporte para limpiar valor
 * - Resaltado de día actual
 * - Semana comienza en Domingo
 * - Localizado en español
 */
export function DSDateField({
  label,
  name,
  value,
  onChange,
  placeholder = 'dd/mm/aaaa',
  help,
  tooltip,
  error,
  disabled = false,
  required = false,
  minDate,
  maxDate,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      const d = new Date(value)
      return isNaN(d.getTime()) ? new Date() : d
    }
    return new Date()
  })

  const containerRef = useRef(null)
  const inputRef = useRef(null)

  // Días de la semana en español (empezando en Domingo)
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  // Meses en español
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  // Cerrar al hacer clic fuera o presionar Escape
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        inputRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // Sincronizar viewDate cuando cambia el value
  useEffect(() => {
    if (value) {
      const d = new Date(value)
      if (!isNaN(d.getTime())) {
        setViewDate(d)
      }
    }
  }, [value])

  // Valor parseado
  const parsedValue = useMemo(() => {
    if (!value) return null
    const d = new Date(value)
    return isNaN(d.getTime()) ? null : d
  }, [value])

  // Formato de display (dd/mm/aaaa)
  const displayValue = useMemo(() => {
    if (!parsedValue) return ''
    const day = String(parsedValue.getDate()).padStart(2, '0')
    const month = String(parsedValue.getMonth() + 1).padStart(2, '0')
    const year = parsedValue.getFullYear()
    return `${day}/${month}/${year}`
  }, [parsedValue])

  // Calcular días del mes
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startWeekday = firstDay.getDay() // 0 = Domingo

    const days = []

    // Días vacíos al inicio
    for (let i = 0; i < startWeekday; i++) {
      days.push({ day: null, date: null })
    }

    // Días del mes
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        day: d,
        date: new Date(year, month, d)
      })
    }

    // Completar última semana
    while (days.length % 7 !== 0) {
      days.push({ day: null, date: null })
    }

    return days
  }, [viewDate])

  // Verificar si un día es hoy
  const isToday = useCallback((date) => {
    if (!date) return false
    const today = new Date()
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
  }, [])

  // Verificar si un día está seleccionado
  const isSelected = useCallback((date) => {
    if (!date || !parsedValue) return false
    return date.getDate() === parsedValue.getDate() &&
      date.getMonth() === parsedValue.getMonth() &&
      date.getFullYear() === parsedValue.getFullYear()
  }, [parsedValue])

  // Verificar si un día está deshabilitado
  const isDisabledDate = useCallback((date) => {
    if (!date) return true
    if (minDate && date < new Date(minDate)) return true
    if (maxDate && date > new Date(maxDate)) return true
    return false
  }, [minDate, maxDate])

  // Navegación
  const goToPrevMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const goToToday = () => {
    const today = new Date()
    setViewDate(today)
    handleSelectDate(today)
  }

  // Seleccionar fecha
  const handleSelectDate = (date) => {
    if (isDisabledDate(date)) return
    const iso = date.toISOString().slice(0, 10)
    onChange?.(iso)
    setIsOpen(false)
  }

  // Limpiar
  const handleClear = (e) => {
    e.stopPropagation()
    onChange?.('')
    setIsOpen(false)
  }

  // Toggle picker
  const togglePicker = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
    }
  }

  return (
    <div ref={containerRef} className="ds-datefield">
      {/* Label */}
      {label && (
        <label className="ds-datefield__label" htmlFor={name}>
          <span className="ds-datefield__label-text">
            {label}
            {tooltip && (
              <span className="ds-datefield__tooltip-icon" title={tooltip}>
                <HelpCircle size={14} />
              </span>
            )}
          </span>
          {required && <span className="ds-datefield__required">*</span>}
        </label>
      )}

      {/* Input */}
      <div className={`ds-datefield__input-wrapper ${disabled ? 'is-disabled' : ''} ${error ? 'has-error' : ''}`}>
        <input
          ref={inputRef}
          id={name}
          name={name}
          type="text"
          className="ds-datefield__input"
          value={displayValue}
          placeholder={placeholder}
          readOnly
          disabled={disabled}
          onClick={togglePicker}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
        />

        {/* Botón limpiar */}
        {displayValue && !disabled && (
          <button
            type="button"
            className="ds-datefield__clear"
            onClick={handleClear}
            tabIndex={-1}
            aria-label="Limpiar fecha"
          >
            <X size={14} />
          </button>
        )}

        {/* Icono calendario */}
        <button
          type="button"
          className="ds-datefield__toggle"
          onClick={togglePicker}
          disabled={disabled}
          tabIndex={-1}
          aria-label="Abrir calendario"
        >
          <Calendar size={16} />
        </button>
      </div>

      {/* Picker */}
      {isOpen && (
        <div className="ds-datefield__picker" role="dialog" aria-label="Seleccionar fecha">
          {/* Header con navegación */}
          <div className="ds-datefield__header">
            <button
              type="button"
              className="ds-datefield__nav"
              onClick={goToPrevMonth}
              aria-label="Mes anterior"
            >
              <ChevronLeft size={18} />
            </button>

            <span className="ds-datefield__month-year">
              {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>

            <button
              type="button"
              className="ds-datefield__nav"
              onClick={goToNextMonth}
              aria-label="Mes siguiente"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Días de la semana */}
          <div className="ds-datefield__weekdays">
            {weekDays.map((day, i) => (
              <span key={i} className="ds-datefield__weekday">{day}</span>
            ))}
          </div>

          {/* Grid de días */}
          <div className="ds-datefield__days">
            {calendarDays.map((item, i) => (
              <button
                key={i}
                type="button"
                className={`ds-datefield__day ${!item.day ? 'is-empty' : ''
                  } ${isToday(item.date) ? 'is-today' : ''
                  } ${isSelected(item.date) ? 'is-selected' : ''
                  } ${isDisabledDate(item.date) ? 'is-disabled' : ''
                  }`}
                onClick={() => item.day && handleSelectDate(item.date)}
                disabled={!item.day || isDisabledDate(item.date)}
                tabIndex={item.day ? 0 : -1}
              >
                {item.day}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="ds-datefield__footer">
            <button
              type="button"
              className="ds-datefield__today"
              onClick={goToToday}
            >
              Hoy
            </button>
            <button
              type="button"
              className="ds-datefield__close"
              onClick={() => setIsOpen(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Help/Error text */}
      {help && !error && <div className="ds-datefield__help">{help}</div>}
      {error && <div className="ds-datefield__error">{error}</div>}
    </div>
  )
}

export default DSDateField
