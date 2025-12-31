import React, { useState, useEffect, useCallback } from 'react'
import './App.css'
import './styles/pages.css'
import { useTheme } from './theme'
import { SecurityProvider } from './core/SecurityContext'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { UsuariosPage } from './pages/sistemas/UsuariosPage';
import { ControlAccesosPage } from './pages/sistemas/ControlAccesosPage';
import { ConfiguracionPage } from './pages/sistemas/ConfiguracionPage';
import { MenusPage } from './pages/sistemas/MenusPage';
import { NivelesSeguridadPage } from './pages/sistemas/NivelesSeguridadPage';
import { CargosPage } from './pages/rrhh/CargosPage';
import { PersonalPage } from './pages/rrhh/PersonalPage';
import { TrabajosPage } from './pages/t_diesel/TrabajosPage';
import { DivisionesPage } from './pages/t_diesel/DivisionesPage';
import { ProveedoresPage } from './pages/t_diesel/ProveedoresPage';
import { TiposPagoPage } from './pages/t_diesel/TiposPagoPage';
import { MotivosAjustePage } from './pages/t_diesel/MotivosAjustePage';
import { UbicacionesPage } from './pages/t_diesel/UbicacionesPage';
import { TanquesPage } from './pages/t_diesel/TanquesPage';
import { MaquinasPage } from './pages/t_diesel/MaquinasPage';
import { TiposMovimientoPage } from './pages/t_diesel/TiposMovimientoPage';
import { IngresosPage } from './pages/t_diesel/IngresosPage';
import { RecepcionPage } from './pages/t_diesel/RecepcionPage';
import { HistorialRecepcionesPage } from './pages/t_diesel/HistorialRecepcionesPage';
import { Sidebar } from './components/Sidebar'
import { ChatWidget } from './components/ChatWidget'
import { SyncManager } from './components/SyncManager'
import { logout, getSession } from './services/authService'
import { getStoredMenu, getHeaderConfig, staticMenus } from './services/menuService'
import { getPublicConfig, applyConfigToDOM } from './services/settingService'
import { useSessionTimeout } from './hooks/useSessionTimeout'

const ACTIVE_PAGE_STORAGE_KEY = 'zdemo:lastActivePage'

const SUPPORTED_ROUTES = new Set([
  'dashboard',
  '/sistemas/usuarios',
  '/sistemas/accesos',
  '/sistemas/configuracion',
  '/sistemas/menus',
  '/sistemas/niveles-seguridad',
  '/rrhh/cargos',
  '/rrhh/personal',
  '/diesel/trabajos',
  '/diesel/divisiones',
  '/diesel/proveedores',
  '/diesel/tipos-pago',
  '/diesel/motivos-ajuste',
  '/diesel/ubicaciones',
  '/diesel/tanques',
  '/diesel/maquinas',
  '/diesel/tipos-movimiento',
  '/diesel/ingresos',
  '/diesel/recepcion',
  '/diesel/historial-recepciones'
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
  const { theme, setTheme, availableThemes, themeLabels } = useTheme()
  const [activePage, setActivePage] = useState(() => getStoredActivePage() || 'dashboard')
  const [isAuthed, setIsAuthed] = useState(false)
  const [userData, setUserData] = useState(null)
  const [userMenus, setUserMenus] = useState([])
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [appConfig, setAppConfig] = useState({})
  const [sessionWarning, setSessionWarning] = useState(null)

  // Callback cuando la sesión expira
  const handleSessionExpire = useCallback(() => {
    setIsAuthed(false)
    setUserData(null)
    setUserMenus([])
    setSessionWarning(null)
    alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.')
  }, [])

  // Callback para advertencia
  const handleSessionWarning = useCallback((remainingMinutes) => {
    setSessionWarning(remainingMinutes)
  }, [])

  // Hook de timeout de sesión (solo activo si está autenticado)
  const { remainingMinutes } = useSessionTimeout(
    isAuthed ? handleSessionExpire : null,
    isAuthed ? handleSessionWarning : null,
    5 // Advertir 5 minutos antes
  )

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
      })
    }
  }, [])

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

  // FORCE LOGIN PREVIEW (para iframe de configuración)
  if (window.location.search.includes('mode=preview')) {
    const params = new URLSearchParams(window.location.search);
    const forcedTheme = params.get('theme');
    // Sincronizar tema si se fuerza desde la URL
    if (forcedTheme && theme !== forcedTheme && availableThemes.includes(forcedTheme)) {
      setTheme(forcedTheme);
    }
    return <LoginPage />
  }

  if (!isAuthed) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />
  }

  const { Icon: HeaderIcon, title: headerTitle } = getHeaderConfig(activePage)

  return (
    <SecurityProvider user={userData}>
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

          {/* Warning de sesión por expirar */}
          {sessionWarning && sessionWarning <= 5 && (
            <div style={{
              background: '#fef3cd',
              borderLeft: '4px solid #f59e0b',
              color: '#92400e',
              padding: '10px 16px',
              margin: '0 24px 16px 24px',
              borderRadius: '0 6px 6px 0',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ⏱️ Tu sesión expirará en <strong>{sessionWarning} minuto{sessionWarning !== 1 ? 's' : ''}</strong>. Guarda tu trabajo.
            </div>
          )}

          {/* Páginas */}
          <div className="main-content__body">
            {activePage === 'dashboard' && <DashboardPage user={userData} menus={userMenus} />}
            {activePage === '/sistemas/usuarios' && <UsuariosPage />}
            {activePage === '/sistemas/accesos' && <ControlAccesosPage />}
            {activePage === '/sistemas/configuracion' && <ConfiguracionPage />}
            {activePage === '/sistemas/menus' && <MenusPage />}
            {activePage === '/sistemas/niveles-seguridad' && <NivelesSeguridadPage />}
            {activePage === '/rrhh/cargos' && <CargosPage />}
            {activePage === '/rrhh/personal' && <PersonalPage />}
            {activePage === '/diesel/maquinas' && <MaquinasPage />}
            {activePage === '/diesel/tipos-movimiento' && <TiposMovimientoPage />}
            {activePage === '/diesel/ingresos' && <IngresosPage />}
            {activePage === '/diesel/recepcion' && <RecepcionPage />}
            {activePage === '/diesel/historial-recepciones' && <HistorialRecepcionesPage />}
            {activePage === '/diesel/trabajos' && <TrabajosPage />}
            {activePage === '/diesel/divisiones' && <DivisionesPage />}
            {activePage === '/diesel/proveedores' && <ProveedoresPage />}
            {activePage === '/diesel/tipos-pago' && <TiposPagoPage />}
            {activePage === '/diesel/motivos-ajuste' && <MotivosAjustePage />}
            {activePage === '/diesel/ubicaciones' && <UbicacionesPage />}
            {activePage === '/diesel/tanques' && <TanquesPage />}
            {activePage === '/diesel/maquinas' && <MaquinasPage />}
          </div>
        </div>

        {/* Chat Widget Flotante - Solo visible si el usuario tiene acceso al chat */}
        <ChatWidget menus={userMenus} />

        {/* Gestor de Sincronización Offline */}
        <SyncManager />
      </div>
    </SecurityProvider>
  )
}

export default App

