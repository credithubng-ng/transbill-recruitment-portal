import React from 'react';
import { Flag } from 'lucide-react';

export default function TransbillLogo({ dark = false }) {
  return (
    <div className="flex items-center gap-1.5">
      <Flag className={`w-5 h-5 ${dark ? 'text-white' : 'text-[#2D6A2F]'}`} fill={dark ? 'white' : '#2D6A2F'} />
      <span className={`font-extrabold text-xl tracking-tight ${dark ? 'text-white' : 'text-[#2D6A2F]'}`}>
        Transbill
      </span>
    </div>
  );
}