import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Settings, Upload, Save, Loader2, X, Image, Type, Palette, Building2, HelpCircle, Monitor } from 'lucide-react';
import { getAllSettings, updateSetting, uploadSettingImage, deleteSettingImage, getImageUrl } from '../../services/settingService';
import { useTheme } from '../../theme';

// Importar componentes DS reutilizables
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
    DSFieldsGrid,
    DSImageUpload,
    DSImagesGrid,
} from '../../ds-components';

import './ConfiguracionPage.css';

// ============================================
// COMPONENTE: Tooltip de Ayuda
// ============================================
function Tooltip({ text }) {
    return (
        <span className="config-tooltip">
            <HelpCircle size={14} />
            <span className="config-tooltip__text">{text}</span>
        </span>
    );
}

// ============================================
// COMPONENTE: FormField con Tooltip
// ============================================
function FormField({ label, children, required, help, icon: Icon }) {
    return (
        <div className="ds-field">
            <label className="ds-field__label">
                <span className="ds-field__label-text">
                    {Icon && <Icon size={14} className="ds-field__label-icon" />}
                    {label}
                    {help && <Tooltip text={help} />}
                </span>
                {required && <span className="ds-field__required">*</span>}
            </label>
            <div className="ds-field__control-wrapper">
                {children}
            </div>
        </div>
    );
}

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
// COMPONENTE: TextField con save inline
// (Versión específica para ConfiguracionPage)
// ============================================
function ConfigTextField({ label, value, onSave, saving, help, icon: Icon = Type }) {
    const [localValue, setLocalValue] = useState(value || '');
    const [dirty, setDirty] = useState(false);

    useEffect(() => {
        setLocalValue(value || '');
        setDirty(false);
    }, [value]);

    const handleChange = (newValue) => {
        setLocalValue(newValue);
        setDirty(newValue !== (value || ''));
    };

    const handleSave = async () => {
        await onSave(localValue);
        setDirty(false);
    };

    return (
        <DSField label={label} tooltip={help}>
            <div className="config-field__row">
                <div className="config-field__icon-wrapper">
                    <Icon size={14} className="config-field__prefix-icon" />
                </div>
                <input
                    type="text"
                    className="ds-field__control config-field__input"
                    value={localValue}
                    onChange={(e) => handleChange(e.target.value)}
                />
                {dirty && (
                    <DSButton
                        variant="primary"
                        size="sm"
                        onClick={handleSave}
                        disabled={saving}
                        loading={saving}
                        icon={!saving && <Save size={14} />}
                    />
                )}
            </div>
        </DSField>
    );
}

// ============================================
// COMPONENTE: ColorField con save inline
// ============================================
function ConfigColorField({ label, value, onSave, saving, help }) {
    const [localValue, setLocalValue] = useState(value || '#15428b');
    const [dirty, setDirty] = useState(false);

    useEffect(() => {
        setLocalValue(value || '#15428b');
        setDirty(false);
    }, [value]);

    const handleChange = (newValue) => {
        setLocalValue(newValue);
        setDirty(newValue !== (value || '#15428b'));
    };

    return (
        <DSField label={label} tooltip={help}>
            <div className="config-field__row">
                <div className="config-field__icon-wrapper">
                    <Palette size={14} className="config-field__prefix-icon" />
                </div>
                <input
                    type="color"
                    className="config-color-picker"
                    value={localValue}
                    onChange={(e) => handleChange(e.target.value)}
                />
                <input
                    type="text"
                    className="ds-field__control config-color-input"
                    value={localValue}
                    onChange={(e) => handleChange(e.target.value)}
                />
                {dirty && (
                    <DSButton
                        variant="primary"
                        size="sm"
                        onClick={() => onSave(localValue)}
                        disabled={saving}
                        loading={saving}
                        icon={!saving && <Save size={14} />}
                    />
                )}
            </div>
        </DSField>
    );
}

// ============================================
// COMPONENTE: ImageField usando DSImageUpload
// ============================================
function ConfigImageField({ label, value, onUpload, onDelete, help, small }) {
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

    const displayPreview = preview || currentImage;

    return (
        <div className={`config-image-field ${small ? 'config-image-field--small' : ''}`}>
            <label className="ds-field__label">
                <Image size={14} />
                {label}
                {help && <span className="ds-field__tooltip" title={help}><HelpCircle size={12} /></span>}
            </label>
            <div className="config-image-box">
                {displayPreview ? (
                    <img src={displayPreview} alt={label} className="config-image-preview" />
                ) : (
                    <div className="config-image-placeholder">
                        <Image size={24} />
                        <span>Sin imagen</span>
                    </div>
                )}
                <input ref={inputRef} type="file" accept="image/*" onChange={handleFileSelect} hidden />
                <div className="config-image-actions">
                    <DSButton
                        variant="default"
                        size="sm"
                        onClick={() => inputRef.current?.click()}
                        disabled={uploading || deleting}
                        loading={uploading}
                        icon={!uploading && <Upload size={14} />}
                        block
                    >
                        {uploading ? 'Subiendo...' : (currentImage ? 'Cambiar' : 'Subir')}
                    </DSButton>
                    {currentImage && (
                        <DSButton
                            variant="danger"
                            size="sm"
                            onClick={handleDelete}
                            disabled={uploading || deleting}
                            loading={deleting}
                            icon={!deleting && <X size={14} />}
                            iconOnly
                            title="Eliminar imagen"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

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

    // Estado de carga
    if (loading) {
        return (
            <DSPage>
                <DSLoading text="Cargando configuración..." />
            </DSPage>
        );
    }

    return (
        <DSPage>
            {/* HEADER */}
            <DSPageHeader
                title="Configuración del Sistema"
                icon={<Settings size={22} />}
            />

            {/* ALERTAS */}
            {success && (
                <DSAlert
                    variant="success"
                    dismissible
                    onDismiss={() => setSuccess(null)}
                    className="config-alert-margin"
                >
                    {success}
                </DSAlert>
            )}
            {(error || loadError) && (
                <DSAlert
                    variant="error"
                    dismissible
                    onDismiss={() => setError(null)}
                    className="config-alert-margin"
                >
                    {error || loadError}
                </DSAlert>
            )}

            {/* CONTENIDO */}
            <DSPageContent>
                {/* SECCIÓN: Información de la Empresa */}
                <DSSection
                    title="Información de la Empresa"
                    icon={<Building2 size={18} />}
                >
                    <DSFieldsGrid columns={2}>
                        <ConfigTextField
                            label="Nombre de la Empresa"
                            value={flatSettings.company_name?.value}
                            onSave={(v) => handleSave('company_name', v)}
                            saving={saving.company_name}
                            icon={Building2}
                            help="Nombre legal o comercial de tu empresa. Se mostrará en reportes y documentos."
                        />
                        <ConfigTextField
                            label="RIF / NIT"
                            value={flatSettings.company_rif?.value}
                            onSave={(v) => handleSave('company_rif', v)}
                            saving={saving.company_rif}
                            help="Número de identificación fiscal de la empresa."
                        />
                        <ConfigTextField
                            label="Teléfono"
                            value={flatSettings.company_phone?.value}
                            onSave={(v) => handleSave('company_phone', v)}
                            saving={saving.company_phone}
                            help="Número de teléfono principal de contacto."
                        />
                        <ConfigTextField
                            label="Correo Electrónico"
                            value={flatSettings.company_email?.value}
                            onSave={(v) => handleSave('company_email', v)}
                            saving={saving.company_email}
                            help="Email corporativo para comunicaciones del sistema."
                        />
                    </DSFieldsGrid>
                    <ConfigTextField
                        label="Dirección"
                        value={flatSettings.company_address?.value}
                        onSave={(v) => handleSave('company_address', v)}
                        saving={saving.company_address}
                        help="Dirección física de la empresa para documentos oficiales."
                    />
                </DSSection>

                {/* SECCIÓN: Identidad Visual */}
                <DSSection
                    title="Identidad Visual (Branding)"
                    icon={<Palette size={18} />}
                >
                    <DSFieldsGrid columns={2}>
                        <ConfigTextField
                            label="Nombre de la Aplicación"
                            value={flatSettings.app_name?.value}
                            onSave={(v) => handleSave('app_name', v)}
                            saving={saving.app_name}
                            help="Aparece en el título del navegador"
                        />
                        <ConfigTextField
                            label="Nombre Corto"
                            value={flatSettings.app_short_name?.value}
                            onSave={(v) => handleSave('app_short_name', v)}
                            saving={saving.app_short_name}
                            help="Para PWA y móviles"
                        />
                    </DSFieldsGrid>

                    <DSSubsection title="Textos del Login">
                        <ConfigTextField
                            label="Título del Login"
                            value={flatSettings.login_title?.value}
                            onSave={(v) => handleSave('login_title', v)}
                            saving={saving.login_title}
                            help="Texto de bienvenida que aparece en la página de inicio de sesión."
                        />
                    </DSSubsection>

                    <DSSubsection title="Colores del Login">
                        <p className="config-hint">
                            Estos colores se usan en la página de login (fondo degradado y acentos)
                        </p>
                        <DSFieldsGrid columns={2}>
                            <ConfigColorField
                                label="Color Primario (Login)"
                                value={flatSettings.primary_color?.value}
                                onSave={(v) => handleSave('primary_color', v)}
                                saving={saving.primary_color}
                                help="Color principal del fondo degradado en la página de login."
                            />
                            <ConfigColorField
                                label="Color Secundario (Login)"
                                value={flatSettings.secondary_color?.value}
                                onSave={(v) => handleSave('secondary_color', v)}
                                saving={saving.secondary_color}
                                help="Color secundario del degradado y acentos en el login."
                            />
                        </DSFieldsGrid>
                    </DSSubsection>

                    <DSSubsection title="Logos e Imágenes">
                        <DSImagesGrid>
                            <ConfigImageField
                                label="Logo del Login (Principal)"
                                value={flatSettings.logo_login?.value}
                                onUpload={(f) => handleUpload('logo_login', f)}
                                onDelete={() => handleDeleteImage('logo_login')}
                                help="Logo grande en la página de login"
                            />
                            <ConfigImageField
                                label="Logo Lateral (Izquierda)"
                                value={flatSettings.logo_login_secondary?.value}
                                onUpload={(f) => handleUpload('logo_login_secondary', f)}
                                onDelete={() => handleDeleteImage('logo_login_secondary')}
                                help="Imagen o logo del lado izquierdo"
                            />
                            <ConfigImageField
                                label="Logo del Sidebar"
                                value={flatSettings.logo_sidebar?.value}
                                onUpload={(f) => handleUpload('logo_sidebar', f)}
                                onDelete={() => handleDeleteImage('logo_sidebar')}
                                help="180x50px recomendado"
                                small
                            />
                            <ConfigImageField
                                label="Favicon"
                                value={flatSettings.favicon?.value}
                                onUpload={(f) => handleUpload('favicon', f)}
                                onDelete={() => handleDeleteImage('favicon')}
                                help="Icono del navegador"
                                small
                            />
                        </DSImagesGrid>
                    </DSSubsection>
                </DSSection>

                {/* SECCIÓN: Vista Previa Real (Iframe) */}
                <DSSection
                    title="Vista Previa del Login (Sitio Real)"
                    icon={<Monitor size={18} />}
                >
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
                </DSSection>
            </DSPageContent>
        </DSPage>
    );
}

export default ConfiguracionPage;
