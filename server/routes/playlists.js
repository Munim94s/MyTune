import express from 'express';
import prisma from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Protect all playlist routes
router.use(auth);

// Get all playlists
router.get('/', async (req, res) => {
    try {
        const playlists = await prisma.playlist.findMany({
            where: { userId: req.user.userId },
            include: {
                tracks: {
                    include: { song: true },
                    orderBy: { order: 'asc' } // Ensure tracks are ordered by 'order'
                }
            },
            orderBy: { createdAt: 'desc' } // Or 'asc', up to preference
        });

        const formatted = playlists.map(p => ({
            id: p.id,
            name: p.name,
            tracks: p.tracks.map(pt => ({ ...pt.song, addedAt: pt.addedAt }))
        }));
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single playlist
router.get('/:id', async (req, res) => {
    try {
        const playlist = await prisma.playlist.findFirst({
            where: {
                id: parseInt(req.params.id),
                userId: req.user.userId
            },
            include: {
                tracks: {
                    include: { song: true },
                    orderBy: { order: 'asc' }
                }
            }
        });
        if (!playlist) return res.status(404).json({ message: 'Not found' });
        res.json({
            id: playlist.id,
            name: playlist.name,
            tracks: playlist.tracks.map(pt => ({ ...pt.song, addedAt: pt.addedAt }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create playlist
router.post('/', async (req, res) => {
    try {
        const playlist = await prisma.playlist.create({
            data: {
                name: req.body.name,
                userId: req.user.userId
            }
        });
        res.json({ ...playlist, tracks: [] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add track to playlist
router.post('/:id/tracks', async (req, res) => {
    const { videoId, title, artist, thumbnail, duration, customCover } = req.body;
    try {
        // Verify ownership
        const playlistExists = await prisma.playlist.findFirst({
            where: {
                id: parseInt(req.params.id),
                userId: req.user.userId
            }
        });
        if (!playlistExists) return res.status(404).json({ message: 'Playlist not found' });

        // Ensure song exists in database
        await prisma.song.upsert({
            where: { videoId },
            update: {}, // Don't overwrite existing data like customCover
            create: {
                videoId,
                title,
                artist,
                thumbnail,
                duration: parseInt(duration) || 0,
                customCover
            }
        });

        // Get current max order to append at the end
        const lastTrack = await prisma.playlistTrack.findFirst({
            where: { playlistId: parseInt(req.params.id) },
            orderBy: { order: 'desc' }
        });
        const newOrder = lastTrack ? lastTrack.order + 1 : 0;

        await prisma.playlistTrack.create({
            data: {
                playlistId: parseInt(req.params.id),
                videoId,
                order: newOrder
            }
        });

        // Return updated playlist
        const playlist = await prisma.playlist.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                tracks: {
                    include: { song: true },
                    orderBy: { order: 'asc' }
                }
            }
        });

        // Match the format expected by frontend or consistent with other endpoints
        res.json({
            id: playlist.id,
            name: playlist.name,
            tracks: playlist.tracks.map(t => t.videoId) // Frontend seems to expect just IDs here in some places
        });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(200).json({ message: 'Already in playlist' });
        }
        console.error('Error adding to playlist:', error);
        res.status(500).json({ error: error.message });
    }
});

// Remove track from playlist
router.delete('/:id/tracks/:videoId', async (req, res) => {
    try {
        // Verify ownership
        const playlistExists = await prisma.playlist.findFirst({
            where: {
                id: parseInt(req.params.id),
                userId: req.user.userId
            }
        });
        if (!playlistExists) return res.status(404).json({ message: 'Playlist not found' });

        await prisma.playlistTrack.deleteMany({
            where: {
                playlistId: parseInt(req.params.id),
                videoId: req.params.videoId
            }
        });
        // Return updated playlist IDs
        const playlist = await prisma.playlist.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { tracks: true }
        });
        res.json({ ...playlist, tracks: playlist.tracks.map(t => t.videoId) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete playlist
router.delete('/:id', async (req, res) => {
    try {
        // Delete with userId check ensures ownership
        const deleted = await prisma.playlist.deleteMany({
            where: {
                id: parseInt(req.params.id),
                userId: req.user.userId
            }
        });

        if (deleted.count === 0) return res.status(404).json({ message: 'Playlist not found or unauthorized' });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update playlist (Rename or Reorder)
router.put('/:id', async (req, res) => {
    try {
        const { name, tracks } = req.body;

        // Check ownership first
        const existingPlaylist = await prisma.playlist.findFirst({
            where: {
                id: parseInt(req.params.id),
                userId: req.user.userId
            }
        });
        if (!existingPlaylist) return res.status(404).json({ message: 'Playlist not found' });

        // Update name
        const playlist = await prisma.playlist.update({
            where: { id: parseInt(req.params.id) },
            data: { name },
            include: { tracks: { include: { song: true } } }
        });

        // Update track order if tracks provided
        if (tracks && Array.isArray(tracks)) {
            const updatePromises = tracks.map((track, index) => {
                return prisma.playlistTrack.updateMany({
                    where: {
                        playlistId: playlist.id,
                        videoId: track.videoId
                    },
                    data: { order: index }
                });
            });
            await Promise.all(updatePromises);

            // Refetch
            const updatedPlaylist = await prisma.playlist.findUnique({
                where: { id: playlist.id },
                include: {
                    tracks: {
                        include: { song: true },
                        orderBy: { order: 'asc' }
                    }
                }
            });

            return res.json({
                id: updatedPlaylist.id,
                name: updatedPlaylist.name,
                tracks: updatedPlaylist.tracks.map(pt => ({ ...pt.song, addedAt: pt.addedAt }))
            });
        }

        res.json({
            id: playlist.id,
            name: playlist.name,
            tracks: playlist.tracks.map(pt => ({ ...pt.song, addedAt: pt.addedAt }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
