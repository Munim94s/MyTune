import { PrismaClient } from '@prisma/client';

import dotenv from 'dotenv';

const toPath = (u) => {
    try {
        const p = decodeURIComponent(new URL(u, import.meta.url).pathname);
        if (typeof process !== 'undefined' && process.platform === 'win32' && p.startsWith('/')) {
            return p.slice(1);
        }
        return p;
    } catch (e) {
        return u; // Fallback
    }
};

// Ensure env vars are loaded
try {
    if (typeof process !== 'undefined' && !process.env.DATABASE_URL) {
        dotenv.config({ path: toPath('./.env') });
        if (!process.env.DATABASE_URL) {
            dotenv.config({ path: toPath('../.env') });
        }
    }
} catch (e) {
    // Ignore dotenv errors in environments where it's not needed/supported
}

let url = process.env.DATABASE_URL;
let prismaConfig = {};

console.log('--- DB Initialization ---');

if (url) {
    // FORCE MANUAL PARSING & ENCODING
    // This is necessary because 'new URL()' might accept unencoded characters 
    // but parse them incorrectly (e.g. '#' starts fragment), or Postgres requires encoding.
    try {
        const protocolSeparator = '://';
        const protoIndex = url.indexOf(protocolSeparator);

        if (protoIndex !== -1) {
            const afterProto = url.substring(protoIndex + protocolSeparator.length);
            const atIndex = afterProto.lastIndexOf('@');

            if (atIndex !== -1) {
                const userInfo = afterProto.substring(0, atIndex);
                const hostInfo = afterProto.substring(atIndex + 1);

                const colonIndex = userInfo.indexOf(':');
                if (colonIndex !== -1) {
                    const user = userInfo.substring(0, colonIndex);
                    const rawPassword = userInfo.substring(colonIndex + 1);

                    // Decrypt then Encrypt to normalize
                    // If it was "pass#word", decode->"pass#word", encode->"pass%23word" (Fixed!)
                    // If it was "pass%23word", decode->"pass#word", encode->"pass%23word" (Safe!)
                    let cleanPassword = rawPassword;
                    try {
                        cleanPassword = decodeURIComponent(rawPassword);
                    } catch (e) {
                        // If decode fails, use raw
                    }

                    const encodedPassword = encodeURIComponent(cleanPassword);
                    const encodedUser = encodeURIComponent(decodeURIComponent(user)); // Do user too

                    const protocol = url.substring(0, protoIndex);

                    // Reassemble
                    const newUrl = `${protocol}://${encodedUser}:${encodedPassword}@${hostInfo}`;

                    // Log change if any
                    if (newUrl !== url) {
                        console.log('URL rewritten for safety.');
                    } else {
                        console.log('URL verified (no changes needed).');
                    }

                    url = newUrl;
                }
            }
        }
    } catch (parseErr) {
        console.error('Error during manual URL parsing:', parseErr);
        // Fallback to original url
    }

    prismaConfig = {
        datasources: {
            db: {
                url: url
            }
        }
    };
} else {
    console.warn('WARNING: DATABASE_URL not found.');
}

const prisma = new PrismaClient(prismaConfig);

export default prisma;
