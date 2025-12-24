import prisma from './db.js';

async function testConnection() {
    console.log('--- Testing DB Connection ---');
    try {
        await prisma.$connect();
        console.log('Connection SUCCESS!');

        // Try a simple query
        const count = await prisma.song.count();
        console.log('Song count:', count);

    } catch (error) {
        console.error('Connection FAILED:', error.message);
        console.error('Full Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();
