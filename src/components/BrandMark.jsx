import React from 'react';

/**
 * BrandMark — Two offset paper strips forming an abstract resume or review signal.
 * Represents the Quiet Signal visual identity.
 */
export function BrandMark({ size = 28, className = '' }) {
  return (
    <div 
      className={`inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Back Paper Strip */}
        <rect
          x="6"
          y="4"
          width="16"
          height="22"
          rx="2.5"
          className="fill-slate-300 dark:fill-slate-700 opacity-60"
        />
        <line x1="9" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-slate-400 dark:text-slate-500 opacity-70" />
        <line x1="9" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-slate-400 dark:text-slate-500 opacity-70" />

        {/* Front Offset Paper Strip */}
        <rect
          x="10"
          y="7"
          width="16"
          height="21"
          rx="2.5"
          fill="#FFFDF8"
          stroke="#13232F"
          strokeWidth="1.5"
          className="dark:fill-[#162432] dark:stroke-slate-600 shadow-sm"
        />

        {/* Review Signal Lines on Front Sheet */}
        <line x1="13" y1="12" x2="22" y2="12" stroke="#13232F" strokeWidth="1.5" strokeLinecap="round" className="dark:stroke-slate-300" />
        <line x1="13" y1="16" x2="20" y2="16" stroke="#13232F" strokeWidth="1.5" strokeLinecap="round" className="dark:stroke-slate-300" />

        {/* Saffron Review Signal Highlight Stroke */}
        <path
          d="M13 20H23"
          stroke="#D99A2B"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="22.5" cy="20" r="1.5" fill="#D99A2B" />
      </svg>
    </div>
  );
}
