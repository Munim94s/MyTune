import { Play, Heart, MoreVertical, Trash2, ListPlus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { formatDuration } from '../../utils/formatters';
import { extractDominantColor } from '../../utils/imageProcessing';
import { deleteTrack, trackExists } from '../../services/storage';
import { useModal } from '../../context/ModalContext';
import PlaylistModal from '../PlaylistModal/PlaylistModal';
import './TrackCard.css';

const TrackCard = ({ track, onDelete, showDelete = false, onSelect, playlists = [], onAddToPlaylist, contextQueue = null }) => {
    const { showCustom } = useModal();
    const { playTrack } = usePlayer();
    const [glowColor, setGlowColor] = useState('rgb(99, 102, 241)');

    const [isSelected, setIsSelected] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        const coverUrl = track.customCover || track.thumbnail;

        // Preload image
        const img = new Image();
        img.onload = () => {
            setImageLoaded(true);
        };
        img.src = coverUrl;

        extractDominantColor(coverUrl).then(setGlowColor);
    }, [track]);

    const handlePlay = (e) => {
        e.stopPropagation(); // Prevent card click
        playTrack(track, contextQueue || [track]);
    };

    const handleCardClick = () => {
        // On mobile (touch devices), play the track directly
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            playTrack(track, contextQueue || [track]);
        } else {
            // On desktop, just select
            setIsSelected(!isSelected);
            if (onSelect) {
                onSelect(track);
            }
        }
    };

    const handleDelete = async (e) => {
        e.stopPropagation();
        if (confirm(`Remove "${track.title}" from library?`)) {
            await deleteTrack(track.videoId);
            if (onDelete) onDelete(track.videoId);
        }
    };

    return (
        <div
            className={`track-card ${isSelected ? 'track-card-selected' : ''}`}
            onClick={handleCardClick}
        >
            <div className="track-card-cover-container">
                <div
                    className="track-card-glow"
                    style={{ backgroundColor: glowColor }}
                />
                <img
                    src={track.customCover || track.thumbnail}
                    alt={track.title}
                    className="track-card-cover"
                    style={{
                        opacity: imageLoaded ? 1 : 0,
                        '--img-scale': 1
                    }}
                />

                <div className="track-card-overlay">
                    <button
                        className="track-card-play-btn"
                        onClick={handlePlay}
                        aria-label="Play track"
                    >
                        <Play size={28} fill="white" />
                    </button>
                </div>
            </div>

            <div className="track-card-info">
                <h4 className="track-card-title truncate-2">{track.title}</h4>
                <p className="track-card-artist truncate">{track.artist}</p>

                <div className="track-card-footer">
                    <span className="track-card-duration">
                        {formatDuration(track.duration)}
                    </span>

                    <div className="track-card-actions">
                        <button
                            className="track-card-action-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                showCustom(PlaylistModal, { track, playlists, onAddToPlaylist });
                            }}
                            aria-label="Add to playlist"
                        >
                            <ListPlus size={18} />
                        </button>

                        {showDelete && (
                            <button
                                className="track-card-delete-btn"
                                onClick={handleDelete}
                                aria-label="Delete track"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>


        </div>
    );
};

export default TrackCard;
