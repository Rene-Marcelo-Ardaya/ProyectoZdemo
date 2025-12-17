import React from 'react'

// Mascara de carga basica para cubrir contenedores
export function DSLoadingMask({ message = 'Cargando...', fullscreen = false, className = '' }) {
  const content = (
    <div className={`ds-loading-mask ${className}`}>
      <div className="ds-loading-mask__spinner" />
      <div className="ds-loading-mask__text">{message}</div>
    </div>
  )
  if (fullscreen) {
    return <div className="ds-loading-mask is-fullscreen">{content}</div>
  }
  return content
}
