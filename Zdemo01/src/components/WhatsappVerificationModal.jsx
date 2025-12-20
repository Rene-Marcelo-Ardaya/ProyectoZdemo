import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Loader2, CheckCircle2, AlertCircle, X, RefreshCw } from 'lucide-react';
import { DSModal, DSButton, DSAlert, DSTextField } from '../ds-components';
import { sendVerificationCode, verifyCode, getWhatsappStatus } from '../services/whatsappVerificationService';
import { getConnectedInstances, getApiKey, getWebSocketUrl } from '../services/evolutionService';
import { io } from 'socket.io-client';
import './WhatsappVerificationModal.css';

/**
 * Modal para verificación de WhatsApp
 * Flujo:
 * 1. Seleccionar instancia
 * 2. Enviar código
 * 3. Esperar respuesta (60s timeout)
 * 4. Verificar código recibido
 */
function WhatsappVerificationModal({ isOpen, onClose, persona, onVerified }) {
    const [step, setStep] = useState('idle'); // idle, sending, waiting, success, failed
    const [instances, setInstances] = useState([]);
    const [selectedInstance, setSelectedInstance] = useState('');
    const [countdown, setCountdown] = useState(60);
    const [error, setError] = useState('');
    const [manualCode, setManualCode] = useState('');

    const socketRef = useRef(null);
    const timerRef = useRef(null);
    const codeSentRef = useRef(null);

    // Cargar instancias al abrir
    useEffect(() => {
        if (isOpen) {
            loadInstances();
            setStep('idle');
            setCountdown(60);
            setError('');
            setManualCode('');
        }
        return () => {
            cleanupSocket();
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isOpen]);

    const loadInstances = async () => {
        const result = await getConnectedInstances();
        if (result.success && result.data) {
            setInstances(result.data);
            if (result.data.length === 1) {
                setSelectedInstance(result.data[0].name || result.data[0].instance?.instanceName);
            }
        }
    };

    const cleanupSocket = () => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
    };

    const handleSendCode = async () => {
        if (!selectedInstance) {
            setError('Selecciona una instancia de WhatsApp');
            return;
        }

        setStep('sending');
        setError('');

        try {
            const result = await sendVerificationCode(persona.id, selectedInstance);

            if (!result.success) {
                setError(result.error || 'Error al enviar código');
                setStep('failed');
                return;
            }

            // Guardar referencia del código enviado
            codeSentRef.current = true;

            // Iniciar escucha de WebSocket
            startWebSocketListener();

            // Iniciar countdown
            setStep('waiting');
            setCountdown(60);
            timerRef.current = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        setStep('failed');
                        setError('Tiempo agotado. No se recibió respuesta.');
                        cleanupSocket();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

        } catch (err) {
            setError('Error de conexión');
            setStep('failed');
        }
    };

    const startWebSocketListener = () => {
        const wsUrl = getWebSocketUrl();
        const apiKey = getApiKey();

        const socket = io(wsUrl, {
            path: '/socket.io',
            transports: ['websocket', 'polling'],
            auth: { apikey: apiKey },
            query: { apikey: apiKey },
        });

        socket.on('messages.upsert', async (eventData) => {
            // Buscar mensaje con código de 4 dígitos
            const msgData = eventData?.data;
            if (!msgData) return;

            const conversation = msgData.message?.conversation ||
                msgData.message?.extendedTextMessage?.text ||
                msgData.conversation;

            if (!conversation) return;

            // Buscar código de 4 dígitos en el mensaje
            const codeMatch = conversation.match(/\b(\d{4})\b/);
            if (codeMatch) {
                const code = codeMatch[1];
                const jid = msgData.key?.remoteJid || eventData.sender;

                // Intentar verificar
                try {
                    const verifyResult = await verifyCode(persona.id, code, jid);
                    if (verifyResult.success) {
                        clearInterval(timerRef.current);
                        setStep('success');
                        cleanupSocket();
                        setTimeout(() => {
                            onVerified && onVerified();
                            onClose();
                        }, 2000);
                    }
                } catch (e) {
                    // Código incorrecto, seguir esperando
                }
            }
        });

        socketRef.current = socket;
    };

    const handleManualVerify = async () => {
        if (manualCode.length !== 4) {
            setError('El código debe ser de 4 dígitos');
            return;
        }

        setStep('sending');
        try {
            // Para verificación manual, usamos un JID placeholder
            const result = await verifyCode(persona.id, manualCode, 'manual_verification');
            if (result.success) {
                setStep('success');
                setTimeout(() => {
                    onVerified && onVerified();
                    onClose();
                }, 2000);
            } else {
                setError(result.error || 'Código incorrecto');
                setStep('waiting');
            }
        } catch {
            setError('Error al verificar');
            setStep('waiting');
        }
    };

    const handleRetry = () => {
        setStep('idle');
        setCountdown(60);
        setError('');
        cleanupSocket();
        if (timerRef.current) clearInterval(timerRef.current);
    };

    return (
        <DSModal isOpen={isOpen} onClose={onClose} title="Verificar WhatsApp" size="sm">
            <div className="whatsapp-verification-modal">
                {error && (
                    <DSAlert variant="danger" className="mb-3">
                        {error}
                    </DSAlert>
                )}

                {step === 'idle' && (
                    <>
                        <p className="verification-info">
                            Se enviará un código de 4 dígitos al número <strong>{persona?.celular_completo}</strong>.
                            El contacto debe responder con el código para verificar.
                        </p>

                        {instances.length === 0 ? (
                            <DSAlert variant="warning" className="mb-3">
                                No hay instancias de WhatsApp conectadas.
                            </DSAlert>
                        ) : (
                            <select
                                className="verification-instance-select"
                                value={selectedInstance}
                                onChange={(e) => setSelectedInstance(e.target.value)}
                            >
                                <option value="">Seleccionar instancia...</option>
                                {instances.map(inst => (
                                    <option key={inst.name || inst.instance?.instanceName} value={inst.name || inst.instance?.instanceName}>
                                        {inst.name || inst.instance?.instanceName}
                                    </option>
                                ))}
                            </select>
                        )}

                        <div className="verification-actions">
                            <DSButton variant="outline" onClick={onClose}>
                                Cancelar
                            </DSButton>
                            <DSButton onClick={handleSendCode} icon={<MessageCircle size={16} />} disabled={!selectedInstance}>
                                Enviar Código
                            </DSButton>
                        </div>
                    </>
                )}

                {step === 'sending' && (
                    <div className="verification-loading">
                        <Loader2 size={48} className="spin" />
                        <p>Enviando código...</p>
                    </div>
                )}

                {step === 'waiting' && (
                    <>
                        <div className="verification-waiting">
                            <div className="countdown-circle">
                                <span>{countdown}</span>
                            </div>
                            <p>Esperando respuesta del contacto...</p>
                            <p className="text-muted">El contacto debe responder con el código de 4 dígitos.</p>
                        </div>

                        <div className="manual-verify">
                            <p className="text-small">¿El contacto ya respondió? Ingresa el código manualmente:</p>
                            <div className="manual-verify-row">
                                <DSTextField
                                    value={manualCode}
                                    onChange={(e) => setManualCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    placeholder="0000"
                                    maxLength={4}
                                />
                                <DSButton onClick={handleManualVerify} disabled={manualCode.length !== 4}>
                                    Verificar
                                </DSButton>
                            </div>
                        </div>
                    </>
                )}

                {step === 'success' && (
                    <div className="verification-success">
                        <CheckCircle2 size={64} />
                        <h3>¡WhatsApp Verificado!</h3>
                        <p>El número ha sido verificado correctamente.</p>
                    </div>
                )}

                {step === 'failed' && (
                    <>
                        <div className="verification-failed">
                            <AlertCircle size={48} />
                            <h4>Verificación fallida</h4>
                            <p>{error || 'No se pudo completar la verificación.'}</p>
                        </div>
                        <div className="verification-actions">
                            <DSButton variant="outline" onClick={onClose}>
                                Cerrar
                            </DSButton>
                            <DSButton onClick={handleRetry} icon={<RefreshCw size={16} />}>
                                Reintentar
                            </DSButton>
                        </div>
                    </>
                )}
            </div>
        </DSModal>
    );
}

export default WhatsappVerificationModal;
