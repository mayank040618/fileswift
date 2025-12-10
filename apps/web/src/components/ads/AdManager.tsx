'use client';

import React, { createContext, useContext } from 'react';

const AdContext = createContext<{ adsEnabled: boolean }>({ adsEnabled: true });

export function AdManager({ children }: { children: React.ReactNode }) {
    // In future, check user preference or subscription
    return (
        <AdContext.Provider value={{ adsEnabled: true }}>
            {children}
        </AdContext.Provider>
    );
}

export const useAds = () => useContext(AdContext);
