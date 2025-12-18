import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Settings, Upload, Save, Loader2, AlertCircle, CheckCircle, X, Image, Type, Palette, Building2, HelpCircle, Eye, User, Lock, Monitor } from 'lucide-react';
import { getAllSettings, updateSetting, uploadSettingImage, deleteSettingImage, getImageUrl } from '../../services/settingService';
import { useTheme } from '../../theme';
import './ConfiguracionPage.css';

// ============================================
// CUSTOM HOOK: useSettings
// ============================================
function useSettings() {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllSettings();
            setSettings(data);
        } catch (err) {
            setError('Error cargando configuración');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Convertir a objeto plano para fácil acceso
    const flatSettings = {};
    Object.values(settings).forEach(group => {
        group.forEach(item => {
            flatSettings[item.key] = item;
        });
    });

    return { settings, flatSettings, loading, error, refetch: fetchData };
}

// ============================================
// COMPONENTE: Alert
// ============================================
function Alert({ type = 'error', message, onDismiss }) {
    if (!message) return null;
    const Icon = type === 'error' ? AlertCircle : CheckCircle;

    return (
        <div className={`config-alert config-alert--${type}`}>
            <Icon size={16} />
            <span>{message}</span>
            {onDismiss && (
                <button onClick={onDismiss} className="config-alert__dismiss">
                    <X size={14} />
                </button>
            )}
        </div>
    );
}

// ============================================
// COMPONENTE: TextField
// ============================================
function TextField({ label, value, onChange, onSave, saving, help, icon: Icon = Type }) {
    const [localValue, setLocalValue] = useState(value || '');
    const [dirty, setDirty] = useState(false);

    useEffect(() => {
        setLocalValue(value || '');
        setDirty(false);
    }, [value]);

    const handleChange = (e) => {
        setLocalValue(e.target.value);
        setDirty(e.target.value !== (value || ''));
        onChange?.(e.target.value);
    };

    const handleSave = async () => {
        await onSave(localValue);
        setDirty(false);
    };

    return (
        <div className="config-field">
            <label className="config-field__label">
                <Icon size={14} />
                {label}
                {help && <span className="config-field__help" title={help}><HelpCircle size={12} /></span>}
            </label>
            <div className="config-field__row">
                <input
                    type="text"
                    className="config-input"
                    value={localValue}
                    onChange={handleChange}
                />
                {dirty && (
                    <button className="config-btn config-btn--save" onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
                    </button>
                )}
            </div>
        </div>
    );
}

// ============================================
// COMPONENTE: ImageField
// ============================================
function ImageField({ label, value, onUpload, onDelete, help, small }) {
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [preview, setPreview] = useState(null);
    const inputRef = useRef(null);

    const currentImage = value ? getImageUrl(value) : null;

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(file);

        setUploading(true);
        await onUpload(file);
        setUploading(false);
        setPreview(null);
    };

    const handleDelete = async () => {
        if (!onDelete) return;
        if (!confirm('¿Estás seguro de eliminar esta imagen?')) return;

        setDeleting(true);
        await onDelete();
        setDeleting(false);
    };

    return (
        <div className={`config-image-field ${small ? 'config-image-field--small' : ''}`}>
            <label className="config-field__label">
                <Image size={14} />
                {label}
                {help && <span className="config-field__help" title={help}><HelpCircle size={12} /></span>}
            </label>
            <div className="config-image-box">
                {(preview || currentImage) ? (
                    <img src={preview || currentImage} alt={label} className="config-image-preview" />
                ) : (
                    <div className="config-image-placeholder">
                        <Image size={24} />
                        <span>Sin imagen</span>
                    </div>
                )}
                <input ref={inputRef} type="file" accept="image/*" onChange={handleFileSelect} hidden />
                <div className="config-image-actions">
                    <button className="config-btn config-btn--upload" onClick={() => inputRef.current?.click()} disabled={uploading || deleting}>
                        {uploading ? <Loader2 size={14} className="spin" /> : <Upload size={14} />}
                        {uploading ? 'Subiendo...' : (currentImage ? 'Cambiar' : 'Subir')}
                    </button>
                    {currentImage && (
                        <button
                            className="config-btn config-btn--delete"
                            onClick={handleDelete}
                            disabled={uploading || deleting}
                            title="Eliminar imagen"
                        >
                            {deleting ? <Loader2 size={14} className="spin" /> : <X size={14} />}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ============================================
// COMPONENTE: ColorField
// ============================================
function ColorField({ label, value, onChange, onSave, saving }) {
    const [localValue, setLocalValue] = useState(value || '#15428b');
    const [dirty, setDirty] = useState(false);

    useEffect(() => {
        setLocalValue(value || '#15428b');
        setDirty(false);
    }, [value]);

    const handleChange = (e) => {
        setLocalValue(e.target.value);
        setDirty(e.target.value !== (value || '#15428b'));
        onChange?.(e.target.value);
    };

    return (
        <div className="config-field config-field--color">
            <label className="config-field__label">
                <Palette size={14} />
                {label}
            </label>
            <div className="config-field__row">
                <input type="color" className="config-color-picker" value={localValue} onChange={handleChange} />
                <input type="text" className="config-input config-input--color" value={localValue} onChange={handleChange} />
                {dirty && (
                    <button className="config-btn config-btn--save" onClick={() => onSave(localValue)} disabled={saving}>
                        {saving ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
                    </button>
                )}
            </div>
        </div>
    );
}

import { BrandLogo } from '../../components/common/BrandLogo';



// ============================================
// COMPONENTE PRINCIPAL: ConfiguracionPage
// ============================================
export function ConfiguracionPage() {
    const { theme } = useTheme();
    const { settings, flatSettings, loading, error: loadError, refetch } = useSettings();
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState({});

    // Key para recargar el iframe
    const [iframeKey, setIframeKey] = useState(0);

    const handleSave = async (key, value) => {
        setSaving(prev => ({ ...prev, [key]: true }));
        const result = await updateSetting(key, value);
        setSaving(prev => ({ ...prev, [key]: false }));

        if (result.success) {
            setSuccess('Configuración guardada');
            setIframeKey(k => k + 1);
            refetch();
            setTimeout(() => setSuccess(null), 3000);
        } else {
            setError(result.error || 'Error guardando');
            setTimeout(() => setError(null), 5000);
        }
    };

    const handleUpload = async (key, file) => {
        setSaving(prev => ({ ...prev, [key]: true }));
        const result = await uploadSettingImage(key, file);
        setSaving(prev => ({ ...prev, [key]: false }));

        if (result.success) {
            setSuccess('Imagen actualizada');
            setIframeKey(k => k + 1);
            refetch();
            setTimeout(() => setSuccess(null), 3000);
        } else {
            setError(result.error || 'Error subiendo imagen');
            setTimeout(() => setError(null), 5000);
        }
    };

    const handleDeleteImage = async (key) => {
        setSaving(prev => ({ ...prev, [key]: true }));
        const result = await deleteSettingImage(key);
        setSaving(prev => ({ ...prev, [key]: false }));

        if (result.success) {
            setSuccess('Imagen eliminada');
            setIframeKey(k => k + 1);
            refetch();
            setTimeout(() => setSuccess(null), 3000);
        } else {
            setError(result.error || 'Error eliminando imagen');
            setTimeout(() => setError(null), 5000);
        }
    };

    if (loading) {
        return (
            <div className="config-page">
                <div className="config-loading">
                    <Loader2 size={32} className="spin" />
                    <span>Cargando configuración...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="config-page">
            {/* HEADER */}
            <div className="config-page__header">
                <div className="config-page__title">
                    <Settings size={22} />
                    <h1>Configuración del Sistema</h1>
                </div>
            </div>

            {/* ALERTAS */}
            <Alert type="success" message={success} onDismiss={() => setSuccess(null)} />
            <Alert type="error" message={error || loadError} onDismiss={() => setError(null)} />

            {/* CONTENIDO */}
            <div className="config-content">
                {/* SECCIÓN: Información de la Empresa */}
                <div className="config-section">
                    <div className="config-section__header">
                        <Building2 size={18} />
                        <h2>Información de la Empresa</h2>
                    </div>
                    <div className="config-section__body">
                        <div className="config-grid-2">
                            <TextField
                                label="Nombre de la Empresa"
                                value={flatSettings.company_name?.value}
                                onSave={(v) => handleSave('company_name', v)}
                                saving={saving.company_name}
                                icon={Building2}
                            />
                            <TextField
                                label="RIF / NIT"
                                value={flatSettings.company_rif?.value}
                                onSave={(v) => handleSave('company_rif', v)}
                                saving={saving.company_rif}
                            />
                            <TextField
                                label="Teléfono"
                                value={flatSettings.company_phone?.value}
                                onSave={(v) => handleSave('company_phone', v)}
                                saving={saving.company_phone}
                            />
                            <TextField
                                label="Correo Electrónico"
                                value={flatSettings.company_email?.value}
                                onSave={(v) => handleSave('company_email', v)}
                                saving={saving.company_email}
                            />
                        </div>
                        <TextField
                            label="Dirección"
                            value={flatSettings.company_address?.value}
                            onSave={(v) => handleSave('company_address', v)}
                            saving={saving.company_address}
                        />
                    </div>
                </div>

                {/* SECCIÓN: Identidad Visual */}
                <div className="config-section">
                    <div className="config-section__header">
                        <Palette size={18} />
                        <h2>Identidad Visual (Branding)</h2>
                    </div>
                    <div className="config-section__body">
                        <div className="config-grid-2">
                            <TextField
                                label="Nombre de la Aplicación"
                                value={flatSettings.app_name?.value}
                                onSave={(v) => handleSave('app_name', v)}
                                saving={saving.app_name}
                                help="Aparece en el título del navegador"
                            />
                            <TextField
                                label="Nombre Corto"
                                value={flatSettings.app_short_name?.value}
                                onSave={(v) => handleSave('app_short_name', v)}
                                saving={saving.app_short_name}
                                help="Para PWA y móviles"
                            />
                        </div>

                        <div className="config-subsection">
                            <h4>Textos del Login</h4>
                            <div>
                                <TextField
                                    label="Título del Login"
                                    value={flatSettings.login_title?.value}
                                    onSave={(v) => handleSave('login_title', v)}
                                    saving={saving.login_title}
                                />
                            </div>
                        </div>

                        <div className="config-subsection">
                            <h4>Colores del Login</h4>
                            <p className="config-hint">
                                Estos colores se usan en la página de login (fondo degradado y acentos)
                            </p>
                            <div className="config-grid-2">
                                <ColorField
                                    label="Color Primario (Login)"
                                    value={flatSettings.primary_color?.value}
                                    onSave={(v) => handleSave('primary_color', v)}
                                    saving={saving.primary_color}
                                />
                                <ColorField
                                    label="Color Secundario (Login)"
                                    value={flatSettings.secondary_color?.value}
                                    onSave={(v) => handleSave('secondary_color', v)}
                                    saving={saving.secondary_color}
                                />
                            </div>
                        </div>

                        <div className="config-subsection">
                            <h4>Logos e Imágenes</h4>
                            <div className="config-images-grid">
                                <ImageField
                                    label="Logo del Login (Principal)"
                                    value={flatSettings.logo_login?.value}
                                    onUpload={(f) => handleUpload('logo_login', f)}
                                    onDelete={() => handleDeleteImage('logo_login')}
                                    help="Logo grande en la página de login"
                                />
                                <ImageField
                                    label="Logo Lateral (Izquierda)"
                                    value={flatSettings.logo_login_secondary?.value}
                                    onUpload={(f) => handleUpload('logo_login_secondary', f)}
                                    onDelete={() => handleDeleteImage('logo_login_secondary')}
                                    help="Imagen o logo del lado izquierdo"
                                />
                                <ImageField
                                    label="Logo del Sidebar"
                                    value={flatSettings.logo_sidebar?.value}
                                    onUpload={(f) => handleUpload('logo_sidebar', f)}
                                    onDelete={() => handleDeleteImage('logo_sidebar')}
                                    help="180x50px recomendado"
                                    small
                                />
                                <ImageField
                                    label="Favicon"
                                    value={flatSettings.favicon?.value}
                                    onUpload={(f) => handleUpload('favicon', f)}
                                    onDelete={() => handleDeleteImage('favicon')}
                                    help="Icono del navegador"
                                    small
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECCIÓN: Vista Previa Real (Iframe) */}
                <div className="config-section">
                    <div className="config-section__header">
                        <Monitor size={18} />
                        <h2>Vista Previa del Login (Sitio Real)</h2>
                    </div>
                    <div className="config-section__body">
                        <div className="config-iframe-wrapper">
                            <iframe
                                key={`${iframeKey}-${theme}`}
                                src={`/?mode=preview&theme=${theme}`}
                                title="Vista previa del login"
                                className="config-iframe-preview"
                            />
                            {/* Overlay para bloquear interacción (solo ver) */}
                            <div className="config-iframe-overlay"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ConfiguracionPage;
