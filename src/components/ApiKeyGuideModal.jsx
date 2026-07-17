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
      case 'gemini': return <Cpu className="w-4 h-4 text-amber-400" />;
      case 'groq': return <Zap className="w-4 h-4 text-amber-400" />;
      case 'mistral': return <Flame className="w-4 h-4 text-amber-400" />;
      default: return <Sparkles className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      {/* Modal Dialog Box */}
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Strip */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
                API Key Guide & Free Tools
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                Get your direct API keys from providers to run 100% private, client-side resume scans.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Provider Tabs */}
        <div className="flex items-center gap-1.5 px-6 pt-4 border-b border-slate-800/80 bg-slate-900/60 overflow-x-auto no-scrollbar">
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
                    ? 'bg-slate-950 text-white border-slate-700 border-b-slate-950 shadow-md'
                    : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {getProviderIcon(providerKey)}
                <span>{p.name}</span>
                {p.isFree && (
                  <span className="px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-bold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                    Free
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar bg-slate-950/40">
          {/* Main Provider Callout Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/20 border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="px-2.5 py-1 text-[11px] font-mono font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                {info.badge}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyPortalUrl}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono transition-colors flex items-center gap-1"
                  title="Copy link to portal"
                >
                  {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                </button>
                <a
                  href={info.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
                >
                  <span>Open {info.portalName}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {info.description}
            </p>
          </div>

          {/* Key Format Cheat Sheet */}
          <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl flex items-start gap-3">
            <Key className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <span className="font-mono font-bold text-slate-200">Expected Key Format: </span>
              <span className="font-mono text-amber-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                {info.keyFormat}
              </span>
            </div>
          </div>

          {/* Step by Step Guide */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              Step-by-Step Key Retrieval Instructions
            </h3>
            <ol className="space-y-2.5">
              {info.steps.map((step, index) => (
                <li key={index} className="flex items-start gap-3 text-xs text-slate-300 font-sans bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  <span className="w-5 h-5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <span className="leading-snug pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Interactive API Key Tester & Applier */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              Test & Save Key Directly
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
                  placeholder={`Paste your ${info.name} key here...`}
                  className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50"
                />
                <button
                  type="submit"
                  disabled={isVerifying || !testKey.trim()}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-amber-400 border border-slate-700 rounded-xl text-xs font-mono font-semibold transition-all shrink-0 flex items-center gap-1.5"
                >
                  {isVerifying ? (
                    <span>Testing...</span>
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
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-red-950/40 border-red-500/40 text-red-300'
                }`}>
                  {verificationResult.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span>{verificationResult.message}</span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Key stored only in browser sessionStorage</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono font-medium transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyAndClose}
              disabled={!testKey.trim()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-mono font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-500/20"
            >
              Use This Key in App
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
