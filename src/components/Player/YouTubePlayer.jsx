import { useEffect, useRef } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import './YouTubePlayer.css';

let YT;
let player;

const YouTubePlayer = () => {
    const {
        currentTrack,
        isPlaying,
        playerRef,
        quality,
        volume,
        queue,
        queueIndex,
        setCurrentTime,
        setDuration,
        playNext,
        pause,
        togglePlayPause
    } = usePlayer();

    // Use refs to avoid stale closure issues in YouTube callbacks
    const queueRef = useRef(queue);
    const playNextRef = useRef(playNext);
    const isPlayingRef = useRef(isPlaying);
    const playRef = useRef(usePlayer().play); // Get fresh function from hook call if needed, but safe to use from destructuring if stable. 
    // Actually, usePlayer returns stable functions usually, but better to be safe. 
    // Wait, I cannot call hook inside callback.
    // I will use the destructured values 'play' and 'pause' which I assumed are stable or at least I can update ref.
    // The previous code destructured 'togglePlayPause', 'pause'. I need 'play' too.
    const {
        play
    } = usePlayer(); // Need to grab play from context too.

    // Let's rewrite the destructuring part first to include play.
    // Wait, replace_file_content replaces a block. I need to make sure I include 'play' in the destructuring if I use it.
    // The original destructuring didn't include 'play'.

    // I will use togglePlayPause which is available.
    // But implementation plan said "Explicitly call play() or pause()".
    // I should probably add 'play' to the destructuring in a separate edit or just use togglePlayPause logic with check.

    // Actually, simpler to just use togglePlayPause but correctly check the REF of isPlaying.
    // If player is PLAYING and isPlayingRef is false -> we need to set isPlaying to true.
    // If player is PAUSED and isPlayingRef is true -> we need to set isPlaying to false.

    // togglePlayPause does: isPlaying ? pause() : play().
    // So if isPlaying is false, it plays. Correct.
    // If isPlaying is true, it pauses. Correct.

    // So using togglePlayPauseRef.current() is correct for synchronization.

    const togglePlayPauseRef = useRef(togglePlayPause);

    useEffect(() => {
        queueRef.current = queue;
    }, [queue]);

    useEffect(() => {
        playNextRef.current = playNext;
    }, [playNext]);

    useEffect(() => {
        togglePlayPauseRef.current = togglePlayPause;
        isPlayingRef.current = isPlaying;
    }, [togglePlayPause, isPlaying]);

    useEffect(() => {
        // Wait for YouTube IFrame API to load
        if (!window.YT) {
            window.onYouTubeIframeAPIReady = initPlayer;
        } else {
            initPlayer();
        }

        return () => {
            if (player) {
                player.destroy();
            }
        };
    }, []);

    const initPlayer = () => {
        YT = window.YT;
        player = new YT.Player('youtube-player', {
            height: '0',
            width: '0',
            playerVars: {
                autoplay: 0,
                controls: 0,
                disablekb: 1,
                fs: 0,
                modestbranding: 1,
                playsinline: 1,
                quality: 'hd720', // Request higher quality for better audio
            },
            events: {
                onReady: onPlayerReady,
                onStateChange: onPlayerStateChange,
            },
        });

        playerRef.current = player;
    };

    const onPlayerReady = (event) => {
        // Player is ready
        if (currentTrack) {
            if (isPlaying) {
                event.target.loadVideoById(currentTrack.videoId);
                event.target.playVideo();
            } else {
                event.target.cueVideoById(currentTrack.videoId);
            }
        }

        // Set initial volume
        if (event.target.setVolume) {
            event.target.setVolume(volume);
        }

        // Update time every second
        setInterval(() => {
            if (player && player.getCurrentTime) {
                setCurrentTime(player.getCurrentTime());
            }
        }, 1000);
    };

    const onPlayerStateChange = (event) => {
        // Update duration when video loads
        if (event.data === YT.PlayerState.PLAYING) {
            setDuration(player.getDuration());
            // Sync state: If internal state says NOT playing, but YT is playing, toggle to true.
            if (!isPlayingRef.current) {
                console.log('Syncing state: Player playing but internal state paused. Toggling.');
                togglePlayPauseRef.current();
            }
        }

        if (event.data === YT.PlayerState.PAUSED) {
            // Sync state: If internal state says PLAYING, but YT is paused, toggle to false.
            if (isPlayingRef.current) {
                // Ignore pause events that happen while seeking or buffering if possible, but distinct pause is clear
                // However, cueVideoById might trigger something? No.
                console.log('Syncing state: Player paused but internal state playing. Toggling.');
                togglePlayPauseRef.current();
            }
        }

        // Auto-play next track when current ends
        if (event.data === YT.PlayerState.ENDED) {
            console.log('Track ended, calling playNext...');
            console.log('Queue ref length:', queueRef.current.length);
            // Use ref to get current playNext function
            playNextRef.current();
        }
    };

    // Load new video when track changes
    useEffect(() => {
        if (player && player.loadVideoById && currentTrack) {
            console.log('Loading new track:', currentTrack.title);
            try {
                if (isPlaying) {
                    player.loadVideoById(currentTrack.videoId);
                    // Always play when track changes (auto-play)
                    setTimeout(() => {
                        if (player && player.playVideo) {
                            console.log('Auto-playing new track');
                            player.playVideo();
                        }
                    }, 100);
                } else {
                    player.cueVideoById(currentTrack.videoId);
                }
            } catch (error) {
                console.error('Error loading video:', error);
            }
        }
    }, [currentTrack]);

    // Handle play/pause state
    useEffect(() => {
        if (player && player.playVideo && player.pauseVideo) {
            try {
                if (isPlaying) {
                    player.playVideo();
                } else {
                    player.pauseVideo();
                }
            } catch (error) {
                console.error('Error changing playback state:', error);
            }
        }
    }, [isPlaying]);

    // Handle quality changes
    useEffect(() => {
        if (player && player.setPlaybackQuality) {
            try {
                player.setPlaybackQuality(quality);
            } catch (error) {
                console.error('Error setting quality:', error);
            }
        }
    }, [quality]);

    // Handle volume changes
    useEffect(() => {
        if (player && player.setVolume) {
            try {
                player.setVolume(volume);
            } catch (error) {
                console.error('Error setting volume:', error);
            }
        }
    }, [volume]);

    return (
        <div className="youtube-player-container">
            <div id="youtube-player"></div>
        </div>
    );
};

export default YouTubePlayer;
