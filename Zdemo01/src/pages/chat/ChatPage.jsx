import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    MessageCircle,
    Send,
    Search,
    MoreVertical,
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
    Check
} from 'lucide-react';
import { getSession } from '../../services/authService';
import {
    getConversations,
    getMessages,
    sendMessage,
    searchUsers,
    createConversation,
    formatMessageTime,
    getInitials,
    getAvatarColor
} from '../../services/chatService';
import './chat.css';

/**
 * Página de Chat
 * Sistema de mensajería en tiempo real
 */
export function ChatPage() {
    // Estado de la aplicación
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Estados de carga y errores
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const [error, setError] = useState(null);

    // Estado para mobile
    const [showConversationList, setShowConversationList] = useState(true);

    // Estado para modal de nueva conversación
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [isSearchingUsers, setIsSearchingUsers] = useState(false);
    const [isCreatingConversation, setIsCreatingConversation] = useState(false);
    const [groupName, setGroupName] = useState('');

    // Usuario actual
    const currentUser = getSession();

    // Refs
    const messagesEndRef = useRef(null);
    const messageInputRef = useRef(null);
    const userSearchInputRef = useRef(null);
    const searchTimeoutRef = useRef(null);

    // Scroll automático al final de los mensajes
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    // Cargar conversaciones al montar el componente
    useEffect(() => {
        loadConversations();
    }, []);

    // Scroll al final cuando cambian los mensajes
    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Polling para nuevos mensajes (cada 5 segundos)
    useEffect(() => {
        if (!selectedConversation) return;

        const interval = setInterval(() => {
            loadMessages(selectedConversation.id, false);
        }, 5000);

        return () => clearInterval(interval);
    }, [selectedConversation]);

    // Búsqueda de usuarios con debounce
    useEffect(() => {
        if (!showNewChatModal) return;

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            handleSearchUsers(userSearchQuery);
        }, 300);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [userSearchQuery, showNewChatModal]);

    // Focus en input de búsqueda cuando se abre el modal
    useEffect(() => {
        if (showNewChatModal) {
            setTimeout(() => {
                userSearchInputRef.current?.focus();
            }, 100);
        }
    }, [showNewChatModal]);

    // Cargar lista de conversaciones
    const loadConversations = async () => {
        setIsLoadingConversations(true);
        setError(null);

        const result = await getConversations();

        if (result.success) {
            setConversations(result.data);
        } else {
            setError(result.error);
        }

        setIsLoadingConversations(false);
    };

    // Cargar mensajes de una conversación
    const loadMessages = async (conversationId, showLoading = true) => {
        if (showLoading) {
            setIsLoadingMessages(true);
        }

        const result = await getMessages(conversationId);

        if (result.success) {
            setMessages(result.data);
        } else if (showLoading) {
            setError(result.error);
        }

        if (showLoading) {
            setIsLoadingMessages(false);
        }
    };

    // Seleccionar una conversación
    const handleSelectConversation = async (conversation) => {
        setSelectedConversation(conversation);
        setShowConversationList(false);
        setMessages([]);
        await loadMessages(conversation.id);

        // Focus en el input de mensaje
        setTimeout(() => {
            messageInputRef.current?.focus();
        }, 100);
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

        // Agregar mensaje optimistamente
        const optimisticMessage = {
            id: 'temp-' + Date.now(),
            body: messageBody,
            user_id: currentUser?.id,
            user: currentUser,
            created_at: new Date().toISOString(),
            sending: true
        };

        setMessages(prev => [...prev, optimisticMessage]);

        const result = await sendMessage(selectedConversation.id, messageBody);

        if (result.success) {
            // Reemplazar mensaje optimista con el real
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === optimisticMessage.id
                        ? { ...result.data, user: currentUser }
                        : msg
                )
            );
        } else {
            // Marcar mensaje como fallido
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === optimisticMessage.id
                        ? { ...msg, sending: false, failed: true }
                        : msg
                )
            );
        }

        setIsSendingMessage(false);
        messageInputRef.current?.focus();
    };

    // Volver a la lista de conversaciones (mobile)
    const handleBackToList = () => {
        setShowConversationList(true);
        setSelectedConversation(null);
    };

    // Buscar usuarios
    const handleSearchUsers = async (query) => {
        setIsSearchingUsers(true);
        const result = await searchUsers(query);

        if (result.success) {
            // Filtrar usuarios ya seleccionados
            const filtered = result.data.filter(
                user => !selectedUsers.find(u => u.id === user.id)
            );
            setSearchResults(filtered);
        } else {
            setSearchResults([]);
        }

        setIsSearchingUsers(false);
    };

    // Seleccionar usuario para nueva conversación
    const handleSelectUser = (user) => {
        if (!selectedUsers.find(u => u.id === user.id)) {
            setSelectedUsers([...selectedUsers, user]);
        }
        setUserSearchQuery('');
        setSearchResults([]);
    };

    // Quitar usuario seleccionado
    const handleRemoveUser = (userId) => {
        setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
    };

    // Crear nueva conversación
    const handleCreateConversation = async () => {
        if (selectedUsers.length === 0 || isCreatingConversation) return;

        setIsCreatingConversation(true);

        const userIds = selectedUsers.map(u => u.id);
        const isGroup = selectedUsers.length > 1;
        const name = isGroup ? groupName.trim() || null : null;

        const result = await createConversation(userIds, name, isGroup);

        if (result.success) {
            // Cerrar modal
            closeNewChatModal();

            // Recargar conversaciones
            await loadConversations();

            // Seleccionar la nueva conversación
            handleSelectConversation(result.data);
        }

        setIsCreatingConversation(false);
    };

    // Abrir modal de nueva conversación
    const openNewChatModal = () => {
        setShowNewChatModal(true);
        setUserSearchQuery('');
        setSearchResults([]);
        setSelectedUsers([]);
        setGroupName('');
        // Cargar usuarios iniciales
        handleSearchUsers('');
    };

    // Cerrar modal de nueva conversación
    const closeNewChatModal = () => {
        setShowNewChatModal(false);
        setUserSearchQuery('');
        setSearchResults([]);
        setSelectedUsers([]);
        setGroupName('');
    };

    // Filtrar conversaciones por búsqueda
    const filteredConversations = conversations.filter(conv => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        const name = getConversationName(conv).toLowerCase();
        return name.includes(query);
    });

    // Obtener nombre de la conversación
    function getConversationName(conversation) {
        if (conversation.name) return conversation.name;

        if (conversation.is_group) {
            return 'Grupo';
        }

        // Para conversaciones 1:1, mostrar el nombre del otro usuario
        const otherUsers = conversation.users?.filter(u => u.id !== currentUser?.id);
        if (otherUsers?.length > 0) {
            return otherUsers.map(u => u.name).join(', ');
        }

        return 'Conversación';
    }

    // Obtener último mensaje de la conversación
    function getLastMessage(conversation) {
        // Si la conversación tiene último mensaje, mostrarlo
        if (conversation.last_message) {
            return conversation.last_message.body;
        }
        return 'Sin mensajes';
    }

    // Renderizar avatar
    const renderAvatar = (user, size = 'medium') => {
        const sizeClass = size === 'small' ? 'chat-avatar--small' :
            size === 'large' ? 'chat-avatar--large' : '';
        const color = getAvatarColor(user?.id || 0);

        return (
            <div
                className={`chat-avatar ${sizeClass}`}
                style={{ backgroundColor: color }}
            >
                {getInitials(user?.name)}
            </div>
        );
    };

    // Estado de carga inicial
    if (isLoadingConversations && conversations.length === 0) {
        return (
            <div className="chat-page">
                <div className="chat-loading">
                    <Loader2 className="chat-loading__spinner" size={48} />
                    <p>Cargando conversaciones...</p>
                </div>
            </div>
        );
    }

    // Estado de error
    if (error && conversations.length === 0) {
        return (
            <div className="chat-page">
                <div className="chat-error">
                    <AlertCircle size={48} />
                    <h3>Error al cargar</h3>
                    <p>{error}</p>
                    <button
                        className="chat-error__retry"
                        onClick={loadConversations}
                    >
                        <RefreshCw size={16} />
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-page">
            <div className="chat-container">
                {/* Lista de conversaciones */}
                <aside className={`chat-sidebar ${!showConversationList ? 'chat-sidebar--hidden-mobile' : ''}`}>
                    <div className="chat-sidebar__header">
                        <h2 className="chat-sidebar__title">
                            <MessageCircle size={20} />
                            <span>Mensajes</span>
                        </h2>
                        <div className="chat-sidebar__actions">
                            <button
                                className="chat-sidebar__new-chat"
                                onClick={openNewChatModal}
                                title="Nueva conversación"
                            >
                                <Plus size={20} />
                            </button>
                            <button
                                className="chat-sidebar__refresh"
                                onClick={loadConversations}
                                title="Actualizar"
                            >
                                <RefreshCw size={18} className={isLoadingConversations ? 'spinning' : ''} />
                            </button>
                        </div>
                    </div>

                    {/* Búsqueda */}
                    <div className="chat-sidebar__search">
                        <Search size={18} className="chat-sidebar__search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar conversación..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="chat-sidebar__search-input"
                        />
                    </div>

                    {/* Lista de conversaciones */}
                    <div className="chat-sidebar__list">
                        {filteredConversations.length === 0 ? (
                            <div className="chat-sidebar__empty">
                                <MessageSquare size={40} />
                                <p>No hay conversaciones</p>
                                <button
                                    className="chat-sidebar__empty-cta"
                                    onClick={openNewChatModal}
                                >
                                    <UserPlus size={16} />
                                    Iniciar chat
                                </button>
                            </div>
                        ) : (
                            filteredConversations.map(conversation => (
                                <button
                                    key={conversation.id}
                                    className={`chat-conversation-item ${selectedConversation?.id === conversation.id ? 'chat-conversation-item--active' : ''
                                        } ${conversation.is_group ? 'chat-conversation-item--group' : ''}`}
                                    onClick={() => handleSelectConversation(conversation)}
                                >
                                    <div className="chat-conversation-item__avatar">
                                        {conversation.is_group ? (
                                            <div
                                                className="chat-avatar chat-avatar--group"
                                                style={{ backgroundColor: getAvatarColor(conversation.id) }}
                                            >
                                                <Users size={20} />
                                            </div>
                                        ) : (
                                            renderAvatar(
                                                conversation.users?.find(u => u.id !== currentUser?.id) || conversation.users?.[0]
                                            )
                                        )}
                                        {conversation.is_group && (
                                            <span className="chat-conversation-item__group-badge">
                                                Grupo
                                            </span>
                                        )}
                                    </div>
                                    <div className="chat-conversation-item__content">
                                        <div className="chat-conversation-item__header">
                                            <span className="chat-conversation-item__name">
                                                {getConversationName(conversation)}
                                            </span>
                                            {conversation.updated_at && (
                                                <span className="chat-conversation-item__time">
                                                    {formatMessageTime(conversation.updated_at)}
                                                </span>
                                            )}
                                        </div>
                                        <p className="chat-conversation-item__preview">
                                            {getLastMessage(conversation)}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </aside>

                {/* Área de mensajes */}
                <main className={`chat-main ${showConversationList ? 'chat-main--hidden-mobile' : ''}`}>
                    {selectedConversation ? (
                        <>
                            {/* Header de la conversación */}
                            <header className="chat-main__header">
                                <button
                                    className="chat-main__back"
                                    onClick={handleBackToList}
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <div className="chat-main__header-info">
                                    {selectedConversation.is_group ? (
                                        <div
                                            className="chat-avatar chat-avatar--small"
                                            style={{ backgroundColor: getAvatarColor(selectedConversation.id) }}
                                        >
                                            <Users size={16} />
                                        </div>
                                    ) : (
                                        renderAvatar(
                                            selectedConversation.users?.find(u => u.id !== currentUser?.id),
                                            'small'
                                        )
                                    )}
                                    <div className="chat-main__header-text">
                                        <h3 className="chat-main__header-name">
                                            {getConversationName(selectedConversation)}
                                        </h3>
                                        <span className="chat-main__header-status">
                                            {selectedConversation.is_group
                                                ? `${selectedConversation.users?.length || 0} participantes`
                                                : 'En línea'
                                            }
                                        </span>
                                    </div>
                                </div>
                                <button className="chat-main__menu">
                                    <MoreVertical size={20} />
                                </button>
                            </header>

                            {/* Mensajes */}
                            <div className="chat-messages">
                                {isLoadingMessages ? (
                                    <div className="chat-messages__loading">
                                        <Loader2 className="chat-loading__spinner" size={32} />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="chat-messages__empty">
                                        <MessageCircle size={48} />
                                        <p>No hay mensajes aún</p>
                                        <span>¡Sé el primero en enviar un mensaje!</span>
                                    </div>
                                ) : (
                                    <div className="chat-messages__list">
                                        {messages.map((message, index) => {
                                            const isOwn = message.user_id === currentUser?.id;
                                            const showAvatar = !isOwn && (
                                                index === 0 ||
                                                messages[index - 1]?.user_id !== message.user_id
                                            );

                                            return (
                                                <div
                                                    key={message.id}
                                                    className={`chat-message ${isOwn ? 'chat-message--own' : ''} ${message.sending ? 'chat-message--sending' : ''
                                                        } ${message.failed ? 'chat-message--failed' : ''}`}
                                                >
                                                    {!isOwn && (
                                                        <div className="chat-message__avatar">
                                                            {showAvatar && renderAvatar(message.user, 'small')}
                                                        </div>
                                                    )}
                                                    <div className="chat-message__content">
                                                        {!isOwn && showAvatar && selectedConversation.is_group && (
                                                            <span className="chat-message__sender">
                                                                {message.user?.name || 'Usuario'}
                                                            </span>
                                                        )}
                                                        <div className="chat-message__bubble">
                                                            <p className="chat-message__text">{message.body}</p>
                                                            <span className="chat-message__time">
                                                                {message.sending ? (
                                                                    <Loader2 size={12} className="spinning" />
                                                                ) : message.failed ? (
                                                                    <AlertCircle size={12} />
                                                                ) : (
                                                                    formatMessageTime(message.created_at)
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>
                                )}
                            </div>

                            {/* Input de mensaje */}
                            <form className="chat-input" onSubmit={handleSendMessage}>
                                <input
                                    ref={messageInputRef}
                                    type="text"
                                    placeholder="Escribe un mensaje..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    className="chat-input__field"
                                    disabled={isSendingMessage}
                                />
                                <button
                                    type="submit"
                                    className="chat-input__send"
                                    disabled={!newMessage.trim() || isSendingMessage}
                                >
                                    {isSendingMessage ? (
                                        <Loader2 size={20} className="spinning" />
                                    ) : (
                                        <Send size={20} />
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="chat-main__empty">
                            <div className="chat-main__empty-icon">
                                <MessageCircle size={64} />
                            </div>
                            <h3>Selecciona una conversación</h3>
                            <p>Elige una conversación de la lista para comenzar a chatear</p>
                            <button
                                className="chat-main__empty-cta"
                                onClick={openNewChatModal}
                            >
                                <UserPlus size={18} />
                                Nueva conversación
                            </button>
                        </div>
                    )}
                </main>
            </div>

            {/* Modal de Nueva Conversación */}
            {showNewChatModal && (
                <div className="chat-modal-overlay" onClick={closeNewChatModal}>
                    <div className="chat-modal" onClick={e => e.stopPropagation()}>
                        <div className="chat-modal__header">
                            <h3 className="chat-modal__title">
                                <UserPlus size={20} />
                                Nueva conversación
                            </h3>
                            <button
                                className="chat-modal__close"
                                onClick={closeNewChatModal}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="chat-modal__body">
                            {/* Usuarios seleccionados */}
                            {selectedUsers.length > 0 && (
                                <div className="chat-modal__selected">
                                    <div className="chat-modal__selected-list">
                                        {selectedUsers.map(user => (
                                            <div key={user.id} className="chat-modal__selected-user">
                                                {renderAvatar(user, 'small')}
                                                <span>{user.name}</span>
                                                <button
                                                    className="chat-modal__selected-remove"
                                                    onClick={() => handleRemoveUser(user.id)}
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Nombre del grupo si hay más de 1 usuario */}
                                    {selectedUsers.length > 1 && (
                                        <div className="chat-modal__group-name">
                                            <label>Nombre del grupo (opcional)</label>
                                            <input
                                                type="text"
                                                placeholder="Ej: Equipo de trabajo"
                                                value={groupName}
                                                onChange={(e) => setGroupName(e.target.value)}
                                                className="chat-modal__group-input"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Búsqueda de usuarios */}
                            <div className="chat-modal__search">
                                <Search size={18} className="chat-modal__search-icon" />
                                <input
                                    ref={userSearchInputRef}
                                    type="text"
                                    placeholder="Buscar personas..."
                                    value={userSearchQuery}
                                    onChange={(e) => setUserSearchQuery(e.target.value)}
                                    className="chat-modal__search-input"
                                />
                            </div>

                            {/* Resultados de búsqueda */}
                            <div className="chat-modal__results">
                                {isSearchingUsers ? (
                                    <div className="chat-modal__loading">
                                        <Loader2 size={24} className="spinning" />
                                        <span>Buscando...</span>
                                    </div>
                                ) : searchResults.length === 0 ? (
                                    <div className="chat-modal__empty">
                                        <User size={32} />
                                        <p>
                                            {userSearchQuery
                                                ? 'No se encontraron usuarios'
                                                : 'Escribe para buscar personas'
                                            }
                                        </p>
                                    </div>
                                ) : (
                                    <div className="chat-modal__user-list">
                                        {searchResults.map(user => (
                                            <button
                                                key={user.id}
                                                className="chat-modal__user"
                                                onClick={() => handleSelectUser(user)}
                                            >
                                                {renderAvatar(user)}
                                                <div className="chat-modal__user-info">
                                                    <span className="chat-modal__user-name">{user.name}</span>
                                                    <span className="chat-modal__user-email">{user.email}</span>
                                                </div>
                                                <div className="chat-modal__user-add">
                                                    <Plus size={18} />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="chat-modal__footer">
                            <button
                                className="chat-modal__cancel"
                                onClick={closeNewChatModal}
                            >
                                Cancelar
                            </button>
                            <button
                                className="chat-modal__submit"
                                onClick={handleCreateConversation}
                                disabled={selectedUsers.length === 0 || isCreatingConversation}
                            >
                                {isCreatingConversation ? (
                                    <>
                                        <Loader2 size={18} className="spinning" />
                                        Creando...
                                    </>
                                ) : (
                                    <>
                                        <Check size={18} />
                                        {selectedUsers.length > 1 ? 'Crear grupo' : 'Iniciar chat'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ChatPage;
