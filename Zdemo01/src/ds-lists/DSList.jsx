import React from 'react'

// Lista simple inspirada en Ext.DataView básico
export function DSList({ items = [], renderItem, onSelect, selectedId, getItemClassName }) {
  return (
    <div className="ds-list">
      {items.map((item) => {
        const content = renderItem ? renderItem(item) : item.label || item.toString()
        const isSelected = selectedId != null && selectedId === item.id
        const extraClass = getItemClassName ? getItemClassName(item) : ''
        return (
          <div
            key={item.id ?? content}
            className={`ds-list__item ${isSelected ? 'is-selected' : ''} ${extraClass}`}
            onClick={() => onSelect?.(item)}
          >
            {content}
          </div>
        )
      })}
    </div>
  )
}
