import { createContext, useContext, useState, useCallback, useRef } from 'react';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
    const [modalState, setModalState] = useState({
        isOpen: false,
        type: 'info', // info, success, error, confirm, custom
        title: '',
        message: '',
        component: null, // For custom components like PlaylistModal
        componentProps: {},
        onConfirm: null,
        onCancel: null,
        confirmText: 'Confirm',
        cancelText: 'Cancel'
    });

    // Store resolve/reject for promise-based confirmation if needed in future
    // For now using callback pattern as requested

    const closeModal = useCallback(() => {
        setModalState(prev => ({ ...prev, isOpen: false }));
        // Delay clearing content slightly for animation to finish if needed
        setTimeout(() => {
            setModalState({
                isOpen: false,
                type: 'info',
                title: '',
                message: '',
                component: null,
                componentProps: {},
                onConfirm: null,
                onCancel: null,
                confirmText: 'Confirm',
                cancelText: 'Cancel'
            });
        }, 700);
    }, []);

    const showModal = useCallback(({ type = 'info', title, message, component, componentProps, onConfirm, onCancel, confirmText, cancelText }) => {
        setModalState({
            isOpen: true,
            type,
            title,
            message,
            component,
            componentProps,
            onConfirm,
            onCancel,
            confirmText: confirmText || 'Confirm',
            cancelText: cancelText || 'Cancel'
        });
    }, []);

    const showAlert = useCallback((message, type = 'info', title = '') => {
        showModal({
            type,
            title: title || type.charAt(0).toUpperCase() + type.slice(1),
            message
        });
    }, [showModal]);

    const showConfirm = useCallback((title, message, onConfirm, onCancel) => {
        showModal({
            type: 'confirm',
            title,
            message,
            onConfirm,
            onCancel
        });
    }, [showModal]);

    const showCustom = useCallback((component, props = {}) => {
        showModal({
            type: 'custom',
            component,
            componentProps: props
        });
    }, [showModal]);

    return (
        <ModalContext.Provider value={{ modalState, closeModal, showModal, showAlert, showConfirm, showCustom }}>
            {children}
        </ModalContext.Provider>
    );
};
