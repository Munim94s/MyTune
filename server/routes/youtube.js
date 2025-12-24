import express from 'express';
import axios from 'axios';

const router = express.Router();

const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

router.get('/search', async (req, res) => {
    try {
        if (!YOUTUBE_API_KEY) throw new Error('YOUTUBE_API_KEY not set');
        const response = await axios.get(`${YOUTUBE_API_URL}/search`, {
            params: { ...req.query, key: YOUTUBE_API_KEY }
        });
        res.json(response.data);
    } catch (error) {
        console.error('YouTube Search API Error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: error.message,
            details: error.response?.data
        });
    }
});

router.get('/videos', async (req, res) => {
    try {
        if (!YOUTUBE_API_KEY) throw new Error('YOUTUBE_API_KEY not set');
        const response = await axios.get(`${YOUTUBE_API_URL}/videos`, {
            params: { ...req.query, key: YOUTUBE_API_KEY }
        });
        res.json(response.data);
    } catch (error) {
        console.error('YouTube Videos API Error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: error.message,
            details: error.response?.data
        });
    }
});

router.get('/related', async (req, res) => {
    try {
        if (!YOUTUBE_API_KEY) throw new Error('YOUTUBE_API_KEY not set');
        const response = await axios.get(`${YOUTUBE_API_URL}/search`, {
            params: { ...req.query, key: YOUTUBE_API_KEY }
        });
        res.json(response.data);
    } catch (error) {
        console.error('YouTube Related API Error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: error.message,
            details: error.response?.data
        });
    }
});

export default router;
