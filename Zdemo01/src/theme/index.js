import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import blue from './tokens/blue'
import gray from './tokens/gray'
import olive from './tokens/olive'
import dark from './tokens/dark'

const themes = {
  blue,
  gray,
  olive,
  dark,
}

const THEME_CLASS_PREFIX = 'ds-theme-'

const ThemeContext = createContext({
  theme: 'blue',
  tokens: blue.tokens,
  setTheme: () => { },
  availableThemes: [],
})

const applyTokensToRoot = (themeKey) => {
  const theme = themes[themeKey] || themes.blue
  const root = document.documentElement

  Object.keys(themes).forEach((key) => {
    root.classList.remove(`${THEME_CLASS_PREFIX}${key}`)
  })
  root.classList.add(`${THEME_CLASS_PREFIX}${theme.name}`)

  Object.entries(theme.tokens).forEach(([token, value]) => {
    root.style.setProperty(`--ds-${token}`, value)
  })
}

export function ThemeProvider({ theme: defaultTheme = 'blue', children }) {
  // Inicializar estado basado en localStorage o preferencia del sistema
  const [currentTheme, setCurrentTheme] = useState(() => {
    // 1. Verificar si hay guardado en localStorage
    const saved = localStorage.getItem('ds-theme-pref')
    if (saved && themes[saved]) {
      return saved
    }

    // 2. Si no hay guardado, detectar sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }

    // 3. Fallback al default
    return defaultTheme
  })

  // Escuchar cambios del sistema (solo si no hay override manual guardado)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e) => {
      // Solo cambiar automáticamente si el usuario NO ha guardado una preferencia manual explícita
      // O si decidimos que 'auto' es el comportamiento por defecto.
      // Aquí asumimos: Si no hay nada en localStorage, seguimos al sistema.
      if (!localStorage.getItem('ds-theme-pref')) {
        setCurrentTheme(e.matches ? 'dark' : defaultTheme)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [defaultTheme])

  useEffect(() => {
    applyTokensToRoot(currentTheme)
  }, [currentTheme])

  // Wrapper para setTheme que guarda en localStorage
  const handleSetTheme = (newTheme) => {
    setCurrentTheme(newTheme)
    localStorage.setItem('ds-theme-pref', newTheme)
  }

  const value = useMemo(
    () => ({
      theme: currentTheme,
      tokens: themes[currentTheme]?.tokens || themes.blue.tokens,
      setTheme: handleSetTheme,
      availableThemes: Object.keys(themes),
    }),
    [currentTheme],
  )

  return React.createElement(ThemeContext.Provider, { value }, children)
}

export const useTheme = () => useContext(ThemeContext)
export { themes }
