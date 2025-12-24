import React, { useLayoutEffect, useRef, useState } from 'react';
import { useModal } from '../../context/ModalContext';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import gsap from 'gsap';
import './GlobalModal.css';

const GlobalModal = () => {
    const { modalState, closeModal } = useModal();
    const { isOpen, type, title, message, component: CustomComponent, componentProps, onConfirm, onCancel, confirmText, cancelText } = modalState;
    const [isVisible, setIsVisible] = useState(false);

    const overlayRef = useRef(null);
    const containerRef = useRef(null);

    // 1. Manage visibility (mounting)
    useLayoutEffect(() => {
        if (isOpen) setIsVisible(true);
    }, [isOpen]);

    // 2. Manage animations
    useLayoutEffect(() => {
        if (!isVisible) return;

        const overlay = overlayRef.current;
        const container = containerRef.current;

        if (!overlay || !container) return;

        // Kill any running animations to prevent conflicts
        gsap.killTweensOf(overlay);
        gsap.killTweensOf(container);

        if (isOpen) {
            // Animate In
            gsap.fromTo(overlay,
                { autoAlpha: 0, backdropFilter: 'blur(0px)', display: 'flex' },
                { autoAlpha: 1, backdropFilter: 'blur(5px)', duration: 0.5, ease: 'power2.out' }
            );

            // Only animate container for standard modals. 
            // Custom components (type === 'custom') handle their own animations.
            if (type !== 'custom') {
                gsap.fromTo(container,
                    { scale: 0.9, autoAlpha: 0, y: 20 },
                    { scale: 1, autoAlpha: 1, y: 0, duration: 0.5, ease: 'back.out(1.2)' }
                );
            } else {
                // Ensure custom container is visible immediately so child can animate
                gsap.set(container, { autoAlpha: 1, scale: 1, y: 0 });
            }
        } else {
            // Animate Out
            gsap.to(overlay, {
                autoAlpha: 0,
                backdropFilter: 'blur(0px)',
                duration: 0.5,
                ease: 'power2.in',
                onComplete: () => setIsVisible(false)
            });

            if (type !== 'custom') {
                gsap.to(container, {
                    scale: 0.9,
                    autoAlpha: 0,
                    y: 20,
                    duration: 0.5,
                    ease: 'back.in(1.2)'
                });
            }
        }
    }, [isOpen, isVisible, type]);

    if (!isVisible) return null;

    const handleBackdropClick = (e) => {
        if (e.target === overlayRef.current) {
            if (type !== 'loading') closeModal();
        }
    };

    const handleConfirm = () => {
        if (onConfirm) onConfirm();
        closeModal();
    };

    const handleCancel = () => {
        if (onCancel) onCancel();
        closeModal();
    };

    // Icons based on type
    const getIcon = () => {
        switch (type) {
            case 'error': return <AlertCircle color="#ef4444" size={24} />;
            case 'success': return <CheckCircle color="#10b981" size={24} />;
            case 'warning': return <AlertTriangle color="#f59e0b" size={24} />;
            case 'confirm': return <AlertCircle color="#6366f1" size={24} />;
            default: return <Info color="#3b82f6" size={24} />;
        }
    };

    // If custom component, render it directly inside the focused overlay
    if (type === 'custom' && CustomComponent) {
        return (
            <div className="global-modal-overlay" ref={overlayRef} onClick={handleBackdropClick}>
                <div ref={containerRef} className="global-modal-custom-wrapper">
                    <CustomComponent {...componentProps} onClose={closeModal} isOpen={isOpen} />
                </div>
            </div>
        );
    }

    return (
        <div className="global-modal-overlay" ref={overlayRef} onClick={handleBackdropClick}>
            <div className="global-modal-container" ref={containerRef}>
                <div className="global-modal-header">
                    <div className="global-modal-title">
                        {getIcon()}
                        <span>{title}</span>
                    </div>
                    <button className="global-modal-close" onClick={closeModal}>
                        <X size={20} />
                    </button>
                </div>

                <div className="global-modal-body">
                    {message}
                </div>

                <div className="global-modal-footer">
                    {type === 'confirm' ? (
                        <>
                            <button className="modal-btn modal-btn-cancel" onClick={handleCancel}>
                                {cancelText}
                            </button>
                            <button className="modal-btn modal-btn-confirm" onClick={handleConfirm}>
                                {confirmText}
                            </button>
                        </>
                    ) : (
                        <button className="modal-btn modal-btn-ok" onClick={closeModal}>
                            OK
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GlobalModal;
