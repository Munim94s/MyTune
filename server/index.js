import express from 'express';
import cors from 'cors';

import dotenv from 'dotenv';
import prisma from './db.js'; // Note .js extension

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

import libraryRoutes from './routes/library.js';
import historyRoutes from './routes/history.js';
import playlistRoutes from './routes/playlists.js';
import youtubeRoutes from './routes/youtube.js';


// Load env vars
try {
    // Prioritize server .env
    dotenv.config({ path: toPath('./.env') });
    // Fallback to root .env
    dotenv.config({ path: toPath('../.env') });
} catch (e) {
    // Ignore dotenv errors
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('working perfectly');
});

// Routes
import authRoutes from './routes/auth.js';
app.use('/api/auth', authRoutes);

app.use('/api/library', libraryRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/youtube', youtubeRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app