import { useEffect, useRef, useState } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import './Scrollbar.css';

const Scrollbar = () => {
    const { isFullscreen } = usePlayer();
    const thumbRef = useRef(null);
    const trackRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (!thumbRef.current || !trackRef.current) return;

        const updatePosition = () => {
            const scrollTop = window.scrollY;
            const scrollHeight = document.documentElement.scrollHeight;
            const windowHeight = window.innerHeight;
            const limit = scrollHeight - windowHeight;

            if (limit <= 0) {
                thumbRef.current.style.display = 'none';
                return;
            } else {
                thumbRef.current.style.display = 'block';
            }

            const progress = scrollTop / limit;
            const trackHeight = trackRef.current.clientHeight;
            const thumbHeight = thumbRef.current.clientHeight;
            const availableSpace = trackHeight - thumbHeight;

            // Calculate position
            const y = Math.min(Math.max(progress * availableSpace, 0), availableSpace);

            thumbRef.current.style.transform = `translate3d(0, ${y}px, 0)`;
        };

        // Scroll event listener
        window.addEventListener('scroll', updatePosition);
        window.addEventListener('resize', updatePosition);

        // Initial update
        updatePosition();

        return () => {
            window.removeEventListener('scroll', updatePosition);
            window.removeEventListener('resize', updatePosition);
        };
    }, []);

    if (isFullscreen) {
        return null;
    }

    return (
        <div
            className={`c-scrollbar ${isHovered ? 'is-hovered' : ''}`}
            ref={trackRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="c-scrollbar_thumb" ref={thumbRef} />
        </div>
    );
};

export default Scrollbar;
