'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Icons } from './Icons';
import { Tool } from '@/config/tools';

// Helper to get Icon component dynamically
const getIcon = (iconName: string) => {
    // defaults to Upload icon if not found
    // @ts-ignore
    const IconComponent = Icons[iconName] || Icons.Upload;
    return IconComponent;
};

function ToolCardComponent({ tool }: { tool: Tool }) {
    const Icon = getIcon(tool.icon || 'Upload');

    const content = (
        <motion.div
            whileHover={!tool.comingSoon ? { y: -5, scale: 1.01 } : {}}
            transition={{ duration: 0.2 }}
            className={`group relative flex flex-col h-full p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all overflow-hidden ${tool.comingSoon
                ? 'bg-slate-50 dark:bg-slate-900 opacity-75 cursor-not-allowed grayscale-[0.5]'
                : 'bg-white dark:bg-slate-850 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-500/30 dark:hover:border-blue-500/20 cursor-pointer'
                }`}
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-50 to-transparent dark:from-blue-900/10 dark:to-transparent rounded-bl-[50px] -z-0 opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-5 transition-transform ${!tool.comingSoon ? 'group-hover:scale-110 group-hover:rotate-3' : ''} ${tool.color} bg-opacity-10 dark:bg-opacity-20`}>
                <Icon className={`h-6 w-6 ${tool.color.replace('bg-', 'text-').replace('-500', '-600')} dark:text-blue-400`} />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {tool.title}
            </h3>

            {tool.comingSoon && (
                <span className="inline-block px-2 py-0.5 mb-2 text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/20 rounded">
                    Coming Soon (Pro)
                </span>
            )}

            <div className="flex-grow">
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {tool.comingSoon ? "This advanced AI feature will be available in the upcoming Pro Plan." : tool.description}
                </p>
            </div>

            {!tool.comingSoon && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center text-blue-600 dark:text-blue-500 text-sm font-semibold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                    Use Tool <span className="ml-1">→</span>
                </div>
            )}
        </motion.div>
    );

    if (tool.comingSoon) {
        return <div>{content}</div>;
    }

    return (
        <Link href={`/tools/${tool.id}`}>
            {content}
        </Link>
    );
}

export const ToolCard = React.memo(ToolCardComponent);
