import React, { useState, useEffect } from 'react';
import { login } from '../services/authService';
import { getPublicConfig, getImageUrl, applyConfigToDOM } from '../services/settingService';
import { useTheme } from '../theme';
import { DSFormPanel, DSTextField, DSPasswordField } from '../ds-forms';
import { BrandLogo } from '../components/common/BrandLogo';
import '../styles/helpers.css';
import '../styles/login.css';

/**
 * Página de Login
 * Diseño visual atractivo con autenticación via API Laravel
 * Los logos se cargan dinámicamente desde la configuración con fallback a inicial
 */
export function LoginPage({ onLoginSuccess }) {
    const { theme, setTheme, availableThemes, themeLabels } = useTheme();
    const [nombre, setNombre] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Configuración dinámica
    const [config, setConfig] = useState({});
    const [configLoaded, setConfigLoaded] = useState(false);

    // Cargar configuración pública al inicio
    useEffect(() => {
        async function loadConfig() {
            try {
                const publicConfig = await getPublicConfig();
                setConfig(publicConfig);
                applyConfigToDOM(publicConfig);
            } catch (err) {
                console.error('Error cargando config:', err);
            } finally {
                setConfigLoaded(true);
            }
        }
        loadConfig();
    }, []);

    // Determinar logos (dinámico o null)
    const logoHK = config.logo_login ? getImageUrl(config.logo_login) : null;
    const logoToreto = config.logo_login_secondary ? getImageUrl(config.logo_login_secondary) : null;
    const loginTitle = config.login_title || 'Iniciar Sesión';
    const appName = config.app_name || 'App';

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        setError('');

        if (!nombre.trim()) {
            setError('Por favor ingresa tu nombre de usuario');
            return;
        }

        if (!password.trim()) {
            setError('Por favor ingresa tu clave');
            return;
        }

        setIsLoading(true);

        try {
            const loginExitoso = await login(nombre, password);
            if (loginExitoso) {
                if (onLoginSuccess) onLoginSuccess();
            } else {
                setError('Usuario o clave incorrectos');
            }
        } catch (err) {
            setError('Error de conexión al intentar ingresar. Intente nuevamente.');
        } finally {
            setIsLoading(false);
        }
    };

    // Estilo para el panel izquierdo
    const leftPanelStyle = config.primary_color ? {
        background: `linear-gradient(135deg, ${config.primary_color} 0%, ${config.secondary_color || '#2c3e50'} 100%)`
    } : {};

    return (
        <div className="login-page">
            {/* Left Side: Toreto Logo - Full height */}
            <div className="login-page__left" style={leftPanelStyle}>
                <BrandLogo
                    src={logoToreto}
                    alt={appName}
                    className="login-page__logo-toreto"
                    primaryColor={config.primary_color}
                    secondaryColor={config.secondary_color}
                    large
                />
            </div>

            {/* Right Side: HK Logo + Form */}
            <div className="login-page__right">
                <div className="login-page__content">
                    {/* Logo HK arriba del form */}
                    <div className="login-page__logo-top">
                        <BrandLogo
                            src={logoHK}
                            alt={loginTitle}
                            className="login-page__logo-hk"
                            primaryColor={config.primary_color}
                            secondaryColor={config.secondary_color}
                        />
                    </div>

                    {/* Login Card */}
                    <div className="login-page__card">
                        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                            <DSFormPanel
                                footer={
                                    <div className="login-page__footer">
                                        {error && (
                                            <div style={{ color: '#d32f2f', fontSize: '14px', width: '100%', marginBottom: '10px', textAlign: 'center' }}>
                                                {error}
                                            </div>
                                        )}
                                        <button
                                            type="submit"
                                            className="btn-primary login-page__btn"
                                            disabled={isLoading}
                                            style={{ opacity: isLoading ? 0.7 : 1 }}
                                        >
                                            {isLoading ? 'Verificando...' : 'Entrar'}
                                        </button>
                                        <div className="theme-switcher">
                                            <label htmlFor="theme-select-login">Tema</label>
                                            <select
                                                id="theme-select-login"
                                                value={theme}
                                                onChange={(e) => setTheme(e.target.value)}
                                                className="theme-select"
                                            >
                                                {(availableThemes || []).map((t) => (
                                                    <option key={t} value={t}>
                                                        {themeLabels?.[t] || t}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                }
                            >
                                <div className="login-page__fields">
                                    <DSTextField
                                        label="Usuario"
                                        name="nombre"
                                        type="text"
                                        value={nombre}
                                        onChange={(val) => setNombre(val)}
                                        placeholder="Ingresa tu nombre de usuario"
                                        error={!nombre && error ? 'Requerido' : ''}
                                    />
                                    <DSPasswordField
                                        label="Contraseña"
                                        name="password"
                                        value={password}
                                        onChange={(val) => setPassword(val)}
                                        placeholder="••••••"
                                        error={!password && error ? 'Requerido' : ''}
                                    />
                                </div>
                            </DSFormPanel>
                        </form>
                    </div>

                    {/* Footer info */}
                    <div className="login-page__info">
                        <p>© {new Date().getFullYear()} {config.company_name || 'Toreto Pet Company'}. Todos los derechos reservados.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
