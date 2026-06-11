import React from 'react';

export default function TransbillLogo({ dark = false }) {
  return (
    <div className="flex items-center gap-2">
      {/* Icon mark */}
      <div className="relative flex-shrink-0">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="6" fill={dark ? '#ffffff22' : '#EBF5EB'} />
          <path d="M8 10h10a4 4 0 0 1 0 8H8V10z" fill={dark ? 'white' : '#2D6A2F'} />
          <path d="M8 18h12a4 4 0 0 1 0 8H8V18z" fill={dark ? 'white' : '#3A7D3C'} opacity="0.7" />
          <rect x="22" y="6" width="4" height="4" rx="2" fill={dark ? 'white' : '#2D6A2F'} />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className={`font-extrabold text-[17px] tracking-tight ${dark ? 'text-white' : 'text-[#2D6A2F]'}`}>
          Transbill
        </span>
        <span className={`text-[10px] font-medium tracking-wide ${dark ? 'text-white/60' : 'text-[#555555]'}`}>
          Solutions Limited
        </span>
      </div>
    </div>
  );
}