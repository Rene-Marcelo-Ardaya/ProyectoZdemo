import React, { useState, useEffect, useCallback } from 'react';
import {
    Key,
    Eye,
    EyeOff,
    Save,
    Loader2,
    CheckCircle2,
    XCircle,
    RefreshCw,
    Radio,
    Lock,
    Globe,
    Server,
    MessageSquare,
    Webhook,
    Cloud,
    CreditCard,
    Mail,
} from 'lucide-react';

import {
    DSPage,
    DSPageHeader,
    DSPageContent,
    DSSection,
    DSSubsection,
    DSAlert,
    DSButton,
    DSLoading,
    DSField,
    DSFieldInput,
    DSFieldsGrid,
    DSNavTabs,
} from '../../ds-components';

import {
    getProviderCredentials,
    updateCredentials,
    testConnection
} from '../../services/apiCredentialsService';

import './ApisConfigPage.css';

// COMPONENTE: Campo de credencial usando DS Components
// ============================================
function CredentialField({
    keyName,
    label,
    value,
    isSecret,
    description,
    onChange,
    disabled
}) {
    const [showSecret, setShowSecret] = useState(false);
    const [localValue, setLocalValue] = useState(value || '');

    useEffect(() => {
        setLocalValue(value || '');
    }, [value]);

    const handleChange = (newValue) => {
        setLocalValue(newValue);
        onChange(keyName, newValue);
    };

    const getIcon = () => {
        if (isSecret) return <Lock size={14} />;
        if (keyName.includes('cluster')) return <Globe size={14} />;
        if (keyName.includes('id')) return <Server size={14} />;
        return <Key size={14} />;
    };

    return (
        <DSField
            label={label}
            help={description}
            tooltip={isSecret ? "Este campo es sensible y se almacena encriptado" : undefined}
        >
            <div className="api-credential-input-row">
                <span className="api-credential-icon">{getIcon()}</span>
                <input
                    name={keyName}
                    type={isSecret && !showSecret ? 'password' : 'text'}
                    className="ds-field__control"
                    value={localValue}
                    onChange={(e) => handleChange(e.target.value)}
                    disabled={disabled}
                    placeholder={isSecret ? '••••••••••••' : ''}
                    style={{ flex: 1 }}
                />
                {isSecret && (
                    <button
                        type="button"
                        className="api-credential-toggle"
                        onClick={() => setShowSecret(!showSecret)}
                        title={showSecret ? 'Ocultar' : 'Mostrar'}
                    >
                        {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                )}
            </div>
        </DSField>
    );
}



// ============================================
// COMPONENTE: Sección de Proveedor
// ============================================
function ProviderSection({
    provider,
    title,
    subtitle,
    icon,
    credentials,
    onUpdate,
    onTest
}) {
    const [formData, setFormData] = useState({});
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (credentials) {
            const initialData = {};
            Object.entries(credentials).forEach(([key, cred]) => {
                initialData[key] = cred.raw_value || cred.value || '';
            });
            setFormData(initialData);
            setHasChanges(false);
        }
    }, [credentials]);

    const handleFieldChange = (keyName, value) => {
        setFormData(prev => ({
            ...prev,
            [keyName]: value
        }));
        setHasChanges(true);
        setTestResult(null);
    };

    const handleSave = async () => {
        setSaving(true);
        setTestResult(null);

        const credentialsToSave = Object.entries(formData).map(([key, value]) => ({
            key_name: key,
            value: value
        }));

        const result = await onUpdate(provider, credentialsToSave);

        if (result.success) {
            setHasChanges(false);
        }

        setSaving(false);
    };

    const handleTest = async () => {
        setTesting(true);
        setTestResult(null);

        const result = await onTest(provider);
        setTestResult(result);

        setTesting(false);
    };

    const IconComponent = icon;

    return (
        <div className="api-provider-section">
            {/* Header */}
            <div className="api-provider-header">
                <div className="api-provider-header__info">
                    <div className="api-provider-header__icon">
                        <IconComponent size={20} />
                    </div>
                    <div>
                        <h3 className="api-provider-header__title">{title}</h3>
                        <p className="api-provider-header__subtitle">{subtitle}</p>
                    </div>
                </div>

                <div className="api-provider-header__actions">
                    {testResult && (
                        <div className={`api-connection-status api-connection-status--${testResult.success ? 'success' : 'error'}`}>
                            {testResult.success ? (
                                <>
                                    <CheckCircle2 size={16} />
                                    Conexión exitosa
                                </>
                            ) : (
                                <>
                                    <XCircle size={16} />
                                    {testResult.error || 'Error de conexión'}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="api-credentials-content">
                {credentials ? (
                    <DSFieldsGrid columns={2}>
                        {Object.entries(credentials).map(([key, cred]) => (
                            <CredentialField
                                key={key}
                                keyName={cred.key_name}
                                label={cred.label || cred.key_name}
                                value={formData[key] || ''}
                                isSecret={cred.is_secret}
                                description={cred.description}
                                onChange={handleFieldChange}
                                disabled={saving}
                            />
                        ))}
                    </DSFieldsGrid>
                ) : (
                    <DSLoading text="Cargando credenciales..." />
                )}
            </div>

            {/* Footer */}
            <div className="api-provider-footer">
                <div className="api-provider-footer__status">
                    {hasChanges && (
                        <>
                            <span style={{ color: 'var(--warning-color)' }}>●</span>
                            Hay cambios sin guardar
                        </>
                    )}
                </div>

                <div className="api-provider-footer__actions">
                    <DSButton
                        variant="outline"
                        size="sm"
                        onClick={handleTest}
                        disabled={testing || saving}
                    >
                        {testing ? (
                            <>
                                <Loader2 className="animate-spin" size={16} />
                                Probando...
                            </>
                        ) : (
                            <>
                                <RefreshCw size={16} />
                                Probar Conexión
                            </>
                        )}
                    </DSButton>

                    <DSButton
                        variant="primary"
                        size="sm"
                        onClick={handleSave}
                        disabled={!hasChanges || saving}
                    >
                        {saving ? (
                            <>
                                <Loader2 className="animate-spin" size={16} />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                Guardar Cambios
                            </>
                        )}
                    </DSButton>
                </div>
            </div>
        </div>
    );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
function ApisConfigPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pusherCredentials, setPusherCredentials] = useState(null);
    const [alert, setAlert] = useState(null);
    const [activeProvider, setActiveProvider] = useState('pusher');

    // Definición de proveedores de API disponibles
    const apiProviders = [
        { key: 'pusher', label: 'Pusher', icon: <Radio size={16} /> },
        // Futuras integraciones:
        // { key: 'whatsapp', label: 'WhatsApp', icon: <MessageSquare size={16} /> },
        // { key: 'email', label: 'Email SMTP', icon: <Mail size={16} /> },
        // { key: 'payments', label: 'Pagos', icon: <CreditCard size={16} /> },
    ];

    // Cargar credenciales
    const loadCredentials = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await getProviderCredentials('pusher');

            if (result.success) {
                setPusherCredentials(result.data);
            } else {
                if (result.error === 'Proveedor no encontrado') {
                    // No hay credenciales configuradas aún
                    setPusherCredentials({});
                } else {
                    setError(result.error);
                }
            }
        } catch (err) {
            setError('Error al cargar las credenciales');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCredentials();
    }, [loadCredentials]);

    // Guardar credenciales
    const handleUpdate = async (provider, credentials) => {
        const result = await updateCredentials(provider, credentials);

        if (result.success) {
            setAlert({
                type: 'success',
                message: 'Credenciales actualizadas correctamente'
            });
            // Recargar credenciales
            loadCredentials();
        } else {
            setAlert({
                type: 'error',
                message: result.error || 'Error al guardar las credenciales'
            });
        }

        // Limpiar alerta después de 3 segundos
        setTimeout(() => setAlert(null), 3000);

        return result;
    };

    // Probar conexión
    const handleTest = async (provider) => {
        return await testConnection(provider);
    };

    if (loading) {
        return (
            <DSPage className="apis-config-page">
                <DSPageHeader
                    icon={<Key size={22} />}
                    title="Configuración de APIs"
                    description="Gestiona las credenciales de servicios externos"
                />
                <DSPageContent>
                    <DSLoading text="Cargando configuración..." />
                </DSPageContent>
            </DSPage>
        );
    }

    if (error) {
        return (
            <DSPage className="apis-config-page">
                <DSPageHeader
                    icon={<Key size={22} />}
                    title="Configuración de APIs"
                    description="Gestiona las credenciales de servicios externos"
                />
                <DSPageContent>
                    <DSAlert type="error" style={{ marginBottom: '1rem' }}>
                        {error}
                    </DSAlert>
                    <DSButton onClick={loadCredentials}>
                        Reintentar
                    </DSButton>
                </DSPageContent>
            </DSPage>
        );
    }

    return (
        <DSPage className="apis-config-page">
            <DSPageHeader
                icon={<Key size={22} />}
                title="Configuración de APIs"
                description="Gestiona las credenciales de servicios externos. Solo SuperAdmin puede acceder a esta sección."
            />

            <DSPageContent>
                {/* Alerta de estado */}
                {alert && (
                    <DSAlert
                        type={alert.type}
                        style={{ marginBottom: '1rem' }}
                        onDismiss={() => setAlert(null)}
                    >
                        {alert.message}
                    </DSAlert>
                )}

                {/* Información de seguridad */}
                <DSAlert type="info" style={{ marginBottom: '1.5rem' }}>
                    <strong>🔒 Seguridad:</strong> Las credenciales sensibles se almacenan encriptadas en la base de datos.
                    Todos los cambios quedan registrados en el log de auditoría.
                </DSAlert>

                {/* Contenedor de tabs + contenido (unidos) */}
                <div className="api-tabs-container">
                    {/* Navegación por proveedores */}
                    <DSNavTabs
                        tabs={apiProviders}
                        activeKey={activeProvider}
                        onChange={setActiveProvider}
                        variant="card"
                    />

                    {/* Panel de contenido del tab */}
                    <div className="api-tab-panel">
                        {/* Contenido según proveedor seleccionado */}
                        {activeProvider === 'pusher' && (
                            <ProviderSection
                                provider="pusher"
                                title="Pusher"
                                subtitle="WebSocket para comunicación en tiempo real"
                                icon={Radio}
                                credentials={pusherCredentials}
                                onUpdate={handleUpdate}
                                onTest={handleTest}
                            />
                        )}

                        {/* Placeholder para otros proveedores */}
                        {activeProvider !== 'pusher' && (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                <strong>Próximamente:</strong> La configuración de {apiProviders.find(p => p.key === activeProvider)?.label || activeProvider} estará disponible en futuras actualizaciones.
                            </div>
                        )}
                    </div>
                </div>

                {/* Instrucciones */}
                {activeProvider === 'pusher' && (
                    <DSSection title="Instrucciones" style={{ marginTop: '1.5rem' }}>
                        <div style={{
                            background: 'var(--bg-secondary)',
                            padding: '1.25rem',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--border-color)'
                        }}>
                            <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--text-primary)' }}>
                                ¿Cómo obtener credenciales de Pusher?
                            </h4>
                            <ol style={{
                                margin: 0,
                                paddingLeft: '1.25rem',
                                color: 'var(--text-secondary)',
                                lineHeight: 1.7
                            }}>
                                <li>Visita <a href="https://pusher.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)' }}>pusher.com</a> y crea una cuenta gratuita</li>
                                <li>Crea una nueva aplicación (Channels)</li>
                                <li>Selecciona el cluster más cercano a tu ubicación (ej: <code>sa1</code> para Sudamérica)</li>
                                <li>Copia las credenciales (App ID, Key, Secret, Cluster) aquí</li>
                                <li>Usa el botón "Probar Conexión" para verificar que todo funciona</li>
                            </ol>
                        </div>
                    </DSSection>
                )}
            </DSPageContent>
        </DSPage>
    );
}

export { ApisConfigPage };
export default ApisConfigPage;

