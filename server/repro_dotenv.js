import dotenv from 'dotenv';

console.log('Testing dotenv with robust conversion...');
const envUrl = new URL('./.env', import.meta.url);
let p = decodeURIComponent(envUrl.pathname);
if (process.platform === 'win32' && p.startsWith('/')) {
    p = p.substring(1);
}
console.log('Final Path:', p);
const result = dotenv.config({ path: p });

if (result.error) {
    console.error('Dotenv ERROR:', result.error);
} else {
    console.log('Dotenv SUCCESS');
    console.log('Parsed keys:', Object.keys(result.parsed || {}));
}

if (result.error) {
    console.error('Dotenv FAILED with URL object:', result.error);
} else {
    console.log('Dotenv SUCCESS with URL object');
    console.log('Parsed keys:', Object.keys(result.parsed || {}));
}
