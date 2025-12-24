
import dotenv from 'dotenv';
import fs from 'fs';

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


const serverEnvPath = toPath('./.env');
console.log('Attempting to load server .env from:', serverEnvPath);
if (fs.existsSync(serverEnvPath)) {
    console.log('Server .env exists.');
    const result = dotenv.config({ path: serverEnvPath });
    if (result.error) console.error('Error loading server .env:', result.error);
    else console.log('Server .env loaded.');
} else {
    console.log('Server .env DOES NOT exist.');
}

const rootEnvPath = toPath('../.env');
console.log('Attempting to load root .env from:', rootEnvPath);
if (fs.existsSync(rootEnvPath)) {
    console.log('Root .env exists.');
    const result = dotenv.config({ path: rootEnvPath });
    if (result.error) console.error('Error loading root .env:', result.error);
    else console.log('Root .env loaded.');
} else {
    console.log('Root .env DOES NOT exist.');
}

const urlStr = process.env.DATABASE_URL;
if (!urlStr) {
    console.error('DATABASE_URL is not set in process.env');
    // process.exit(1); 
} else {
    console.log('DATABASE_URL is set.');
}
