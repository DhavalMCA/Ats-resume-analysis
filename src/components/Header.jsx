import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';
import { MODEL_CONFIGS } from '../lib/llm';
import { 
  Key, Eye, EyeOff, ShieldCheck, Moon, Sun, 
  History, Sparkles, HelpCircle, Check, Cpu, Zap, ChevronDown 
} from 'lucide-react';

export function Header({ 
  apiKey, 
  setApiKey, 
  provider, 
  setProvider, 
  model,
  setModel,
  onOpenHistory, 
  historyCount 
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

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0a0d14]/85 border-b border-slate-800/80 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-[#0a0d14] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-lg tracking-tight text-white">
                Resume<span className="text-amber-400">Intelligence</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
                BYOK v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              100% Client-Side Audit
            </p>
          </div>
        </div>

        {/* BYOK Controls Center */}
        <div className="hidden lg:flex flex-1 items-center justify-center gap-2 max-w-4xl mx-2 min-w-0">
          {/* Provider Toggle Dropdown / Selector */}
          <div className="flex items-center bg-slate-900/90 border border-slate-700/60 rounded-xl p-1 shrink-0">
            <button
              type="button"
              data-testid="provider-groq-btn"
              onClick={() => handleProviderChange('groq')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                provider === 'groq'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Groq
            </button>
            <button
              type="button"
              data-testid="provider-gemini-btn"
              onClick={() => handleProviderChange('gemini')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                provider === 'gemini'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              Gemini
            </button>
            <button
              type="button"
              data-testid="provider-openai-btn"
              onClick={() => handleProviderChange('openai')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                provider === 'openai'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              OpenAI
            </button>
          </div>

          {/* Model Selector Dropdown */}
          <div className="relative shrink-0 max-w-[210px]">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              data-testid="model-selector-dropdown"
              className="w-full truncate appearance-none bg-slate-900/90 border border-slate-700/60 hover:border-slate-600 rounded-xl pl-3 pr-8 py-2 text-xs font-mono font-medium text-amber-400 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50 cursor-pointer transition-all"
            >
              {currentModelOptions.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-slate-900 text-slate-200">
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Key Input Field */}
          <form onSubmit={handleSaveKey} className="flex-1 flex items-center min-w-[200px] max-w-md relative">
            <div className="relative flex-1 min-w-0">
              <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showKey ? 'text' : 'password'}
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder={
                  provider === 'groq'
                    ? 'Paste Groq key (gsk_...)'
                    : provider === 'gemini' 
                    ? 'Paste Gemini key (AIza...)' 
                    : 'Paste OpenAI key (sk-...)'
                }
                data-testid="byok-api-key-input"
                className="w-full pl-9 pr-9 py-2 bg-slate-900/90 border border-slate-700/60 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50 transition-all truncate"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
                title={showKey ? 'Hide Key' : 'Show Key'}
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            <button
              type="submit"
              data-testid="save-api-key-btn"
              className="ml-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-medium transition-all flex items-center gap-1 shrink-0"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-mono">Saved</span>
                </>
              ) : (
                <span>Save</span>
              )}
            </button>
          </form>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Privacy Tooltip / Information Badge */}
          <div className="relative group hidden md:block">
            <button className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800/60 rounded-xl transition-all">
              <HelpCircle className="w-5 h-5" />
            </button>
            <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-xl text-xs text-slate-300 hidden group-hover:block z-50 animate-fade-up">
              <p className="font-semibold text-white mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Zero Backend Guarantee
              </p>
              Your API key never touches our servers — it lives only in this browser tab. Your PDF is parsed locally and never uploaded. Direct browser calls only.
            </div>
          </div>

          {/* History Drawer Trigger */}
          <button
            onClick={onOpenHistory}
            data-testid="open-history-drawer-btn"
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-mono text-slate-200 transition-all relative"
            title="View Past Scans"
          >
            <History className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center">
                {historyCount}
              </span>
            )}
          </button>

          {/* Dark / Light Theme Toggle */}
          <button
            onClick={toggleTheme}
            data-testid="theme-toggle-btn"
            className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800/60 rounded-xl transition-all"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Provider & Model & Key Banner */}
      <div className="lg:hidden px-4 pb-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <select
            value={provider}
            onChange={(e) => handleProviderChange(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs font-mono text-amber-400 rounded-lg p-1.5"
          >
            <option value="groq">Groq Cloud</option>
            <option value="gemini">Google Gemini</option>
            <option value="openai">OpenAI ChatGPT</option>
          </select>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs font-mono text-amber-300 rounded-lg p-1.5"
          >
            {currentModelOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
          <input
            type="password"
            value={tempKey}
            onChange={(e) => setTempKey(e.target.value)}
            onBlur={handleSaveKey}
            placeholder="API key..."
            className="flex-1 bg-slate-900 border border-slate-700 text-xs font-mono text-white rounded-lg p-1.5 min-w-0"
          />
        </div>
      </div>
    </header>
  );
}
