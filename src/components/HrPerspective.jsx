import React from 'react';
import { UserCheck, CheckCircle, AlertTriangle, MessageSquare } from 'lucide-react';

export function HrPerspective({ hrPerspective }) {
  if (!hrPerspective) return null;

  const { verdict, first_impression, reasoning, strengths = [], red_flags = [] } = hrPerspective;

  const verdictStyles = {
    strong_yes: { label: 'STRONG YES', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
    yes: { label: 'YES', bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    maybe: { label: 'MAYBE / RE-EVALUATE', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    no: { label: 'NO / PASS', bg: 'bg-red-500/20 text-red-400 border-red-500/40' },
  };

  const vInfo = verdictStyles[verdict?.toLowerCase()] || verdictStyles.maybe;

  return (
    <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-white">Recruiter Initial Verdict</h3>
            <p className="text-[11px] font-mono text-slate-400">6-Second Scan Simulation</p>
          </div>
        </div>

        <span className={`px-3 py-1 text-xs font-mono font-bold border rounded-full ${vInfo.bg}`}>
          {vInfo.label}
        </span>
      </div>

      {/* First Impression Box */}
      {first_impression && (
        <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" /> First Impression Summary
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-sans italic">
            "{first_impression}"
          </p>
        </div>
      )}

      {/* Reasoning */}
      {reasoning && (
        <p className="text-xs text-slate-300 leading-relaxed">
          {reasoning}
        </p>
      )}

      {/* Strengths & Red Flags grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {strengths.length > 0 && (
          <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-1.5">
            <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Key Strengths
            </h4>
            <ul className="space-y-1 text-[11px] text-slate-300 list-disc list-inside">
              {strengths.map((item, idx) => (
                <li key={idx} className="leading-tight">{item}</li>
              ))}
            </ul>
          </div>
        )}

        {red_flags.length > 0 && (
          <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl space-y-1.5">
            <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-red-400 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Recruiter Red Flags
            </h4>
            <ul className="space-y-1 text-[11px] text-slate-300 list-disc list-inside">
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
