import React, { useMemo, useState } from 'react'

// Grid básico inspirado en Ext.grid.GridPanel con sort visual simple
export function DSGrid({ columns = [], data = [], toolbar, pagination, getRowClassName, onEdit }) {
  const [sortState, setSortState] = useState({ key: null, dir: 'asc' })
  const [editing, setEditing] = useState({ rowId: null, colKey: null })
  const [draft, setDraft] = useState('')

  const sorted = useMemo(() => {
    if (!sortState.key) return data
    const dir = sortState.dir === 'desc' ? -1 : 1
    return [...data].sort((a, b) => {
      if (a[sortState.key] > b[sortState.key]) return dir
      if (a[sortState.key] < b[sortState.key]) return -dir
      return 0
    })
  }, [data, sortState])

  const handleSort = (col) => {
    if (!col.sortable) return
    setSortState((prev) => {
      if (prev.key === col.key) {
        const nextDir = prev.dir === 'asc' ? 'desc' : 'asc'
        return { key: col.key, dir: nextDir }
      }
      return { key: col.key, dir: 'asc' }
    })
  }

  return (
    <div className="ds-grid">
      {toolbar ? <div className="ds-grid__toolbar">{toolbar}</div> : null}
      <div className="ds-grid__header">
        {columns.map((col, idx) => (
          <div
            key={col.key || col.field || idx}
            className={`ds-grid__cell ds-grid__cell--header ${col.sortable ? 'is-sortable' : ''}`}
            style={{ width: col.width }}
            onClick={() => handleSort(col)}
          >
            {col.label}
            {sortState.key === col.key ? <span className="ds-grid__sort">{sortState.dir === 'asc' ? '▲' : '▼'}</span> : null}
          </div>
        ))}
      </div>
      <div className="ds-grid__body">
        {sorted.map((row, idx) => {
          const extraClass = getRowClassName ? getRowClassName(row) : ''
          return (
            <div key={row.id ?? idx} className={`ds-grid__row ${extraClass}`}>
              {columns.map((col, cIdx) => (
                <div key={col.key || col.field || cIdx} className="ds-grid__cell" style={{ width: col.width }}>
                  {editing.rowId === row.id && editing.colKey === col.key ? (
                    <input
                      className="ds-field__control"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onBlur={() => {
                        onEdit?.(row.id, col.key, draft)
                        setEditing({ rowId: null, colKey: null })
                      }}
                    />
                  ) : (
                    <span
                      onDoubleClick={() => {
                        setEditing({ rowId: row.id, colKey: col.key })
                        setDraft(row[col.key])
                      }}
                    >
                      {row[col.key]}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )
        })}
      </div>
      {pagination ? <div className="ds-grid__pagination">{pagination}</div> : null}
    </div>
  )
}
