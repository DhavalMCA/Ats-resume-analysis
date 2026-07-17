import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';
import { MODEL_CONFIGS } from '../lib/llm';
import { 
  Key, Eye, EyeOff, ShieldCheck, Moon, Sun, 
  History, Sparkles, HelpCircle, Check, Cpu, Zap, ChevronDown, Flame
} from 'lucide-react';

export function Header({ 
  apiKey, 
  setApiKey, 
  provider, 
  setProvider, 
  model,
  setModel,
  onOpenHistory, 
  historyCount,
  onOpenApiKeyGuide
}) {
  const { theme, toggleTheme } = useTheme();
  const [showKey, setShowKey] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setTempKey(apiKey || '');
  }, [apiKey]);

  const handleSaveKey = (e) => {
    e?.preventDefault();
    setApiKey(tempKey);
    sessionStorage.setItem('byok_llm_key', tempKey);
    sessionStorage.setItem('byok_provider', provider);
    if (model) sessionStorage.setItem('byok_model', model);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleProviderChange = (newProvider) => {
    setProvider(newProvider);
  };

  const currentModelOptions = MODEL_CONFIGS[provider]?.options || [];

  const providerConfig = [
    { id: 'groq',    label: 'Groq',    icon: <Zap className="w-3 h-3" /> },
    { id: 'gemini',  label: 'Gemini',  icon: <Cpu className="w-3 h-3" /> },
    { id: 'mistral', label: 'Mistral', icon: <Flame className="w-3 h-3" /> },
    { id: 'openai',  label: 'OpenAI',  icon: <Sparkles className="w-3 h-3" /> },
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0a0d14]/95 border-b border-slate-800/80 transition-colors duration-300">

      {/* ── Row 1: Logo + Right Actions ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">

        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-lg shadow-amber-500/20 shrink-0">
            <div className="w-full h-full bg-[#0a0d14] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base tracking-tight text-white whitespace-nowrap">
                Resume<span className="text-amber-400">Intelligence</span>
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full whitespace-nowrap">
                BYOK v1.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1 whitespace-nowrap">
              <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
              100% Client-Side Audit
            </p>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">

          {/* Get API Key */}
          <button
            onClick={onOpenApiKeyGuide}
            data-testid="open-api-key-guide-btn"
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-xl text-xs font-mono font-semibold transition-all shrink-0"
            title="How to get free API keys"
          >
            <Key className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Get API Key</span>
          </button>

          {/* Privacy Info */}
          <div className="relative group hidden md:block shrink-0">
            <button
              className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800/60 rounded-xl transition-all"
              aria-label="Privacy information"
            >
              <HelpCircle className="w-4.5 h-4.5" />
            </button>
            <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-xl text-xs text-slate-300 hidden group-hover:block z-50">
              <p className="font-semibold text-white mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                Zero Backend Guarantee
              </p>
              <p className="mb-2 leading-relaxed">
                Your API key never touches our servers — it lives only in this browser tab. Your PDF is parsed locally and never uploaded. Direct browser calls only.
              </p>
              <button
                type="button"
                onClick={onOpenApiKeyGuide}
                className="text-amber-400 font-mono text-[11px] font-bold hover:underline flex items-center gap-1"
              >
                + How to get free API keys →
              </button>
            </div>
          </div>

          {/* History */}
          <button
            onClick={onOpenHistory}
            data-testid="open-history-drawer-btn"
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-mono text-slate-200 transition-all shrink-0 relative"
            title="View Past Scans"
          >
            <History className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center shrink-0">
                {historyCount}
              </span>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            data-testid="theme-toggle-btn"
            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800/60 rounded-xl transition-all shrink-0"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5" />}
          </button>
        </div>
      </div>

      {/* ── Row 2 (Desktop ≥ lg): Provider + Model + API Key ── */}
      <div className="hidden lg:block border-t border-slate-800/60 bg-[#0a0d14]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-11 flex items-center gap-3">

          {/* Provider Tabs */}
          <div className="flex items-center bg-slate-900/80 border border-slate-700/50 rounded-lg p-0.5 shrink-0 gap-0.5">
            {providerConfig.map(({ id, label, icon }) => (
              <button
                key={id}
                type="button"
                data-testid={`provider-${id}-btn`}
                onClick={() => handleProviderChange(id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-mono font-medium transition-all whitespace-nowrap ${
                  provider === id
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm shadow-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-slate-700/60 shrink-0" />

          {/* Model Selector */}
          <div className="relative shrink-0 w-[200px]">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              data-testid="model-selector-dropdown"
              className="w-full appearance-none bg-slate-900/80 border border-slate-700/50 hover:border-slate-600 rounded-lg pl-2.5 pr-7 py-1 text-[11px] font-mono font-medium text-amber-400 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/40 cursor-pointer transition-all"
            >
              {currentModelOptions.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-slate-900 text-slate-200">
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-slate-700/60 shrink-0" />

          {/* API Key Input + Save */}
          <form onSubmit={handleSaveKey} className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 min-w-0">
              <Key className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                type={showKey ? 'text' : 'password'}
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder={`Paste ${provider} API key here…`}
                data-testid="byok-api-key-input"
                className="w-full pl-7 pr-8 py-1 bg-slate-900/80 border border-slate-700/50 rounded-lg text-[11px] font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/40 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                title={showKey ? 'Hide Key' : 'Show Key'}
              >
                {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </button>
            </div>
            <button
              type="submit"
              data-testid="save-api-key-btn"
              className="px-4 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold rounded-lg text-[11px] transition-all flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save</span>
              )}
            </button>
          </form>

        </div>
      </div>

      {/* ── Mobile / Tablet Controls (< lg) ── */}
      <div className="lg:hidden border-t border-slate-800/60 px-4 pb-3 pt-2.5 flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <select
            value={provider}
            onChange={(e) => handleProviderChange(e.target.value)}
            aria-label="Select AI Provider"
            className="w-full bg-slate-900 border border-slate-700 text-xs font-mono font-medium text-amber-400 rounded-xl p-2 focus:outline-none focus:border-amber-500"
          >
            <option value="groq">Groq Cloud</option>
            <option value="gemini">Google Gemini</option>
            <option value="mistral">Mistral AI</option>
            <option value="openai">OpenAI ChatGPT</option>
          </select>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            aria-label="Select Model"
            className="w-full bg-slate-900 border border-slate-700 text-xs font-mono text-amber-300 rounded-xl p-2 focus:outline-none focus:border-amber-500"
          >
            {currentModelOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
        </div>
        <form onSubmit={handleSaveKey} className="flex items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <Key className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type={showKey ? 'text' : 'password'}
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder={`Paste ${provider} API key here…`}
              aria-label="API key input"
              className="w-full pl-8 pr-8 py-2 bg-slate-900 border border-slate-700 text-xs font-mono text-white rounded-xl placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 p-0.5"
            >
              {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          <button
            type="submit"
            className="px-3 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-mono font-bold shrink-0 hover:bg-amber-400 transition-colors whitespace-nowrap"
          >
            {savedSuccess ? 'Saved!' : 'Save'}
          </button>
        </form>
        <button
          type="button"
          onClick={onOpenApiKeyGuide}
          className="w-full py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-xl text-xs font-mono font-semibold flex items-center justify-center gap-1.5"
        >
          <Key className="w-3.5 h-3.5 shrink-0" />
          <span>Need an API Key? View Free Links &amp; Guide</span>
        </button>
      </div>

    </header>
  );
}
