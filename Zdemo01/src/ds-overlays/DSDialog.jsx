import React from 'react'

// Dialog ligero para confirmaciones simples
export function DSDialog({ title, message, children, onConfirm, onCancel, confirmText = 'OK', cancelText = 'Cancelar', footerAlign, width }) {
  return (
    <div className="ds-window-backdrop">
      <div className="ds-window" style={width ? { width } : undefined}>
        {title ? (
          <div className="ds-window__header">
            <div>{title}</div>
          </div>
        ) : null}
        <div className="ds-window__body">
          {message && <p style={{ margin: 0, marginBottom: children ? 16 : 0 }}>{message}</p>}
          {children}
        </div>
        <div className="ds-window__footer" style={{ display: 'flex', justifyContent: footerAlign || 'flex-end', gap: '12px', padding: '16px' }}>
          {onCancel ? (
            <button className="ds-btn ds-btn--ghost" onClick={onCancel}>
              {cancelText}
            </button>
          ) : null}
          {onConfirm ? (
            <button className="ds-btn ds-btn--primary" onClick={onConfirm}>
              {confirmText}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
