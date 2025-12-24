import express from 'express';
import prisma from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get history
router.get('/', auth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const history = await prisma.history.findMany({
            where: { userId: req.user.userId },
            include: { song: true },
            orderBy: { playedAt: 'desc' },
            skip,
            take: limit
        });
        res.json(history.map(h => ({ ...h.song, playedAt: h.playedAt })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add to history
router.post('/', auth, async (req, res) => {
    const { videoId, title, artist, thumbnail, customCover, duration } = req.body;
    const userId = req.user.userId;

    if (!videoId) {
        return res.status(400).json({ error: 'videoId is required' });
    }

    try {
        // Upsert Song (Metadata)
        await prisma.song.upsert({
            where: { videoId },
            update: { customCover: customCover || undefined },
            create: { videoId, title, artist, thumbnail, customCover, duration }
        });

        // Upsert History (Link user -> song)
        const entry = await prisma.history.upsert({
            where: {
                userId_videoId: { userId, videoId }
            },
            update: { playedAt: new Date() },
            create: { userId, videoId, playedAt: new Date() }
        });

        res.json(entry);
    } catch (error) {
        console.error('History API Error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
