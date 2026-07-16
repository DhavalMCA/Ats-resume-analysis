import React from 'react';
import { AlertOctagon, CornerDownRight } from 'lucide-react';

export function FlaggedPatterns({ flaggedPatterns = [], onSelectHighlight }) {
  if (!flaggedPatterns || flaggedPatterns.length === 0) return null;

  const severityColors = {
    high: 'border-red-500/30 bg-red-500/5 text-red-400',
    medium: 'border-amber-500/30 bg-amber-500/5 text-amber-400',
    low: 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400',
  };

  return (
    <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-red-500/10 rounded-xl text-red-400">
          <AlertOctagon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-heading font-bold text-base text-white">Flagged AI Patterns</h3>
          <p className="text-[11px] font-mono text-slate-400">Detected Generative Language & Inflation</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {flaggedPatterns.map((item, idx) => {
          const sClass = severityColors[item.severity?.toLowerCase()] || severityColors.medium;
          const exampleText = Array.isArray(item.examples) ? item.examples[0] : item.examples;

          return (
            <div
              key={idx}
              onClick={() => exampleText && onSelectHighlight?.(exampleText)}
              className={`p-3.5 border rounded-xl transition-all cursor-pointer hover:border-amber-500/50 ${sClass} group`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-heading font-bold text-xs text-white group-hover:text-amber-400 transition-colors">
                  {item.name}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-md bg-slate-950/60 border border-current">
                  {item.severity}
                </span>
              </div>

              {exampleText && (
                <p className="text-xs text-slate-300 font-mono bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 mb-2 truncate">
                  "{exampleText}"
                </p>
              )}

              <p className="text-xs text-slate-400 leading-relaxed">
                {item.why_it_matters}
              </p>

              <div className="mt-2 text-[10px] font-mono text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <CornerDownRight className="w-3 h-3" /> Click to locate line in PDF
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
