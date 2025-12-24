import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
});

/**
 * Search YouTube videos with music category filter
 */
export const searchVideos = async (query, maxResults = 20, pageToken = '') => {
  try {
    const response = await api.get('/youtube/search', {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        videoCategoryId: '10', // Music category
        maxResults,
        pageToken,
      },
    });

    const videoIds = response.data.items.map(item => item.id.videoId).join(',');
    const nextPageToken = response.data.nextPageToken;

    // Get video details including duration
    const detailsResponse = await api.get('/youtube/videos', {
      params: {
        part: 'contentDetails,snippet,statistics',
        id: videoIds,
      },
    });

    const items = detailsResponse.data.items
      .filter(item => {
        // Filter out YouTube Shorts (videos under 60 seconds)
        const duration = parseDuration(item.contentDetails.duration);
        return duration >= 60;
      })
      .map(item => ({
        videoId: item.id,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.standard?.url || item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
        duration: parseDuration(item.contentDetails.duration),
        views: item.statistics.viewCount,
      }));

    return { items, nextPageToken };
  } catch (error) {
    console.error('Error searching videos:', error);
    throw error;
  }
};

/**
 * Get video details by ID
 */
export const getVideoDetails = async (videoId) => {
  try {
    const response = await api.get('/youtube/videos', {
      params: {
        part: 'contentDetails,snippet,statistics',
        id: videoId,
      },
    });

    const item = response.data.items[0];
    if (!item) return null;

    return {
      videoId: item.id,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.standard?.url || item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
      duration: parseDuration(item.contentDetails.duration),
      views: item.statistics.viewCount,
    };
  } catch (error) {
    console.error('Error getting video details:', error);
    throw error;
  }
};

/**
 * Parse YouTube URL to extract video ID
 */
export const parseVideoUrl = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
};

/**
 * Get related videos
 */
export const getRelatedVideos = async (videoId, maxResults = 10) => {
  try {
    const response = await api.get('/youtube/search', {
      params: {
        part: 'snippet',
        relatedToVideoId: videoId,
        type: 'video',
        videoCategoryId: '10',
        maxResults,
      },
    });

    return response.data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.medium?.url,
    }));
  } catch (error) {
    console.error('Error getting related videos:', error);
    return [];
  }
};

/**
 * Parse ISO 8601 duration to seconds
 */
const parseDuration = (duration) => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);

  return hours * 3600 + minutes * 60 + seconds;
};
