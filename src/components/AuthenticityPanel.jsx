import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function AuthenticityPanel({ authenticityScore, dimensionScores = {} }) {
  const dimensions = [
    { key: 'buzzword_density', label: 'Buzzword Density', inv: true },
    { key: 'specificity', label: 'Specificity & Quantification', inv: false },
    { key: 'seniority_realism', label: 'Seniority Realism', inv: false },
    { key: 'technical_depth', label: 'Technical Depth', inv: false },
    { key: 'semantic_redundancy', label: 'Semantic Redundancy', inv: true },
    { key: 'style_entropy', label: 'Style & Rhythm Variation', inv: false },
    { key: 'verifiability', label: 'Claim Verifiability', inv: false },
    { key: 'ats_manipulation', label: 'ATS Keyword Stuffing', inv: true },
  ];

  return (
    <div className="p-5 bg-[#FFFDF8] dark:bg-[#162432] border border-[#E2D9C8] dark:border-[#223446] rounded-2xl shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#EBF4EE] dark:bg-[#13261C] border border-[#A8D0B5] dark:border-[#245037] rounded-xl text-[#3B7A57] dark:text-[#4E9A70]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-[#13232F] dark:text-white">Authenticity Index</h3>
            <p className="text-[11px] font-mono text-[#52667A] dark:text-slate-400">Human vs AI Writing Patterns</p>
          </div>
        </div>

        <div className="flex items-baseline gap-1 bg-[#EBF4EE] dark:bg-[#13261C] border border-[#A8D0B5] dark:border-[#245037] px-3 py-1 rounded-xl">
          <span className="font-heading font-extrabold text-lg text-[#3B7A57] dark:text-[#4E9A70]">
            {authenticityScore || 0}
          </span>
          <span className="text-[10px] font-mono text-[#3B7A57]/80 dark:text-[#4E9A70]/80">/100</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5 pt-1">
        {dimensions.map(dim => {
          const val = dimensionScores[dim.key] ?? 50;
          const isGood = dim.inv ? val <= 40 : val >= 65;
          const isWarn = dim.inv ? val > 40 && val <= 70 : val >= 40 && val < 65;
          const barColor = isGood ? 'bg-[#3B7A57] dark:bg-[#4E9A70]' : isWarn ? 'bg-[#D99A2B]' : 'bg-[#B85242] dark:bg-[#D96957]';
          const textColor = isGood ? 'text-[#3B7A57] dark:text-[#4E9A70]' : isWarn ? 'text-[#D99A2B]' : 'text-[#B85242] dark:text-[#D96957]';

          return (
            <div key={dim.key} className="space-y-1">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#13232F] dark:text-slate-300 font-medium">{dim.label}</span>
                <span className={`font-semibold ${textColor}`}>
                  {val}%
                </span>
              </div>
              <div className="w-full h-2 bg-[#F6F2EA] dark:bg-[#0F1720] rounded-full overflow-hidden border border-[#EDE5D6] dark:border-[#1C2D3E]">
                <div
                  className={`h-full ${barColor} transition-all duration-700 ease-out`}
                  style={{ width: `${Math.min(100, Math.max(0, val))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
