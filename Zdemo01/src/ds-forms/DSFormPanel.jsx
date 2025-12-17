import React from 'react'

// Contenedor estilo Ext.form.FormPanel
export function DSFormPanel({ title, toolbar, children, footer }) {
  return (
    <div className="ds-panel">
      {title && <div className="ds-panel__header">{title}</div>}
      {toolbar ? <div className="ds-toolbar">{toolbar}</div> : null}
      <div style={{ padding: '12px' }}>{children}</div>
      {footer ? (
        <div
          style={{
            borderTop: '1px solid var(--ds-panelBorder, #c2d3ef)',
            padding: '10px 12px',
            background: 'var(--ds-surfaceBg, #f5f7fb)',
          }}
        >
          {footer}
        </div>
      ) : null}
    </div>
  )
}
