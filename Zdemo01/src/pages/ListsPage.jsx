import React, { useState } from 'react'
import { DSList, DSGrid } from '../ds-lists'
import { DSPanel } from '../ds-layout'
import { DSToolbar } from '../ds-navigation'
import { useStore } from '../core/useStore'

export function ListsPage() {
  const [selection, setSelection] = useState({ id: 1, label: 'Elemento 1' })
  const store = useStore([
    { id: 1, name: 'Ana', role: 'Admin' },
    { id: 2, name: 'Luis', role: 'User (error)' },
    { id: 3, name: 'Mara', role: 'User' },
  ])

  const onEdit = (id, key, value) => {
    store.setData((prev) => prev.map((row) => (row.id === id ? { ...row, [key]: value } : row)))
  }

  return (
    <div className="preview-grid">
      <DSPanel title="DSList">
        <DSToolbar
          items={[
            { key: 'add', label: 'Agregar', onClick: () => {} },
            { type: 'separator' },
            { key: 'remove', label: 'Eliminar', onClick: () => {} },
          ]}
        />
        <DSList
          items={[
            { id: 1, label: 'Elemento 1' },
            { id: 2, label: 'Elemento 2' },
            { id: 3, label: 'Elemento 3 (error)' },
          ]}
          selectedId={selection?.id}
          onSelect={setSelection}
          getItemClassName={(item) => (item.id === 3 ? 'is-error' : '')}
        />
      </DSPanel>
      <DSPanel title="DSGrid">
        <DSGrid
          columns={[
            { key: 'name', label: 'Nombre', sortable: true },
            { key: 'role', label: 'Rol', sortable: true },
          ]}
          data={store.data}
          toolbar={
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="ds-pill">Toolbar</span>
              <input
                className="ds-field__control"
                placeholder="Filtro rapido"
                onChange={(e) => store.setFilter(e.target.value)}
                style={{ maxWidth: 160 }}
              />
            </div>
          }
          pagination={<span className="ds-pill">Paginacion</span>}
          getRowClassName={(row) => {
            if (row.id === 1) return 'is-selected'
            if (row.id === 2) return 'is-error'
            return ''
          }}
          onEdit={onEdit}
        />
      </DSPanel>
    </div>
  )
}
