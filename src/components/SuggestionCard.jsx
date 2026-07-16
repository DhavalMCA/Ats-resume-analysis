import React, { useState } from 'react';
import { Copy, Check, ArrowRight, CornerDownRight, Sparkles } from 'lucide-react';

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
      className={`p-4 rounded-2xl border transition-all cursor-pointer group hover:shadow-xl ${
        isOptional
          ? 'bg-slate-900/60 border-slate-800 hover:border-amber-500/40'
          : 'bg-slate-900/90 border-slate-700/80 hover:border-amber-400'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-xs text-white flex items-center gap-1">
            <span className="text-amber-400">#{index + 1}</span> Rewrite
          </span>
          {isOptional && (
            <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-slate-800 text-slate-400 border border-slate-700 rounded-full">
              OPTIONAL POLISH
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {impact_points > 0 && (
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              +{impact_points} pts
            </span>
          )}

          <button
            type="button"
            onClick={handleCopy}
            data-testid={`copy-suggestion-${index}`}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors flex items-center gap-1 text-[11px] font-mono"
            title="Copy improved rewrite"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
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
        <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-400">
            Original Wording
          </span>
          <p className="text-xs text-slate-300 line-through decoration-red-400/80 leading-relaxed font-sans">
            "{original}"
          </p>
        </div>

        {/* Improved Rewrite */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1 relative">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
            Impact Optimized Rewrite
          </span>
          <p className="text-xs text-white font-medium leading-relaxed font-sans">
            "{improved}"
          </p>
        </div>
      </div>

      {/* Footer Reason & Click Hint */}
      <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-slate-400 border-t border-slate-800/60">
        <span className="italic truncate max-w-[80%]">
          Why: {reason}
        </span>
        <span className="text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 shrink-0">
          Locate line <CornerDownRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
}
