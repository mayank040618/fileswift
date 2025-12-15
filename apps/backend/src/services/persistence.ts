
import fs from 'fs';
import path from 'path';
import os from 'os';

const STATE_FILE = path.join(os.tmpdir(), 'fileswift-state.json');

export const persistence = {
    save: (data: any) => {
        try {
            fs.writeFileSync(STATE_FILE, JSON.stringify(data));
        } catch (e) {
            console.error('[Persistence] Failed to save state:', e);
        }
    },
    load: (): any => {
        try {
            if (fs.existsSync(STATE_FILE)) {
                return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
            }
        } catch (e) {
            console.error('[Persistence] Failed to load state:', e);
        }
        return null;
    }
};
