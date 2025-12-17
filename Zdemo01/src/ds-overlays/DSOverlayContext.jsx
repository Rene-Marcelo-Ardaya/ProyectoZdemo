import React, { createContext, useContext, useState, useCallback } from 'react';
import { DSMessageBox } from './DSMessageBox';

const DSOverlayContext = createContext(null);

export function DSOverlayProvider({ children }) {
    const [messageState, setMessageState] = useState(null);

    const closeMessage = useCallback(() => {
        setMessageState(prev => prev ? { ...prev, isClosing: true } : null);
        // Esperar animación de salida antes de destruir completamente
        setTimeout(() => {
            setMessageState(null);
        }, 200);
    }, []);

    const showMessage = useCallback(({ type = 'info', title, message, onConfirm, onCancel, confirmText, cancelText }) => {
        setMessageState({
            isVisible: true,
            isClosing: false,
            type,
            title,
            message,
            confirmText,
            cancelText,
            onConfirm: () => {
                if (onConfirm) onConfirm();
                closeMessage();
            },
            onCancel: onCancel ? () => {
                onCancel();
                closeMessage();
            } : undefined, // Si no hay onCancel, no pasamos la función para que no muestre el botón
            // Si pasamos onCancel explícito pero undefined, el componente puede decidir. 
            // Para el componente: si onCancel existe, muestra botón cancelar.

            // Caso especial para cuando solo queremos cerrar sin callback
            onClose: () => {
                if (onCancel) onCancel(); // Si el usuario le dio a la X o backdrop
                closeMessage();
            }
        });
    }, [closeMessage]);

    const showSuccess = useCallback((message, onConfirm) => showMessage({ type: 'success', message, onConfirm }), [showMessage]);
    const showError = useCallback((message, onConfirm) => showMessage({ type: 'error', message, onConfirm }), [showMessage]);
    const showWarning = useCallback((message, onConfirm) => showMessage({ type: 'warning', message, onConfirm }), [showMessage]);
    const showInfo = useCallback((message, onConfirm) => showMessage({ type: 'info', message, onConfirm }), [showMessage]);

    const showConfirm = useCallback((message, onConfirm, onCancel) => showMessage({
        type: 'question', // Usamos 'question' o 'warning' para confirmaciones
        title: '¿Estás seguro?',
        message,
        onConfirm,
        onCancel: onCancel || (() => { }), // Confirm siempre tiene cancelar
        confirmText: 'Sí, continuar',
        cancelText: 'Cancelar'
    }), [showMessage]);

    return (
        <DSOverlayContext.Provider value={{ showMessage, showSuccess, showError, showWarning, showInfo, showConfirm }}>
            {children}
            {messageState && (
                <DSMessageBox
                    {...messageState}
                    onClose={messageState.onClose || messageState.onCancel}
                />
            )}
        </DSOverlayContext.Provider>
    );
}

export function useMessageBox() {
    const context = useContext(DSOverlayContext);
    if (!context) {
        throw new Error('useMessageBox must be used within a DSOverlayProvider');
    }
    return context;
}
