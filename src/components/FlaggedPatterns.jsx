import React from 'react';
import { AlertOctagon, CornerDownRight } from 'lucide-react';

export function FlaggedPatterns({ flaggedPatterns = [], onSelectHighlight }) {
  if (!flaggedPatterns || flaggedPatterns.length === 0) return null;

  const severityColors = {
    high: 'border-[#E8B8B0] dark:border-[#592922] bg-[#FBF0EE] dark:bg-[#2A1715] text-[#B85242] dark:text-[#D96957]',
    medium: 'border-[#E8C98F] dark:border-[#5C4722] bg-[#FAF3E5] dark:bg-[#272216] text-[#D99A2B]',
    low: 'border-[#E2D9C8] dark:border-[#223446] bg-[#F6F2EA] dark:bg-[#1C2D3E] text-[#52667A] dark:text-slate-300',
  };

  return (
    <div className="p-5 bg-[#FFFDF8] dark:bg-[#162432] border border-[#E2D9C8] dark:border-[#223446] rounded-2xl shadow-sm space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="p-2 bg-[#FBF0EE] dark:bg-[#2A1715] border border-[#E8B8B0] dark:border-[#592922] rounded-xl text-[#B85242] dark:text-[#D96957]">
          <AlertOctagon className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-heading font-bold text-base text-[#13232F] dark:text-white">Flagged AI Patterns</h3>
          <p className="text-[11px] font-mono text-[#52667A] dark:text-slate-400">Detected Generative Language & Inflation</p>
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
              className={`p-3.5 border rounded-xl transition-all cursor-pointer hover:border-[#D99A2B] ${sClass} group`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-heading font-bold text-xs text-[#13232F] dark:text-white group-hover:text-[#D99A2B] transition-colors">
                  {item.name}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-md bg-[#FFFDF8] dark:bg-[#0F1720] border border-current">
                  {item.severity}
                </span>
              </div>

              {exampleText && (
                <p className="text-xs text-[#13232F] dark:text-slate-200 font-mono bg-[#FFFDF8] dark:bg-[#0F1720] p-2 rounded-lg border border-[#EDE5D6] dark:border-[#1C2D3E] mb-2 truncate">
                  "{exampleText}"
                </p>
              )}

              <p className="text-xs text-[#52667A] dark:text-slate-300 leading-relaxed">
                {item.why_it_matters}
              </p>

              <div className="mt-2 text-[10px] font-mono text-[#D99A2B] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <CornerDownRight className="w-3 h-3" /> Click to locate line in PDF
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
