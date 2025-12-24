import express from 'express';
import prisma from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Protect all library routes
router.use(auth);

// Get all tracks in library
router.get('/tracks', async (req, res) => {
    try {
        const tracks = await prisma.library.findMany({
            where: { userId: req.user.userId },
            include: { song: true },
            orderBy: { addedAt: 'desc' }
        });
        // Flatten structure to match frontend expectation
        res.json(tracks.map(t => ({ ...t.song, addedAt: t.addedAt })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single track (check if in library)
router.get('/tracks/:id', async (req, res) => {
    try {
        const entry = await prisma.library.findUnique({
            where: {
                userId_videoId: {
                    userId: req.user.userId,
                    videoId: req.params.id
                }
            },
            include: { song: true }
        });
        if (!entry) return res.status(404).json({ message: 'Not found' });
        res.json({ ...entry.song, addedAt: entry.addedAt });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Save track to library
router.post('/save', async (req, res) => {
    const { videoId, title, artist, thumbnail, customCover, duration } = req.body;
    try {
        // Upsert Song first (agnostic of user)
        const song = await prisma.song.upsert({
            where: { videoId },
            update: { customCover: customCover || undefined },
            create: { videoId, title, artist, thumbnail, customCover, duration }
        });

        // Add to Library (linked to user)
        const entry = await prisma.library.create({
            data: {
                userId: req.user.userId,
                videoId
            }
        });

        res.json({ ...song, addedAt: entry.addedAt });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(200).json({ message: 'Already in library' });
        }
        res.status(500).json({ error: error.message });
    }
});

// Delete track from library
router.delete('/tracks/:id', async (req, res) => {
    try {
        await prisma.library.delete({
            where: {
                userId_videoId: {
                    userId: req.user.userId,
                    videoId: req.params.id
                }
            }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
