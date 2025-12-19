import React, { useState, useEffect, useCallback } from 'react';
import {
    Smartphone,
    Plus,
    Trash2,
    QrCode,
    Power,
    PowerOff,
    RefreshCw,
    Wifi,
    WifiOff,
    Copy,
    Check
} from 'lucide-react';
import {
    fetchInstances,
    createInstance,
    deleteInstance,
    reconnectInstance,
    logoutInstance,
    getConnectionState
} from '../../services/evolutionService';

// Importar componentes DS
import {
    DSPage,
    DSPageHeader,
    DSSection,
    DSAlert,
    DSButton,
    DSLoading,
    DSBadge,
    DSModal,
} from '../../ds-components';

import './InstanciasPage.css';

// ============================================
// CUSTOM HOOK: useInstancias
// ============================================
function useInstancias() {
    const [instances, setInstances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchInstances();
            if (result.success) {
                // Evolution API devuelve array directamente o dentro de data
                const data = Array.isArray(result.data) ? result.data : (result.data?.instances || []);
                setInstances(data);
            } else {
                setError(result.error || 'Error cargando instancias');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { instances, loading, error, refetch: fetchData };
}

// ============================================
// COMPONENTE: FormField
// ============================================
function FormField({ label, children, required, help }) {
    return (
        <div className="ds-field">
            <label className="ds-field__label">
                <span className="ds-field__label-text">{label}</span>
                {required && <span className="ds-field__required">*</span>}
            </label>
            {help && <span className="ds-field__help">{help}</span>}
            <div className="ds-field__control-wrapper">
                {children}
            </div>
        </div>
    );
}

// ============================================
// COMPONENTE: InstanceCard
// ============================================
function InstanceCard({ instance, onConnect, onDisconnect, onDelete, onRefresh }) {
    const [copied, setCopied] = useState(false);

    const isConnected = instance.connectionStatus === 'open' ||
        instance.state === 'open' ||
        instance.instance?.state === 'open';

    const instanceName = instance.instanceName || instance.instance?.instanceName || instance.name;
    const ownerNumber = instance.owner || instance.instance?.owner || '-';

    const handleCopyName = () => {
        navigator.clipboard.writeText(instanceName);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={`instance-card ${isConnected ? 'instance-card--connected' : 'instance-card--disconnected'}`}>
            <div className="instance-card__header">
                <div className="instance-card__icon">
                    <Smartphone size={24} />
                </div>
                <div className="instance-card__status">
                    {isConnected ? (
                        <DSBadge variant="success">
                            <Wifi size={12} /> Conectado
                        </DSBadge>
                    ) : (
                        <DSBadge variant="warning">
                            <WifiOff size={12} /> Desconectado
                        </DSBadge>
                    )}
                </div>
            </div>

            <div className="instance-card__body">
                <h3 className="instance-card__name">
                    {instanceName}
                    <button
                        className="instance-card__copy"
                        onClick={handleCopyName}
                        title="Copiar nombre"
                    >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                </h3>
                <p className="instance-card__owner">
                    {ownerNumber !== '-' ? `+${ownerNumber}` : 'Sin número vinculado'}
                </p>
            </div>

            <div className="instance-card__actions">
                {isConnected ? (
                    <DSButton
                        size="sm"
                        variant="outline-danger"
                        icon={<PowerOff size={14} />}
                        onClick={() => onDisconnect(instanceName)}
                    >
                        Desconectar
                    </DSButton>
                ) : (
                    <DSButton
                        size="sm"
                        variant="primary"
                        icon={<QrCode size={14} />}
                        onClick={() => onConnect(instanceName)}
                    >
                        Conectar
                    </DSButton>
                )}
                <DSButton
                    size="sm"
                    iconOnly
                    icon={<RefreshCw size={14} />}
                    onClick={() => onRefresh(instanceName)}
                    title="Actualizar estado"
                />
                <DSButton
                    size="sm"
                    variant="outline-danger"
                    iconOnly
                    icon={<Trash2 size={14} />}
                    onClick={() => onDelete(instanceName)}
                    title="Eliminar"
                />
            </div>
        </div>
    );
}

// ============================================
// COMPONENTE: QRModal
// ============================================
function QRModal({ isOpen, onClose, instanceName, qrData, loading, error }) {
    // Extraer QR de diferentes formatos posibles de Evolution API
    const getQRImage = () => {
        if (!qrData) return null;

        // Formato: { base64: "data:image/png;base64,..." }
        if (qrData.base64) {
            return qrData.base64.startsWith('data:')
                ? qrData.base64
                : `data:image/png;base64,${qrData.base64}`;
        }

        // Formato: { code: "data:image/png;base64,..." }
        if (qrData.code) {
            return qrData.code.startsWith('data:')
                ? qrData.code
                : `data:image/png;base64,${qrData.code}`;
        }

        // Formato: { qrcode: { base64: "..." } }
        if (qrData.qrcode?.base64) {
            return qrData.qrcode.base64.startsWith('data:')
                ? qrData.qrcode.base64
                : `data:image/png;base64,${qrData.qrcode.base64}`;
        }

        // Formato: { qrcode: { code: "..." } }
        if (qrData.qrcode?.code) {
            return qrData.qrcode.code.startsWith('data:')
                ? qrData.qrcode.code
                : `data:image/png;base64,${qrData.qrcode.code}`;
        }

        // Formato: string directo
        if (typeof qrData === 'string' && qrData.length > 100) {
            return qrData.startsWith('data:')
                ? qrData
                : `data:image/png;base64,${qrData}`;
        }

        return null;
    };

    // Código de emparejamiento como alternativa al QR
    const getPairingCode = () => {
        if (!qrData) return null;
        return qrData.pairingCode || qrData.qrcode?.pairingCode || null;
    };

    const qrImage = getQRImage();
    const pairingCode = getPairingCode();

    return (
        <DSModal
            isOpen={isOpen}
            onClose={onClose}
            title={`Conectar: ${instanceName}`}
            size="sm"
        >
            <div className="qr-modal">
                {loading && (
                    <div className="qr-modal__loading">
                        <DSLoading text="Generando código QR..." />
                    </div>
                )}

                {error && (
                    <DSAlert variant="error">{error}</DSAlert>
                )}

                {!loading && !error && (qrImage || pairingCode) && (
                    <>
                        {qrImage && (
                            <div className="qr-modal__image">
                                <img src={qrImage} alt="QR Code" />
                            </div>
                        )}

                        {pairingCode && (
                            <div className="qr-modal__pairing">
                                <p>Código de emparejamiento:</p>
                                <code className="qr-modal__code">{pairingCode}</code>
                            </div>
                        )}

                        <p className="qr-modal__instructions">
                            Abre WhatsApp en tu teléfono, ve a <strong>Dispositivos vinculados</strong> y escanea este código QR.
                        </p>
                    </>
                )}

                {!loading && !error && !qrImage && !pairingCode && qrData && (
                    <div className="qr-modal__debug">
                        <DSAlert variant="warning">
                            No se pudo extraer el QR. Revisa la consola para más detalles.
                        </DSAlert>
                        <pre style={{ fontSize: '10px', overflow: 'auto', maxHeight: '150px' }}>
                            {JSON.stringify(qrData, null, 2)}
                        </pre>
                    </div>
                )}

                {!loading && !error && !qrData && (
                    <DSAlert variant="warning">
                        No se recibió respuesta del servidor. Intenta de nuevo.
                    </DSAlert>
                )}
            </div>
        </DSModal>
    );
}

// ============================================
// COMPONENTE PRINCIPAL: InstanciasPage
// ============================================
export function InstanciasPage() {
    const { instances, loading, error: loadError, refetch } = useInstancias();

    // Estado del formulario de creación
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState(null);
    const [formSuccess, setFormSuccess] = useState(null);
    const [form, setForm] = useState({ instanceName: '' });

    // Estado del modal QR
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [qrInstanceName, setQrInstanceName] = useState('');
    const [qrData, setQrData] = useState(null);
    const [qrLoading, setQrLoading] = useState(false);
    const [qrError, setQrError] = useState(null);

    // Reset form
    const resetForm = useCallback(() => {
        setForm({ instanceName: '' });
        setFormError(null);
    }, []);

    // Abrir modal crear
    const openCreate = () => {
        resetForm();
        setCreateModalOpen(true);
    };

    // Cerrar modal crear
    const closeCreateModal = () => {
        setCreateModalOpen(false);
        resetForm();
    };

    // Manejar cambios del form
    const handleChange = (field) => (e) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
    };

    // Validar nombre de instancia (solo letras, números, guiones y underscores)
    const validateInstanceName = (name) => {
        const regex = /^[a-zA-Z0-9_-]+$/;
        return regex.test(name);
    };

    // Crear instancia
    const handleCreate = async () => {
        if (!form.instanceName.trim()) {
            setFormError('El nombre de instancia es requerido');
            return;
        }

        if (!validateInstanceName(form.instanceName)) {
            setFormError('El nombre solo puede contener letras, números, guiones y guiones bajos');
            return;
        }

        setSaving(true);
        setFormError(null);

        try {
            const result = await createInstance({
                instanceName: form.instanceName.trim(),
                qrcode: true,
            });

            if (result.success) {
                setFormSuccess('Instancia creada correctamente');
                closeCreateModal();
                refetch();

                // Si la respuesta incluye QR, mostrar modal
                if (result.data?.qrcode || result.data?.base64) {
                    setQrInstanceName(form.instanceName);
                    setQrData(result.data.qrcode || result.data);
                    setQrModalOpen(true);
                }

                setTimeout(() => setFormSuccess(null), 3000);
            } else {
                setFormError(result.error || 'Error creando instancia');
            }
        } catch (err) {
            setFormError('Error de conexión');
        } finally {
            setSaving(false);
        }
    };

    // Conectar instancia (recrear para obtener QR)
    const handleConnect = async (instanceName) => {
        setQrInstanceName(instanceName);
        setQrModalOpen(true);
        setQrLoading(true);
        setQrError(null);
        setQrData(null);

        try {
            // Evolution API v2 solo devuelve QR al crear
            // Debemos eliminar y recrear la instancia
            const result = await reconnectInstance(instanceName);
            console.log('Reconnect result:', result);

            if (result.success) {
                // El QR viene en result.data.qrcode o similar
                const qrData = result.data?.qrcode || result.data;
                setQrData(qrData);
                refetch();
            } else {
                setQrError(result.error || 'Error reconectando instancia');
            }
        } catch (err) {
            console.error('Connect error:', err);
            setQrError('Error de conexión');
        } finally {
            setQrLoading(false);
        }
    };

    // Desconectar instancia
    const handleDisconnect = async (instanceName) => {
        if (!window.confirm(`¿Desconectar la instancia "${instanceName}"?`)) return;

        try {
            const result = await logoutInstance(instanceName);
            if (result.success) {
                setFormSuccess('Instancia desconectada');
                refetch();
                setTimeout(() => setFormSuccess(null), 3000);
            } else {
                alert(result.error || 'Error desconectando');
            }
        } catch (err) {
            alert('Error de conexión');
        }
    };

    // Eliminar instancia
    const handleDelete = async (instanceName) => {
        if (!window.confirm(`¿Eliminar la instancia "${instanceName}"? Esta acción no se puede deshacer.`)) return;

        try {
            const result = await deleteInstance(instanceName);
            if (result.success) {
                setFormSuccess('Instancia eliminada');
                refetch();
                setTimeout(() => setFormSuccess(null), 3000);
            } else {
                alert(result.error || 'Error eliminando');
            }
        } catch (err) {
            alert('Error de conexión');
        }
    };

    // Actualizar estado de una instancia
    const handleRefresh = async (instanceName) => {
        try {
            await getConnectionState(instanceName);
            refetch();
        } catch (err) {
            console.error('Error refreshing:', err);
        }
    };

    // Cerrar modal QR
    const closeQrModal = () => {
        setQrModalOpen(false);
        setQrData(null);
        setQrError(null);
        refetch(); // Refrescar por si se conectó
    };

    return (
        <DSPage>
            {/* HEADER */}
            <DSPageHeader
                title="Instancias WhatsApp"
                icon={<Smartphone size={22} />}
                actions={
                    <DSButton variant="primary" icon={<Plus size={16} />} onClick={openCreate}>
                        Nueva Instancia
                    </DSButton>
                }
            />

            {/* ALERTAS */}
            {formSuccess && (
                <DSAlert variant="success" dismissible onDismiss={() => setFormSuccess(null)} className="instancias-alert-margin">
                    {formSuccess}
                </DSAlert>
            )}
            {loadError && (
                <DSAlert variant="error" className="instancias-alert-margin">
                    {loadError}
                </DSAlert>
            )}

            {/* CONTENIDO */}
            <DSSection
                title="Mis Instancias"
                actions={
                    <DSButton size="sm" icon={<RefreshCw size={14} />} onClick={refetch}>
                        Actualizar
                    </DSButton>
                }
            >
                {loading ? (
                    <DSLoading text="Cargando instancias..." />
                ) : instances.length === 0 ? (
                    <div className="instancias-empty">
                        <Smartphone size={48} strokeWidth={1} />
                        <h3>No hay instancias</h3>
                        <p>Crea una nueva instancia para conectar WhatsApp</p>
                        <DSButton variant="primary" icon={<Plus size={16} />} onClick={openCreate}>
                            Crear Instancia
                        </DSButton>
                    </div>
                ) : (
                    <div className="instancias-grid">
                        {instances.map((instance, index) => (
                            <InstanceCard
                                key={instance.instanceName || instance.instance?.instanceName || index}
                                instance={instance}
                                onConnect={handleConnect}
                                onDisconnect={handleDisconnect}
                                onDelete={handleDelete}
                                onRefresh={handleRefresh}
                            />
                        ))}
                    </div>
                )}
            </DSSection>

            {/* MODAL CREAR */}
            <DSModal
                isOpen={createModalOpen}
                onClose={closeCreateModal}
                title="Nueva Instancia"
                size="sm"
                footer={
                    <>
                        <DSButton onClick={closeCreateModal} disabled={saving}>
                            Cancelar
                        </DSButton>
                        <DSButton
                            variant="primary"
                            onClick={handleCreate}
                            disabled={saving}
                            loading={saving}
                            icon={!saving && <Plus size={16} />}
                        >
                            {saving ? 'Creando...' : 'Crear'}
                        </DSButton>
                    </>
                }
            >
                {formError && (
                    <DSAlert variant="error" dismissible onDismiss={() => setFormError(null)} className="instancias-alert-margin">
                        {formError}
                    </DSAlert>
                )}

                <form className="instancias-form" onSubmit={e => e.preventDefault()}>
                    <FormField
                        label="Nombre de Instancia"
                        required
                        help="Identificador único. Solo letras, números, guiones y guiones bajos."
                    >
                        <input
                            type="text"
                            className="ds-field__control"
                            value={form.instanceName}
                            onChange={handleChange('instanceName')}
                            placeholder="mi-instancia-whatsapp"
                            autoFocus
                        />
                    </FormField>
                </form>
            </DSModal>

            {/* MODAL QR */}
            <QRModal
                isOpen={qrModalOpen}
                onClose={closeQrModal}
                instanceName={qrInstanceName}
                qrData={qrData}
                loading={qrLoading}
                error={qrError}
            />
        </DSPage>
    );
}

export default InstanciasPage;
