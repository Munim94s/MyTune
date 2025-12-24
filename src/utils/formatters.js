/**
 * Format seconds to MM:SS or HH:MM:SS
 */
export const formatDuration = (seconds) => {
    if (!seconds || seconds < 0) return '0:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format view count (1.2M, 500K, etc.)
 */
export const formatViews = (count) => {
    if (!count) return '0';

    const num = parseInt(count);

    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
    }

    if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`;
    }

    return num.toString();
};

/**
 * Format timestamp to relative time (2 hours ago, 3 days ago)
 */
export const formatRelativeTime = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text, maxLength = 50) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};
