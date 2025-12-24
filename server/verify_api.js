import axios from 'axios';
import dotenv from 'dotenv';


const toPath = (u) => {
    try {
        const p = decodeURIComponent(new URL(u, import.meta.url).pathname);
        if (typeof process !== 'undefined' && process.platform === 'win32' && p.startsWith('/')) {
            return p.slice(1);
        }
        return p;
    } catch (e) {
        return u;
    }
};



// Load env vars
try {
    dotenv.config({ path: toPath('./.env') });
    dotenv.config({ path: toPath('../.env') });
} catch (e) { }

const API_URL = (process.env.SERVER_URL || 'http://localhost:5000') + '/api';

async function testAPIs() {
    console.log('--- Testing APIs ---');

    try {
        // 1. History API
        console.log('\nTesting History API...');
        const testTrack = {
            videoId: 'test_vid_1',
            title: 'Test Song',
            artist: 'Test Artist',
            thumbnail: 'http://example.com/thumb.jpg',
            duration: 120
        };

        console.log('POST /history');
        const postHistory = await axios.post(`${API_URL}/history`, testTrack);
        console.log('Status:', postHistory.status);
        if (postHistory.data.videoId !== testTrack.videoId) throw new Error('History save failed');

        console.log('GET /history');
        const getHistory = await axios.get(`${API_URL}/history`);
        console.log('History count:', getHistory.data.length);
        if (!getHistory.data.find(t => t.videoId === testTrack.videoId)) throw new Error('History retrieve failed');

        // 2. Playlist API
        console.log('\nTesting Playlist API...');
        const playlistName = 'Test Playlist';

        console.log('POST /playlists');
        const createPlaylist = await axios.post(`${API_URL}/playlists`, { name: playlistName });
        const playlistId = createPlaylist.data.id;
        console.log('Playlist ID:', playlistId);

        console.log('POST /playlists/:id/tracks');
        await axios.post(`${API_URL}/playlists/${playlistId}/tracks`, { videoId: testTrack.videoId });

        console.log('GET /playlists/:id');
        const getPlaylist = await axios.get(`${API_URL}/playlists/${playlistId}`);
        console.log('Tracks in playlist:', getPlaylist.data.tracks.length);
        if (getPlaylist.data.tracks.length !== 1) throw new Error('Playlist track add failed');

        console.log('PUT /playlists/:id (Rename)');
        await axios.put(`${API_URL}/playlists/${playlistId}`, { name: 'Renamed Playlist' });

        console.log('DELETE /playlists/:id');
        await axios.delete(`${API_URL}/playlists/${playlistId}`);

        // 3. Library API (just to be sure)
        console.log('\nTesting Library API...');
        console.log('POST /library/save');
        await axios.post(`${API_URL}/library/save`, testTrack);

        console.log('GET /library/tracks');
        const getLibrary = await axios.get(`${API_URL}/library/tracks`);
        console.log('Library count:', getLibrary.data.length);
        if (!getLibrary.data.find(t => t.videoId === testTrack.videoId)) throw new Error('Library save failed');

        console.log('\n--- ALL TESTS PASSED ---');

    } catch (error) {
        console.error('\n--- TEST FAILED ---');
        console.error('Error Message:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Server Error Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testAPIs();
