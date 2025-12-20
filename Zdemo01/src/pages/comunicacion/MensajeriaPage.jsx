import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import {
    MessageSquare,
    Send,
    Paperclip,
    X,
    Phone,
    User,
    FileText,
    Image,
    CheckCircle,
    Loader2,
    Smartphone,
    RefreshCw,
    Wifi,
    WifiOff,
} from 'lucide-react';
import {
    getConnectedInstances,
    sendTextMessage,
    sendAudioMessage,
    sendMediaMessage,
    fileToBase64,
    fetchMessages,
    getWebSocketUrl,
    getApiKey,
} from '../../services/evolutionService';
import { fetchPersonal } from '../../services/personalService';

// DS Components
import {
    DSPage,
    DSPageHeader,
    DSSection,
    DSAlert,
    DSLoading,
    DSEmpty,
} from '../../ds-components';

import './MensajeriaPage.css';

// ============================================
// COMPONENTE: ContactSelector
// ============================================
function ContactSelector({ contacts, selectedContact, onSelect, loading }) {
    const [search, setSearch] = useState('');

    const filtered = contacts.filter(c => {
        if (!search) return true;
        const term = search.toLowerCase();
        return (
            c.nombre_completo?.toLowerCase().includes(term) ||
            c.celular?.includes(term)
        );
    });

    const withPhone = filtered.filter(c => c.celular);

    if (loading) {
        return <DSLoading text="Cargando contactos..." />;
    }

    return (
        <div className="contact-selector">
            <div className="contact-selector__search">
                <User size={16} />
                <input
                    type="text"
                    placeholder="Buscar por nombre o teléfono..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
            <div className="contact-selector__list">
                {withPhone.length === 0 ? (
                    <div className="contact-selector__empty">
                        No hay contactos con número de teléfono
                    </div>
                ) : (
                    withPhone.map(contact => (
                        <button
                            key={contact.id}
                            type="button"
                            className={`contact-selector__item ${selectedContact?.id === contact.id ? 'is-selected' : ''}`}
                            onClick={() => onSelect(contact)}
                        >
                            <div className="contact-selector__avatar">
                                <User size={20} />
                            </div>
                            <div className="contact-selector__info">
                                <span className="contact-selector__name">{contact.nombre_completo}</span>
                                <span className="contact-selector__phone">
                                    <Phone size={12} />
                                    +{contact.codigo_pais} {contact.celular}
                                </span>
                            </div>
                            {selectedContact?.id === contact.id && (
                                <CheckCircle size={18} className="contact-selector__check" />
                            )}
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}

// ============================================
// COMPONENTE: ChatMessage
// ============================================
function ChatMessage({ message }) {
    const isFromMe = message.key?.fromMe;
    const timestamp = message.messageTimestamp
        ? new Date(message.messageTimestamp * 1000).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
        : '';

    // Extraer contenido del mensaje
    let content = '';
    let type = 'text';

    if (message.message?.conversation) {
        content = message.message.conversation;
    } else if (message.message?.extendedTextMessage?.text) {
        content = message.message.extendedTextMessage.text;
    } else if (message.message?.imageMessage) {
        content = message.message.imageMessage.caption || '📷 Imagen';
        type = 'image';
    } else if (message.message?.documentMessage) {
        content = message.message.documentMessage.fileName || '📄 Documento';
        type = 'document';
    } else if (message.message?.audioMessage) {
        content = '🎤 Audio';
        type = 'audio';
    } else if (message.message?.videoMessage) {
        content = message.message.videoMessage.caption || '🎥 Video';
        type = 'video';
    } else {
        content = '📎 Mensaje';
    }

    return (
        <div className={`chat-message ${isFromMe ? 'chat-message--sent' : 'chat-message--received'}`}>
            <div className="chat-message__bubble">
                {type !== 'text' && (
                    <span className="chat-message__type">
                        {type === 'image' && <Image size={14} />}
                        {type === 'document' && <FileText size={14} />}
                    </span>
                )}
                <span className="chat-message__text">{content}</span>
                <span className="chat-message__time">{timestamp}</span>
            </div>
        </div>
    );
}

// ============================================
// COMPONENTE: ChatPanel
// ============================================
function ChatPanel({ messages, loading, onRefresh, wsConnected }) {
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="chat-panel">
            <div className="chat-panel__header">
                <span className={`chat-panel__status ${wsConnected ? 'is-connected' : ''}`}>
                    {wsConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
                    {wsConnected ? 'Tiempo real' : 'Desconectado'}
                </span>
                <button
                    type="button"
                    className="chat-panel__refresh"
                    onClick={onRefresh}
                    disabled={loading}
                    title="Actualizar mensajes"
                >
                    <RefreshCw size={16} className={loading ? 'spin' : ''} />
                </button>
            </div>
            <div className="chat-panel__messages">
                {loading && messages.length === 0 ? (
                    <DSLoading text="Cargando mensajes..." />
                ) : messages.length === 0 ? (
                    <div className="chat-panel__empty">
                        <MessageSquare size={32} />
                        <span>No hay mensajes aún</span>
                    </div>
                ) : (
                    <>
                        {messages.map((msg, idx) => (
                            <ChatMessage key={msg.key?.id || idx} message={msg} />
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>
        </div>
    );
}

// ============================================
// COMPONENTE: MessageComposer
// ============================================
function MessageComposer({ onSend, sending }) {
    const [text, setText] = useState('');
    const [attachment, setAttachment] = useState(null);
    const fileInputRef = useRef(null);

    const handleSendText = () => {
        if (!text.trim() && !attachment) return;
        onSend({ type: 'text', content: text.trim() });
        setText('');
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        let type = 'document';
        if (file.type.startsWith('image/')) type = 'image';
        else if (file.type.startsWith('audio/')) type = 'audio';
        else if (file.type.startsWith('video/')) type = 'video';

        setAttachment({
            file,
            type,
            name: file.name,
            mimetype: file.type,
        });
    };

    const handleSendAttachment = async () => {
        if (!attachment) return;

        try {
            const base64 = await fileToBase64(attachment.file);
            onSend({
                type: attachment.type,
                content: base64,
                fileName: attachment.name,
                mimetype: attachment.mimetype,
                caption: text.trim(),
            });
            setAttachment(null);
            setText('');
        } catch (err) {
            console.error('Error converting file:', err);
        }
    };

    const removeAttachment = () => {
        setAttachment(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (attachment) handleSendAttachment();
            else handleSendText();
        }
    };

    return (
        <div className="message-composer">
            {attachment && (
                <div className="message-composer__attachment">
                    <div className="attachment-preview">
                        {attachment.type === 'image' && <Image size={20} />}
                        {attachment.type === 'document' && <FileText size={20} />}
                        <span>{attachment.name}</span>
                        <button type="button" onClick={removeAttachment}>
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            <div className="message-composer__row">
                <button
                    type="button"
                    className="message-composer__btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={sending}
                    title="Adjuntar archivo"
                >
                    <Paperclip size={20} />
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                    style={{ display: 'none' }}
                />

                <textarea
                    className="message-composer__input"
                    placeholder="Escribe tu mensaje..."
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={sending}
                    rows={1}
                />

                <button
                    type="button"
                    className="message-composer__send"
                    onClick={attachment ? handleSendAttachment : handleSendText}
                    disabled={sending || (!text.trim() && !attachment)}
                    title="Enviar"
                >
                    {sending ? <Loader2 size={20} className="spin" /> : <Send size={20} />}
                </button>
            </div>
        </div>
    );
}

// ============================================
// COMPONENTE PRINCIPAL: MensajeriaPage
// ============================================
export function MensajeriaPage() {
    const [instances, setInstances] = useState([]);
    const [loadingInstances, setLoadingInstances] = useState(true);
    const [selectedInstance, setSelectedInstance] = useState(null);

    const [contacts, setContacts] = useState([]);
    const [loadingContacts, setLoadingContacts] = useState(true);
    const [selectedContact, setSelectedContact] = useState(null);

    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [wsConnected, setWsConnected] = useState(false);

    const [sending, setSending] = useState(false);
    const [alert, setAlert] = useState(null);

    const socketRef = useRef(null);

    // Cargar instancias
    useEffect(() => {
        const loadInstances = async () => {
            setLoadingInstances(true);
            const result = await getConnectedInstances();
            if (result.success) {
                setInstances(result.data || []);
                if (result.data?.length === 1) {
                    setSelectedInstance(result.data[0]);
                }
            }
            setLoadingInstances(false);
        };
        loadInstances();
    }, []);

    // Cargar contactos
    useEffect(() => {
        const loadContacts = async () => {
            setLoadingContacts(true);
            const result = await fetchPersonal();
            if (result.success) {
                setContacts(result.data || []);
            }
            setLoadingContacts(false);
        };
        loadContacts();
    }, []);

    // Conectar WebSocket cuando se selecciona instancia
    useEffect(() => {
        if (!selectedInstance) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setWsConnected(false);
            }
            return;
        }

        const instanceName = selectedInstance.name || selectedInstance.instance?.instanceName;
        const wsUrl = getWebSocketUrl();
        const apiKey = getApiKey();


        // Evolution API WebSocket - conectar al root con apikey y namespace de instancia
        const socket = io(wsUrl, {
            path: '/socket.io',
            transports: ['websocket', 'polling'],
            auth: { apikey: apiKey },
            query: { apikey: apiKey },
            reconnection: true,
            reconnectionDelay: 2000,
            reconnectionAttempts: 5,
        });

        socket.on('connect', () => {
            setWsConnected(true);
        });

        socket.on('disconnect', () => {
            setWsConnected(false);
        });

        socket.on('messages.upsert', (eventData) => {

            // Evolution API envía: {event, instance, data: {...}, sender: 'xxx@s.whatsapp.net'}
            let messagesArray = [];
            const senderJid = eventData?.sender;

            if (eventData?.data?.messages) {
                messagesArray = eventData.data.messages;
            } else if (eventData?.data?.message) {
                messagesArray = [eventData.data.message];
            } else if (Array.isArray(eventData?.data)) {
                messagesArray = eventData.data;
            } else if (eventData?.data) {
                messagesArray = [eventData.data];
            }

            // Agregar key si no existe (para mensajes que vienen sin estructura completa)
            messagesArray = messagesArray.map(msg => ({
                key: msg.key || { remoteJid: senderJid, fromMe: false, id: Date.now().toString() },
                message: msg.message || { conversation: msg.conversation },
                messageTimestamp: msg.messageTimestamp || Math.floor(Date.now() / 1000),
                ...msg
            }));

            // Agregar mensajes entrantes
            if (messagesArray.length > 0) {
                setMessages(prev => [...prev, ...messagesArray]);
            }
        });

        socket.on('error', (error) => {
            console.error('WebSocket error:', error);
        });

        socketRef.current = socket;

        return () => {
            socket.disconnect();
        };
    }, [selectedInstance, selectedContact]);

    // Cargar historial cuando se selecciona contacto
    const loadMessages = useCallback(async () => {
        if (!selectedInstance || !selectedContact) {
            setMessages([]);
            return;
        }

        const instanceName = selectedInstance.name || selectedInstance.instance?.instanceName;
        const phoneNumber = `${selectedContact.codigo_pais}${selectedContact.celular}`;

        setLoadingMessages(true);
        const result = await fetchMessages(instanceName, phoneNumber);

        if (result.success && Array.isArray(result.data)) {
            // Ordenar por timestamp ascendente
            const sorted = result.data.sort((a, b) =>
                (a.messageTimestamp || 0) - (b.messageTimestamp || 0)
            );
            setMessages(sorted);
        } else {
            setMessages([]);
        }
        setLoadingMessages(false);
    }, [selectedInstance, selectedContact]);

    useEffect(() => {
        loadMessages();
    }, [loadMessages]);

    // Enviar mensaje
    const handleSend = async (message) => {
        if (!selectedInstance || !selectedContact) return;

        const instanceName = selectedInstance.name || selectedInstance.instance?.instanceName;
        const phoneNumber = `${selectedContact.codigo_pais}${selectedContact.celular}`;

        setSending(true);
        setAlert(null);

        let result;

        try {
            if (message.type === 'text') {
                result = await sendTextMessage(instanceName, phoneNumber, message.content);
            } else if (message.type === 'audio') {
                result = await sendAudioMessage(instanceName, phoneNumber, message.content);
            } else {
                result = await sendMediaMessage(
                    instanceName,
                    phoneNumber,
                    message.content,
                    message.mimetype,
                    message.fileName,
                    message.caption
                );
            }

            if (result.success) {
                // Agregar mensaje enviado a la lista
                const sentMsg = {
                    key: { id: Date.now().toString(), fromMe: true },
                    message: { conversation: message.type === 'text' ? message.content : message.fileName },
                    messageTimestamp: Math.floor(Date.now() / 1000),
                };
                setMessages(prev => [...prev, sentMsg]);
            } else {
                setAlert({ type: 'error', message: result.error || 'Error enviando mensaje' });
            }
        } catch (err) {
            setAlert({ type: 'error', message: 'Error de conexión' });
        } finally {
            setSending(false);
        }
    };

    const getInstanceName = (inst) => {
        if (!inst) return '';
        return inst.name || inst.instance?.instanceName || inst.instanceName || '';
    };

    const selectedInstanceName = getInstanceName(selectedInstance);

    const handleInstanceChange = (e) => {
        const name = e.target.value;
        if (!name) {
            setSelectedInstance(null);
            return;
        }
        const inst = instances.find(i => getInstanceName(i) === name);
        setSelectedInstance(inst || null);
    };

    const handleContactSelect = (contact) => {
        setSelectedContact(contact);
        setMessages([]);
    };

    return (
        <DSPage>
            <DSPageHeader
                title="Mensajería WhatsApp"
                icon={<MessageSquare size={22} />}
            />

            {alert && (
                <DSAlert
                    variant={alert.type}
                    dismissible
                    onDismiss={() => setAlert(null)}
                    className="mb-3"
                >
                    {alert.message}
                </DSAlert>
            )}

            <div className="mensajeria-layout">
                {/* Sidebar */}
                <div className="mensajeria-sidebar">
                    <DSSection title="1. Instancia WhatsApp" icon={<Smartphone size={16} />}>
                        {loadingInstances ? (
                            <DSLoading text="Cargando instancias..." />
                        ) : instances.length === 0 ? (
                            <DSEmpty
                                icon={<Smartphone size={32} />}
                                title="Sin instancias conectadas"
                                description="Conecta una instancia desde la página de Instancias"
                            />
                        ) : (
                            <select
                                className="mensajeria-instance-select"
                                value={selectedInstanceName}
                                onChange={handleInstanceChange}
                            >
                                <option value="">Selecciona una instancia...</option>
                                {instances.map(inst => {
                                    const name = getInstanceName(inst);
                                    return (
                                        <option key={name} value={name}>
                                            {name}
                                        </option>
                                    );
                                })}
                            </select>
                        )}
                    </DSSection>

                    <DSSection title="2. Seleccionar Contacto" icon={<User size={16} />}>
                        <ContactSelector
                            contacts={contacts}
                            selectedContact={selectedContact}
                            onSelect={handleContactSelect}
                            loading={loadingContacts}
                        />
                    </DSSection>
                </div>

                {/* Main Chat Area */}
                <div className="mensajeria-main">
                    <DSSection title="3. Conversación" icon={<MessageSquare size={16} />}>
                        {!selectedInstance || !selectedContact ? (
                            <DSEmpty
                                icon={<MessageSquare size={48} />}
                                title="Selecciona instancia y contacto"
                                description="Primero elige una instancia de WhatsApp y un contacto para ver la conversación"
                            />
                        ) : (
                            <div className="mensajeria-chat-area">
                                {/* Recipient Header */}
                                <div className="mensajeria-recipient">
                                    <div className="mensajeria-recipient__avatar">
                                        <User size={24} />
                                    </div>
                                    <div className="mensajeria-recipient__info">
                                        <span className="mensajeria-recipient__name">{selectedContact.nombre_completo}</span>
                                        <span className="mensajeria-recipient__phone">
                                            +{selectedContact.codigo_pais} {selectedContact.celular}
                                        </span>
                                    </div>
                                </div>

                                {/* Chat Panel */}
                                <ChatPanel
                                    messages={messages}
                                    loading={loadingMessages}
                                    onRefresh={loadMessages}
                                    wsConnected={wsConnected}
                                />

                                {/* Composer */}
                                <MessageComposer onSend={handleSend} sending={sending} />
                            </div>
                        )}
                    </DSSection>
                </div>
            </div>
        </DSPage>
    );
}

export default MensajeriaPage;
