import React from 'react';
import HeroSection from '../components/home/HeroSection';
import FeaturesGrid from '../components/home/FeaturesGrid';
import LatestJobs from '../components/home/LatestJobs';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      <HeroSection />
      <FeaturesGrid />
      <LatestJobs />
    </div>
  );
}
