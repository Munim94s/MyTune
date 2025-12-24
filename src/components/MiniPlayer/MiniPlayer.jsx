import { usePlayer } from '../../context/PlayerContext';
import { Play, Pause, SkipBack, SkipForward, Volume2, Settings, X, Maximize, Minimize } from 'lucide-react';
import { formatDuration } from '../../utils/formatters';
import { useEffect, useState, useRef } from 'react';
import { extractDominantColor } from '../../utils/imageProcessing';
import gsap from 'gsap';
import './MiniPlayer.css';
import './MiniPlayer-layout-fix.css';
import './MiniPlayer-mobile-fullscreen.css';
import './MiniPlayer-controls.css';

const MiniPlayer = () => {
    const {
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        quality,
        togglePlayPause,
        playNext,
        playPrevious,
        seekTo,
        setPlayerVolume,
        setQuality,
        pause,
        isFullscreen,
        setIsFullscreen,
    } = usePlayer();

    const [isDraggingProgress, setIsDraggingProgress] = useState(false);
    const [dragPreviewProgress, setDragPreviewProgress] = useState(0);
    const [glowColor, setGlowColor] = useState('rgb(99, 102, 241)');
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const [volumeSliderClosing, setVolumeSliderClosing] = useState(false);
    const [showQualityMenu, setShowQualityMenu] = useState(false);
    const [swipeStartY, setSwipeStartY] = useState(0);
    const [swipeCurrentY, setSwipeCurrentY] = useState(0);
    const [isSwiping, setIsSwiping] = useState(false);
    const [isMinimized, setIsMinimized] = useState(true); // Start minimized on page load
    const swipeVelocityRef = useRef(0);
    const lastSwipeTimeRef = useRef(0);

    const miniPlayerRef = useRef(null);
    const volumeHideTimer = useRef(null);
    // Play/Pause Animation
    useEffect(() => {
        // Animate all play buttons (fullscreen and mini) when state changes
        const targets = document.querySelectorAll('.mini-player-btn-play');
        if (targets.length > 0) {
            gsap.fromTo(targets,
                { scale: 0.5, rotate: -45, opacity: 0 },
                { scale: 1, rotate: 0, opacity: 1, duration: 0.4, ease: 'back.out(2)' }
            );
        }
    }, [isPlaying]);

    useEffect(() => {
        if (currentTrack) {
            const coverUrl = currentTrack.customCover || currentTrack.thumbnail;
            extractDominantColor(coverUrl).then(setGlowColor);
        }
    }, [currentTrack]);

    // Reappear when playback starts (even if it's the same song)
    useEffect(() => {
        if (isPlaying && isMinimized) {
            setIsMinimized(false);
        }
    }, [isPlaying, isMinimized]);

    // Animate when appearing
    useEffect(() => {
        if (!isMinimized && miniPlayerRef.current) {
            gsap.fromTo(miniPlayerRef.current,
                { y: 100, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
            );
        }
    }, [isMinimized]);

    // Attach drag listener directly to DOM

    const volumeRef = useRef(volume);

    useEffect(() => {
        volumeRef.current = volume;
    }, [volume]);

    // Prevent page scroll on volume controls using native listeners
    useEffect(() => {
        const handleWheel = (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -5 : 5;
            // Adjust volume linearly using ref to avoid stale closure without re-binding
            const currentVol = volumeRef.current;
            const newVolume = Math.max(0, Math.min(100, currentVol + delta));
            setPlayerVolume(newVolume);
        };

        // Select all potential volume areas
        const elements = document.querySelectorAll('.mini-player-volume-section, .volume-control-mobile, .volume-slider-popup, .volume-icon, .volume-bar, .volume-bar-vertical');

        elements.forEach(el => {
            el.addEventListener('wheel', handleWheel, { passive: false });
        });

        return () => {
            elements.forEach(el => {
                el.removeEventListener('wheel', handleWheel);
            });
        };
    }, [showVolumeSlider, isMinimized, isFullscreen, setPlayerVolume]); // Re-bind when layout changes

    // Control locomotive scroll based on fullscreen state
    useEffect(() => {
        const scrollContext = document.querySelector('[data-scroll-container]');
        if (scrollContext) {
            if (isFullscreen) {
                // Disable scrolling when fullscreen
                document.body.style.overflow = 'hidden';
            } else {
                // Re-enable scrolling when not fullscreen
                document.body.style.overflow = '';
            }
        }
    }, [isFullscreen]);

    if (!currentTrack) return null;

    const handleSeek = (e) => {
        console.log('onClick fired!');
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX || (e.touches && e.touches[0]?.clientX) || (e.changedTouches && e.changedTouches[0]?.clientX);
        if (!x) return;

        const percentage = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
        const newTime = percentage * duration;
        seekTo(newTime);
    };

    const handleSeekDrag = (e) => {
        e.preventDefault();
        const element = e.currentTarget;
        console.log('Seek drag started');

        setIsDraggingProgress(true);
        let lastTime = 0;

        const updateSeek = (event) => {
            console.log('Updating seek preview position');
            const rect = element.getBoundingClientRect();
            const x = event.clientX || (event.touches && event.touches[0]?.clientX);
            if (!x) return;

            const percentage = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
            const newTime = percentage * duration;
            lastTime = newTime;
            // Only update visual preview, don't seek yet
            setDragPreviewProgress(percentage * 100);
        };

        const stopDrag = (event) => {
            console.log('Drag stopped - seeking to final position');
            setIsDraggingProgress(false);
            // Only seek when drag ends
            if (lastTime !== undefined) {
                seekTo(lastTime);
            }
            document.removeEventListener('mousemove', updateSeek);
            document.removeEventListener('mouseup', stopDrag);
            document.removeEventListener('touchmove', updateSeek);
            document.removeEventListener('touchend', stopDrag);
        };

        document.addEventListener('mousemove', updateSeek);
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchmove', updateSeek);
        document.addEventListener('touchend', stopDrag);

        updateSeek(e);
    };

    const handleVolumeChange = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX || (e.touches && e.touches[0]?.clientX) || (e.changedTouches && e.changedTouches[0]?.clientX);
        if (!x) return;

        const percentage = Math.max(0, Math.min(100, ((x - rect.left) / rect.width) * 100));
        setPlayerVolume(percentage);
    };

    const handleVolumeDrag = (e) => {
        e.preventDefault();
        const element = e.currentTarget;
        const updateVolume = (event) => {
            const rect = element.getBoundingClientRect();
            const x = event.clientX || (event.touches && event.touches[0]?.clientX);
            if (!x) return;

            const percentage = Math.max(0, Math.min(100, ((x - rect.left) / rect.width) * 100));
            setPlayerVolume(percentage);
        };

        const stopDrag = () => {
            document.removeEventListener('mousemove', updateVolume);
            document.removeEventListener('mouseup', stopDrag);
            document.removeEventListener('touchmove', updateVolume);
            document.removeEventListener('touchend', stopDrag);
        };

        document.addEventListener('mousemove', updateVolume);
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchmove', updateVolume);
        document.addEventListener('touchend', stopDrag);

        updateVolume(e);
    };

    const handleVolumeMouseEnter = () => {
        // Clear any existing timer
        if (volumeHideTimer.current) {
            clearTimeout(volumeHideTimer.current);
        }
        setVolumeSliderClosing(false);
        setShowVolumeSlider(true);
    };

    const handleVolumeMouseLeave = () => {
        // Set timer to start closing animation after 0.35 seconds
        volumeHideTimer.current = setTimeout(() => {
            setVolumeSliderClosing(true);
            // Then hide after animation completes (0.2s)
            setTimeout(() => {
                setShowVolumeSlider(false);
                setVolumeSliderClosing(false);
            }, 200);
        }, 350);
    };

    const handleQualityChange = (newQuality) => {
        setQuality(newQuality);
        setShowQualityMenu(false);
    };

    const handleClose = () => {
        // Animate out
        if (miniPlayerRef.current) {
            gsap.to(miniPlayerRef.current, {
                y: 100,
                opacity: 0,
                duration: 0.3,
                ease: 'power2.in',
                onComplete: () => {
                    setIsMinimized(true);
                    pause(); // Stop playback
                }
            });
        } else {
            setIsMinimized(true);
            pause();
        }
    };

    const handleFullscreen = () => {
        const newFullscreenState = !isFullscreen;
        const overlay = document.querySelector('.fullscreen-cover-overlay');

        if (newFullscreenState) {
            // Opening fullscreen - slide down from top
            setIsFullscreen(true);
            document.body.style.overflow = 'hidden';

            // Wait for DOM to render, then animate
            requestAnimationFrame(() => {
                const overlayElement = document.querySelector('.fullscreen-cover-overlay');
                if (overlayElement) {
                    gsap.fromTo(overlayElement,
                        { y: '100vh' },
                        { y: 0, duration: 0.4, ease: 'power2.out' }
                    );
                }
            });
        } else {
            // Closing fullscreen - slide down (matching swipe gesture)
            if (overlay) {
                gsap.to(overlay, {
                    y: '100vh',
                    duration: 0.3,
                    ease: 'power2.in',
                    onComplete: () => {
                        setIsFullscreen(false);
                        document.body.style.overflow = '';
                    }
                });
            } else {
                setIsFullscreen(false);
                document.body.style.overflow = '';
            }
        }
    };

    // Swipe gesture handlers for mobile - drag to dismiss
    const handleTouchStart = (e) => {
        setSwipeStartY(e.touches[0].clientY);
        setIsSwiping(true);
        lastSwipeTimeRef.current = Date.now();
        swipeVelocityRef.current = 0;
    };

    const handleTouchMove = (e) => {
        if (!isSwiping) return;
        const currentY = e.touches[0].clientY;
        const now = Date.now();
        const timeDelta = now - lastSwipeTimeRef.current;

        // Calculate velocity (pixels per millisecond)
        if (timeDelta > 0) {
            const distance = currentY - swipeCurrentY;
            swipeVelocityRef.current = distance / timeDelta;
        }

        setSwipeCurrentY(currentY);
        lastSwipeTimeRef.current = now;

        const swipeDistance = currentY - swipeStartY;

        // Only allow downward swipes
        if (swipeDistance > 0) {
            const overlay = document.querySelector('.fullscreen-cover-overlay');
            if (overlay) {
                // Use gsap.set for instant response during drag
                gsap.set(overlay, { y: swipeDistance });
            }
        }
    };

    const handleTouchEnd = () => {
        if (!isSwiping) return;

        const swipeDistance = swipeCurrentY - swipeStartY;
        const overlay = document.querySelector('.fullscreen-cover-overlay');
        const velocity = swipeVelocityRef.current;

        // If swiped down more than 100px, close fullscreen (more sensitive)
        if (swipeDistance > 100) {
            if (overlay) {
                // Animate out - slide down with ease-in
                gsap.to(overlay, {
                    y: '100vh',
                    duration: 0.3,
                    ease: 'power2.in',
                    onComplete: () => {
                        setIsFullscreen(false);
                        document.body.style.overflow = '';
                    }
                });
            } else {
                setIsFullscreen(false);
                document.body.style.overflow = '';
            }
        } else {
            // Snap back with velocity consideration
            if (overlay) {
                // Use velocity to determine duration - faster swipe = quicker snap
                const baseDuration = 0.3;
                const velocityFactor = Math.min(Math.abs(velocity) * 100, 0.2);
                const duration = Math.max(baseDuration - velocityFactor, 0.15);

                gsap.to(overlay, {
                    y: 0,
                    duration: duration,
                    ease: 'power2.out',
                    overwrite: true
                });
            }
        }

        setIsSwiping(false);
        setSwipeStartY(0);
        setSwipeCurrentY(0);
        swipeVelocityRef.current = 0;
    };

    const progress = isDraggingProgress
        ? dragPreviewProgress
        : (duration > 0 ? (currentTime / duration) * 100 : 0);

    // Volume is now stored linearly, use directly for slider position
    const volumePosition = volume;

    const qualityOptions = [
        { value: 'hd720', label: 'High (720p)' },
        { value: 'medium', label: 'Medium (360p)' },
        { value: 'small', label: 'Low (240p)' },
    ];

    return (
        <>
            {/* Fullscreen Cover Overlay */}
            {isFullscreen && (
                <div
                    className="fullscreen-cover-overlay"
                    style={{ background: glowColor }}
                >
                    <button
                        className="fullscreen-cover-close"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleFullscreen();
                        }}
                        aria-label="Exit fullscreen"
                    >
                        <X size={24} />
                    </button>

                    {/* Swipeable container for indicator and cover */}
                    <div
                        className="fullscreen-swipeable-area"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        {/* Swipe indicator for mobile */}
                        <div className="fullscreen-swipe-indicator"></div>

                        <img
                            src={currentTrack.customCover || currentTrack.thumbnail}
                            alt={currentTrack.title}
                            style={{ '--img-scale': 1 }}
                        />
                    </div>

                    {/* Mini-player overlay at bottom of fullscreen */}
                    <div className="fullscreen-mini-player" onClick={(e) => e.stopPropagation()}>
                        <div className="mini-player-content">
                            {/* Right side: 2 rows */}
                            <div className="mini-player-right">
                                {/* Row 1: Track Info */}
                                <div className="mini-player-info">
                                    <div className="mini-player-title truncate">{currentTrack.title}</div>
                                    <div className="mini-player-artist truncate">{currentTrack.artist}</div>
                                </div>

                                {/* Row 2: Controls row */}
                                <div className="mini-player-controls-row">
                                    {/* Progress Bar */}
                                    <div className="mini-player-progress-section">
                                        <span className="mini-player-time">{formatDuration(currentTime)}</span>

                                        <div
                                            className="mini-player-progress-bar"
                                            onClick={handleSeek}
                                            onMouseDown={handleSeekDrag}
                                            onTouchStart={handleSeekDrag}
                                        >
                                            <div
                                                className="mini-player-progress-fill"
                                                style={{ width: `${progress}% ` }}
                                            />
                                        </div>

                                        <span className="mini-player-time">{formatDuration(duration)}</span>
                                    </div>

                                    {/* Controls */}
                                    <div className="mini-player-controls">
                                        <button
                                            className="mini-player-btn"
                                            onClick={playPrevious}
                                            aria-label="Previous track"
                                        >
                                            <SkipBack size={20} />
                                        </button>

                                        <button
                                            className="mini-player-btn mini-player-btn-play"
                                            onClick={togglePlayPause}
                                            aria-label={isPlaying ? 'Pause' : 'Play'}
                                        >
                                            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                                        </button>

                                        <button
                                            className="mini-player-btn"
                                            onClick={playNext}
                                            aria-label="Next track"
                                        >
                                            <SkipForward size={20} />
                                        </button>
                                    </div>

                                    {/* Volume Control */}
                                    <div className="mini-player-volume-section">
                                        <Volume2
                                            size={18}
                                            className="volume-icon"
                                            style={{ cursor: 'pointer' }}
                                        />
                                        <div
                                            className="volume-bar"
                                            onClick={handleVolumeChange}
                                            onMouseDown={handleVolumeDrag}
                                            onTouchStart={handleVolumeDrag}
                                        >
                                            <div
                                                className="volume-fill"
                                                style={{ width: `${volumePosition}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Quality Control */}
                                    <div className="quality-control">
                                        <button
                                            className="mini-player-btn"
                                            onClick={() => setShowQualityMenu(!showQualityMenu)}
                                            aria-label="Quality settings"
                                        >
                                            <Settings size={20} />
                                        </button>
                                        {showQualityMenu && (
                                            <div className="quality-menu">
                                                {qualityOptions.map(option => (
                                                    <button
                                                        key={option.value}
                                                        className={`quality - option ${quality === option.value ? 'active' : ''} `}
                                                        onClick={() => handleQualityChange(option.value)}
                                                    >
                                                        {option.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Mini Player - Conditionally Visible */}
            {!isMinimized && (
                <div
                    ref={miniPlayerRef}
                    className="mini-player"
                    style={{ '--progress': `${progress}%` }}
                    onClick={(e) => {
                        // Disable fullscreen on mobile
                        // On mobile, tap mini player does nothing
                    }}
                >
                    <div className="mini-player-content">
                        {/* Album Art with Glow */}
                        <div className="mini-player-cover-container">
                            <div
                                className="mini-player-glow"
                                style={{ backgroundColor: glowColor }}
                            />
                            <img
                                src={currentTrack.customCover || currentTrack.thumbnail}
                                alt={currentTrack.title}
                                className="mini-player-cover"
                                style={{ '--img-scale': 1 }}
                            />
                        </div>

                        {/* Right side: 2 rows */}
                        <div className="mini-player-right">
                            {/* Row 1: Track Info */}
                            <div className="mini-player-info">
                                <div className="mini-player-title truncate">{currentTrack.title}</div>
                                <div className="mini-player-artist truncate">{currentTrack.artist}</div>
                            </div>

                            {/* Window Controls - Desktop only */}
                            {window.innerWidth > 768 && (
                                <div className="mini-player-window-controls">
                                    <button
                                        className="mini-player-btn window-control-btn"
                                        onClick={handleFullscreen}
                                        aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                                    >
                                        {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                                    </button>
                                    <button
                                        className="mini-player-btn window-control-btn"
                                        onClick={handleClose}
                                        aria-label="Close"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            )}


                            {/* Row 2: Controls row - Desktop only */}
                            {window.innerWidth > 768 && (
                                <div className="mini-player-controls-row">
                                    {/* Progress Bar */}
                                    <div className="mini-player-progress-section">
                                        <span className="mini-player-time">{formatDuration(currentTime)}</span>

                                        <div
                                            className="mini-player-progress-bar"
                                            onClick={handleSeek}
                                            onMouseDown={handleSeekDrag}
                                            onTouchStart={handleSeekDrag}
                                        >
                                            <div
                                                className="mini-player-progress-fill"
                                                style={{ width: `${progress}% ` }}
                                            />
                                        </div>

                                        <span className="mini-player-time">{formatDuration(duration)}</span>
                                    </div>

                                    {/* Controls - Center */}
                                    <div className="mini-player-controls">
                                        <button
                                            className="mini-player-btn"
                                            onClick={playPrevious}
                                            aria-label="Previous track"
                                        >
                                            <SkipBack size={20} />
                                        </button>

                                        <button
                                            className="mini-player-btn mini-player-btn-play"
                                            onClick={togglePlayPause}
                                            aria-label={isPlaying ? 'Pause' : 'Play'}
                                        >
                                            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                                        </button>

                                        <button
                                            className="mini-player-btn"
                                            onClick={playNext}
                                            aria-label="Next track"
                                        >
                                            <SkipForward size={20} />
                                        </button>

                                        {/* Quality Control */}
                                        <div className="quality-control">
                                            <button
                                                className="mini-player-btn"
                                                onClick={() => setShowQualityMenu(!showQualityMenu)}
                                                aria-label="Quality settings"
                                            >
                                                <Settings size={20} />
                                            </button>
                                            {showQualityMenu && (
                                                <div className="quality-menu">
                                                    {qualityOptions.map(option => (
                                                        <button
                                                            key={option.value}
                                                            className={`quality - option ${quality === option.value ? 'active' : ''} `}
                                                            onClick={() => handleQualityChange(option.value)}
                                                        >
                                                            {option.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Volume Control - Right Side */}
                                    <div className="mini-player-volume-section">
                                        <Volume2
                                            size={18}
                                            className="volume-icon"
                                            style={{ cursor: 'pointer' }}
                                        />
                                        <div
                                            className="volume-bar"
                                            onClick={handleVolumeChange}
                                            onMouseDown={handleVolumeDrag}
                                            onTouchStart={handleVolumeDrag}
                                        >
                                            <div
                                                className="volume-fill"
                                                style={{ width: `${volumePosition}%` }}
                                            />
                                        </div>

                                        {/* Mobile: Vertical popup */}
                                        <div
                                            className="volume-control-mobile"
                                            onMouseEnter={handleVolumeMouseEnter}
                                            onMouseLeave={handleVolumeMouseLeave}
                                        >
                                            <button
                                                className="mini-player-btn"
                                                aria-label="Volume"
                                            >
                                                <Volume2 size={20} />
                                            </button>
                                            {showVolumeSlider && (
                                                <div
                                                    className={`volume-slider-popup ${volumeSliderClosing ? 'closing' : ''}`}
                                                    onMouseEnter={handleVolumeMouseEnter}
                                                    onMouseLeave={handleVolumeMouseLeave}
                                                >
                                                    <div
                                                        className="volume-bar-vertical"
                                                        onClick={handleVolumeChange}
                                                        onMouseDown={handleVolumeDrag}
                                                        onTouchStart={handleVolumeDrag}
                                                    >
                                                        <div
                                                            className="volume-fill-vertical"
                                                            style={{ height: `${volumePosition}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MiniPlayer;
