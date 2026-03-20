'use client';

import { FileCheck2, BrainCircuit, LineChart, TrendingUp, Workflow } from "lucide-react";
import { motion } from "framer-motion";

export function AuthPreview() {
    return (
        <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="w-full max-w-md mt-10 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden group"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10">
                {/* Uploaded Document Header */}
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                        <FileCheck2 className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-0.5">Document Uploaded</p>
                        <p className="text-sm text-white font-semibold">Q3_financial_report.pdf</p>
                    </div>
                </div>

                {/* AI Summary Section */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <BrainCircuit className="w-4 h-4 text-purple-400" />
                        <h4 className="text-sm font-semibold text-slate-200">AI Summary</h4>
                    </div>
                    <div className="bg-black/20 rounded-xl p-4 border border-white/5 space-y-2">
                        <p className="text-sm text-slate-300 leading-relaxed">
                            This document discusses three main topics:
                        </p>
                        <ul className="text-sm text-slate-400 space-y-1.5 list-none">
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> AI productivity tools</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div> Automation workflows</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div> Business insights</li>
                        </ul>
                    </div>
                </div>

                {/* Key Insights Section */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <LineChart className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-sm font-semibold text-slate-200">Key Insights</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-xl p-3">
                            <TrendingUp className="w-4 h-4 text-emerald-400 mb-2" />
                            <p className="text-xs text-slate-400">Revenue</p>
                            <p className="text-sm text-emerald-50 font-semibold">+28% increase</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-xl p-3">
                            <Workflow className="w-4 h-4 text-blue-400 mb-2" />
                            <p className="text-xs text-slate-400">Workload</p>
                            <p className="text-sm text-blue-50 font-semibold">Reduced greatly</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
