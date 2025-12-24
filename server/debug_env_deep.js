import fs from 'fs';

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


const envPath = toPath('./.env');

console.log('--- Deep Debug of .env ---');
console.log('Target path:', envPath);

// 1. Check existence
if (fs.existsSync(envPath)) {
    console.log('File exists: YES');
    const stats = fs.statSync(envPath);
    console.log('File size:', stats.size, 'bytes');

    // 2. Try raw read
    try {
        const content = fs.readFileSync(envPath, 'utf8');
        console.log('File content (raw length):', content.length);

        // Check for null bytes or weird encoding issues
        if (content.indexOf('\0') !== -1) {
            console.warn('WARNING: Null bytes detected in .env (wrong encoding?)');
        }

        // 3. Manual Parse
        const parsed = dotenv.parse(content);
        console.log('Dotenv parse keys:', Object.keys(parsed));

        if (parsed.DATABASE_URL) {
            console.log('DATABASE_URL found in parse: YES');
            console.log('Value length:', parsed.DATABASE_URL.length);
        } else {
            console.error('DATABASE_URL found in parse: NO');
            console.log('First 50 chars of content:', content.substring(0, 50).replace(/\n/g, '\\n'));
        }

    } catch (err) {
        console.error('Error reading file:', err.message);
    }

} else {
    console.error('File exists: NO');
    console.log('Directory listing:');
    try {
        console.log(fs.readdirSync(__dirname));
    } catch (e) { console.log('Cannot list dir'); }
}

// 4. Standard Dotenv Config
const result = dotenv.config({ path: envPath });
if (result.error) {
    console.error('Dotenv config error:', result.error.message);
}

console.log('process.env.DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
