'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';

export const SplashScreen = () => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Check if we've already shown the splash screen in this session
        const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');

        if (hasSeenSplash) {
            setIsVisible(false);
            return;
        }

        // Show splash, then hide after delay
        const timer = setTimeout(() => {
            setIsVisible(false);
            sessionStorage.setItem('hasSeenSplash', 'true');
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F172A]"
                >
                    <div className="flex flex-col items-center">
                        {/* Logo Animation */}
                        <motion.div
                            initial={{ scale: 1, opacity: 1, rotate: 0 }}
                            animate={{
                                scale: [1, 1.1, 1],
                                rotate: [0, -10, 10, 0]
                            }}
                            transition={{
                                duration: 1.2,
                                ease: "easeInOut",
                                times: [0, 0.2, 1]
                            }}
                            className="bg-blue-600 p-6 rounded-3xl shadow-2xl shadow-blue-500/30 mb-6"
                        >
                            <FileText className="text-white w-16 h-16" strokeWidth={1.5} />
                        </motion.div>

                        {/* Text Animation */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="text-center"
                        >
                            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                                File<span className="text-blue-500">Swift</span>
                            </h1>
                            <p className="text-slate-400 text-sm tracking-widest uppercase">
                                AI Powered Workspace
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
