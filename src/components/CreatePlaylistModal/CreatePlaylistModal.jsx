import { useState, useRef, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import gsap from 'gsap';
import './CreatePlaylistModal.css';

const CreatePlaylistModal = ({ isOpen, onClose, onCreate }) => {
    const [playlistName, setPlaylistName] = useState('');
    const overlayRef = useRef(null);
    const contentRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            // Reset initial state
            gsap.set(overlayRef.current, { opacity: 0 });
            gsap.set(contentRef.current, { scale: 0.9, opacity: 0 });

            // Animate in
            gsap.to(overlayRef.current, {
                opacity: 1,
                duration: 0.3,
                ease: 'power2.out'
            });

            gsap.to(contentRef.current, {
                scale: 1,
                opacity: 1,
                duration: 0.4,
                ease: 'back.out(1.2)',
                delay: 0.1
            });
        }
    }, [isOpen]);

    const handleClose = () => {
        // Animate out
        gsap.to(contentRef.current, {
            scale: 0.95,
            opacity: 0,
            duration: 0.2,
            ease: 'power2.in',
        });

        gsap.to(overlayRef.current, {
            opacity: 0,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => {
                setPlaylistName('');
                onClose();
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (playlistName.trim()) {
            onCreate(playlistName.trim());
            handleClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" ref={overlayRef} onClick={handleClose}>
            <div className="modal-content create-playlist-modal" ref={contentRef} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <Plus size={24} />
                        Create New Playlist
                    </h2>
                    <button className="modal-close-btn" onClick={handleClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <label htmlFor="playlist-name">Playlist Name</label>
                        <input
                            id="playlist-name"
                            type="text"
                            placeholder="Enter playlist name..."
                            value={playlistName}
                            onChange={(e) => setPlaylistName(e.target.value)}
                            autoFocus
                            maxLength={50}
                        />
                        <div className="char-count">
                            {playlistName.length}/50
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={!playlistName.trim()}
                        >
                            Create Playlist
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePlaylistModal;
