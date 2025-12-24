import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Loader } from 'lucide-react';
import { searchVideos } from '../../services/youtube';
import { saveTrack, trackExists, getPlaylists, addToPlaylist } from '../../services/storage';
import { useModal } from '../../context/ModalContext';
import { usePlayer } from '../../context/PlayerContext';
import TrackCard from '../../components/TrackCard/TrackCard';
import './Search.css';

const Search = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [results, setResults] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState('');
    const [nextPageToken, setNextPageToken] = useState('');
    const loader = useRef(null);
    const { playTrack } = usePlayer();
    const { showAlert } = useModal();

    useEffect(() => {
        loadPlaylists();
    }, []);

    // Infinite scroll observer
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !loading && !loadingMore && nextPageToken) {
                loadMore();
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
    }, [loading, loadingMore, nextPageToken, results]); // Re-hook when relevant state changes

    const loadPlaylists = async () => {
        try {
            const data = await getPlaylists();
            setPlaylists(data);
        } catch (error) {
            console.error('Error loading playlists:', error);
        }
    };

    const handleAddToPlaylist = async (playlistId, track) => {
        try {
            await addToPlaylist(playlistId, track);
            loadPlaylists(); // Refresh to update counts
        } catch (error) {
            console.error('Error adding to playlist:', error);
            showAlert('Failed to add to playlist', 'error');
        }
    };

    const search = async (searchQuery) => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        setError('');
        setResults([]); // Clear previous results
        setNextPageToken('');

        try {
            const { items, nextPageToken: token } = await searchVideos(searchQuery);
            setResults(items);
            setNextPageToken(token);
        } catch (err) {
            setError('Failed to search. Please check your API key.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadMore = async () => {
        if (!nextPageToken || loading || loadingMore) return;

        setLoadingMore(true);
        try {
            const { items, nextPageToken: token } = await searchVideos(query, 21, nextPageToken);
            setResults(prev => [...prev, ...items]);
            setNextPageToken(token);
        } catch (err) {
            console.error('Error loading more results:', err);
        } finally {
            setLoadingMore(false);
        }
    };

    // Effect to trigger search when URL query param changes
    useEffect(() => {
        if (query) {
            search(query);
        } else {
            setResults([]); // Clear results if query is empty
        }
    }, [query]);

    const handleSearch = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newQuery = formData.get('q');

        if (newQuery && newQuery.trim()) {
            setSearchParams({ q: newQuery });
        }
    };

    const handleTrackSelect = async (track) => {
        // Just select the track, don't auto-play
        // Auto-save to library when selected
        const exists = await trackExists(track.videoId);
        if (!exists) {
            await saveTrack(track);
        }
    };

    return (
        <div className="page search-page animate-stagger">
            <div className="page-header">
                <h1 className="page-title">Search Music</h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Find your favorite songs on YouTube
                </p>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="search-form">
                <div className="search-input-container">
                    <SearchIcon size={20} className="search-icon" />
                    <input
                        type="text"
                        name="q"
                        placeholder="Search for songs, artists, albums..."
                        defaultValue={query}
                        className="search-input"
                        autoComplete="off"
                    />
                </div>
                <button type="submit" className="btn btn-primary search-btn" disabled={loading && results.length === 0} aria-label="Search">
                    {loading && results.length === 0 ? (
                        <Loader className="spin" size={20} />
                    ) : (
                        <>
                            <SearchIcon size={20} />
                            <span className="search-text">Search</span>
                        </>
                    )}
                </button>
            </form>

            {/* Error Message */}
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {/* Results */}
            {loading && results.length === 0 && (
                <div className="loading-state">
                    <Loader className="spin" size={40} />
                    <p>Searching...</p>
                </div>
            )}

            {results.length > 0 && (
                <div className="search-results">
                    <h2>Results ({results.length}+)</h2>
                    <div className="grid grid-4 animate-stagger">
                        {results.map((track) => (
                            <TrackCard
                                key={track.videoId}
                                track={track}
                                onSelect={handleTrackSelect}
                                playlists={playlists}
                                onAddToPlaylist={handleAddToPlaylist}
                                contextQueue={results}
                            />
                        ))}
                    </div>
                    {/* Infinite scroll sentinel */}
                    {(nextPageToken || loadingMore) && (
                        <div ref={loader} className="loading-state" style={{ padding: '20px', textAlign: 'center' }}>
                            <Loader className="spin" size={24} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Search;
