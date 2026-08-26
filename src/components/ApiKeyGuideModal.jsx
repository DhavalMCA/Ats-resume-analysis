import React, { useState, useEffect } from 'react';
import { PROVIDER_HELP, verifyApiKey } from '../lib/llm';
import { 
  X, ExternalLink, Key, ShieldCheck, CheckCircle2, AlertCircle, 
  Sparkles, Zap, Cpu, Flame, Copy, Check, Info, ArrowRight, Activity 
} from 'lucide-react';

export function ApiKeyGuideModal({ 
  isOpen, 
  onClose, 
  currentProvider = 'gemini', 
  apiKey = '', 
  onSaveKey 
}) {
  const [activeTab, setActiveTab] = useState(currentProvider);
  const [testKey, setTestKey] = useState(apiKey || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    setActiveTab(currentProvider);
  }, [currentProvider]);

  useEffect(() => {
    setTestKey(apiKey || '');
    setVerificationResult(null);
  }, [apiKey, activeTab]);

  if (!isOpen) return null;

  const info = PROVIDER_HELP[activeTab] || PROVIDER_HELP.gemini;

  const handleTestKey = async (e) => {
    e?.preventDefault();
    if (!testKey.trim()) return;
    setIsVerifying(true);
    setVerificationResult(null);

    const res = await verifyApiKey({ provider: activeTab, apiKey: testKey });
    setVerificationResult(res);
    setIsVerifying(false);
  };

  const handleApplyAndClose = () => {
    if (testKey.trim()) {
      onSaveKey(testKey.trim(), activeTab);
    }
    onClose();
  };

  const handleCopyPortalUrl = () => {
    navigator.clipboard.writeText(info.portalUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const getProviderIcon = (key) => {
    switch (key) {
      case 'gemini': return <Cpu className="w-4 h-4 text-[#D99A2B]" />;
      case 'groq': return <Zap className="w-4 h-4 text-[#D99A2B]" />;
      case 'mistral': return <Flame className="w-4 h-4 text-[#D99A2B]" />;
      default: return <Sparkles className="w-4 h-4 text-[#D99A2B]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#13232F]/70 backdrop-blur-md overflow-y-auto">
      {/* Modal Dialog Box */}
      <div 
        className="relative w-full max-w-2xl bg-[#FFFDF8] dark:bg-[#162432] border border-[#E2D9C8] dark:border-[#223446] rounded-3xl shadow-2xl overflow-hidden my-auto animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Strip */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2D9C8] dark:border-[#223446] bg-[#F6F2EA]/60 dark:bg-[#0F1720]/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#FAF3E5] dark:bg-[#272216] rounded-2xl border border-[#E8C98F] dark:border-[#5C4722] text-[#D99A2B]">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-heading font-bold text-[#13232F] dark:text-white flex items-center gap-2">
                API Key Retrieval Guide
              </h2>
              <p className="text-xs text-[#52667A] dark:text-slate-400 font-sans">
                Obtain your direct API keys to run 100% private, client-side resume reviews.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#52667A] dark:text-slate-400 hover:text-[#13232F] dark:hover:text-white rounded-xl transition-all"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Provider Tabs */}
        <div className="flex items-center gap-1.5 px-6 pt-4 border-b border-[#E2D9C8] dark:border-[#223446] bg-[#F6F2EA]/40 dark:bg-[#0F1720]/40 overflow-x-auto no-scrollbar">
          {Object.keys(PROVIDER_HELP).map((providerKey) => {
            const p = PROVIDER_HELP[providerKey];
            const isActive = activeTab === providerKey;
            return (
              <button
                key={providerKey}
                onClick={() => {
                  setActiveTab(providerKey);
                  setVerificationResult(null);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-mono font-semibold transition-all shrink-0 border-t border-x ${
                  isActive
                    ? 'bg-[#FFFDF8] dark:bg-[#162432] text-[#13232F] dark:text-white border-[#E2D9C8] dark:border-[#223446] border-b-transparent shadow-sm'
                    : 'bg-transparent text-[#52667A] dark:text-slate-400 border-transparent hover:text-[#13232F] dark:hover:text-slate-200'
                }`}
              >
                {getProviderIcon(providerKey)}
                <span>{p.name}</span>
                {p.isFree && (
                  <span className="px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-bold bg-[#EBF4EE] dark:bg-[#13261C] text-[#3B7A57] dark:text-[#4E9A70] rounded-full border border-[#A8D0B5] dark:border-[#245037]">
                    Free
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Main Provider Callout Banner */}
          <div className="p-4 rounded-2xl bg-[#FAF3E5]/60 dark:bg-[#272216]/60 border border-[#E8C98F] dark:border-[#5C4722] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="px-2.5 py-1 text-[11px] font-mono font-bold text-[#D99A2B] bg-[#FFFDF8] dark:bg-[#162432] border border-[#E8C98F] dark:border-[#5C4722] rounded-lg flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                {info.badge}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyPortalUrl}
                  className="px-2.5 py-1 bg-[#FFFDF8] dark:bg-[#162432] hover:bg-[#F6F2EA] text-[#52667A] dark:text-slate-300 rounded-lg text-xs font-mono transition-colors flex items-center gap-1 border border-[#E2D9C8] dark:border-[#223446]"
                  title="Copy link to portal"
                >
                  {copiedLink ? <Check className="w-3 h-3 text-[#3B7A57]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                </button>
                <a
                  href={info.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 btn-saffron font-mono font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <span>Open {info.portalName}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
            <p className="text-xs text-[#13232F] dark:text-slate-300 font-sans leading-relaxed">
              {info.description}
            </p>
          </div>

          {/* Key Format Cheat Sheet */}
          <div className="p-3.5 bg-[#F6F2EA] dark:bg-[#0F1720] border border-[#EDE5D6] dark:border-[#1C2D3E] rounded-xl flex items-start gap-3">
            <Key className="w-4 h-4 text-[#D99A2B] shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <span className="font-mono font-bold text-[#13232F] dark:text-slate-200">Expected Key Format: </span>
              <span className="font-mono text-[#D99A2B] bg-[#FFFDF8] dark:bg-[#162432] px-2 py-0.5 rounded border border-[#E2D9C8] dark:border-[#223446]">
                {info.keyFormat}
              </span>
            </div>
          </div>

          {/* Step by Step Guide */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#52667A] dark:text-slate-400 flex items-center gap-2">
              <ArrowRight className="w-3.5 h-3.5 text-[#D99A2B]" />
              Step-by-Step Instructions
            </h3>
            <ol className="space-y-2">
              {info.steps.map((step, index) => (
                <li key={index} className="flex items-start gap-3 text-xs text-[#13232F] dark:text-slate-300 font-sans bg-[#F6F2EA]/60 dark:bg-[#0F1720]/60 p-3 rounded-xl border border-[#EDE5D6] dark:border-[#1C2D3E]">
                  <span className="w-5 h-5 rounded-lg bg-[#FAF3E5] dark:bg-[#272216] border border-[#E8C98F] dark:border-[#5C4722] text-[#D99A2B] font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <span className="leading-snug pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Interactive API Key Tester & Applier */}
          <div className="p-4 bg-[#F6F2EA]/80 dark:bg-[#0F1720]/80 border border-[#E2D9C8] dark:border-[#223446] rounded-2xl space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#13232F] dark:text-slate-200 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-[#D99A2B]" />
              Test &amp; Save Key Directly
            </h3>

            <form onSubmit={handleTestKey} className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  value={testKey}
                  onChange={(e) => {
                    setTestKey(e.target.value);
                    setVerificationResult(null);
                  }}
                  placeholder={`Paste your ${info.name} key here…`}
                  className="flex-1 px-3.5 py-2 bg-[#FFFDF8] dark:bg-[#162432] border border-[#E2D9C8] dark:border-[#223446] rounded-xl text-xs font-mono text-[#13232F] dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#D99A2B]"
                />
                <button
                  type="submit"
                  disabled={isVerifying || !testKey.trim()}
                  className="px-3.5 py-2 bg-[#FFFDF8] dark:bg-[#162432] hover:bg-[#FAF3E5] disabled:opacity-50 text-[#D99A2B] border border-[#E2D9C8] dark:border-[#223446] rounded-xl text-xs font-mono font-semibold transition-all shrink-0 flex items-center gap-1.5"
                >
                  {isVerifying ? (
                    <span>Testing…</span>
                  ) : (
                    <>
                      <Activity className="w-3.5 h-3.5" />
                      <span>Test Connection</span>
                    </>
                  )}
                </button>
              </div>

              {/* Verification Feedback Banner */}
              {verificationResult && (
                <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-mono ${
                  verificationResult.ok 
                    ? 'bg-[#EBF4EE] border-[#A8D0B5] text-[#3B7A57] dark:bg-[#13261C] dark:text-[#4E9A70]'
                    : 'bg-[#FBF0EE] border-[#E8B8B0] text-[#B85242] dark:bg-[#2A1715] dark:text-[#D96957]'
                }`}>
                  {verificationResult.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-[#3B7A57] shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-[#B85242] shrink-0" />
                  )}
                  <span>{verificationResult.message}</span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#E2D9C8] dark:border-[#223446] bg-[#F6F2EA]/40 dark:bg-[#0F1720]/40 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#52667A] dark:text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-[#3B7A57]" />
            <span>Key stored only in browser sessionStorage</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#F6F2EA] dark:bg-[#1C2D3E] text-[#52667A] dark:text-slate-300 rounded-xl text-xs font-mono font-medium hover:bg-[#EDE5D6]"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyAndClose}
              disabled={!testKey.trim()}
              className="px-4 py-2 btn-saffron font-mono font-bold rounded-xl text-xs disabled:opacity-50 shadow-sm"
            >
              Use This Key in App
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
