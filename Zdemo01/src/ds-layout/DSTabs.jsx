import React, { useState } from 'react'

export function DSTabs({ tabs = [], defaultActive, onChange }) {
  const initial = defaultActive || (tabs[0] && tabs[0].key)
  const [active, setActive] = useState(initial)

  const current = tabs.find((t) => t.key === active) || tabs[0]

  const handleSelect = (key) => {
    setActive(key)
    onChange?.(key)
  }

  return (
    <div className="ds-tabs">
      <div className="ds-tabs__list">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`ds-tabs__tab ${tab.key === active ? 'is-active' : ''}`}
            onClick={() => handleSelect(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="ds-tabs__panel">{current?.content}</div>
    </div>
  )
}
