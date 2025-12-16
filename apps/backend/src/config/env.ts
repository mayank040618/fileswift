import { config } from 'dotenv';
import path from 'path';

// Force load from root .env.local (Dev only usually)
try {
    config({ path: path.join(__dirname, '../../../../.env.local') });
} catch (e) {
    // Ignore in production
}
console.log('[Config] Loaded environment variables. USE_MOCK_QUEUE:', process.env.USE_MOCK_QUEUE);
