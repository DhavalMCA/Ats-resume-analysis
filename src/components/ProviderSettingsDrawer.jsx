import React, { useState, useEffect } from 'react';
import { MODEL_CONFIGS, verifyApiKey } from '../lib/llm';
import { 
  X, Key, Eye, EyeOff, Check, Cpu, Zap, Flame, Sparkles, 
  ChevronDown, HelpCircle, ShieldCheck, Activity 
} from 'lucide-react';

export function ProviderSettingsDrawer({
  isOpen,
  onClose,
  provider,
  setProvider,
  model,
  setModel,
  apiKey,
  setApiKey,
  onOpenApiKeyGuide
}) {
  const [tempKey, setTempKey] = useState(apiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

  useEffect(() => {
    setTempKey(apiKey || '');
    setVerifyResult(null);
  }, [apiKey, provider, isOpen]);

  if (!isOpen) return null;

  const currentModelOptions = MODEL_CONFIGS[provider]?.options || [];

  const handleProviderChange = (newProvider) => {
    setProvider(newProvider);
    sessionStorage.setItem('byok_provider', newProvider);
    const newDefault = MODEL_CONFIGS[newProvider]?.defaultModel;
    if (newDefault) {
      setModel(newDefault);
      sessionStorage.setItem('byok_model', newDefault);
    }
  };

  const handleModelChange = (newModel) => {
    setModel(newModel);
    sessionStorage.setItem('byok_model', newModel);
  };

  const handleSaveKey = (e) => {
    e?.preventDefault();
    setApiKey(tempKey);
    sessionStorage.setItem('byok_llm_key', tempKey);
    sessionStorage.setItem('byok_provider', provider);
    if (model) sessionStorage.setItem('byok_model', model);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleTestConnection = async () => {
    if (!tempKey.trim()) return;
    setIsVerifying(true);
    setVerifyResult(null);
    const res = await verifyApiKey({ provider, apiKey: tempKey });
    setVerifyResult(res);
    setIsVerifying(false);
  };

  const providerConfig = [
    { id: 'groq',    label: 'Groq Cloud', icon: <Zap className="w-3.5 h-3.5" />, badge: 'Free' },
    { id: 'gemini',  label: 'Google Gemini', icon: <Cpu className="w-3.5 h-3.5" />, badge: 'Free' },
    { id: 'mistral', label: 'Mistral AI', icon: <Flame className="w-3.5 h-3.5" /> },
    { id: 'openai',  label: 'OpenAI ChatGPT', icon: <Sparkles className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#13232F]/60 backdrop-blur-sm animate-fade-up">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-full sm:max-w-md bg-[#FFFDF8] dark:bg-[#162432] border-l border-[#E2D9C8] dark:border-[#223446] shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-5 border-b border-[#E2D9C8] dark:border-[#223446] flex items-center justify-between bg-[#F6F2EA]/60 dark:bg-[#0F1720]/60">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#FAF3E5] dark:bg-[#272216] border border-[#E8C98F] dark:border-[#5C4722] rounded-xl text-[#D99A2B]">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-base text-[#13232F] dark:text-white">
                  Provider Settings
                </h2>
                <p className="text-[11px] font-mono text-[#52667A] dark:text-slate-400">
                  BYOK Configuration
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-[#52667A] dark:text-slate-400 hover:text-[#13232F] dark:hover:text-white rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
            
            {/* 1. AI Provider Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-[#52667A] dark:text-slate-400">
                1. Select AI Provider
              </label>
              <div className="grid grid-cols-2 gap-2">
                {providerConfig.map(({ id, label, icon, badge }) => (
                  <button
                    key={id}
                    type="button"
                    data-testid={`provider-${id}-btn`}
                    onClick={() => handleProviderChange(id)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                      provider === id
                        ? 'bg-[#FAF3E5] dark:bg-[#272216] border-[#D99A2B] text-[#13232F] dark:text-white font-semibold shadow-sm'
                        : 'bg-[#FFFDF8] dark:bg-[#1C2D3E] border-[#E2D9C8] dark:border-[#223446] text-[#52667A] dark:text-slate-300 hover:border-[#D99A2B]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1.5 text-xs font-sans">
                        <span className="text-[#D99A2B]">{icon}</span>
                        <span>{label}</span>
                      </div>
                      {badge && (
                        <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase bg-[#EBF4EE] dark:bg-[#13261C] text-[#3B7A57] dark:text-[#4E9A70] rounded">
                          {badge}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Model Dropdown */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-[#52667A] dark:text-slate-400">
                2. Model Version
              </label>
              <div className="relative">
                <select
                  value={model}
                  onChange={(e) => handleModelChange(e.target.value)}
                  data-testid="model-selector-dropdown"
                  className="w-full appearance-none bg-[#FFFDF8] dark:bg-[#1C2D3E] border border-[#E2D9C8] dark:border-[#223446] rounded-xl pl-3 pr-8 py-2.5 text-xs font-mono font-medium text-[#13232F] dark:text-amber-300 focus:outline-none focus:border-[#D99A2B]"
                >
                  {currentModelOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#52667A] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 3. API Key Input & Actions */}
            <form onSubmit={handleSaveKey} className="space-y-3 pt-2 border-t border-[#E2D9C8] dark:border-[#223446]">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-[#52667A] dark:text-slate-400">
                  3. {MODEL_CONFIGS[provider]?.name} API Key
                </label>
                <button
                  type="button"
                  onClick={onOpenApiKeyGuide}
                  className="text-xs font-mono text-[#D99A2B] hover:underline"
                >
                  How to get key?
                </button>
              </div>

              <div className="relative">
                <Key className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#52667A] pointer-events-none" />
                <input
                  type={showKey ? 'text' : 'password'}
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder={`Paste ${provider} API key here…`}
                  data-testid="byok-api-key-input"
                  className="w-full pl-9 pr-9 py-2.5 bg-[#FFFDF8] dark:bg-[#1C2D3E] border border-[#E2D9C8] dark:border-[#223446] rounded-xl text-xs font-mono text-[#13232F] dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#D99A2B]"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52667A] hover:text-[#13232F] dark:hover:text-white"
                  title={showKey ? 'Hide key' : 'Show key'}
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  data-testid="save-api-key-btn"
                  className="flex-1 py-2.5 btn-saffron rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Saved to Browser!
                    </>
                  ) : (
                    'Save Key in Browser'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isVerifying || !tempKey.trim()}
                  className="px-3 py-2.5 bg-[#F6F2EA] dark:bg-[#1C2D3E] border border-[#E2D9C8] dark:border-[#223446] text-[#52667A] dark:text-slate-300 hover:text-[#13232F] rounded-xl text-xs font-mono flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Activity className="w-3.5 h-3.5 text-[#D99A2B]" />
                  <span>{isVerifying ? 'Testing...' : 'Test'}</span>
                </button>
              </div>

              {/* Verify feedback */}
              {verifyResult && (
                <div className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-2 ${
                  verifyResult.ok 
                    ? 'bg-[#EBF4EE] text-[#3B7A57] border-[#A8D0B5] dark:bg-[#13261C] dark:text-[#4E9A70]'
                    : 'bg-[#FBF0EE] text-[#B85242] border-[#E8B8B0] dark:bg-[#2A1715] dark:text-[#D96957]'
                }`}>
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>{verifyResult.message}</span>
                </div>
              )}
            </form>

            {/* Privacy Architecture Clarification */}
            <div className="p-4 bg-[#F6F2EA]/80 dark:bg-[#0F1720]/80 border border-[#E2D9C8] dark:border-[#223446] rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#13232F] dark:text-slate-200">
                <ShieldCheck className="w-4 h-4 text-[#3B7A57] dark:text-[#4E9A70]" />
                Privacy & Data Flow Summary
              </div>
              <ul className="text-[11px] font-sans text-[#52667A] dark:text-slate-400 space-y-1.5 leading-relaxed list-disc list-inside">
                <li>Your API key is stored strictly in your browser session memory (`sessionStorage`).</li>
                <li>Your PDF files are parsed locally using `pdfjs-dist` inside your browser. No files are uploaded to our servers.</li>
                <li>Extracted text is transmitted directly from your browser to your selected AI provider ({provider}).</li>
                <li>Optionally saved report history remains stored in local IndexedDB inside this browser tab.</li>
              </ul>
            </div>

          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#E2D9C8] dark:border-[#223446] bg-[#F6F2EA]/40 dark:bg-[#0F1720]/40 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#13232F] dark:bg-slate-700 text-white rounded-xl text-xs font-mono font-medium hover:bg-slate-800"
            >
              Done
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
