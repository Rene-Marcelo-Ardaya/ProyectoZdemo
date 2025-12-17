import React, { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react'
import blue from './tokens/blue'
import gray from './tokens/gray'
import olive from './tokens/olive'
import dark from './tokens/dark'
import customDefault, { generateCustomTheme } from './tokens/custom'

// Temas base (solo 4 + personalizado)
const baseThemes = {
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
  updateCustomTheme: () => { },
})

const applyTokensToRoot = (themeObj) => {
  const root = document.documentElement

  // Remover clases de tema anteriores
  const allThemeKeys = [...Object.keys(baseThemes), 'custom']
  allThemeKeys.forEach((key) => {
    root.classList.remove(`${THEME_CLASS_PREFIX}${key}`)
  })

  // Aplicar clase del tema actual
  root.classList.add(`${THEME_CLASS_PREFIX}${themeObj.name}`)

  // Aplicar tokens CSS
  Object.entries(themeObj.tokens).forEach(([token, value]) => {
    root.style.setProperty(`--ds-${token}`, value)
  })
}

export function ThemeProvider({ theme: defaultTheme = 'blue', children }) {
  // Estado del tema actual
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('ds-theme-pref')
    if (saved && (baseThemes[saved] || saved === 'custom')) {
      return saved
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return defaultTheme
  })

  // Estado del tema personalizado (cargado desde config)
  const [customTheme, setCustomTheme] = useState(customDefault)
  
  // Ref para almacenar la última config aplicada y evitar re-renders innecesarios
  const lastConfigRef = useRef('')
  // Ref para saber el tema actual sin causar re-renders
  const currentThemeRef = useRef(currentTheme)
  
  // Mantener el ref actualizado
  useEffect(() => {
    currentThemeRef.current = currentTheme
  }, [currentTheme])

  // Función para actualizar el tema personalizado desde la config
  const updateCustomTheme = useCallback((config) => {
    // Crear una clave única basada en los colores para comparar
    const configKey = `${config.theme_bg_color}-${config.theme_panel_color}-${config.theme_text_color}-${config.primary_color}-${config.secondary_color}`
    
    // Solo actualizar si los colores realmente cambiaron
    if (configKey === lastConfigRef.current) {
      return
    }
    
    lastConfigRef.current = configKey
    const newCustom = generateCustomTheme(config)
    
    setCustomTheme(prev => {
      // Verificar si realmente cambió algo
      if (JSON.stringify(prev.tokens) === JSON.stringify(newCustom.tokens)) {
        return prev
      }
      return newCustom
    })
    
    // Solo aplicar a root si el tema actual ES 'custom'
    if (currentThemeRef.current === 'custom') {
      applyTokensToRoot(newCustom)
    }
  }, [])

  // Obtener el objeto tema actual
  const currentThemeObj = useMemo(() => {
    if (currentTheme === 'custom') {
      return customTheme
    }
    return baseThemes[currentTheme] || baseThemes.blue
  }, [currentTheme, customTheme])

  // Escuchar cambios del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e) => {
      if (!localStorage.getItem('ds-theme-pref')) {
        setCurrentTheme(e.matches ? 'dark' : defaultTheme)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [defaultTheme])

  // Aplicar tokens cuando cambia el tema
  useEffect(() => {
    applyTokensToRoot(currentThemeObj)
  }, [currentThemeObj])

  // Wrapper para setTheme
  const handleSetTheme = useCallback((newTheme) => {
    setCurrentTheme(newTheme)
    localStorage.setItem('ds-theme-pref', newTheme)
  }, [])

  // Temas disponibles (4 base + personalizado)
  const availableThemes = useMemo(() => [
    ...Object.keys(baseThemes),
    'custom'
  ], [])

  // Nombres para mostrar en el selector
  const themeLabels = {
    blue: 'Azul',
    gray: 'Gris',
    olive: 'Oliva',
    dark: 'Oscuro',
    custom: 'Personalizado'
  }

  const value = useMemo(
    () => ({
      theme: currentTheme,
      tokens: currentThemeObj.tokens,
      setTheme: handleSetTheme,
      availableThemes,
      themeLabels,
      updateCustomTheme,
      isCustomTheme: currentTheme === 'custom',
    }),
    [currentTheme, currentThemeObj, handleSetTheme, availableThemes, updateCustomTheme],
  )

  return React.createElement(ThemeContext.Provider, { value }, children)
}

export const useTheme = () => useContext(ThemeContext)
export { baseThemes as themes }
