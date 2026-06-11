import React from 'react';

export default function TransbillLogo({ dark = false }) {
  return (
    <img
      src="https://media.base44.com/images/public/6a1d7f35df3abaff93c10cec/bc7731e43_Transbilllogo.png"
      alt="Transbill Solutions Limited"
      className={`h-10 w-auto object-contain ${dark ? 'brightness-0 invert' : ''}`}
    />
  );
}