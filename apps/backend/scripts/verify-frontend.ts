
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';
const TOOLS = [
    'pdf-to-word',
    'compress-pdf',
    'ai-summary',
    'ai-chat',
    'image-converter'
]; // Add more if needed, or fetch from sitemap

async function checkRoute(slug: string) {
    const url = `${BASE_URL}/tools/${slug}`;
    try {
        const res = await axios.get(url);
        if (res.status === 200) {
            // Check for key content
            const valid = res.data.includes('Upload') || res.data.includes('Select');
            if (valid) {
                console.log(`✅ [${slug}] Page Load OK`);
                return true;
            } else {
                console.log(`⚠️ [${slug}] Page 200 but missing expected content`);
                return false;
            }
        } else {
            console.log(`❌ [${slug}] Failed with status ${res.status}`);
            return false;
        }
    } catch (e: any) {
        console.log(`❌ [${slug}] Error: ${e.message}`);
        return false;
    }
}

async function checkStatic(path: string) {
    try {
        const res = await axios.get(`${BASE_URL}${path}`);
        console.log(`✅ [${path}] Status ${res.status}`);
    } catch (e: any) {
        console.log(`❌ [${path}] Error: ${e.message}`);
    }
}

async function main() {
    console.log('=== Verifying Frontend Routes ===');
    await checkStatic('/');
    await checkStatic('/sitemap.xml');
    await checkStatic('/robots.txt');

    console.log('\n=== Verifying Tool Pages ===');
    for (const tool of TOOLS) {
        await checkRoute(tool);
    }
}

main();
