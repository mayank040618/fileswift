const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'apps', 'backend', 'data', 'waitlist.json');

try {
    if (!fs.existsSync(dbPath)) {
        console.log('Waitlist DB not found at:', dbPath);
        console.log('Count: 0');
    } else {
        const data = fs.readFileSync(dbPath, 'utf-8');
        const entries = JSON.parse(data);
        console.log(`Waitlist Path: ${dbPath}`);
        console.log(`Total Entries: ${entries.length}`);
        if (entries.length > 0) {
            console.log('Latest Entry:', entries[entries.length - 1].email);
        }
    }
} catch (e) {
    console.error('Error reading waitlist:', e);
}
