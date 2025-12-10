import { FastifyInstance } from 'fastify';
import fs from 'fs';
import path from 'path';

// Simple in-memory rate limit: IP -> Timestamp of last request
// Allows 1 request per minute per IP for waitlist
const rateLimit = new Map<string, number>();

export default async function waitlistRoutes(fastify: FastifyInstance) {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    const dbPath = path.join(dataDir, 'waitlist.json');

    // Ensure DB exists
    if (!fs.existsSync(dbPath)) {
        fs.writeFileSync(dbPath, '[]');
    }

    fastify.post('/api/waitlist', async (req, reply) => {
        const { email, source } = req.body as { email: string, source?: string };

        if (!email || !email.includes('@')) {
            return reply.code(400).send({ ok: false, error: 'Invalid email' });
        }

        // Rate Limit
        const ip = req.ip;
        const now = Date.now();
        const lastReq = rateLimit.get(ip);
        if (lastReq && now - lastReq < 60000) {
            return reply.code(429).send({ ok: false, error: 'Too many requests. Please try again later.' });
        }
        rateLimit.set(ip, now);

        try {
            const data = fs.readFileSync(dbPath, 'utf-8');
            const entries = JSON.parse(data) as any[];

            // Check Duplicate
            if (entries.find((e: any) => e.email.toLowerCase() === email.toLowerCase())) {
                return reply.code(409).send({ ok: false, error: 'You are already on the waitlist!' });
            }

            // Append
            entries.push({
                email,
                source: source || 'unknown',
                createdAt: new Date().toISOString(),
                ip: process.env.NODE_ENV === 'production' ? 'redacted' : ip // Privacy
            });

            fs.writeFileSync(dbPath, JSON.stringify(entries, null, 2));

            // Log
            const logLine = `[${new Date().toISOString()}] New Signup: ${email} (${source})\n`;
            // try to append to logs if exists
            try {
                const logsDir = path.join(process.cwd(), 'logs');
                if (fs.existsSync(logsDir)) {
                    fs.appendFileSync(path.join(logsDir, 'waitlist.log'), logLine);
                }
            } catch (e) { /* ignore log error */ }

            return { ok: true };

        } catch (error) {
            console.error('Waitlist Error:', error);
            return reply.code(500).send({ ok: false, error: 'Internal Server Error' });
        }
    });

    // Simple Admin Count Endpoint (Protected or Dev only ideally, but keeping open as per "minimal" req)
    fastify.get('/api/waitlist/count', async () => {
        try {
            if (!fs.existsSync(dbPath)) return { count: 0 };
            const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            return { count: data.length };
        } catch {
            return { count: 0 };
        }
    });
}
