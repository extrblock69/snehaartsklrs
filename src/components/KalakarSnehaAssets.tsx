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
export const KalakarSnehaLogo: React.FC<AssetProps> = ({ className = '', style }) => {
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
      <span className="flex flex-col sm:flex-row sm:items-baseline sm:gap-1.5 leading-none">
        <span className={`font-sans font-bold tracking-[0.16em] uppercase text-xs sm:text-sm transition-colors duration-300 ${textCol}`}>
          Kalakar
        </span>
        <span className={`font-brand italic font-medium text-base sm:text-lg tracking-wide transition-colors duration-300 ${accentTextCol}`}>
          Sneha
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
export const KalakarSnehaPhoto: React.FC<AssetProps & { src?: string }> = ({ className = 'w-full h-full', style, src }) => {
  const [loadFailed, setLoadFailed] = useState(false);
  const imageSrc = src || "/assets/sneha_photo.png";

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

  // Majestic CSS + SVG Composition portraying the photograph/sketch requested
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

      {/* The high-contrast hand-shaded fine charcoal portrait of Sneha */}
      <div className="relative z-10 w-64 md:w-72 aspect-[3/4] flex flex-col justify-end">
        <svg viewBox="0 0 200 250" className="w-full h-full text-stone-900 dark:text-stone-200" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Subtle paper background texture for the sketch */}
          <rect width="200" height="250" rx="6" fill="#F4EFE6" opacity="0.95" stroke="#D1C7BD" strokeWidth="0.75" />
          
          <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            {/* Hair back masses */}
            <path d="M 70 80 Q 50 110 52 180 Q 53 210 65 240" strokeWidth="1.8" />
            <path d="M 130 80 Q 150 110 148 180 Q 147 210 135 240" strokeWidth="1.8" />
            
            {/* Shirt outline with academic fold shading */}
            <path d="M 75 160 Q 55 170 50 200 L 58 245 L 142 245 L 150 200 Q 145 170 125 160 Z" fill="#2E2A25" />
            <path d="M 100 160 L 100 245" stroke="#F4EFE6" strokeWidth="1" opacity="0.3" />
            
            {/* Shading/texture on the shirt */}
            <path d="M 58 190 L 68 230 M 75 185 L 85 235 M 142 190 L 132 230 M 125 185 L 115 235" stroke="#1C1814" strokeWidth="0.8" opacity="0.4" />
            
            {/* Neck */}
            <path d="M 88 140 Q 88 165 92 170 M 112 140 Q 112 165 108 170" />
            
            {/* Portrait Face Contour */}
            <path d="M 80 85 C 78 120, 80 142, 100 148 C 120 142, 122 120, 120 85" fill="#FAF5EC" />
            
            {/* Smiling Lips with hand-hatched value study */}
            <path d="M 92 128 Q 100 135 108 128" strokeWidth="1.5" />
            <path d="M 90 126 Q 100 129 110 126" strokeWidth="1" />
            <line x1="96" y1="127" x2="96" y2="130" opacity="0.5" />
            <line x1="104" y1="127" x2="104" y2="131" opacity="0.5" />
            
            {/* Smiling cheeks / dimple lines */}
            <path d="M 85 118 Q 88 124 90 127" opacity="0.6" strokeWidth="0.8" />
            <path d="M 115 118 Q 112 124 110 127" opacity="0.6" strokeWidth="0.8" />

            {/* Nose study */}
            <path d="M 98 102 Q 100 118 102 118 Q 104 118 105 115" strokeWidth="1.1" />

            {/* Eyes */}
            <path d="M 86 103 Q 91 99 96 103" strokeWidth="1.4" />
            <path d="M 104 103 Q 109 99 114 103" strokeWidth="1.4" />
            {/* Pupils & Eyebrows */}
            <circle cx="91" cy="103" r="2.2" fill="currentColor" />
            <circle cx="109" cy="103" r="2.2" fill="currentColor" />
            <path d="M 84 97 Q 91 92 98 96" strokeWidth="1.8" />
            <path d="M 102 96 Q 109 92 116 97" strokeWidth="1.8" />

            {/* Hair front blocks and bangs framing the face */}
            <path d="M 100 70 C 80 72, 75 88, 76 102 C 77 115, 80 135, 78 140 M 100 70 C 115 72, 122 88, 122 102 C 122 115, 118 135, 120 140" strokeWidth="1.8" />
            {/* Hair volume details */}
            <path d="M 72 75 C 62 82, 60 102, 62 130 C 64 150, 70 170, 71 190" strokeWidth="1.5" />
            <path d="M 128 75 C 138 82, 140 102, 138 130 C 136 150, 130 170, 129 190" strokeWidth="1.5" />
            <path d="M 100 68 L 100 80" strokeWidth="0.8" opacity="0.6" />

            {/* Crossed arms overlapping bottom of image */}
            <g strokeWidth="1.5" fill="#EAE5DC">
              <path d="M 64 185 C 64 185, 90 178, 115 186 C 128 190, 134 200, 134 205 C 134 212, 110 216, 90 212 L 64 198 Z" />
              <path d="M 136 190 C 120 190, 95 195, 78 206 C 72 210, 68 214, 73 222 C 78 230, 115 228, 136 218 Z" />
            </g>
            <path d="M 82 195 C 80 205, 85 210, 92 211" strokeWidth="1" opacity="0.8" />
            <path d="M 110 195 C 114 203, 112 208, 106 210" strokeWidth="1" opacity="0.8" />
          </g>

          {/* Signature label */}
          <text x="14" y="240" fill="#7A674B" fontFamily="Georgia, serif" fontSize="8" fontStyle="italic" opacity="0.8">
            Kalakar Sneha &copy; 2026
          </text>
        </svg>

        {/* Brand bar banner signature layout */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-stone-900/90 text-stone-100 flex items-center justify-center py-2 px-4 shadow rounded-lg w-[88%] border border-stone-800">
          <div className="flex flex-col items-center">
            <span className="font-brand italic text-base leading-tight">Kalakar_sneha</span>
            <span className="text-[8px] font-mono tracking-widest text-[#EAB308] uppercase mt-0.5">STUDIO MASTER</span>
          </div>
        </div>
      </div>
    </div>
  );
};
