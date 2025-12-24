import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Plus, Folder, Loader } from 'lucide-react';
import { getHistory, updateTrackCover, getPlaylists, createPlaylist, addToPlaylist } from '../../services/storage';
import { compressImage, blobToDataURL } from '../../utils/imageProcessing';
import { useModal } from '../../context/ModalContext';
import TrackCard from '../../components/TrackCard/TrackCard';
import CreatePlaylistModal from '../../components/CreatePlaylistModal/CreatePlaylistModal';
import './Library.css';

const Library = () => {
    const navigate = useNavigate();
    const { showAlert } = useModal();
    const [tracks, setTracks] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [selectedTrack, setSelectedTrack] = useState(null);
    const [showCoverModal, setShowCoverModal] = useState(false);
    const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const loader = useRef(null);

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !loading && !loadingMore && hasMore) {
                loadMoreHistory();
            }
        }, { threshold: 1.0 });

        if (loader.current) {
            observer.observe(loader.current);
        }

        return () => {
            if (loader.current) {
                observer.unobserve(loader.current);
            }
        };
    }, [loading, loadingMore, hasMore]); // Re-create observer when loading/hasMore changes

    const loadInitialData = async () => {
        setLoading(true);
        try {
            const [historyData, playlistsData] = await Promise.all([
                getHistory(1, 21),
                getPlaylists()
            ]);

            setTracks(historyData);
            setPlaylists(playlistsData);
            setHasMore(historyData.length === 21); // If less than limit, no more pages
        } catch (error) {
            console.error('Error loading library:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMoreHistory = async () => {
        if (loadingMore) return;
        setLoadingMore(true);
        try {
            const nextPage = page + 1;
            const newTracks = await getHistory(nextPage, 21);

            if (newTracks.length > 0) {
                setTracks(prev => [...prev, ...newTracks]);
                setPage(nextPage);
                setHasMore(newTracks.length === 21);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error loading more history:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleTrackDelete = (videoId) => {
        setTracks(prev => prev.filter(t => t.videoId !== videoId));
    };

    const handleCustomCover = (track) => {
        setSelectedTrack(track);
        setShowCoverModal(true);
    };

    const handleCoverUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const compressedUrl = await compressImage(file);
            const dataUrl = await blobToDataURL(compressedUrl);

            await updateTrackCover(selectedTrack.videoId, dataUrl);

            // Update local state
            setTracks(prev => prev.map(t =>
                t.videoId === selectedTrack.videoId
                    ? { ...t, customCover: dataUrl }
                    : t
            ));

            setShowCoverModal(false);
            setSelectedTrack(null);
            setImageUrl('');
        } catch (error) {
            console.error('Error uploading cover:', error);
            showAlert('Failed to upload cover', 'error');
        }
    };

    const handleUrlSubmit = async () => {
        if (!imageUrl.trim()) {
            showAlert('Please enter a valid image URL', 'warning');
            return;
        }

        try {
            // Validate URL format
            new URL(imageUrl);

            // Use the URL directly
            await updateTrackCover(selectedTrack.videoId, imageUrl);

            // Update local state
            setTracks(prev => prev.map(t =>
                t.videoId === selectedTrack.videoId
                    ? { ...t, customCover: imageUrl }
                    : t
            ));

            setShowCoverModal(false);
            setSelectedTrack(null);
            setImageUrl('');
        } catch (error) {
            console.error('Error setting cover from URL:', error);
            showAlert('Failed to set cover. Please check the URL is valid.', 'error');
        }
    };

    const handleCreatePlaylist = async (name) => {
        try {
            const playlist = await createPlaylist(name);
            setPlaylists(prev => [...prev, playlist]);
        } catch (error) {
            console.error('Error creating playlist:', error);
        }
    };

    const handleAddToPlaylist = async (playlistId, track) => {
        try {
            await addToPlaylist(playlistId, track);
            // Reload playlists to show updated track count
            const updatedPlaylists = await getPlaylists();
            setPlaylists(updatedPlaylists);
        } catch (error) {
            console.error('Error adding to playlist:', error);
        }
    };

    if (loading) {
        return (
            <div className="loading-state" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                color: 'var(--text-secondary)'
            }}>
                <Loader className="spin" size={40} />
                <p style={{ marginTop: '1rem' }}>Loading library...</p>
            </div>
        );
    }

    return (
        <div className="page library-page animate-stagger">
            <div className="page-header">
                <h1 className="page-title">My Library</h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    {tracks.length} track{tracks.length !== 1 ? 's' : ''} in history
                </p>
            </div>

            {/* Playlists Section */}
            <div className="playlists-section">
                <div className="section-header">
                    <h2>Playlists</h2>
                    <button className="btn btn-secondary" onClick={() => setShowCreatePlaylistModal(true)}>
                        <Plus size={20} />
                        New Playlist
                    </button>
                </div>

                {playlists.length > 0 ? (
                    <div className="playlists-grid animate-stagger">
                        {playlists.map(playlist => (
                            <div
                                key={playlist.id}
                                className="playlist-card glass"
                                onClick={() => navigate(`/playlist/${playlist.id}`)}
                                style={{ cursor: 'pointer' }}
                            >
                                <Folder size={32} />
                                <h3>{playlist.name}</h3>
                                <p>{playlist.tracks.length} tracks</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="empty-state">No playlists yet. Create one to organize your music!</p>
                )}
            </div>

            <div className="divider" />

            {/* Tracks Section */}
            <div className="tracks-section">
                <h2>Recently Played</h2>

                {tracks.length > 0 ? (
                    <div className="grid grid-4 animate-stagger">
                        {tracks.map(track => (
                            <div key={track.videoId} className="track-with-actions">
                                <TrackCard
                                    track={track}
                                    showDelete={false}
                                    playlists={playlists}
                                    onAddToPlaylist={handleAddToPlaylist}
                                    contextQueue={tracks}
                                />
                                <button
                                    className="custom-cover-btn"
                                    onClick={() => handleCustomCover(track)}
                                >
                                    <Upload size={16} />
                                    Custom Cover
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    !loading && (
                        <div className="empty-library">
                            <p>No listening history yet</p>
                            <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--spacing-sm)' }}>
                                Play some music to see it here
                            </p>
                            <a href="/search" className="btn btn-primary" style={{ marginTop: 'var(--spacing-lg)' }}>
                                Go to Search
                            </a>
                        </div>
                    )
                )}

                {/* Sentinel for infinite scroll */}
                {(hasMore || loadingMore) && (
                    <div ref={loader} className="loading-state" style={{ padding: '20px', textAlign: 'center' }}>
                        <Loader className="spin" size={24} />
                    </div>
                )}
            </div>

            {/* Cover Upload Modal */}
            {showCoverModal && (
                <div className="modal-overlay" onClick={() => setShowCoverModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Upload Custom Cover</h3>
                        <p>for "{selectedTrack?.title}"</p>

                        <label className="upload-label">
                            <Upload size={32} />
                            <span>Choose Image</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleCoverUpload}
                                style={{ display: 'none' }}
                            />
                        </label>

                        <div className="modal-divider">
                            <span>OR</span>
                        </div>

                        <div className="url-input-section">
                            <input
                                type="text"
                                className="url-input"
                                placeholder="Paste image URL here..."
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleUrlSubmit();
                                    }
                                }}
                            />
                            <button
                                className="btn btn-primary"
                                onClick={handleUrlSubmit}
                                disabled={!imageUrl.trim()}
                            >
                                Set Cover
                            </button>
                        </div>

                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                setShowCoverModal(false);
                                setImageUrl('');
                            }}
                            style={{ marginTop: 'var(--spacing-lg)' }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Create Playlist Modal */}
            <CreatePlaylistModal
                isOpen={showCreatePlaylistModal}
                onClose={() => setShowCreatePlaylistModal(false)}
                onCreate={handleCreatePlaylist}
            />
        </div>
    );
};

export default Library;
