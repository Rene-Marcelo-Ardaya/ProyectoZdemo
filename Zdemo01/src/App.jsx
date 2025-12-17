import React, { useState, useEffect } from 'react'
import './App.css'
import './styles/pages.css'
import { useTheme } from './theme'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { ChatPage } from "./pages/chat/ChatPage";
import { UsuariosPage } from './pages/sistemas/UsuariosPage';
import { ControlAccesosPage } from './pages/sistemas/ControlAccesosPage';
import { ConfiguracionPage } from './pages/sistemas/ConfiguracionPage';
import { Sidebar } from './components/Sidebar'
import { logout, getSession } from './services/authService'
import { getStoredMenu, getHeaderConfig, staticMenus } from './services/menuService'
import { getPublicConfig, applyConfigToDOM } from './services/settingService'

const ACTIVE_PAGE_STORAGE_KEY = 'zdemo:lastActivePage'

const SUPPORTED_ROUTES = new Set([
  'dashboard',
  '/chat',
  '/sistemas/usuarios',
  '/sistemas/accesos',
  '/sistemas/configuracion'
])

function getStoredActivePage() {
  try {
    const value = localStorage.getItem(ACTIVE_PAGE_STORAGE_KEY)
    return typeof value === 'string' && SUPPORTED_ROUTES.has(value) ? value : null
  } catch {
    return null
  }
}

function App() {
  const { theme, setTheme, availableThemes, themeLabels, updateCustomTheme } = useTheme()
  const [activePage, setActivePage] = useState(() => getStoredActivePage() || 'dashboard')
  const [isAuthed, setIsAuthed] = useState(false)
  const [userData, setUserData] = useState(null)
  const [userMenus, setUserMenus] = useState([])
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [appConfig, setAppConfig] = useState({})

  // Verificar sesión al cargar
  useEffect(() => {
    const session = getSession()
    if (session?.isAuthenticated) {
      setIsAuthed(true)
      setUserData(session)

      const savedActivePage = getStoredActivePage()
      setActivePage(savedActivePage || 'dashboard')

      // Usar menú guardado
      const storedMenu = getStoredMenu()
      setUserMenus(storedMenu || staticMenus)

      // Cargar configuración pública
      getPublicConfig().then(config => {
        setAppConfig(config)
        applyConfigToDOM(config)
        updateCustomTheme(config) // Actualizar tema personalizado
      })
    }
  }, [updateCustomTheme])

  useEffect(() => {
    if (!isAuthed) return
    if (!SUPPORTED_ROUTES.has(activePage)) return

    try {
      localStorage.setItem(ACTIVE_PAGE_STORAGE_KEY, activePage)
    } catch {
      // ignore
    }
  }, [activePage, isAuthed])

  const goToPage = (key) => {
    if (!SUPPORTED_ROUTES.has(key)) return
    setActivePage(key)
  }

  const handleLoginSuccess = async (data) => {
    setIsAuthed(true)
    setUserData(data)

    const savedActivePage = getStoredActivePage()
    setActivePage(savedActivePage || 'dashboard')

    // Cargar menú recién guardado por authService
    const storedMenu = getStoredMenu()
    setUserMenus(storedMenu || staticMenus)
  }

  const handleLogout = async () => {
    await logout()
    setIsAuthed(false)
    setUserData(null)
    setUserMenus([])

    try {
      localStorage.removeItem(ACTIVE_PAGE_STORAGE_KEY)
    } catch {
      // ignore
    }
  }

  if (!isAuthed) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />
  }

  const { Icon: HeaderIcon, title: headerTitle } = getHeaderConfig(activePage)

  return (
    <div className="app-with-sidebar">
      {/* SIDEBAR con menús desplegables */}
      <Sidebar
        menus={userMenus}
        activePage={activePage}
        onNavigate={goToPage}
        user={userData}
        onLogout={handleLogout}
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
        appConfig={appConfig}
      />

      {/* Contenido principal */}
      <div
        className={`main-content ${isCollapsed ? 'is-collapsed' : ''}`}
        style={{
          minHeight: '100vh',
          background: 'var(--ds-primaryBg)',
          transition: 'background-color 0.2s'
        }}
      >
        {/* Header */}
        <div className="main-content__header">
          <h1 className="main-content__title">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
              <HeaderIcon size={20} />
              <span>{headerTitle}</span>
            </span>
          </h1>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--ds-secondaryText)' }}>
              {userData?.name || userData?.email}
            </span>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid var(--ds-fieldBorder)',
                background: 'var(--ds-fieldBg)',
                color: 'var(--ds-fieldText)'
              }}
            >
              {availableThemes?.map((t) => (
                <option key={t} value={t}>{themeLabels?.[t] || t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Páginas */}
        <div className="main-content__body">
          {activePage === 'dashboard' && <DashboardPage user={userData} menus={userMenus} />}
          {activePage === '/chat' && <ChatPage />}
          {activePage === '/sistemas/usuarios' && <UsuariosPage />}
          {activePage === '/sistemas/accesos' && <ControlAccesosPage />}
          {activePage === '/sistemas/configuracion' && <ConfiguracionPage />}
        </div>
      </div>
    </div>
  )
}

export default App
