import React, { useMemo, useRef, useEffect } from 'react';
import { findMatchingLineBox } from '../lib/pdfUtils';
import { Eye, ShieldAlert, Sparkles } from 'lucide-react';

export function PdfHighlightViewer({ pages = [], aiDetectedLines = [], activeHighlightText }) {
  const containerRef = useRef(null);

  // Match AI detected lines to exact line boxes on rendered canvas pages
  const pageHighlights = useMemo(() => {
    if (!pages || pages.length === 0 || !aiDetectedLines || aiDetectedLines.length === 0) {
      return [];
    }

    const matches = [];

    aiDetectedLines.forEach((item) => {
      const match = findMatchingLineBox(item.text, pages);
      if (match) {
        matches.push({
          ...match,
          severity: item.severity || 'medium',
          pattern: item.pattern || 'Flagged Language',
          detectedText: item.text,
        });
      }
    });

    return matches;
  }, [pages, aiDetectedLines]);

  // Scroll to active highlight when clicked from suggestion cards
  useEffect(() => {
    if (!activeHighlightText || pageHighlights.length === 0) return;

    const matched = pageHighlights.find(h => 
      h.detectedText.toLowerCase().includes(activeHighlightText.toLowerCase()) ||
      activeHighlightText.toLowerCase().includes(h.detectedText.toLowerCase())
    );

    if (matched) {
      const el = document.getElementById(`highlight-${matched.pageIndex}-${Math.round(matched.box.y)}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('highlight-pulse', 'ring-2', 'ring-amber-400');
        setTimeout(() => {
          el.classList.remove('highlight-pulse', 'ring-2', 'ring-amber-400');
        }, 3000);
      }
    }
  }, [activeHighlightText, pageHighlights]);

  const severityStyles = {
    high: 'bg-red-500/30 border-red-500/80 hover:bg-red-500/50 text-red-100',
    medium: 'bg-amber-500/30 border-amber-500/80 hover:bg-amber-500/50 text-amber-100',
    low: 'bg-yellow-500/30 border-yellow-500/80 hover:bg-yellow-500/50 text-yellow-100',
  };

  if (!pages || pages.length === 0) return null;

  return (
    <div ref={containerRef} className="space-y-4">
      {/* Severity Legend Header */}
      <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center justify-between gap-2 shadow-md">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-amber-400" />
          <span className="font-heading font-bold text-xs text-white">Interactive PDF Inspector</span>
        </div>

        <div className="flex items-center gap-3 text-[10px] font-mono font-semibold">
          <span className="flex items-center gap-1 text-red-400">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" /> High Severity
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" /> Medium
          </span>
          <span className="flex items-center gap-1 text-yellow-300">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80 inline-block" /> Low
          </span>
        </div>
      </div>

      {/* Pages Canvas List */}
      <div className="space-y-6 max-h-[85vh] overflow-y-auto pr-1 custom-scrollbar rounded-2xl">
        {pages.map((page, pIdx) => {
          const pageMatches = pageHighlights.filter(h => h.pageIndex === pIdx);

          return (
            <div
              key={pIdx}
              className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl mx-auto max-w-full"
              style={{ width: page.width }}
            >
              {/* PDF Canvas Image */}
              <img
                src={page.dataUrl}
                alt={`Page ${pIdx + 1}`}
                className="w-full h-auto block select-none pointer-events-none"
              />

              {/* Absolute Overlay Highlights */}
              {pageMatches.map((h, hIdx) => {
                const sStyle = severityStyles[h.severity.toLowerCase()] || severityStyles.medium;
                const elementId = `highlight-${pIdx}-${Math.round(h.box.y)}`;

                return (
                  <div
                    key={hIdx}
                    id={elementId}
                    title={`[${h.severity.toUpperCase()} SEVERITY] ${h.pattern}: "${h.detectedText}"`}
                    className={`absolute border rounded backdrop-blur-[1px] transition-all duration-300 group cursor-pointer ${sStyle}`}
                    style={{
                      left: `${(h.box.x / page.width) * 100}%`,
                      top: `${(h.box.y / page.height) * 100}%`,
                      width: `${(h.box.width / page.width) * 100}%`,
                      height: `${(h.box.height / page.height) * 100}%`,
                    }}
                  >
                    {/* Hover Card Tooltip */}
                    <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-64 p-2.5 bg-slate-950 border border-slate-700 text-white text-[11px] font-sans rounded-xl shadow-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                      <div className="font-mono font-bold uppercase text-[10px] text-amber-400 mb-0.5 flex items-center justify-between">
                        <span>{h.pattern}</span>
                        <span className="uppercase font-extrabold">{h.severity}</span>
                      </div>
                      <p className="line-clamp-2 text-slate-300 font-mono text-[10px]">
                        "{h.detectedText}"
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Page Number Badge */}
              <div className="absolute bottom-2 right-2 px-2.5 py-1 bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-slate-400 rounded-md">
                Page {pIdx + 1} of {pages.length}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
