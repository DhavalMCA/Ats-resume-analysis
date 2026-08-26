import React, { useState } from 'react';
import { Copy, Check, CornerDownRight, Sparkles } from 'lucide-react';

export function SuggestionCard({ suggestion, index, onSelectHighlight }) {
  const [copied, setCopied] = useState(false);

  const { original, improved, reason, impact_points = 5, priority = 'required' } = suggestion;

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(improved);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isOptional = priority === 'optional';

  return (
    <div
      onClick={() => onSelectHighlight?.(original)}
      data-testid={`suggestion-card-${index}`}
      className={`p-4 rounded-2xl border transition-all cursor-pointer group hover:shadow-md ${
        isOptional
          ? 'bg-[#FFFDF8] dark:bg-[#162432] border-[#E2D9C8] dark:border-[#223446] hover:border-[#D99A2B]/60'
          : 'bg-[#FFFDF8] dark:bg-[#162432] border-[#EDE5D6] dark:border-[#223446] hover:border-[#D99A2B]'
      }`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono font-bold text-xs text-[#13232F] dark:text-white flex items-center gap-1">
            <span className="text-[#D99A2B]">#{index + 1}</span> Strategic Rewrite
          </span>
          {isOptional && (
            <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-[#F6F2EA] dark:bg-[#1C2D3E] text-[#52667A] dark:text-slate-400 border border-[#EDE5D6] dark:border-[#223446] rounded-full">
              OPTIONAL POLISH
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {impact_points > 0 && (
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-[#EBF4EE] dark:bg-[#13261C] text-[#3B7A57] dark:text-[#4E9A70] border border-[#A8D0B5] dark:border-[#245037] rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              +{impact_points} pts
            </span>
          )}

          <button
            type="button"
            onClick={handleCopy}
            data-testid={`copy-suggestion-${index}`}
            className="p-1.5 bg-[#F6F2EA] dark:bg-[#1C2D3E] hover:bg-[#FAF3E5] dark:hover:bg-[#272216] text-[#52667A] dark:text-slate-300 hover:text-[#13232F] dark:hover:text-white rounded-lg transition-colors flex items-center gap-1 text-[11px] font-mono border border-[#E2D9C8] dark:border-[#223446]"
            title="Copy improved rewrite"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#3B7A57]" />
                <span className="text-[#3B7A57]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Before / After Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        {/* Original Line */}
        <div className="p-3 bg-[#FBF0EE] dark:bg-[#2A1715] border border-[#E8B8B0] dark:border-[#592922] rounded-xl space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#B85242] dark:text-[#D96957]">
            Original Draft
          </span>
          <p className="text-xs text-[#13232F] dark:text-slate-300 line-through decoration-red-400/80 leading-relaxed font-sans">
            "{original}"
          </p>
        </div>

        {/* Improved Rewrite */}
        <div className="p-3 bg-[#FAF3E5] dark:bg-[#272216] border border-[#E8C98F] dark:border-[#5C4722] rounded-xl space-y-1 relative">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D99A2B] flex items-center gap-1">
            Saffron Impact Optimized Rewrite
          </span>
          <p className="text-xs text-[#13232F] dark:text-white font-medium leading-relaxed font-sans">
            "{improved}"
          </p>
        </div>
      </div>

      {/* Footer Reason & Click Hint */}
      <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-[#52667A] dark:text-slate-400 border-t border-[#EDE5D6] dark:border-[#223446]">
        <span className="italic truncate max-w-[80%]">
          Why: {reason}
        </span>
        <span className="text-[#D99A2B] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 shrink-0">
          Locate line <CornerDownRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
}
