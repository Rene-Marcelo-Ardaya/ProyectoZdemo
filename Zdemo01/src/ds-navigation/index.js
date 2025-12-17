import React from 'react'

export function DSToolbar({ items = [] }) {
  return React.createElement(
    'div',
    { className: 'ds-toolbar' },
    items.map((item, idx) =>
      item.type === 'separator'
        ? React.createElement('span', { key: idx, className: 'ds-toolbar__sep' })
        : React.createElement(
            'button',
            { key: item.key || idx, className: 'ds-btn ds-btn--ghost', onClick: item.onClick },
            item.label,
          ),
    ),
  )
}

export function DSMenu({ children }) {
  return React.createElement('div', { className: 'ds-menu' }, children)
}

export function DSMenuItem({ label, onClick }) {
  return React.createElement(
    'div',
    { className: 'ds-menu__item', onClick },
    label,
  )
}

export { DSTree } from './DSTree'
export { DSMenuBar } from './DSMenuBar'
