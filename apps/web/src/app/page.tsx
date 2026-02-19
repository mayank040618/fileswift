'use client';

import { useState } from 'react';
import { TOOLS } from '@/config/tools';
import { ToolCard } from '@/components/ToolCard';
import { Hero } from '@/components/Hero';
import { ComingSoonModal } from '@/components/ComingSoonModal';



import { SeoSection } from '@/components/SeoSection';


export default function Home(): JSX.Element {
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

        <div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {activeTools.map((tool) => (
            <div key={tool.id}>
              <ToolCard tool={tool} />
            </div>
          ))}

          {/* Coming Soon / Waitlist Card - Hidden for AdSense */}
        </div>
      </div>



      {/* SEO Content Section */}
      <SeoSection />

    </main>
  );
}
