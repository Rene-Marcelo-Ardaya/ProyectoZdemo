import React from 'react'

// Layout sencillo tipo border (north/south/east/west/center)
export function DSBorderLayout({ north, south, east, west, center, gap = 8, height = '600px' }) {
  return (
    <div className="ds-border" style={{ gap, height }}>
      {north ? <div className="ds-border__north">{north}</div> : null}
      <div className="ds-border__middle">
        {west ? <div className="ds-border__west">{west}</div> : null}
        <div className="ds-border__center">{center}</div>
        {east ? <div className="ds-border__east">{east}</div> : null}
      </div>
      {south ? <div className="ds-border__south">{south}</div> : null}
    </div>
  )
}
