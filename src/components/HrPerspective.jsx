import React from 'react';
import { UserCheck, CheckCircle, AlertTriangle, MessageSquare } from 'lucide-react';

export function HrPerspective({ hrPerspective }) {
  if (!hrPerspective) return null;

  const { verdict, first_impression, reasoning, strengths = [], red_flags = [] } = hrPerspective;

  const verdictStyles = {
    strong_yes: { label: 'STRONG YES', bg: 'bg-[#EBF4EE] text-[#3B7A57] border-[#A8D0B5] dark:bg-[#13261C] dark:text-[#4E9A70] dark:border-[#245037]' },
    yes: { label: 'YES', bg: 'bg-[#EBF4EE] text-[#3B7A57] border-[#A8D0B5] dark:bg-[#13261C] dark:text-[#4E9A70] dark:border-[#245037]' },
    maybe: { label: 'MAYBE / RE-EVALUATE', bg: 'bg-[#FAF3E5] text-[#D99A2B] border-[#E8C98F] dark:bg-[#272216] dark:text-[#D99A2B] dark:border-[#5C4722]' },
    no: { label: 'NO / PASS', bg: 'bg-[#FBF0EE] text-[#B85242] border-[#E8B8B0] dark:bg-[#2A1715] dark:text-[#D96957] dark:border-[#592922]' },
  };

  const vInfo = verdictStyles[verdict?.toLowerCase()] || verdictStyles.maybe;

  return (
    <div className="p-5 bg-[#FFFDF8] dark:bg-[#162432] border border-[#E2D9C8] dark:border-[#223446] rounded-2xl shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#FAF3E5] dark:bg-[#272216] border border-[#E8C98F] dark:border-[#5C4722] rounded-xl text-[#D99A2B]">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-[#13232F] dark:text-white">Recruiter Initial Verdict</h3>
            <p className="text-[11px] font-mono text-[#52667A] dark:text-slate-400">6-Second Impression Simulation</p>
          </div>
        </div>

        <span className={`px-3 py-1 text-xs font-mono font-bold border rounded-full ${vInfo.bg}`}>
          {vInfo.label}
        </span>
      </div>

      {/* First Impression Box */}
      {first_impression && (
        <div className="p-3.5 bg-[#F6F2EA] dark:bg-[#0F1720] border border-[#EDE5D6] dark:border-[#1C2D3E] rounded-xl">
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#D99A2B] mb-1 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" /> First Impression Summary
          </div>
          <p className="text-xs text-[#13232F] dark:text-slate-200 leading-relaxed font-sans italic">
            "{first_impression}"
          </p>
        </div>
      )}

      {/* Reasoning */}
      {reasoning && (
        <p className="text-xs text-[#52667A] dark:text-slate-300 leading-relaxed">
          {reasoning}
        </p>
      )}

      {/* Strengths & Red Flags grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {strengths.length > 0 && (
          <div className="p-3 bg-[#EBF4EE] dark:bg-[#13261C] border border-[#A8D0B5] dark:border-[#245037] rounded-xl space-y-1.5">
            <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#3B7A57] dark:text-[#4E9A70] flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Key Strengths
            </h4>
            <ul className="space-y-1 text-[11px] text-[#13232F] dark:text-slate-300 list-disc list-inside">
              {strengths.map((item, idx) => (
                <li key={idx} className="leading-tight">{item}</li>
              ))}
            </ul>
          </div>
        )}

        {red_flags.length > 0 && (
          <div className="p-3 bg-[#FBF0EE] dark:bg-[#2A1715] border border-[#E8B8B0] dark:border-[#592922] rounded-xl space-y-1.5">
            <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#B85242] dark:text-[#D96957] flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Recruiter Red Flags
            </h4>
            <ul className="space-y-1 text-[11px] text-[#13232F] dark:text-slate-300 list-disc list-inside">
              {red_flags.map((item, idx) => (
                <li key={idx} className="leading-tight">{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
