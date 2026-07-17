import React from 'react';
import { ShieldCheck, Cpu, KeyRound, Target } from 'lucide-react';
import { MODEL_CONFIGS } from '../lib/llm';

export function HeroSection({ provider, model }) {
  const providerConfig = MODEL_CONFIGS[provider] || MODEL_CONFIGS.gemini;
  const activeModelOption = providerConfig.options.find(o => o.id === model) || providerConfig.options[0];

  return (
    <div className="relative py-6 sm:py-10 md:py-12 text-center max-w-4xl mx-auto px-4">
      {/* Top Badge Pills */}
      <div className="inline-flex flex-wrap items-center justify-center gap-2 mb-4 sm:mb-6 p-1 bg-slate-900/80 border border-amber-500/20 rounded-full sm:rounded-full shadow-lg max-w-full">
        <span className="px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] font-mono font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/30 anim-breath">
          LOCAL-FIRST · BYOK
        </span>
        <span className="px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] font-mono font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
          PRIVACY FIRST
        </span>
      </div>

      {/* Hero Headline */}
      <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4 leading-[1.15] sm:leading-[1.1]">
        Resume <span className="gradient-text-amber">Intelligence</span> for the ATS era.
      </h1>

      {/* Subtitle */}
      <p className="text-slate-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-8 font-sans leading-relaxed">
        Deep line-by-line authenticity auditing, AI language detection, recruiter verdict simulation, and precise score rewrites — powered directly by your browser using <span className="text-amber-400 font-medium">{providerConfig.name} ({activeModelOption?.label || model})</span>.
      </p>

      {/* 4-Cell Stat Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
        <div className="p-3.5 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-sm text-left flex items-start gap-3">
          <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-heading font-bold text-white">8 Dimensions</div>
            <div className="text-[11px] font-mono text-slate-400">Authenticity Audit</div>
          </div>
        </div>

        <div className="p-3.5 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-sm text-left flex items-start gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-heading font-bold text-white">0 Servers</div>
            <div className="text-[11px] font-mono text-slate-400">PDF Parsed Locally</div>
          </div>
        </div>

        <div className="p-3.5 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-sm text-left flex items-start gap-3">
          <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-heading font-bold text-white">100% BYOK</div>
            <div className="text-[11px] font-mono text-slate-400">Zero Cloud Storage</div>
          </div>
        </div>

        <div className="p-3.5 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-sm text-left flex items-start gap-3">
          <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-heading font-bold text-white">85–98 Target</div>
            <div className="text-[11px] font-mono text-slate-400">ATS Score Boost</div>
          </div>
        </div>
      </div>
    </div>
  );
}
