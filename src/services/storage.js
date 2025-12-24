import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/**
 * Save a track to library
 */
export const saveTrack = async (track) => {
    try {
        const response = await api.post('/library/save', track);
        return response.data;
    } catch (error) {
        console.error('Error saving track:', error);
        throw error;
    }
};

/**
 * Get all tracks from library
 */
export const getTracks = async () => {
    try {
        const response = await api.get('/library/tracks');
        return response.data;
    } catch (error) {
        console.error('Error fetching tracks:', error);
        return [];
    }
};

/**
 * Get a single track by videoId
 */
export const getTrack = async (videoId) => {
    try {
        const response = await api.get(`/library/tracks/${videoId}`);
        return response.data;
    } catch (error) {
        if (error.response?.status === 404) return null;
        console.error('Error fetching track:', error);
        return null; // Return null if not found or error
    }
};

/**
 * Delete a track from library
 */
export const deleteTrack = async (videoId) => {
    try {
        await api.delete(`/library/tracks/${videoId}`);
    } catch (error) {
        console.error('Error deleting track:', error);
        throw error;
    }
};

/**
 * Check if track exists in library
 */
export const trackExists = async (videoId) => {
    const track = await getTrack(videoId);
    return !!track;
};

/**
 * Update track cover image
 */
export const updateTrackCover = async (videoId, coverUrl) => {
    try {
        // Try to update specifically. If backend 'save' is robust, this works.
        // We'll send just enough data for an update if the backend supports partials on upsert
        // or re-fetch -> save if needed.
        // Current backend implementation of /library/save uses upsert on Song.
        // We need to be careful not to overwrite other fields with nulls if we send a partial object
        // and the backend doesn't handle 'undefined' correctly for non-nullable fields that aren't provided.
        // The backend `upsert` create block requires all fields.
        // So we should fetch first.

        const existing = await getTrack(videoId);
        if (existing) {
            await api.post('/library/save', { ...existing, customCover: coverUrl });
        } else {
            console.warn('Cannot update cover: Track not found in library', videoId);
        }
    } catch (error) {
        console.error('Error updating cover:', error);
    }
};

/**
 * Create a new playlist
 */
export const createPlaylist = async (name) => {
    try {
        const response = await api.post('/playlists', { name });
        return response.data;
    } catch (error) {
        console.error('Error creating playlist:', error);
        throw error;
    }
};

/**
 * Get all playlists
 */
export const getPlaylists = async () => {
    try {
        const response = await api.get('/playlists');
        return response.data;
    } catch (error) {
        console.error('Error fetching playlists:', error);
        return [];
    }
};

/**
 * Get a single playlist
 */
export const getPlaylist = async (id) => {
    try {
        const response = await api.get(`/playlists/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching playlist:', error);
        return null;
    }
};

/**
 * Add track to playlist
 */
export const addToPlaylist = async (playlistId, track) => {
    try {
        const response = await api.post(`/playlists/${playlistId}/tracks`, track);
        return response.data;
    } catch (error) {
        console.error('Error adding to playlist:', error);
        throw error;
    }
};

/**
 * Remove track from playlist
 */
export const removeFromPlaylist = async (playlistId, videoId) => {
    try {
        const response = await api.delete(`/playlists/${playlistId}/tracks/${videoId}`);
        return response.data;
    } catch (error) {
        console.error('Error removing from playlist:', error);
        throw error;
    }
};

/**
 * Update a playlist
 */
export const updatePlaylist = async (id, updates) => {
    try {
        const response = await api.put(`/playlists/${id}`, updates);
        return response.data;
    } catch (error) {
        console.error('Error updating playlist:', error);
        throw error; // Propagate error
    }
};

/**
 * Delete a playlist
 */
export const deletePlaylist = async (id) => {
    try {
        await api.delete(`/playlists/${id}`);
    } catch (error) {
        console.error('Error deleting playlist:', error);
        throw error;
    }
};

/**
 * Add track to history
 */
export const addToHistory = async (track) => {
    try {
        const response = await api.post('/history', track);
        return response.data;
    } catch (error) {
        console.error('Error adding to history:', error);
        // Don't throw for history, just log
        return null;
    }
};

/**
 * Get history tracks
 */
export const getHistory = async (page = 1, limit = 20) => {
    try {
        const response = await api.get('/history', {
            params: { page, limit }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching history:', error);
        return [];
    }
};

/**
 * Clear all data
 * Note: No backend endpoint for this yet.
 */
export const clearAllData = async () => {
    console.warn('clearAllData not implemented for backend storage');
};

