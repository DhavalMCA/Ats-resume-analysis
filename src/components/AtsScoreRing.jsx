import React from 'react';

export function AtsScoreRing({ score, label, color = 'amber', size = 110 }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  const colorMap = {
    amber: { stroke: '#D99A2B', text: 'text-[#D99A2B]' },
    emerald: { stroke: '#3B7A57', text: 'text-[#3B7A57] dark:text-[#4E9A70]' },
    slate: { stroke: '#52667A', text: 'text-[#52667A] dark:text-slate-400' },
  };

  const selected = colorMap[color] || colorMap.amber;

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Background Track Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-[#E2D9C8] dark:text-[#223446]"
            fill="transparent"
          />
          {/* Progress Indicator Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={selected.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Score Number in Center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-heading font-extrabold text-2xl tracking-tight text-[#13232F] dark:text-white">
            {score}
          </span>
          <span className="text-[10px] font-mono font-semibold uppercase text-[#52667A] dark:text-slate-400">/100</span>
        </div>
      </div>
      <span className="mt-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#52667A] dark:text-slate-400">
        {label}
      </span>
    </div>
  );
}
