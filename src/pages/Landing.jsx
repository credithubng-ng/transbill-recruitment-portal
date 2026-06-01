import React from 'react';
import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import WhySection from '../components/landing/WhySection';
import WhatYouDoSection from '../components/landing/WhatYouDoSection';
import RequirementsSection from '../components/landing/RequirementsSection';
import BenefitsSection from '../components/landing/BenefitsSection';
import CTASection from '../components/landing/CTASection';
import Footer from '../components/landing/Footer';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <WhySection />
      <WhatYouDoSection />
      <RequirementsSection />
      <BenefitsSection />
      <CTASection />
      <Footer />
    </div>
  );
}