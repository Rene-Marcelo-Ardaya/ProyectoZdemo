import React, { useState, useEffect, useRef } from 'react';
import {
    MessageSquare,
    Send,
    Paperclip,
    Mic,
    X,
    Phone,
    User,
    FileText,
    Image,
    CheckCircle,
    AlertCircle,
    Loader2,
    Smartphone,
} from 'lucide-react';
import {
    getConnectedInstances,
    sendTextMessage,
    sendAudioMessage,
    sendMediaMessage,
    fileToBase64,
} from '../../services/evolutionService';
import { fetchPersonal } from '../../services/personalService';

// DS Components
import {
    DSPage,
    DSPageHeader,
    DSSection,
    DSAlert,
    DSButton,
    DSLoading,
    DSTextField,
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

    // Solo mostrar contactos con número de celular
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

        // Determinar tipo
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
            {/* Attachment Preview */}
            {attachment && (
                <div className="message-composer__attachment">
                    <div className="attachment-preview">
                        {attachment.type === 'image' && <Image size={20} />}
                        {attachment.type === 'audio' && <Mic size={20} />}
                        {attachment.type === 'document' && <FileText size={20} />}
                        <span>{attachment.name}</span>
                        <button type="button" onClick={removeAttachment}>
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Input Row */}
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

    const [sending, setSending] = useState(false);
    const [alert, setAlert] = useState(null);
    const [sentMessages, setSentMessages] = useState([]);

    // Cargar instancias conectadas
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

    // Enviar mensaje
    const handleSend = async (message) => {
        if (!selectedInstance || !selectedContact) return;

        // API devuelve 'name' directamente
        const instanceName = selectedInstance.name || selectedInstance.instance?.instanceName || selectedInstance.instanceName;
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
                // image, document, video
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
                setAlert({ type: 'success', message: '✅ Mensaje enviado correctamente' });
                setSentMessages(prev => [...prev, {
                    id: Date.now(),
                    type: message.type,
                    content: message.type === 'text' ? message.content : message.fileName,
                    timestamp: new Date().toLocaleTimeString(),
                }]);
            } else {
                setAlert({ type: 'error', message: result.error || 'Error enviando mensaje' });
            }
        } catch (err) {
            setAlert({ type: 'error', message: 'Error de conexión' });
        } finally {
            setSending(false);
        }
    };

    // Obtener nombre de instancia seleccionada
    const getInstanceName = (inst) => {
        if (!inst) return '';
        // API devuelve 'name' directamente
        return inst.name || inst.instance?.instanceName || inst.instanceName || '';
    };

    // Valor actual del selector
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
                {/* Sidebar: Instance & Contact Selection */}
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
                            onSelect={setSelectedContact}
                            loading={loadingContacts}
                        />
                    </DSSection>
                </div>

                {/* Main: Message Composer */}
                <div className="mensajeria-main">
                    <DSSection title="3. Enviar Mensaje" icon={<Send size={16} />}>
                        {!selectedInstance || !selectedContact ? (
                            <DSEmpty
                                icon={<MessageSquare size={48} />}
                                title="Selecciona instancia y contacto"
                                description="Primero elige una instancia de WhatsApp y un contacto para enviar mensajes"
                            />
                        ) : (
                            <div className="mensajeria-composer-area">
                                {/* Selected Contact Info */}
                                <div className="mensajeria-recipient">
                                    <span className="mensajeria-recipient__label">Enviando a:</span>
                                    <span className="mensajeria-recipient__name">{selectedContact.nombre_completo}</span>
                                    <span className="mensajeria-recipient__phone">
                                        +{selectedContact.codigo_pais} {selectedContact.celular}
                                    </span>
                                </div>

                                {/* Sent Messages Log */}
                                {sentMessages.length > 0 && (
                                    <div className="mensajeria-log">
                                        <h4>Mensajes enviados:</h4>
                                        {sentMessages.map(msg => (
                                            <div key={msg.id} className="mensajeria-log__item">
                                                <CheckCircle size={14} />
                                                <span className="mensajeria-log__content">
                                                    {msg.type === 'text' ? msg.content : `📎 ${msg.content}`}
                                                </span>
                                                <span className="mensajeria-log__time">{msg.timestamp}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

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
