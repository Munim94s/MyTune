import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';
import prisma from '../db.js';
import { sendVerificationEmail, sendPasswordSetEmail } from '../services/email.js';

const router = express.Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-please-change';

// Helper to generate token
const generateToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Helper to generate random hex token
const generateRandomToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// --- Google OAuth ---
// --- Google OAuth ---
// 1. Redirect to Google
router.get('/google/login', (req, res) => {
    const redirectUri = `${process.env.SERVER_URL}/api/auth/google/callback`;
    const authUrl = client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
        redirect_uri: redirectUri
    });
    res.redirect(authUrl);
});

// 2. Handle Callback
router.get('/google/callback', async (req, res) => {
    const { code } = req.query;
    try {
        const redirectUri = `${process.env.SERVER_URL}/api/auth/google/callback`;
        const { tokens } = await client.getToken({
            code,
            redirect_uri: redirectUri
        });

        client.setCredentials(tokens);

        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { googleId },
                    { email }
                ]
            }
        });

        if (user) {
            if (!user.googleId) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        googleId,
                        isVerified: true,
                        provider: user.provider === 'local' ? 'google' : user.provider
                    }
                });
            }
        } else {
            user = await prisma.user.create({
                data: {
                    email,
                    name,
                    googleId,
                    provider: 'google',
                    isVerified: true,
                    password: null
                }
            });
        }

        const token = generateToken(user.id);

        // Redirect back to frontend with token
        // In production, might want to use a cookie or a safer way to pass token
        // For now, passing via query param to a frontend handler route or home
        // Better: Set httpOnly cookie, but user requested "token" approach in prior context. 
        // Let's redirect to a frontend "auth-success" page or home with token in fragment/query
        res.redirect(`${process.env.FRONTEND_URL}/?token=${token}&user=${encodeURIComponent(JSON.stringify({ id: user.id, email: user.email, name: user.name, picture, provider: user.provider }))}`);

    } catch (error) {
        console.error('Google Auth Error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=GoogleAuthFailed`);
    }
});

// --- Email/Password Register ---
router.post('/register', async (req, res) => {
    const { email, password, name } = req.body;
    try {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(400).json({ error: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = generateRandomToken();
        const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                provider: 'local',
                isVerified: false,
                verificationToken,
                verificationTokenExpiry: expiry
            }
        });

        // Send Email
        await sendVerificationEmail(email, verificationToken);

        res.status(201).json({ message: 'Registration successful. Please check your email to verify account.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// --- Login ---
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.provider === 'google' && !user.password) {
            // If user is google-only, they might not have password.
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const valid = await bcrypt.compare(password, user.password || '');
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

        if (!user.isVerified) {
            return res.status(403).json({ error: 'Email not verified. Please check your inbox.' });
        }

        const token = generateToken(user.id);
        res.json({ token, user: { id: user.id, email: user.email, name: user.name, provider: user.provider } });

    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// --- Verify Email ---
router.post('/verify-email', async (req, res) => {
    const { token } = req.body;
    try {
        const user = await prisma.user.findFirst({
            where: {
                verificationToken: token,
                verificationTokenExpiry: { gt: new Date() }
            }
        });

        if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

        await prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                verificationToken: null,
                verificationTokenExpiry: null
            }
        });

        res.json({ message: 'Email verified successfully. You can now login.' });

    } catch (error) {
        res.status(500).json({ error: 'Verification failed' });
    }
});

// --- Initiate Password Set (For OAuth users adding password) ---
router.post('/initiate-password-set', async (req, res) => {
    // Current user context needed (protected route?)
    // Or just by email? Let's say authenticated user wants to add pass?
    // User request: "If the account is already created through o auth and has no password the email must be verified to set the password."
    // This implies they are probably logged in via Google (so we have user ID).

    // We expect a valid JWT token in auth header for this usually, but for strict verification flow:
    // If they are logged in via Google, their email IS trusted/verified by Google.
    // BUT the requirement says "email must be verified ... to set the password".
    // This might mean re-verifying intent to set password, OR verifying strictly before setting local creds.

    const { email } = req.body; // Or get from req.user if protected
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const token = generateRandomToken();
        const expiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

        await prisma.user.update({
            where: { id: user.id },
            data: {
                verificationToken: token,
                verificationTokenExpiry: expiry
            }
        });

        await sendPasswordSetEmail(email, token);
        res.json({ message: 'Verification email sent.' });

    } catch (error) {
        res.status(500).json({ error: 'Failed to initiate password set' });
    }
});

// --- Complete Password Set ---
router.post('/complete-password-set', async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const user = await prisma.user.findFirst({
            where: {
                verificationToken: token,
                verificationTokenExpiry: { gt: new Date() }
            }
        });

        if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                verificationToken: null,
                verificationTokenExpiry: null,
                // Ensure isVerified is true if it wasn't (unlikely for oauth, but good safety)
                isVerified: true,
                provider: user.provider === 'google' ? 'google' : user.provider // Keep provider as original? Or maybe 'mixed'? Let's touch nothing.
            }
        });

        res.json({ message: 'Password set successfully.' });

    } catch (error) {
        res.status(500).json({ error: 'Failed to set password' });
    }
});

export default router;
