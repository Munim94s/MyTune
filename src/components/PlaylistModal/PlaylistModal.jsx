import { useState, useRef, useEffect } from 'react';
import { X, ListPlus, Check, Search, Music } from 'lucide-react';
import gsap from 'gsap';
import './PlaylistModal.css';

const PlaylistModal = ({ onClose, track, playlists, onAddToPlaylist, isOpen = true }) => {
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        if (isOpen) {
            // Animate In
            gsap.killTweensOf(container);
            gsap.fromTo(container,
                { scale: 0.95, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.2)' }
            );
        } else {
            // External Close (e.g. Backdrop Click)
            // We still need this because if backdrop is clicked, isOpen becomes false immediately from parent
            gsap.killTweensOf(container);
            gsap.to(container, {
                scale: 0.95,
                opacity: 0,
                duration: 0.2,
                ease: 'power2.in'
            });
        }
    }, [isOpen]);

    const handleClose = (e) => {
        e?.stopPropagation();

        // Manual Close (Internal Button)
        // Animate out first, then notify parent
        const container = containerRef.current;

        if (container) {
            gsap.to(container, {
                scale: 0.95,
                opacity: 0,
                duration: 0.2,
                ease: 'power2.in',
                onComplete: () => {
                    onClose();
                }
            });
        } else {
            onClose();
        }
    };



    const filteredPlaylists = playlists.filter(playlist =>
        playlist.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddToPlaylist = (playlist) => {
        onAddToPlaylist(playlist.id, track);
        setSelectedPlaylist(playlist.id);

        // Show success briefly then close
        setTimeout(() => {
            handleClose();
        }, 800);
    };

    return (
        <div className="playlist-modal-wrapper" ref={containerRef}>
            <div className="playlist-modal-header">
                <h2>
                    <ListPlus size={24} />
                    Add to Playlist
                </h2>
                <button className="playlist-modal-close-btn" onClick={handleClose}>
                    <X size={24} />
                </button>
            </div>

            <div className="playlist-modal-body">
                {/* Track Info */}
                <div className="playlist-track-info">
                    <img
                        src={track.customCover || track.thumbnail}
                        alt={track.title}
                        className="playlist-track-cover"
                    />
                    <div className="playlist-track-details">
                        <span className="playlist-track-title">{track.title}</span>
                        <span className="playlist-track-artist">{track.artist}</span>
                    </div>
                </div>

                {/* Search */}
                <div className="playlist-search-container">
                    <Search size={18} className="playlist-search-icon" />
                    <input
                        type="text"
                        placeholder="Search playlists..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="playlist-search-input"
                        autoFocus
                    />
                </div>

                {/* List */}
                <div className="playlist-list-container">
                    {filteredPlaylists.length === 0 ? (
                        <div className="playlist-empty-state">
                            <p>No playlists found</p>
                        </div>
                    ) : (
                        filteredPlaylists.map((playlist) => (
                            <button
                                key={playlist.id}
                                className={`playlist-item ${selectedPlaylist === playlist.id ? 'added' : ''}`}
                                onClick={() => handleAddToPlaylist(playlist)}
                                disabled={selectedPlaylist === playlist.id}
                            >
                                <div className="playlist-item-left">
                                    <div className="playlist-item-icon">
                                        <Music size={20} />
                                    </div>
                                    <div className="playlist-item-info">
                                        <span className="playlist-item-name">{playlist.name}</span>
                                        <span className="playlist-item-count">
                                            {playlist.tracks?.length || 0} tracks
                                        </span>
                                    </div>
                                </div>
                                {selectedPlaylist === playlist.id && (
                                    <Check size={20} className="playlist-item-check" />
                                )}
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlaylistModal;
