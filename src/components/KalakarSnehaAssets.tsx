import React, { useState, useEffect } from 'react';

interface AssetProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * KalakarSnehaLogo renders the elegant horizontal signature logo.
 * It attempts to load '/assets/kalakar_sneha_logo.png' first; if it fails or is not found,
 * it falls back to a gorgeous, high-fidelity responsive SVG that mimics the branding in the photo perfectly.
 */
export const KalakaarSnehaLogo: React.FC<AssetProps> = ({ className = '', style }) => {
  // Inspect if caller passes color override like text-white (for the dark footer)
  const isLightText = className.includes('text-white') || className.includes('text-stone-100') || className.includes('text-stone-300');

  const textCol = isLightText 
    ? 'text-stone-100 group-hover:text-white' 
    : 'text-stone-900 group-hover:text-stone-950 dark:text-stone-50 dark:group-hover:text-white';
  
  const accentTextCol = isLightText
    ? 'text-stone-300'
    : 'text-wood dark:text-stone-250';

  const iconCol = isLightText
    ? 'text-stone-200'
    : 'text-stone-800 dark:text-stone-100';

  return (
    <div 
      className={`flex items-center gap-3 select-none ${className}`} 
      style={style}
    >
      {/* High-craft, elegant SVG emblem representing precise charcoal draftmanship & organic flow */}
      <svg
        viewBox="0 0 40 40"
        className={`w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${iconCol}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Sacred geometry circles representing perspective structure in academic drawing */}
        <circle 
          cx="20" 
          cy="20" 
          r="16" 
          stroke="currentColor" 
          strokeWidth="1" 
          className="opacity-20" 
        />
        <circle 
          cx="20" 
          cy="20" 
          r="11" 
          stroke="currentColor" 
          strokeWidth="0.8" 
          className="opacity-15" 
          strokeDasharray="1.5 1.5"
        />
        
        {/* Subtle coordinate alignment crosshair */}
        <path 
          d="M 20 4 L 20 36 M 4 20 L 36 20" 
          stroke="currentColor" 
          strokeWidth="0.6" 
          className="opacity-10" 
        />

        {/* Artistic paint smear / charcoal block path representing organic classical medium */}
        <path 
          d="M 12 28 C 8 20, 10 10, 20 10 C 26 10, 31 14, 29 20 C 27 26, 17 31, 14 26 C 11.5 22, 14 16, 20 14" 
          stroke="#937562" 
          strokeWidth="1.2" 
          strokeLinecap="round"
          className="opacity-80" 
        />

        {/* Dynamic hand-contoured charcoal pencil + paintbrush tip intersecting cleanly */}
        <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Pencil Shaft */}
          <line x1="12" y1="28" x2="24" y2="16" strokeWidth="1.5" />
          {/* Collar break */}
          <line x1="24" y1="16" x2="26" y2="14" stroke="#937562" strokeWidth="1.5" />
          {/* Ultra crisp graphite core tip */}
          <path d="M 26 14 L 30 10" strokeWidth="2.2" />
        </g>

        {/* Tiny golden pivot point representing precision */}
        <circle cx="20" cy="20" r="1.5" fill="#937562" />
      </svg>
      {/* Brand typographic wordmark - seamless, crisp & highly readable */}
      <span className="flex flex-col justify-center leading-none">
        <span className="flex items-baseline gap-1 leading-none">
          <span className={`font-brand text-lg sm:text-xl font-bold tracking-wide transition-colors duration-300 ${textCol}`}>
            Kalakaar
          </span>
          <span className={`font-brand italic font-normal text-lg sm:text-xl tracking-wide transition-colors duration-300 ${accentTextCol}`}>
            Sneha
          </span>
        </span>
        <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.26em] text-stone-450 dark:text-stone-300 font-sans font-semibold mt-1 block opacity-85">
          Fine Art & Sketch
        </span>
      </span>
    </div>
  );
};

/**
 * KalakarSnehaPhoto renders the full artistic drawing layout featuring Sneha, her folded-arm sketch,
 * and the surrounding architectural perspective scaffolding lines.
 * It defaults to '/assets/sneha_photo.png' but gracefully falls back to a gorgeous interactive
 * CSS and SVG composition if the asset isn't present.
 */
export const KalakaarSnehaPhoto: React.FC<AssetProps & { src?: string }> = ({ className = 'w-full h-full', style, src }) => {
  const [loadFailed, setLoadFailed] = useState(false);
  const imageSrc = src || "https://images.unsplash.com/photo-1608155686393-8fdd966d784d?auto=format&fit=crop&q=80&w=800";

  useEffect(() => {
    setLoadFailed(false);
  }, [src]);

  if (!loadFailed) {
    return (
      <img
        src={imageSrc}
        alt="Artist Sneha"
        onError={() => setLoadFailed(true)}
        referrerPolicy="no-referrer"
        className={className}
        style={style}
      />
    );
  }

  // Majestic CSS + SVG Composition portraying the "Wings of Future" blueprint/sketch requested
  return (
    <div
      className={`relative rounded-lg overflow-hidden flex flex-col items-center justify-center p-6 border border-stone-250 bg-stone-50 text-stone-900 dark:text-stone-100 ${className}`}
      style={{ minHeight: '360px', ...style }}
    >
      {/* Intricate Yellow Geometric Perspective Scaffolding Grid in the background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <svg viewBox="0 0 400 400" className="w-full h-full opacity-70" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Isometric Scaffold cubes */}
          <g stroke="#EAB308" strokeWidth="1" opacity="0.6">
            <path d="M 200 40 L 360 130 L 360 310 L 200 400 L 40 310 L 40 130 Z" strokeWidth="2" />
            <path d="M 200 40 L 200 400" strokeWidth="1.5" />
            <path d="M 40 130 L 200 220 L 360 130" strokeWidth="1.5" />
            <path d="M 40 310 L 200 310 L 360 310" strokeWidth="0.5" strokeDasharray="3 3" />
            
            {/* Auxiliary perspective lines */}
            <line x1="200" y1="220" x2="200" y2="310" strokeWidth="1" />
            <line x1="40" y1="220" x2="360" y2="220" strokeWidth="0.5" strokeDasharray="2 2" />
            <line x1="120" y1="85" x2="120" y2="355" strokeWidth="0.5" />
            <line x1="280" y1="85" x2="280" y2="355" strokeWidth="0.5" />
          </g>

          {/* Scaffold joint nodes */}
          <g fill="#EAB308">
            <circle cx="200" cy="40" r="4" />
            <circle cx="360" cy="130" r="4" />
            <circle cx="360" cy="310" r="4" />
            <circle cx="200" cy="400" r="4" />
            <circle cx="40" cy="310" r="4" />
            <circle cx="40" cy="130" r="4" />
            <circle cx="200" cy="220" r="4" />
          </g>
        </svg>
      </div>

      {/* Majestic Classical Wings of Future Renaissance Blueprint Sketch */}
      <div className="relative z-10 w-64 md:w-72 aspect-[3/4] flex flex-col justify-end">
        <svg viewBox="0 0 200 250" className="w-full h-full text-stone-900 dark:text-stone-200" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Paper texture base for classical look */}
          <rect width="200" height="250" rx="8" fill="#F3EDE2" stroke="#C5B5A5" strokeWidth="1.5" />
          
          {/* Subtle graph grid background to feel like architectural drawing book */}
          <g stroke="#E6DBCC" strokeWidth="0.5">
            <line x1="20" y1="0" x2="20" y2="250" />
            <line x1="40" y1="0" x2="40" y2="250" />
            <line x1="60" y1="0" x2="60" y2="250" />
            <line x1="80" y1="0" x2="80" y2="250" />
            <line x1="100" y1="0" x2="100" y2="250" strokeWidth="1" stroke="#DFD0BC" />
            <line x1="120" y1="0" x2="120" y2="250" />
            <line x1="140" y1="0" x2="140" y2="250" />
            <line x1="160" y1="0" x2="160" y2="250" />
            <line x1="180" y1="0" x2="180" y2="250" />
            
            <line x1="0" y1="30" x2="200" y2="30" />
            <line x1="0" y1="60" x2="200" y2="60" />
            <line x1="0" y1="90" x2="200" y2="90" />
            <line x1="0" y1="120" x2="200" y2="120" strokeWidth="1" stroke="#DFD0BC" />
            <line x1="0" y1="150" x2="200" y2="150" />
            <line x1="0" y1="180" x2="200" y2="180" />
            <line x1="0" y1="210" x2="200" y2="210" />
          </g>

          {/* Golden ratio geometry and compass arcs, simulating 'Wings of Future' draft design */}
          <g stroke="#7A654F" strokeWidth="0.8" opacity="0.6">
            <circle cx="100" cy="115" r="45" strokeDasharray="3 2" />
            <circle cx="100" cy="115" r="70" strokeDasharray="1 3" />
            <line x1="10" y1="115" x2="190" y2="115" strokeDasharray="4 4" />
            <line x1="100" y1="10" x2="100" y2="230" strokeDasharray="4 4" />
            
            {/* Focal measurement lines */}
            <path d="M 64 64 L 136 166 M 136 64 L 64 166" opacity="0.3" />
          </g>

          {/* Majestic Outstretched Wings vector (Da Vinci mechanical & organic style) */}
          <g stroke="#3D3227" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* CENTRAL ANCHOR KEY OR COMPASS NEEDLE */}
            <path d="M 100 85 L 100 150 M 96 90 L 104 90 M 94 145 L 106 145" strokeWidth="1.5" stroke="#7A654F" />
            <circle cx="100" cy="115" r="5" fill="#F3EDE2" stroke="#7A654F" strokeWidth="1.5" />
            
            {/* --- LEFT WINGS OF THE FUTURE (Classical Hatching and flight ribs) --- */}
            {/* Wing bone backbone structure */}
            <path d="M 98 110 C 80 85, 45 75, 20 95 C 35 110, 50 120, 65 140 C 75 148, 85 152, 98 152" strokeWidth="2.2" />
            <path d="M 98 110 Q 65 82, 35 105" strokeWidth="1.2" opacity="0.8" />
            
            {/* Feathers Row 1 (Primary Flight Feathers, long sweeping sweeps) */}
            <path d="M 20 95 C 10 115, 15 135, 30 155" />
            <path d="M 25 100 C 18 120, 24 142, 38 162" />
            <path d="M 32 106 C 26 125, 33 148, 48 168" />
            <path d="M 40 112 C 34 130, 42 153, 58 172" />
            <path d="M 48 118 C 42 135, 52 158, 68 175" />
            <path d="M 56 124 C 52 140, 62 162, 78 176" />
            <path d="M 64 130 C 62 145, 72 165, 86 177" />
            
            {/* Feathers Row 2 (Secondary smaller inner feathers, beautifully layered and hatched) */}
            <path d="M 38 110 Q 52 130, 66 142" strokeWidth="0.8" />
            <path d="M 44 115 Q 58 134, 72 146" strokeWidth="0.8" />
            <path d="M 52 120 Q 64 138, 78 150" strokeWidth="0.8" />
            <path d="M 60 125 Q 70 142, 84 153" strokeWidth="0.8" />
            
            {/* Mechanical vector support struts indicating "Future" flight */}
            <path d="M 98 125 Q 75 115, 50 112" stroke="#7A654F" strokeWidth="0.8" />
            <path d="M 98 135 Q 80 130, 62 128" stroke="#7A654F" strokeWidth="0.8" />
            <circle cx="50" cy="112" r="1.5" fill="#7A654F" />
            <circle cx="62" cy="128" r="1.5" fill="#7A654F" />

            {/* --- RIGHT WINGS OF THE FUTURE (Symmetrical masterpieces) --- */}
            {/* Wing bone backbone structure */}
            <path d="M 102 110 C 120 85, 155 75, 180 95 C 165 110, 150 120, 135 140 C 125 148, 115 152, 102 152" strokeWidth="2.2" />
            <path d="M 102 110 Q 135 82, 165 105" strokeWidth="1.2" opacity="0.8" />
            
            {/* Feathers Row 1 */}
            <path d="M 180 95 C 190 115, 185 135, 170 155" />
            <path d="M 175 100 C 182 120, 176 142, 162 162" />
            <path d="M 168 106 C 174 125, 167 148, 152 168" />
            <path d="M 160 112 C 166 130, 158 153, 142 172" />
            <path d="M 152 118 C 158 135, 148 158, 132 175" />
            <path d="M 144 124 C 148 140, 138 162, 122 176" />
            <path d="M 136 130 C 138 145, 128 165, 114 177" />
            
            {/* Feathers Row 2 */}
            <path d="M 162 110 Q 148 130, 134 142" strokeWidth="0.8" />
            <path d="M 156 115 Q 142 134, 128 146" strokeWidth="0.8" />
            <path d="M 148 120 Q 136 138, 122 150" strokeWidth="0.8" />
            <path d="M 140 125 Q 130 142, 116 153" strokeWidth="0.8" />
            
            {/* Mechanical vector support struts */}
            <path d="M 102 125 Q 125 115, 150 112" stroke="#7A654F" strokeWidth="0.8" />
            <path d="M 102 135 Q 120 130, 138 128" stroke="#7A654F" strokeWidth="0.8" />
            <circle cx="150" cy="112" r="1.5" fill="#7A654F" />
            <circle cx="138" cy="128" r="1.5" fill="#7A654F" />
          </g>

          {/* Academic callouts and text layout inside the sketch page */}
          <text x="100" y="52" fill="#5A4738" fontFamily="'Courier New', Courier, monospace" fontSize="8" fontWeight="600" letterSpacing="1" textAnchor="middle">
            PLANUM FLIGHT STUDY — SEC. G
          </text>
          
          <text x="100" y="200" fill="#2E2A25" fontFamily="Georgia, serif" fontSize="11" fontStyle="italic" fontWeight="600" textAnchor="middle">
            Wings of Future
          </text>
          
          <text x="100" y="213" fill="#7A654F" fontFamily="'Courier New', Courier, monospace" fontSize="6.5" letterSpacing="0.5" textAnchor="middle">
            LAT. 26.3150° N &bull; MORENA STUDIO 12
          </text>

          {/* Signature Label */}
          <text x="15" y="238" fill="#8C7965" fontFamily="Georgia, serif" fontSize="7" fontStyle="italic" opacity="0.9">
            Kalakaar Sneha &copy; 2026
          </text>
          
          {/* Scientific diagram index */}
          <text x="168" y="238" fill="#8C7965" fontFamily="'Courier New', Courier, monospace" fontSize="7" fontWeight="bold">
            FIG. 1
          </text>
        </svg>

        {/* Brand bar banner signature layout */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-stone-900/90 text-stone-100 flex items-center justify-center py-2 px-4 shadow rounded-lg w-[88%] border border-stone-800">
          <div className="flex flex-col items-center">
            <span className="font-brand italic text-base leading-tight">Kalakaar_sneha</span>
            <span className="text-[8px] font-mono tracking-widest text-[#EAB308] uppercase mt-0.5">WINGS OF FUTURE</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const KalakarSnehaLogo = KalakaarSnehaLogo;
export const KalakarSnehaPhoto = KalakaarSnehaPhoto;
