import React, { useState } from 'react'
import { DSWindow, DSDialog, DSLoadingMask } from '../ds-overlays'
import { useToast } from '../core/useToast'
import { DSMenu, DSMenuItem } from '../ds-navigation'
import { DSBorderLayout } from '../ds-layout'
import { DSTree } from '../ds-navigation'
import { DSMenuBar } from '../ds-navigation'
import { DSToolbar } from '../ds-navigation'

export function OverlaysPage() {
  const [openWindow, setOpenWindow] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast, showToast, hideToast } = useToast()

  return (
    <div className="overlay-page">
      <DSMenuBar
        menus={[
          { label: 'Archivo', items: [{ label: 'Nuevo' }, { label: 'Cerrar', onClick: () => setOpenWindow(false) }] },
          { label: 'Editar', items: [{ label: 'Copiar' }, { label: 'Pegar' }] },
        ]}
      />
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button className="ds-btn ds-btn--primary" onClick={() => setOpenWindow(true)}>
          Abrir ventana
        </button>
        <button className="ds-btn ds-btn--ghost" onClick={() => setShowDialog(true)}>
          Mostrar dialogo
        </button>
        <div style={{ position: 'relative' }}>
          <button className="ds-btn ds-btn--primary" onClick={() => showToast('Toast demo')}>
            Mostrar toast
          </button>
          <DSMenu>
            <DSMenuItem label="Toast info" onClick={() => showToast('Info toast')} />
            <DSMenuItem label="Toast success" onClick={() => showToast('Success toast')} />
          </DSMenu>
        </div>
        <button
          className="ds-btn ds-btn--ghost"
          onClick={() => {
            setLoading(true)
            setTimeout(() => setLoading(false), 1200)
          }}
        >
          Toggle loading
        </button>
      </div>

      {openWindow ? (
        <DSWindow
          title="Demo Window"
          onClose={() => setOpenWindow(false)}
          footer={
            <>
              <button className="ds-btn ds-btn--ghost" onClick={() => setOpenWindow(false)}>
                Cancelar
              </button>
              <button className="ds-btn ds-btn--primary" onClick={() => setOpenWindow(false)}>
                Aceptar
              </button>
            </>
          }
        >
          <p style={{ margin: 0 }}>Contenido de ventana tematizada.</p>
        </DSWindow>
      ) : null}

      {showDialog ? (
        <DSDialog
          title="Confirmacion"
          message="Ejemplo de dialogo confirm/ cancelar."
          onConfirm={() => {
            showToast('Confirmado')
            setShowDialog(false)
          }}
          onCancel={() => setShowDialog(false)}
          confirmText="Confirmar"
          cancelText="Cancelar"
        />
      ) : null}

      <div className="ds-overlay-container" style={{ minHeight: 80, marginTop: 12 }}>
        <div className="ds-placeholder">
          <span className="ds-placeholder__tag">Area con loading overlay</span>
          <span>Demo scoped</span>
        </div>
        {loading ? <DSLoadingMask className="is-overlay" message="Cargando datos..." /> : null}
      </div>

      {toast ? (
        <div className="ds-toast is-inline" onClick={hideToast}>
          {toast}
        </div>
      ) : null}

      <h4>Layout estilo border + arbol</h4>
      <DSBorderLayout
        height="400px"
        west={
          <DSTree
            data={[
              {
                id: 'root',
                label: 'Root',
                children: [
                  { id: 'child1', label: 'Child 1' },
                  { id: 'child2', label: 'Child 2', children: [{ id: 'grand', label: 'Grandchild' }] },
                ],
              },
            ]}
            checkbox
            onCheck={(node, checked) => {
              node.checked = checked
            }}
          />
        }
        center={
          <div>
            <DSToolbar items={[{ label: 'Accion', onClick: () => {} }, { type: 'separator' }, { label: 'Refrescar' }]} />
            <div className="ds-placeholder" style={{ marginTop: 8 }}>
              Centro
            </div>
          </div>
        }
        east={<div className="ds-placeholder">East</div>}
        south={<div className="ds-placeholder">Status bar</div>}
        north={<div className="ds-placeholder">Toolbar/menubar</div>}
      />
    </div>
  )
}
