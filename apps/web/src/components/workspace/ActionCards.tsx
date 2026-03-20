'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, FileText, Image as ImageIcon, Database, ListChecks, Search } from 'lucide-react';
import { useThemeStore, THEME_COLORS } from '@/store/useThemeStore';

interface ActionCardsProps {
    files: File[];
    onSelectAction: (prompt: string) => void;
}

export function ActionCards({ files, onSelectAction }: ActionCardsProps) {
    const activeColorName = useThemeStore((state) => state.activeColorName);
    const activeColorDef = THEME_COLORS[activeColorName];

    // Determine file types to show tailored suggestions
    const suggestions = useMemo(() => {
        if (!files || files.length === 0) return [];

        const hasPdfOrDoc = files.some(f => /\.(pdf|doc|docx|txt|md)$/i.test(f.name));
        const hasImage = files.some(f => /\.(png|jpg|jpeg|webp|gif)$/i.test(f.name));
        const hasData = files.some(f => /\.(csv|json|xlsx|xls)$/i.test(f.name));

        const actions = [];

        if (hasPdfOrDoc) {
            actions.push({ icon: <FileText size={16} />, label: 'Summarize Document', prompt: 'Provide a comprehensive summary of this document, broken down by key sections.' });
            actions.push({ icon: <ListChecks size={16} />, label: 'Extract Action Items', prompt: 'Extract any action items, deliverables, or deadlines mentioned in this document.' });
            actions.push({ icon: <Search size={16} />, label: 'Find Key Details', prompt: 'Identify and list the most important facts, dates, and figures in this file.' });
        } else if (hasImage) {
            actions.push({ icon: <Search size={16} />, label: 'Extract Text (OCR)', prompt: 'Extract all readable text from this image exactly as written.' });
            actions.push({ icon: <ImageIcon size={16} />, label: 'Describe Image', prompt: 'Describe the contents of this image in detail, including layout and key elements.' });
        } else if (hasData) {
            actions.push({ icon: <Database size={16} />, label: 'Analyze Data', prompt: 'Provide a structured overview of this data, including columns, formats, and a brief summary of what it represents.' });
            actions.push({ icon: <Sparkles size={16} />, label: 'Find Insights', prompt: 'Highlight any notable trends, anomalies, or interesting insights from this dataset.' });
        } else {
            // Generic fallback
            actions.push({ icon: <Sparkles size={16} />, label: 'Summarize files', prompt: 'What are these files about? Give me a high-level summary.' });
            actions.push({ icon: <Search size={16} />, label: 'Extract details', prompt: 'Extract the most important information from these files into a bulleted list.' });
        }

        // Limit to 3 max
        return actions.slice(0, 3);
    }, [files]);

    if (suggestions.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}
            className="flex flex-wrap gap-2 mb-4 px-2"
        >
            {suggestions.map((action, idx) => (
                <motion.button
                    key={idx}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelectAction(action.prompt)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-black/[0.02] dark:bg-white/[0.03] border-black/[0.05] dark:border-white/5 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:border-black/10 dark:hover:border-white/10 hover:shadow-[0_0_15px_rgba(59,130,246,0.05)] dark:hover:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all text-sm font-medium text-slate-600 dark:text-slate-300"
                >
                    <span className={activeColorDef.textClass}>{action.icon}</span>
                    {action.label}
                </motion.button>
            ))}
        </motion.div>
    );
}
