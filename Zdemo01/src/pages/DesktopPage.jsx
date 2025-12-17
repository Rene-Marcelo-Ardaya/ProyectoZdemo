import React from 'react'
import { DSBorderLayout, DSPanel } from '../ds-layout'
import { DSTree } from '../ds-navigation'
import { DSToolbar } from '../ds-navigation'
import { DSMenuBar } from '../ds-navigation'

export function DesktopPage() {
  return (
    <DSBorderLayout
      height="600px"
      north={
        <div>
          <DSMenuBar
            menus={[
              { label: 'Archivo', items: [{ label: 'Nuevo' }, { label: 'Abrir' }, { label: 'Salir' }] },
              { label: 'Editar', items: [{ label: 'Copiar' }, { label: 'Pegar' }] },
            ]}
          />
        </div>
      }
      west={
        <DSTree
          checkbox
          data={[
            {
              id: 'sistemas',
              label: 'Sistemas',
              children: [{ id: 'accesos', label: 'Control de Accesos' }],
            },
            { id: 'config', label: 'Configuracion' },
            { id: 'clientes', label: 'Gestion Clientes' },
          ]}
        />
      }
      center={
        <DSPanel title="Bienvenido">
          <DSToolbar items={[{ label: 'Agregar' }, { type: 'separator' }, { label: 'Refrescar' }]} />
          <div className="ds-placeholder" style={{ marginTop: 10 }}>
            <span className="ds-placeholder__tag">Contenido</span> Vista principal estilo Ext
          </div>
        </DSPanel>
      }
      south={<div className="ds-placeholder">Barra de estado</div>}
    />
  )
}
