import React from 'react';
import { MODEL_CONFIGS } from '../lib/llm';
import { BrandMark } from './BrandMark';
import { 
  ShieldCheck, Cpu, KeyRound, Target, ArrowDown, Check, Sparkles, FileText, CornerDownRight
} from 'lucide-react';

export function HeroSection({ provider, model, onLoadSampleJd }) {
  const providerConfig = MODEL_CONFIGS[provider] || MODEL_CONFIGS.gemini;
  const activeModelOption = providerConfig.options?.find(o => o.id === model) || providerConfig.options?.[0];

  const handleScrollToIntake = () => {
    document.getElementById('intake-desk')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTrySample = () => {
    onLoadSampleJd?.();
    handleScrollToIntake();
  };

  return (
    <section className="relative py-8 sm:py-12 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Asymmetric Editorial Hero Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">

        {/* Left Content Column (~7 cols on desktop) */}
        <div className="lg:col-span-7 space-y-6 text-left">
          
          {/* Trust Badge Pills */}
          <div className="inline-flex flex-wrap items-center gap-2 p-1 bg-[#FFFDF8] dark:bg-[#162432] border border-[#E2D9C8] dark:border-[#223446] rounded-full shadow-sm">
            <span className="px-3 py-1 text-[11px] font-mono font-semibold uppercase tracking-wider bg-[#FAF3E5] dark:bg-[#272216] text-[#D99A2B] rounded-full border border-[#E8C98F] dark:border-[#5C4722]">
              BROWSER-FIRST · BYOK
            </span>
            <span className="px-3 py-1 text-[11px] font-mono font-semibold uppercase tracking-wider bg-[#EBF4EE] dark:bg-[#13261C] text-[#3B7A57] dark:text-[#4E9A70] rounded-full border border-[#A8D0B5] dark:border-[#245037]">
              100% PRIVATE AUDIT
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#13232F] dark:text-white leading-[1.12]">
            Make your resume <span className="text-[#D99A2B] underline decoration-[#D99A2B]/40 underline-offset-4">answer the job.</span>
          </h1>

          {/* Supporting Copy */}
          <p className="text-[#52667A] dark:text-slate-300 text-sm sm:text-base md:text-lg font-sans leading-relaxed max-w-2xl">
            See exactly what the role requires, where your resume already matches, which critical keywords are missing, and which formatting issues may block ATS parsers — powered directly inside your browser using <strong className="text-[#13232F] dark:text-amber-300 font-semibold">{providerConfig.name} ({activeModelOption?.label || model})</strong>.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleScrollToIntake}
              data-testid="hero-primary-cta"
              className="px-6 py-3.5 btn-saffron rounded-2xl text-xs sm:text-sm font-mono font-bold flex items-center gap-2 shadow-md"
            >
              <span>Check My Resume</span>
              <ArrowDown className="w-4 h-4" />
            </button>

            <button
              onClick={handleTrySample}
              data-testid="hero-secondary-cta"
              className="px-5 py-3.5 bg-[#FFFDF8] dark:bg-[#162432] hover:bg-[#F6F2EA] dark:hover:bg-[#1C2D3E] border border-[#E2D9C8] dark:border-[#223446] text-[#13232F] dark:text-slate-200 rounded-2xl text-xs sm:text-sm font-mono font-medium transition-all"
            >
              + Try a Sample Review
            </button>
          </div>

          {/* Quiet Trust Indicators */}
          <div className="pt-3 border-t border-[#E2D9C8]/80 dark:border-[#223446]/80 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-[#52667A] dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#3B7A57] dark:text-[#4E9A70]" />
              Browser-first parsing
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#3B7A57] dark:text-[#4E9A70]" />
              No account required
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#3B7A57] dark:text-[#4E9A70]" />
              One focused report
            </span>
          </div>

        </div>

        {/* Right Editorial Paper Mockup Column (~5 cols on desktop) */}
        <div className="lg:col-span-5 relative">
          <div className="p-6 bg-[#FFFDF8] dark:bg-[#162432] border border-[#E2D9C8] dark:border-[#223446] rounded-3xl shadow-xl space-y-4 relative overflow-hidden">
            
            {/* Paper Header Strip */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E2D9C8] dark:border-[#223446]">
              <div className="flex items-center gap-2">
                <BrandMark size={24} />
                <span className="font-mono text-xs font-bold text-[#13232F] dark:text-white uppercase tracking-wider">
                  Review Margin #842
                </span>
              </div>
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-[#FAF3E5] dark:bg-[#272216] text-[#D99A2B] rounded-full border border-[#E8C98F] dark:border-[#5C4722]">
                Target 88+ PTS
              </span>
            </div>

            {/* Resume Sheet Preview Fragment */}
            <div className="p-4 bg-[#F6F2EA] dark:bg-[#0F1720] border border-[#EDE5D6] dark:border-[#1C2D3E] rounded-2xl space-y-3 font-sans text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[11px] text-[#52667A] dark:text-slate-400 uppercase">
                  Candidate Bullet Audit
                </span>
                <span className="text-[10px] font-mono text-[#D99A2B] font-bold">
                  +12 PTS IMPROVEMENT
                </span>
              </div>

              {/* Original Bullet */}
              <div className="p-2.5 bg-[#FFFDF8] dark:bg-[#162432] rounded-xl border border-red-200 dark:border-red-950 text-[#13232F] dark:text-slate-300 space-y-1">
                <div className="text-[9px] font-mono text-red-500 uppercase font-bold">Original Draft</div>
                <p className="line-through text-slate-400 dark:text-slate-500 italic text-[11px]">
                  "Spearheaded optimization of web app performance for modern users."
                </p>
              </div>

              {/* Editorial Margin Annotation Arrow */}
              <div className="flex items-center gap-1 text-[10px] font-mono text-[#D99A2B] font-semibold pl-2">
                <CornerDownRight className="w-3 h-3" />
                <span>Inject missing keywords: React 18, Web Vitals, LCP (-340ms)</span>
              </div>

              {/* Improved Bullet */}
              <div className="p-2.5 bg-[#FAF3E5] dark:bg-[#272216] rounded-xl border border-[#E8C98F] dark:border-[#5C4722] text-[#13232F] dark:text-white space-y-1">
                <div className="text-[9px] font-mono text-[#D99A2B] uppercase font-bold">Saffron Signal Draft</div>
                <p className="font-medium text-[11px]">
                  "Architected React 18 frontend pipeline, reducing LCP by 340ms across 1.2M monthly users."
                </p>
              </div>
            </div>

            {/* Footer Slip */}
            <div className="flex items-center justify-between text-[11px] font-mono text-[#52667A] dark:text-slate-400 pt-1">
              <span>8 Dimensions Audited</span>
              <span className="text-[#3B7A57] dark:text-[#4E9A70] font-bold">Indexed Evidence</span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
