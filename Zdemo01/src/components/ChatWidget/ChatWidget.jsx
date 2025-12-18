import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    MessageCircle,
    Send,
    Search,
    ChevronLeft,
    Users,
    User,
    Loader2,
    AlertCircle,
    RefreshCw,
    MessageSquare,
    Plus,
    X,
    UserPlus,
    Check,
    CheckCheck,
    Minimize2,
    Maximize2
} from 'lucide-react';
import { getSession } from '../../services/authService';
import {
    getConversations,
    getMessages,
    sendMessage,
    searchUsers,
    createConversation,
    markAsRead,
    sendTyping,
    formatMessageTime,
    getInitials,
    getAvatarColor,
    initializeEcho,
    subscribeToConversation,
    unsubscribeFromConversation
} from '../../services/chatService';
import './ChatWidget.css';

/**
 * Verificar si el usuario tiene acceso al chat basado en sus menús
 */
export function hasAccessToChat(menus) {
    if (!menus || !Array.isArray(menus)) return false;

    for (const menu of menus) {
        if (menu.codMenu?.toLowerCase().includes('chat') ||
            menu.descripcion?.toLowerCase().includes('chat') ||
            menu.descripcion?.toLowerCase().includes('comunicación')) {
            return true;
        }

        if (menu.submenus && Array.isArray(menu.submenus)) {
            for (const sub of menu.submenus) {
                if (sub.rutaReact === '/chat' ||
                    sub.codSubMenu?.toLowerCase().includes('chat') ||
                    sub.descripcion?.toLowerCase().includes('chat')) {
                    return true;
                }
            }
        }

        if (menu.children && Array.isArray(menu.children)) {
            for (const child of menu.children) {
                if (child.url === '/chat' ||
                    child.title?.toLowerCase().includes('chat')) {
                    return true;
                }
            }
        }
    }

    return false;
}

/**
 * Widget de Chat Flotante estilo WhatsApp
 */
export function ChatWidget({ menus = [] }) {
    const hasChatAccess = hasAccessToChat(menus);

    // Estado del widget
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState('chats'); // 'chats' o 'search'

    // Estado del chat
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    // Estados de carga
    const [isLoadingConversations, setIsLoadingConversations] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const [error, setError] = useState(null);

    // Estado de búsqueda (unificado para chats y usuarios)
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Estados de tiempo real
    const [typingUsers, setTypingUsers] = useState({});
    const [totalUnread, setTotalUnread] = useState(0);

    // Usuario actual
    const currentUser = getSession();

    // Refs
    const messagesEndRef = useRef(null);
    const messageInputRef = useRef(null);
    const searchInputRef = useRef(null);
    const searchTimeoutRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Scroll automático
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    // Inicializar Echo cuando se abre el widget
    useEffect(() => {
        if (isOpen && hasChatAccess) {
            initializeEcho();
            loadConversations();
        }
    }, [isOpen, hasChatAccess]);

    // Suscribirse a conversaciones para tiempo real
    useEffect(() => {
        if (!selectedConversation) return;

        const channel = subscribeToConversation(selectedConversation.id, {
            onMessage: (data) => {
                // Nuevo mensaje recibido
                setMessages(prev => {
                    if (prev.find(m => m.id === data.id)) return prev;
                    return [...prev, data];
                });
                scrollToBottom();
                // Marcar como leído si estamos en la conversación
                markAsRead(selectedConversation.id);
            },
            onStatusUpdate: (data) => {
                // Actualizar estado del mensaje
                setMessages(prev => prev.map(msg =>
                    msg.id === data.message_id
                        ? { ...msg, status: data.status }
                        : msg
                ));
            },
            onTyping: (data) => {
                // Actualizar estado de typing
                if (data.user_id !== currentUser?.id) {
                    setTypingUsers(prev => ({
                        ...prev,
                        [data.user_id]: data.is_typing ? data.user_name : null
                    }));
                    // Limpiar después de 3s
                    setTimeout(() => {
                        setTypingUsers(prev => ({
                            ...prev,
                            [data.user_id]: null
                        }));
                    }, 3000);
                }
            }
        });

        return () => {
            unsubscribeFromConversation(selectedConversation.id);
        };
    }, [selectedConversation?.id, currentUser?.id, scrollToBottom]);

    // Scroll cuando cambian los mensajes
    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Calcular total de no leídos
    useEffect(() => {
        const total = conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);
        setTotalUnread(total);
    }, [conversations]);

    // Búsqueda con debounce
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (!searchQuery.trim()) {
            setSearchResults([]);
            setActiveTab('chats');
            return;
        }

        searchTimeoutRef.current = setTimeout(async () => {
            setIsSearching(true);
            const result = await searchUsers(searchQuery);
            if (result.success) {
                setSearchResults(result.data);
                setActiveTab('search');
            }
            setIsSearching(false);
        }, 300);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery]);

    if (!hasChatAccess) {
        return null;
    }

    // Cargar conversaciones
    const loadConversations = async (showLoading = true) => {
        if (showLoading) {
            setIsLoadingConversations(true);
            setError(null);
        }

        const result = await getConversations();

        if (result.success) {
            setConversations(result.data);
        } else if (showLoading) {
            setError(result.error);
        }

        if (showLoading) {
            setIsLoadingConversations(false);
        }
    };

    // Cargar mensajes
    const loadMessages = async (conversationId, showLoading = true) => {
        if (showLoading) {
            setIsLoadingMessages(true);
        }

        const result = await getMessages(conversationId);

        if (result.success) {
            setMessages(result.data);
            // Marcar como leídos
            markAsRead(conversationId);
            // Actualizar contador local
            setConversations(prev => prev.map(c =>
                c.id === conversationId ? { ...c, unread_count: 0 } : c
            ));
        } else if (showLoading) {
            setError(result.error);
        }

        if (showLoading) {
            setIsLoadingMessages(false);
        }
    };

    // Seleccionar conversación
    const handleSelectConversation = async (conversation) => {
        setSelectedConversation(conversation);
        setMessages([]);
        setSearchQuery('');
        setActiveTab('chats');
        await loadMessages(conversation.id);

        setTimeout(() => {
            messageInputRef.current?.focus();
        }, 100);
    };

    // Iniciar chat con usuario (desde búsqueda)
    const handleStartChatWithUser = async (user) => {
        // Buscar si ya existe conversación
        const existingConv = conversations.find(c =>
            !c.is_group && c.users?.some(u => u.id === user.id)
        );

        if (existingConv) {
            handleSelectConversation(existingConv);
        } else {
            // Crear nueva conversación
            const result = await createConversation([user.id], null, false);
            if (result.success) {
                await loadConversations();
                handleSelectConversation(result.data);
            }
        }
        setSearchQuery('');
    };

    // Enviar mensaje
    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!newMessage.trim() || !selectedConversation || isSendingMessage) {
            return;
        }

        const messageBody = newMessage.trim();
        setNewMessage('');
        setIsSendingMessage(true);

        // Mensaje optimista
        const optimisticMessage = {
            id: 'temp-' + Date.now(),
            body: messageBody,
            user_id: currentUser?.id,
            user: currentUser,
            status: 'sending',
            created_at: new Date().toISOString(),
        };

        setMessages(prev => [...prev, optimisticMessage]);

        const result = await sendMessage(selectedConversation.id, messageBody);

        if (result.success) {
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === optimisticMessage.id
                        ? { ...result.data, user: currentUser }
                        : msg
                )
            );
        } else {
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === optimisticMessage.id
                        ? { ...msg, status: 'failed' }
                        : msg
                )
            );
        }

        setIsSendingMessage(false);
        messageInputRef.current?.focus();
    };

    // Manejar typing
    const handleTyping = () => {
        if (!selectedConversation) return;

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        sendTyping(selectedConversation.id, true);

        typingTimeoutRef.current = setTimeout(() => {
            sendTyping(selectedConversation.id, false);
        }, 2000);
    };

    // Volver a lista
    const handleBackToList = () => {
        setSelectedConversation(null);
        loadConversations(false);
    };

    // Toggle widget
    const toggleWidget = () => {
        setIsOpen(!isOpen);
    };

    // Obtener nombre de conversación
    function getConversationName(conversation) {
        if (conversation.name) return conversation.name;
        if (conversation.is_group) return 'Grupo';

        const otherUsers = conversation.users?.filter(u => u.id !== currentUser?.id);
        if (otherUsers?.length > 0) {
            return otherUsers.map(u => u.name).join(', ');
        }
        return 'Conversación';
    }

    // Obtener último mensaje
    function getLastMessage(conversation) {
        if (conversation.last_message) {
            const isOwn = conversation.last_message.user_id === currentUser?.id;
            const prefix = isOwn ? 'Tú: ' : '';
            const body = conversation.last_message.body;
            return prefix + (body.length > 30 ? body.substring(0, 30) + '...' : body);
        }
        return 'Sin mensajes';
    }

    // Obtener usuarios que están escribiendo
    function getTypingText() {
        const typing = Object.values(typingUsers).filter(Boolean);
        if (typing.length === 0) return null;
        if (typing.length === 1) return `${typing[0]} está escribiendo...`;
        return 'Varios están escribiendo...';
    }

    // Renderizar avatar
    const renderAvatar = (user, size = 'medium') => {
        const sizeClass = size === 'small' ? 'cw-avatar--small' :
            size === 'large' ? 'cw-avatar--large' : '';
        const color = getAvatarColor(user?.id || 0);

        return (
            <div
                className={`cw-avatar ${sizeClass}`}
                style={{ backgroundColor: color }}
            >
                {getInitials(user?.name)}
            </div>
        );
    };

    // Renderizar estado del mensaje
    const renderMessageStatus = (status, isOwn) => {
        if (!isOwn) return null;

        if (status === 'sending') {
            return <Loader2 size={12} className="spinning cw-status" />;
        }
        if (status === 'failed') {
            return <AlertCircle size={12} className="cw-status cw-status--failed" />;
        }
        if (status === 'sent') {
            return <Check size={12} className="cw-status" />;
        }
        if (status === 'delivered') {
            return <CheckCheck size={12} className="cw-status" />;
        }
        if (status === 'read') {
            return <CheckCheck size={12} className="cw-status cw-status--read" />;
        }
        return null;
    };

    // Filtrar conversaciones
    const filteredConversations = searchQuery.trim()
        ? [] // Si hay búsqueda, mostramos usuarios
        : conversations;

    return (
        <>
            {/* Botón flotante */}
            <button
                className={`chat-widget-fab ${isOpen ? 'chat-widget-fab--open' : ''}`}
                onClick={toggleWidget}
                aria-label={isOpen ? "Cerrar chat" : "Abrir chat"}
            >
                {isOpen ? (
                    <X size={24} />
                ) : (
                    <>
                        <MessageCircle size={24} />
                        {totalUnread > 0 && (
                            <span className="chat-widget-fab__count">{totalUnread > 99 ? '99+' : totalUnread}</span>
                        )}
                    </>
                )}
            </button>

            {/* Panel del chat */}
            {isOpen && (
                <div className={`chat-widget-panel ${isExpanded ? 'chat-widget-panel--expanded' : ''}`}>
                    {/* Header */}
                    <header className="cw-header">
                        {selectedConversation ? (
                            <>
                                <button className="cw-header__back" onClick={handleBackToList}>
                                    <ChevronLeft size={20} />
                                </button>
                                <div className="cw-header__info">
                                    {selectedConversation.is_group ? (
                                        <div
                                            className="cw-avatar cw-avatar--small"
                                            style={{ backgroundColor: getAvatarColor(selectedConversation.id) }}
                                        >
                                            <Users size={14} />
                                        </div>
                                    ) : (
                                        renderAvatar(
                                            selectedConversation.users?.find(u => u.id !== currentUser?.id),
                                            'small'
                                        )
                                    )}
                                    <div className="cw-header__text">
                                        <span className="cw-header__name">
                                            {getConversationName(selectedConversation)}
                                        </span>
                                        {getTypingText() && (
                                            <span className="cw-header__typing">{getTypingText()}</span>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="cw-header__title">
                                <MessageCircle size={18} />
                                <span>Chat</span>
                            </div>
                        )}
                        <div className="cw-header__right">
                            {!selectedConversation && (
                                <button
                                    className="cw-header__btn"
                                    onClick={() => loadConversations()}
                                    title="Actualizar"
                                >
                                    <RefreshCw size={16} className={isLoadingConversations ? 'spinning' : ''} />
                                </button>
                            )}
                            <button
                                className="cw-header__btn"
                                onClick={() => setIsExpanded(!isExpanded)}
                                title={isExpanded ? "Minimizar" : "Expandir"}
                            >
                                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                            </button>
                            <button
                                className="cw-header__btn cw-header__close"
                                onClick={toggleWidget}
                                title="Cerrar"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </header>

                    {/* Contenido */}
                    <div className="cw-body">
                        {selectedConversation ? (
                            /* Vista de mensajes */
                            <>
                                <div className="cw-messages">
                                    {isLoadingMessages ? (
                                        <div className="cw-messages__loading">
                                            <Loader2 className="spinning" size={28} />
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="cw-messages__empty">
                                            <MessageCircle size={36} />
                                            <p>Envía el primer mensaje</p>
                                        </div>
                                    ) : (
                                        <div className="cw-messages__list">
                                            {messages.map((message, index) => {
                                                const isOwn = message.user_id === currentUser?.id;
                                                const showAvatar = !isOwn && (
                                                    index === 0 ||
                                                    messages[index - 1]?.user_id !== message.user_id
                                                );

                                                return (
                                                    <div
                                                        key={message.id}
                                                        className={`cw-message ${isOwn ? 'cw-message--own' : ''}`}
                                                    >
                                                        {!isOwn && (
                                                            <div className="cw-message__avatar">
                                                                {showAvatar && renderAvatar(message.user, 'small')}
                                                            </div>
                                                        )}
                                                        <div className="cw-message__bubble">
                                                            <p className="cw-message__text">{message.body}</p>
                                                            <div className="cw-message__meta">
                                                                <span className="cw-message__time">
                                                                    {formatMessageTime(message.created_at)}
                                                                </span>
                                                                {renderMessageStatus(message.status, isOwn)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            <div ref={messagesEndRef} />
                                        </div>
                                    )}
                                </div>

                                {/* Input */}
                                <form className="cw-input" onSubmit={handleSendMessage}>
                                    <input
                                        ref={messageInputRef}
                                        type="text"
                                        placeholder="Escribe un mensaje..."
                                        value={newMessage}
                                        onChange={(e) => {
                                            setNewMessage(e.target.value);
                                            handleTyping();
                                        }}
                                        className="cw-input__field"
                                        disabled={isSendingMessage}
                                    />
                                    <button
                                        type="submit"
                                        className="cw-input__send"
                                        disabled={!newMessage.trim() || isSendingMessage}
                                    >
                                        {isSendingMessage ? (
                                            <Loader2 size={18} className="spinning" />
                                        ) : (
                                            <Send size={18} />
                                        )}
                                    </button>
                                </form>
                            </>
                        ) : (
                            /* Lista de conversaciones y búsqueda */
                            <>
                                {/* Búsqueda unificada */}
                                <div className="cw-search">
                                    <Search size={16} className="cw-search__icon" />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="Buscar o iniciar chat..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="cw-search__input"
                                    />
                                    {searchQuery && (
                                        <button
                                            className="cw-search__clear"
                                            onClick={() => setSearchQuery('')}
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>

                                {/* Contenido según tab */}
                                <div className="cw-list">
                                    {activeTab === 'search' && searchQuery ? (
                                        /* Resultados de búsqueda (usuarios) */
                                        <>
                                            {isSearching ? (
                                                <div className="cw-list__loading">
                                                    <Loader2 className="spinning" size={24} />
                                                    <span>Buscando...</span>
                                                </div>
                                            ) : searchResults.length === 0 ? (
                                                <div className="cw-list__empty">
                                                    <User size={32} />
                                                    <p>No se encontraron usuarios</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="cw-list__header">
                                                        <UserPlus size={14} />
                                                        <span>Iniciar chat con:</span>
                                                    </div>
                                                    {searchResults.map(user => (
                                                        <button
                                                            key={user.id}
                                                            className="cw-user-item"
                                                            onClick={() => handleStartChatWithUser(user)}
                                                        >
                                                            {renderAvatar(user)}
                                                            <div className="cw-user-item__info">
                                                                <span className="cw-user-item__name">{user.name}</span>
                                                                <span className="cw-user-item__email">{user.email}</span>
                                                            </div>
                                                            <MessageCircle size={18} className="cw-user-item__action" />
                                                        </button>
                                                    ))}
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        /* Lista de conversaciones */
                                        <>
                                            {isLoadingConversations && conversations.length === 0 ? (
                                                <div className="cw-list__loading">
                                                    <Loader2 className="spinning" size={28} />
                                                </div>
                                            ) : error && conversations.length === 0 ? (
                                                <div className="cw-list__error">
                                                    <AlertCircle size={28} />
                                                    <p>{error}</p>
                                                    <button onClick={() => loadConversations()}>
                                                        <RefreshCw size={14} />
                                                        Reintentar
                                                    </button>
                                                </div>
                                            ) : filteredConversations.length === 0 ? (
                                                <div className="cw-list__empty">
                                                    <MessageSquare size={32} />
                                                    <p>No hay conversaciones</p>
                                                    <span>Busca una persona para chatear</span>
                                                </div>
                                            ) : (
                                                filteredConversations.map(conversation => (
                                                    <button
                                                        key={conversation.id}
                                                        className={`cw-conversation ${conversation.unread_count > 0 ? 'cw-conversation--unread' : ''}`}
                                                        onClick={() => handleSelectConversation(conversation)}
                                                    >
                                                        <div className="cw-conversation__avatar">
                                                            {conversation.is_group ? (
                                                                <div
                                                                    className="cw-avatar"
                                                                    style={{ backgroundColor: getAvatarColor(conversation.id) }}
                                                                >
                                                                    <Users size={16} />
                                                                </div>
                                                            ) : (
                                                                renderAvatar(
                                                                    conversation.users?.find(u => u.id !== currentUser?.id)
                                                                )
                                                            )}
                                                        </div>
                                                        <div className="cw-conversation__content">
                                                            <div className="cw-conversation__row">
                                                                <span className="cw-conversation__name">
                                                                    {getConversationName(conversation)}
                                                                </span>
                                                                <span className="cw-conversation__time">
                                                                    {formatMessageTime(conversation.updated_at)}
                                                                </span>
                                                            </div>
                                                            <div className="cw-conversation__row">
                                                                <p className="cw-conversation__preview">
                                                                    {conversation.last_message?.status &&
                                                                        conversation.last_message?.user_id === currentUser?.id && (
                                                                            <span className={`cw-preview-status ${conversation.last_message.status === 'read' ? 'cw-preview-status--read' : ''}`}>
                                                                                {conversation.last_message.status === 'sent' && <Check size={12} />}
                                                                                {(conversation.last_message.status === 'delivered' || conversation.last_message.status === 'read') && <CheckCheck size={12} />}
                                                                            </span>
                                                                        )}
                                                                    {getLastMessage(conversation)}
                                                                </p>
                                                                {conversation.unread_count > 0 && (
                                                                    <span className="cw-conversation__badge">
                                                                        {conversation.unread_count}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))
                                            )}
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default ChatWidget;
