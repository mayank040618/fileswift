'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { TabSelector, TabType } from '@/components/TabSelector';
import { InstagramBioForm } from '@/components/generators/InstagramBioForm';
import { LinkedInBioForm } from '@/components/generators/LinkedInBioForm';
import { TwitterBioForm } from '@/components/generators/TwitterBioForm';
import { CaptionForm } from '@/components/generators/CaptionForm';
import { ResultsSection } from '@/components/ResultsSection';
import { Features } from '@/components/Features';
import { FAQ } from '@/components/FAQ';
import { Footer } from '@/components/Footer';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabType>('instagram');
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async (generatedResults: string[]) => {
    setResults(generatedResults);
  };

  const renderForm = () => {
    const props = { onGenerate: handleGenerate, isLoading, setIsLoading };

    switch (activeTab) {
      case 'instagram':
        return <InstagramBioForm {...props} />;
      case 'linkedin':
        return <LinkedInBioForm {...props} />;
      case 'twitter':
        return <TwitterBioForm {...props} />;
      case 'caption':
        return <CaptionForm {...props} />;
      default:
        return <InstagramBioForm {...props} />;
    }
  };

  return (
    <main className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Create <span className="gradient-text">Viral Bios</span> & Captions
            <br />in Seconds with AI ✨
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Generate perfect bios for Instagram, LinkedIn, Twitter & more.
            100% free, no signup required.
          </p>
        </div>
      </section>

      {/* Generator Section */}
      <section className="px-4 pb-20">
        <div className="max-w-3xl mx-auto">
          {/* Tab Selector */}
          <TabSelector activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Generator Card */}
          <div className="glass-card p-6 md:p-8 mt-6">
            {renderForm()}
          </div>

          {/* Results */}
          {(results.length > 0 || isLoading) && (
            <ResultsSection results={results} isLoading={isLoading} tabType={activeTab} />
          )}
        </div>
      </section>

      {/* Features Section */}
      <Features />

      {/* FAQ Section */}
      <FAQ />

      {/* Footer */}
      <Footer />
    </main>
  );
}
