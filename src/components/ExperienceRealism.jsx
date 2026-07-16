import React, { useState } from 'react';
import { Briefcase, AlertCircle, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export function ExperienceRealism({ experienceRealism, unverifiableClaims = [] }) {
  const [openClaims, setOpenClaims] = useState({});

  if (!experienceRealism && unverifiableClaims.length === 0) return null;

  const toggleClaim = (idx) => {
    setOpenClaims(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const { stated_yoe, implied_seniority, mismatch_severity, evidence = [] } = experienceRealism || {};

  const mismatchColors = {
    none: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    mild: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    moderate: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    severe: 'bg-red-500/20 text-red-400 border-red-500/40',
  };

  const badgeStyle = mismatchColors[mismatch_severity?.toLowerCase()] || mismatchColors.none;

  return (
    <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-white">Experience & Claims Realism</h3>
            <p className="text-[11px] font-mono text-slate-400">Seniority Alignment & Proof Probing</p>
          </div>
        </div>

        {mismatch_severity && (
          <span className={`px-2.5 py-1 text-xs font-mono font-semibold border rounded-full uppercase ${badgeStyle}`}>
            {mismatch_severity} mismatch
          </span>
        )}
      </div>

      {/* YOE vs Implied Seniority Stats */}
      {experienceRealism && (
        <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs font-mono">
          <div>
            <span className="text-slate-400">Stated YOE:</span>
            <span className="ml-2 font-bold text-white">{stated_yoe ? `${stated_yoe} Years` : 'Unspecified'}</span>
          </div>
          <div>
            <span className="text-slate-400">Implied Seniority:</span>
            <span className="ml-2 font-bold text-amber-400 capitalize">{implied_seniority || 'Mid'}</span>
          </div>
        </div>
      )}

      {/* Evidence Bullet Points */}
      {evidence.length > 0 && (
        <div className="space-y-1">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
            Audit Observations:
          </span>
          <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
            {evidence.map((item, idx) => (
              <li key={idx} className="leading-relaxed">{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Unverifiable Claims Accordion */}
      {unverifiableClaims.length > 0 && (
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            Unverifiable Claims ({unverifiableClaims.length}) — Probing Questions
          </div>

          <div className="space-y-2">
            {unverifiableClaims.map((item, idx) => (
              <div key={idx} className="border border-slate-800 rounded-xl bg-slate-950/40 overflow-hidden">
                <button
                  onClick={() => toggleClaim(idx)}
                  className="w-full p-3 text-left flex items-start justify-between gap-2 hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span className="text-xs font-medium text-slate-200">
                      "{item.claim}"
                    </span>
                  </div>
                  {openClaims[idx] ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {openClaims[idx] && item.probing_questions?.length > 0 && (
                  <div className="px-3 pb-3 pt-1 border-t border-slate-800/60 bg-amber-500/5">
                    <p className="text-[11px] font-mono font-bold text-amber-300 mb-1">
                      Recruiter Probing Interview Questions:
                    </p>
                    <ul className="space-y-1 text-[11px] text-slate-300 list-disc list-inside">
                      {item.probing_questions.map((q, qIdx) => (
                        <li key={qIdx} className="leading-normal">{q}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
