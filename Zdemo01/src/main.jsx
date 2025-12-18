import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/overlays.css'
import './styles/ds-components.css'
import App from './App.jsx'
import { ThemeProvider } from './theme'
import { DSOverlayProvider } from './ds-overlays'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme="blue">
      <DSOverlayProvider>
        <App />
      </DSOverlayProvider>
    </ThemeProvider>
  </StrictMode>,
)
