import React from 'react';
import TransbillLogo from '../TransbillLogo';

export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A] py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <TransbillLogo dark />
        <p className="text-white/60 text-sm mt-3">
          © {new Date().getFullYear()} Transbill Solutions Limited. All rights reserved.
        </p>
        <p className="text-white/40 text-xs mt-2">
          CBN-Licensed PSS Super-Agent · Nigeria
        </p>
      </div>
    </footer>
  );
}