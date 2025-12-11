'use client';

import { useState } from 'react';
import { TOOLS } from '@/config/tools';
import { ToolCard } from '@/components/ToolCard';
// Force Vercel Rebuild Trigger
import { Hero } from '@/components/Hero';
import { ComingSoonModal } from '@/components/ComingSoonModal';

import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Home() {
  const activeTools = TOOLS.filter(t => !t.comingSoon);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);

  return (
    <main className="min-h-screen bg-hero-gradient dark:bg-hero-gradient-dark">
      <Hero />

      <ComingSoonModal isOpen={isWaitlistOpen} setIsOpen={setIsWaitlistOpen} />

      {/* Active Tools Section */}
      <div id="tools" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">All Tools</h2>
          <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800 ml-6"></div>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {activeTools.map((tool) => (
            <motion.div key={tool.id} variants={item}>
              <ToolCard tool={tool} />
            </motion.div>
          ))}

          {/* Coming Soon / Waitlist Card */}
          <motion.div
            variants={item}
            onClick={() => setIsWaitlistOpen(true)}
            className="group relative flex flex-col h-full bg-white dark:bg-slate-850 p-6 rounded-2xl border border-amber-200 dark:border-amber-900/30 shadow-sm hover:shadow-xl hover:shadow-amber-500/10 hover:border-amber-500/30 transition-all cursor-pointer overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-50 to-transparent dark:from-amber-900/10 dark:to-transparent rounded-bl-[50px] -z-0 opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="h-12 w-12 rounded-xl flex items-center justify-center mb-5 bg-amber-100 dark:bg-amber-900/20 text-amber-600 transition-transform group-hover:scale-110 group-hover:rotate-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rocket"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></svg>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-amber-600 transition-colors">
              Coming Soon — Pro Features
            </h3>

            <div className="flex-grow">
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                AI and advanced image tools arriving with our Pro Plan. Tap to learn more & join the waitlist.
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center text-amber-600 text-sm font-semibold">
              Join Waitlist <span className="ml-1">→</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
