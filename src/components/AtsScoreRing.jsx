import React from 'react';

export function AtsScoreRing({ score, label, color = 'amber', size = 110 }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const colorMap = {
    amber: { stroke: '#f59e0b', bg: '#f59e0b20', text: 'text-amber-400' },
    emerald: { stroke: '#10b981', bg: '#10b98120', text: 'text-emerald-400' },
    slate: { stroke: '#64748b', bg: '#64748b20', text: 'text-slate-400' },
  };

  const selected = colorMap[color] || colorMap.amber;

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-800"
            fill="transparent"
          />
          {/* Progress circle */}
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
        {/* Score Number in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`font-heading font-extrabold text-2xl tracking-tight text-white`}>
            {score}
          </span>
          <span className="text-[10px] font-mono font-semibold uppercase text-slate-400">/100</span>
        </div>
      </div>
      <span className="mt-2 text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </span>
    </div>
  );
}
