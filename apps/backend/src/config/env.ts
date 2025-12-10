import { config } from 'dotenv';
import path from 'path';

// Force load from root .env.local
config({ path: path.join(__dirname, '../../../../.env.local') });
console.log('[Config] Loaded environment variables. USE_MOCK_QUEUE:', process.env.USE_MOCK_QUEUE);
