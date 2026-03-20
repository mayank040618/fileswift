/**
 * Anonymous session management via cookies.
 * Used for rate-limiting free (unauthenticated) users.
 */

const SESSION_COOKIE = 'fsai_session';

/**
 * Get or create a session ID. Reads from cookie, creates one if missing.
 * Works client-side only.
 */
export function getOrCreateSessionId(): string {
    if (typeof document === 'undefined') return '';

    // Try to read existing session
    const match = document.cookie.match(new RegExp(`(?:^|; )${SESSION_COOKIE}=([^;]*)`));
    if (match) return decodeURIComponent(match[1]);

    // Create new session ID
    const sessionId = generateUUID();
    // Set cookie to expire in 30 days
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${SESSION_COOKIE}=${sessionId}; expires=${expires}; path=/; SameSite=Lax`;
    return sessionId;
}

/**
 * Simple UUID v4 generator (no external dependency).
 */
function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
