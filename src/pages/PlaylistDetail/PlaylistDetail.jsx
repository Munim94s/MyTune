import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Shuffle, Repeat, ArrowLeft, Trash2 } from 'lucide-react';
import { getPlaylist, getTrack, removeFromPlaylist, deletePlaylist } from '../../services/storage';
import { usePlayer } from '../../context/PlayerContext';
import './PlaylistDetail.css';

const PlaylistDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { playTrack } = usePlayer();
    const [playlist, setPlaylist] = useState(null);
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPlaylist();
    }, [id]);

    const loadPlaylist = async () => {
        try {
            const playlistData = await getPlaylist(parseInt(id));
            if (!playlistData) {
                navigate('/library');
                return;
            }

            setPlaylist(playlistData);
            setTracks(playlistData.tracks);
        } catch (error) {
            console.error('Error loading playlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePlayAll = () => {
        if (tracks.length > 0) {
            playTrack(tracks[0], tracks);
        }
    };

    const handleShuffle = async () => {
        // Permanently shuffle the playlist order
        const shuffled = [...playlist.tracks].sort(() => Math.random() - 0.5);

        // Update playlist in storage
        const { updatePlaylist } = await import('../../services/storage');
        await updatePlaylist(playlist.id, { ...playlist, tracks: shuffled });

        // Reload playlist
        await loadPlaylist();
    };

    const handleRemoveTrack = async (videoId) => {
        await removeFromPlaylist(playlist.id, videoId);
        setTracks(prev => prev.filter(t => t.videoId !== videoId));
        setPlaylist(prev => ({
            ...prev,
            tracks: prev.tracks.filter(id => id !== videoId)
        }));
    };

    const handleDeletePlaylist = async () => {
        if (confirm(`Delete playlist "${playlist.name}"?`)) {
            await deletePlaylist(playlist.id);
            navigate('/library');
        }
    };

    if (loading) return null;
    if (!playlist) return null;

    // Create cover mosaic from first 4 tracks (always show 4, use placeholder if needed)
    const coverTracks = [...tracks.slice(0, 4)];
    while (coverTracks.length < 4) {
        coverTracks.push(null); // Add null for empty slots
    }

    return (
        <div className="page playlist-detail-page animate-stagger">
            <button className="back-btn" onClick={() => navigate('/library')}>
                <ArrowLeft size={20} />
                Back to Library
            </button>

            <div className="playlist-header">
                <div className="playlist-cover-mosaic">
                    {coverTracks.map((track, index) => (
                        track ? (
                            <div key={index} className="mosaic-item-wrapper">
                                <img
                                    src={track.customCover || track.thumbnail}
                                    alt=""
                                    className="mosaic-item"
                                    style={{ transform: !track.customCover ? 'scale(1.34)' : 'none' }}
                                />
                            </div>
                        ) : (
                            <div key={index} className="mosaic-empty-slot" />
                        )
                    ))}
                </div>

                <div className="playlist-info">
                    <h1>{playlist.name}</h1>
                    <p>{tracks.length} track{tracks.length !== 1 ? 's' : ''}</p>

                    <div className="playlist-actions">
                        <div className="playlist-actions-left">
                            <button
                                className="playlist-action-btn playlist-delete-btn"
                                onClick={handleDeletePlaylist}
                                aria-label="Delete playlist"
                            >
                                <Trash2 size={20} />
                            </button>

                            <button
                                className="playlist-action-btn playlist-shuffle-btn"
                                onClick={handleShuffle}
                                disabled={tracks.length === 0}
                                aria-label="Shuffle"
                            >
                                <Shuffle size={20} />
                            </button>
                        </div>

                        <button
                            className="playlist-action-btn playlist-play-btn"
                            onClick={handlePlayAll}
                            disabled={tracks.length === 0}
                            aria-label="Play all"
                        >
                            <Play size={28} fill="white" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="playlist-tracks">
                <h2>Tracks</h2>
                {tracks.length > 0 ? (
                    <div className="track-list animate-stagger">
                        {tracks.map((track, index) => (
                            <div
                                key={track.videoId}
                                className="track-list-item"
                                onClick={() => playTrack(track, tracks)}
                            >
                                <div className="track-list-number">{index + 1}</div>
                                <img
                                    src={track.customCover || track.thumbnail}
                                    alt={track.title}
                                    className="track-list-cover"
                                    style={{ transform: !track.customCover ? 'scale(1.34)' : 'none' }}
                                />
                                <div className="track-list-info">
                                    <div className="track-list-title">{track.title}</div>
                                    <div className="track-list-artist">{track.artist}</div>
                                </div>
                                <button
                                    className="track-list-remove"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveTrack(track.videoId);
                                    }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="empty-state">No tracks in this playlist yet.</p>
                )}
            </div>
        </div>
    );
};

export default PlaylistDetail;
