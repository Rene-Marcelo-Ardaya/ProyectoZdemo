import React from 'react'
import { DSMenu, DSMenuItem } from './index'

export function DSMenuBar({ menus = [] }) {
  return (
    <div className="ds-menubar">
      {menus.map((menu) => (
        <div key={menu.label} className="ds-menubar__item">
          <span>{menu.label}</span>
          <DSMenu>
            {menu.items.map((item, idx) => (
              <DSMenuItem key={idx} label={item.label} onClick={item.onClick} />
            ))}
          </DSMenu>
        </div>
      ))}
    </div>
  )
}
