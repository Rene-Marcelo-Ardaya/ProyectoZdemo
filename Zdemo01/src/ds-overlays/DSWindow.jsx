import React from 'react'

// Ventana con drag/resize basico inspirado en Ext.Window
export function DSWindow({ title, children, footer, onClose }) {
  const winRef = React.useRef(null)
  const pos = React.useRef({ x: 0, y: 0, dx: 0, dy: 0, dragging: false })

  const onMouseDown = (e) => {
    const rect = winRef.current?.getBoundingClientRect()
    pos.current = { x: e.clientX, y: e.clientY, dx: rect?.left || 0, dy: rect?.top || 0, dragging: true }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  const onMouseMove = (e) => {
    if (!pos.current.dragging || !winRef.current) return
    const nx = pos.current.dx + (e.clientX - pos.current.x)
    const ny = pos.current.dy + (e.clientY - pos.current.y)
    winRef.current.style.left = `${nx}px`
    winRef.current.style.top = `${ny}px`
  }

  const onMouseUp = () => {
    pos.current.dragging = false
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }

  return (
    <div className="ds-window-backdrop">
      <div className="ds-window" ref={winRef} style={{ position: 'absolute', left: '20%', top: '10%' }}>
        <div className="ds-window__header" onMouseDown={onMouseDown}>
          <div>{title}</div>
          {onClose ? (
            <button className="ds-window__close" onClick={onClose} aria-label="Cerrar">
              ×
            </button>
          ) : null}
        </div>
        <div className="ds-window__body">{children}</div>
        {footer ? <div className="ds-window__footer">{footer}</div> : null}
      </div>
    </div>
  )
}
