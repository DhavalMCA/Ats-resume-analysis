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
    none: 'bg-[#EBF4EE] text-[#3B7A57] border-[#A8D0B5] dark:bg-[#13261C] dark:text-[#4E9A70] dark:border-[#245037]',
    mild: 'bg-[#FAF3E5] text-[#D99A2B] border-[#E8C98F] dark:bg-[#272216] dark:text-[#D99A2B] dark:border-[#5C4722]',
    moderate: 'bg-[#FAF3E5] text-[#D99A2B] border-[#E8C98F] dark:bg-[#272216] dark:text-[#D99A2B] dark:border-[#5C4722]',
    severe: 'bg-[#FBF0EE] text-[#B85242] border-[#E8B8B0] dark:bg-[#2A1715] dark:text-[#D96957] dark:border-[#592922]',
  };

  const badgeStyle = mismatchColors[mismatch_severity?.toLowerCase()] || mismatchColors.none;

  return (
    <div className="p-5 bg-[#FFFDF8] dark:bg-[#162432] border border-[#E2D9C8] dark:border-[#223446] rounded-2xl shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#FAF3E5] dark:bg-[#272216] border border-[#E8C98F] dark:border-[#5C4722] rounded-xl text-[#D99A2B]">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-[#13232F] dark:text-white">Experience & Claims Realism</h3>
            <p className="text-[11px] font-mono text-[#52667A] dark:text-slate-400">Seniority Alignment & Evidence Probing</p>
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
        <div className="grid grid-cols-2 gap-3 p-3 bg-[#F6F2EA] dark:bg-[#0F1720] border border-[#EDE5D6] dark:border-[#1C2D3E] rounded-xl text-xs font-mono">
          <div>
            <span className="text-[#52667A] dark:text-slate-400">Stated YOE:</span>
            <span className="ml-2 font-bold text-[#13232F] dark:text-white">{stated_yoe ? `${stated_yoe} Years` : 'Unspecified'}</span>
          </div>
          <div>
            <span className="text-[#52667A] dark:text-slate-400">Implied Seniority:</span>
            <span className="ml-2 font-bold text-[#D99A2B] capitalize">{implied_seniority || 'Mid'}</span>
          </div>
        </div>
      )}

      {/* Evidence Bullet Points */}
      {evidence.length > 0 && (
        <div className="space-y-1">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#52667A] dark:text-slate-400">
            Audit Observations:
          </span>
          <ul className="space-y-1 text-xs text-[#13232F] dark:text-slate-300 list-disc list-inside">
            {evidence.map((item, idx) => (
              <li key={idx} className="leading-relaxed">{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Unverifiable Claims Accordion */}
      {unverifiableClaims.length > 0 && (
        <div className="pt-2 border-t border-[#E2D9C8] dark:border-[#223446] space-y-2">
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#D99A2B] flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            Unverifiable Claims ({unverifiableClaims.length}) — Probing Questions
          </div>

          <div className="space-y-2">
            {unverifiableClaims.map((item, idx) => (
              <div key={idx} className="border border-[#E2D9C8] dark:border-[#223446] rounded-xl bg-[#FFFDF8] dark:bg-[#1C2D3E] overflow-hidden">
                <button
                  onClick={() => toggleClaim(idx)}
                  className="w-full p-3 text-left flex items-start justify-between gap-2 hover:bg-[#F6F2EA]/60 dark:hover:bg-[#0F1720]/60 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-[#D99A2B] shrink-0 mt-0.5" />
                    <span className="text-xs font-medium text-[#13232F] dark:text-slate-200">
                      "{item.claim}"
                    </span>
                  </div>
                  {openClaims[idx] ? (
                    <ChevronUp className="w-4 h-4 text-[#52667A] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#52667A] shrink-0" />
                  )}
                </button>

                {openClaims[idx] && item.probing_questions?.length > 0 && (
                  <div className="px-3 pb-3 pt-1 border-t border-[#E2D9C8] dark:border-[#223446] bg-[#FAF3E5]/50 dark:bg-[#272216]/50">
                    <p className="text-[11px] font-mono font-bold text-[#D99A2B] mb-1">
                      Recruiter Probing Interview Questions:
                    </p>
                    <ul className="space-y-1 text-[11px] text-[#13232F] dark:text-slate-300 list-disc list-inside">
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
