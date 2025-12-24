import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { addToHistory } from '../services/storage';
import { getVideoDetails } from '../services/youtube';

const PlayerContext = createContext();

export const usePlayer = () => {
    const context = useContext(PlayerContext);
    if (!context) {
        throw new Error('usePlayer must be used within PlayerProvider');
    }
    return context;
};

export const PlayerProvider = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState(null);
    const [queue, setQueue] = useState([]);
    const [queueIndex, setQueueIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(100);
    const [quality, setQuality] = useState('small'); // small (lowest), medium, hd720
    const [isFullscreen, setIsFullscreen] = useState(false);
    const playerRef = useRef(null);



    // Load saved state from localStorage
    useEffect(() => {
        const savedTrackRaw = localStorage.getItem('currentTrack');
        const savedQueue = localStorage.getItem('queue');

        if (savedTrackRaw) {
            const parsedTrack = JSON.parse(savedTrackRaw);
            setCurrentTrack(parsedTrack);

            // Fetch fresh details to ensure valid video references
            getVideoDetails(parsedTrack.videoId)
                .then(details => {
                    if (details) {
                        console.log('Refreshed track details for:', details.title);
                        setCurrentTrack(details);
                    }
                })
                .catch(err => console.error('Failed to refresh track details:', err));
        }

        if (savedQueue) {
            setQueue(JSON.parse(savedQueue));
        }
    }, []);

    // Save state to localStorage
    useEffect(() => {
        if (currentTrack) {
            localStorage.setItem('currentTrack', JSON.stringify(currentTrack));
        }
    }, [currentTrack]);

    useEffect(() => {
        if (queue.length > 0) {
            localStorage.setItem('queue', JSON.stringify(queue));
        }
    }, [queue]);

    // Refs for Media Session handlers to avoid stale closures
    const playNextRef = useRef(null);
    const playPreviousRef = useRef(null);
    const playRef = useRef(null);
    const pauseRef = useRef(null);



    // Update Media Session API
    // Update Media Session API
    useEffect(() => {
        if ('mediaSession' in navigator && currentTrack) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: currentTrack.title,
                artist: currentTrack.artist,
                artwork: [
                    { src: currentTrack.customCover || currentTrack.thumbnail, sizes: '512x512', type: 'image/jpeg' },
                ],
            });

            const setHandler = (action, handler) => {
                try {
                    navigator.mediaSession.setActionHandler(action, handler);
                } catch (e) {
                    // Start of Selection
                    console.log(`Media Session action ${action} not supported`);
                }
            };

            setHandler('play', () => playRef.current && playRef.current());
            setHandler('pause', () => pauseRef.current && pauseRef.current());
            setHandler('previoustrack', () => playPreviousRef.current && playPreviousRef.current());
            setHandler('nexttrack', () => playNextRef.current && playNextRef.current());
            setHandler('seekto', (details) => {
                if (details.seekTime && playerRef.current && playerRef.current.seekTo) {
                    playerRef.current.seekTo(details.seekTime, true);
                    setCurrentTime(details.seekTime);
                }
            });
        }
    }, [currentTrack]);

    // Update playback state for Media Session
    useEffect(() => {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
        }
    }, [isPlaying]);

    const playTrack = (track, newQueue = null) => {
        console.log('playTrack called with:', track.title);
        console.log('Queue provided:', newQueue ? newQueue.length + ' tracks' : 'none');
        setCurrentTrack(track);
        setIsPlaying(true);

        if (newQueue) {
            console.log('Setting queue with', newQueue.length, 'tracks');
            setQueue(newQueue);
            const index = newQueue.findIndex(t => t.videoId === track.videoId);
            setQueueIndex(index >= 0 ? index : 0);
            console.log('Queue index set to:', index >= 0 ? index : 0);
        }

        // Try to play immediately if player is ready
        if (playerRef.current && playerRef.current.loadVideoById) {
            try {
                playerRef.current.loadVideoById(track.videoId);
                playerRef.current.playVideo();
            } catch (error) {
                console.log('Player not ready yet, will play when ready');
            }
        }

        // Add to history
        addToHistory(track).catch(console.error);
    };

    const play = () => {
        setIsPlaying(true);
        if (playerRef.current && playerRef.current.playVideo) {
            try {
                playerRef.current.playVideo();
            } catch (error) {
                console.log('Player not ready yet');
            }
        }
    };

    const pause = () => {
        setIsPlaying(false);
        if (playerRef.current && playerRef.current.pauseVideo) {
            try {
                playerRef.current.pauseVideo();
            } catch (error) {
                console.log('Player not ready yet');
            }
        }
    };

    const togglePlayPause = () => {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    };

    const playNext = () => {
        console.log('playNext called, queue length:', queue.length);
        if (queue.length === 0) {
            console.log('Queue is empty, cannot play next');
            return;
        }

        const nextIndex = (queueIndex + 1) % queue.length;
        console.log('Moving from index', queueIndex, 'to', nextIndex);
        console.log('Next track:', queue[nextIndex]?.title);
        setQueueIndex(nextIndex);
        setCurrentTrack(queue[nextIndex]);
        setIsPlaying(true);
        addToHistory(queue[nextIndex]).catch(console.error);
    };

    const playPrevious = () => {
        if (queue.length === 0) return;

        const prevIndex = queueIndex === 0 ? queue.length - 1 : queueIndex - 1;
        setQueueIndex(prevIndex);
        setCurrentTrack(queue[prevIndex]);
        setIsPlaying(true);
        addToHistory(queue[prevIndex]).catch(console.error);
    };

    const seekTo = (time) => {
        if (playerRef.current && playerRef.current.seekTo) {
            playerRef.current.seekTo(time, true);
            setCurrentTime(time);
        }
    };

    const setPlayerVolume = (vol) => {
        setVolume(vol); // Store linear value (0-100)
        if (playerRef.current && playerRef.current.setVolume) {
            // Convert linear slider position to logarithmic volume for natural perception
            const logVolume = vol === 0 ? 0 : Math.round((Math.exp((vol / 100) * 2) - 1) / (Math.exp(2) - 1) * 100);
            playerRef.current.setVolume(logVolume);
        }
    };

    const addToQueue = (track) => {
        setQueue(prev => [...prev, track]);
    };

    const removeFromQueue = (index) => {
        setQueue(prev => prev.filter((_, i) => i !== index));
    };

    const clearQueue = () => {
        setQueue([]);
        setQueueIndex(0);
    };

    useEffect(() => {
        playNextRef.current = playNext;
        playPreviousRef.current = playPrevious;
        playRef.current = play;
        pauseRef.current = pause;
    }, [playNext, playPrevious, play, pause]);

    const value = {
        currentTrack,
        queue,
        queueIndex,
        isPlaying,
        currentTime,
        duration,
        volume,
        quality,
        playerRef,
        playTrack,
        play,
        pause,
        togglePlayPause,
        playNext,
        playPrevious,
        seekTo,
        setCurrentTime,
        setDuration,
        setPlayerVolume,
        setQuality,
        addToQueue,
        removeFromQueue,
        clearQueue,
        isFullscreen,
        setIsFullscreen,
    };

    return (
        <PlayerContext.Provider value={value}>
            {children}
        </PlayerContext.Provider>
    );
};
