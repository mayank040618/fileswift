'use client';

import React from 'react';
import { HistoryPanel } from '@/components/workspace/history-panel';

export default function HistoryPage() {
    return (
        <div className="flex-1 h-full overflow-hidden">
            <HistoryPanel />
        </div>
    );
}
