import nodemailer from 'nodemailer';
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


// Ensure env is loaded securely

// Ensure env is loaded securely
try {
    dotenv.config({ path: toPath('../../.env') });
    dotenv.config({ path: toPath('../.env') }); // Fallback to server/.env
} catch (e) { }

let transporter;

const getTransporter = () => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    return transporter;
};

export const sendVerificationEmail = async (to, token) => {
    // ...
    const mailOptions = {
        from: `"MyTune Auth" <${process.env.SMTP_USER}>`,
        to,
        subject: 'Verify your MyTune Account',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Welcome to MyTune!</h2>
                <p>Please verify your email address to complete your registration.</p>
                <div style="margin: 20px 0;">
                    <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
                </div>
                <p>Or copy this link: <a href="${verificationLink}">${verificationLink}</a></p>
                <p>This link will expire in 24 hours.</p>
            </div>
        `,
    };

    try {
        const info = await getTransporter().sendMail(mailOptions);
        console.log('Verification email sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw error;
    }
};

export const sendPasswordSetEmail = async (to, token) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const link = `${frontendUrl}/set-password?token=${token}`;

    const mailOptions = {
        from: `"MyTune Auth" <${process.env.SMTP_USER}>`,
        to,
        subject: 'Set your Password',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Set Password</h2>
                <p>You requested to set a password for your account.</p>
                 <div style="margin: 20px 0;">
                    <a href="${link}" style="background-color: #008CBA; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Set Password</a>
                </div>
                <p>This link will expire in 1 hour.</p>
            </div>
        `,
    };

    try {
        await getTransporter().sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending password set email:', error);
        throw error;
    }
};
