
type EventName =
    | 'coming_soon_open'
    | 'coming_soon_waitlist_signup'
    | 'coming_soon_share_click';

export const trackEvent = (eventName: EventName, params?: Record<string, any>) => {
    // In production, this would send to GA4, Plausible, etc.
    // For now, we just log to console or could POST to a logging endpoint if needed.
    if (process.env.NODE_ENV === 'development') {
        console.log(`[Analytics] Track: ${eventName}`, params);
    }

    // Example GA4 gtag call (commented out)
    // if (typeof window !== 'undefined' && (window as any).gtag) {
    //     (window as any).gtag('event', eventName, params);
    // }
};
