'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

export function AnnouncementToast() {
    useEffect(() => {
        // Show after a short delay so it does not overwhelm the user immediately on page load
        const timer = setTimeout(() => {
            const hasSeen = localStorage.getItem('seen_ai_announcement');
            if (!hasSeen) {
                toast('✨ Hey, try our new AI tools!', {
                    description: 'Chat with PDF, AI Background Remover, and more!',
                    action: {
                        label: 'Got it',
                        onClick: () => {
                            // User acknowledged
                        }
                    },
                    duration: 8000,
                });
                // Ensure they don't get spammed on every page load
                localStorage.setItem('seen_ai_announcement', 'true');
            }
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    return null;
}
