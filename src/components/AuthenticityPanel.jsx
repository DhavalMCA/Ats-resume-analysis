import React from 'react';
import { ShieldCheck, BarChart3 } from 'lucide-react';

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
    <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-white">Authenticity Index</h3>
            <p className="text-[11px] font-mono text-slate-400">Human vs AI Voice Score</p>
          </div>
        </div>

        <div className="flex items-baseline gap-1 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
          <span className="font-heading font-extrabold text-xl text-emerald-400">
            {authenticityScore || 0}
          </span>
          <span className="text-[10px] font-mono text-emerald-400/80">/100</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5 pt-1">
        {dimensions.map(dim => {
          const val = dimensionScores[dim.key] ?? 50;
          // Color based on whether high score is good or bad (inverted dimensions like buzzword density)
          const isGood = dim.inv ? val <= 40 : val >= 65;
          const isWarn = dim.inv ? val > 40 && val <= 70 : val >= 40 && val < 65;
          const barColor = isGood ? 'bg-emerald-500' : isWarn ? 'bg-amber-500' : 'bg-red-500';

          return (
            <div key={dim.key} className="space-y-1">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300 font-medium">{dim.label}</span>
                <span className={`font-semibold ${isGood ? 'text-emerald-400' : isWarn ? 'text-amber-400' : 'text-red-400'}`}>
                  {val}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
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
