import React, { useState } from 'react'

export function DSAccordion({ items = [] }) {
  const [openKey, setOpenKey] = useState(items[0]?.key)

  return (
    <div className="ds-accordion">
      {items.map((item) => {
        const open = item.key === openKey
        return (
          <div key={item.key} className="ds-accordion__item">
            <button className="ds-accordion__header" onClick={() => setOpenKey(open ? null : item.key)}>
              {item.title}
              <span className="ds-accordion__chevron">{open ? '▾' : '▸'}</span>
            </button>
            {open ? <div className="ds-accordion__body">{item.content}</div> : null}
          </div>
        )
      })}
    </div>
  )
}
