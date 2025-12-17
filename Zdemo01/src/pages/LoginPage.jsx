import React, { useState, useEffect } from 'react';
import { login } from '../services/authService';
import { getPublicConfig, getImageUrl, applyConfigToDOM } from '../services/settingService';
import { useTheme } from '../theme';
import { DSFormPanel, DSTextField, DSPasswordField } from '../ds-forms';
import '../styles/helpers.css';
import '../styles/login.css';

// Logos estáticos como fallback
import logoHKStatic from '../img/Final new hk no bc.png';
import logoToretoStatic from '../img/Toreto Pet Company PNG.png';

/**
 * Página de Login
 * Diseño visual atractivo con autenticación via API Laravel
 * Los logos se cargan dinámicamente desde la configuración con fallback estático
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

    // Determinar logos (dinámico o fallback estático)
    const logoHK = config.logo_login ? getImageUrl(config.logo_login) : logoHKStatic;
    const logoToreto = config.logo_login_secondary ? getImageUrl(config.logo_login_secondary) : logoToretoStatic;
    const loginTitle = config.login_title || 'Iniciar Sesión';

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        setError('');

        if (!nombre.trim()) {
            setError('Por favor ingresa tu nombre de usuario');
            return;
        }

        if (!password.trim()) {
            setError('Por favor ingresa tu contraseña');
            return;
        }

        setIsLoading(true);

        try {
            const result = await login(nombre, password);

            if (result.success) {
                onLoginSuccess(result.data);
            } else {
                setError(result.error || 'Error al iniciar sesión');
            }
        } catch (err) {
            setError('Error de conexión. Intenta nuevamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* Left Side: Toreto Logo - Full height */}
            <div className="login-page__left">
                <img
                    src={logoToreto}
                    alt="Toreto Pet Company"
                    className="login-page__logo-toreto"
                />
            </div>

            {/* Right Side: HK Logo + Form */}
            <div className="login-page__right">
                <div className="login-page__content">
                    {/* Logo HK arriba del form */}
                    <div className="login-page__logo-top">
                        <img
                            src={logoHK}
                            alt="HK Logo"
                            className="login-page__logo-hk"
                        />
                    </div>

                    {/* Login Card */}
                    <div className="login-page__card">
                        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                            <DSFormPanel
                                title={loginTitle}
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
