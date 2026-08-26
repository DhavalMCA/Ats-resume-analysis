import React, { useState } from 'react';
import { useTheme } from './ThemeProvider';
import { BrandMark } from './BrandMark';
import { ProviderSettingsDrawer } from './ProviderSettingsDrawer';
import { 
  Settings, History, Sun, Moon, Key, Menu, X, ShieldCheck
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const hasApiKey = Boolean(apiKey && apiKey.trim());

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FFFDF8]/90 dark:bg-[#0F1720]/90 backdrop-blur-md border-b border-[#E2D9C8] dark:border-[#223446] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

          {/* Left: Brand Mark + Wordmark + Short Descriptor */}
          <div className="flex items-center gap-3 shrink-0">
            <a href="#" className="flex items-center gap-2.5 group">
              <BrandMark size={30} />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-extrabold text-base sm:text-lg tracking-tight text-[#13232F] dark:text-white">
                    Resume<span className="text-[#D99A2B]">Intelligence</span>
                  </span>
                  <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider bg-[#FAF3E5] dark:bg-[#272216] text-[#D99A2B] border border-[#E8C98F] dark:border-[#5C4722] rounded-full">
                    Quiet Signal
                  </span>
                </div>
                <span className="text-[11px] font-sans text-[#52667A] dark:text-slate-400 hidden sm:block">
                  Resume review workspace
                </span>
              </div>
            </a>
          </div>

          {/* Middle: Editorial Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-sans font-medium text-[#52667A] dark:text-slate-300">
            <a href="#how-it-works" className="hover:text-[#13232F] dark:hover:text-white transition-colors">
              How it works
            </a>
            <a href="#privacy" className="hover:text-[#13232F] dark:hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#faq" className="hover:text-[#13232F] dark:hover:text-white transition-colors">
              FAQ
            </a>
          </nav>

          {/* Right: Actions (History, Settings, Theme, Mobile toggle) */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Provider Key Indicator / Settings Button */}
            <button
              onClick={() => setSettingsOpen(true)}
              data-testid="open-provider-settings-btn"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium border transition-all ${
                hasApiKey
                  ? 'bg-[#EBF4EE] dark:bg-[#13261C] text-[#3B7A57] dark:text-[#4E9A70] border-[#A8D0B5] dark:border-[#245037] hover:border-[#3B7A57]'
                  : 'bg-[#FAF3E5] dark:bg-[#272216] text-[#D99A2B] border-[#E8C98F] dark:border-[#5C4722] hover:bg-[#D99A2B]/20'
              }`}
              title="AI Provider Settings"
            >
              <Settings className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline capitalize">{provider}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${hasApiKey ? 'bg-[#3B7A57]' : 'bg-[#D99A2B] animate-pulse'}`} />
            </button>

            {/* History Drawer Trigger */}
            <button
              onClick={onOpenHistory}
              data-testid="open-history-drawer-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFDF8] dark:bg-[#162432] hover:bg-[#F6F2EA] dark:hover:bg-[#1C2D3E] border border-[#E2D9C8] dark:border-[#223446] rounded-xl text-xs font-mono text-[#13232F] dark:text-slate-200 transition-all shrink-0 relative"
              title="View Past Scans"
            >
              <History className="w-3.5 h-3.5 text-[#D99A2B] shrink-0" />
              <span className="hidden sm:inline">History</span>
              {historyCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#D99A2B] text-[#13232F] font-bold text-[10px] flex items-center justify-center shrink-0">
                  {historyCount}
                </span>
              )}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              data-testid="theme-toggle-btn"
              className="p-2 text-[#52667A] dark:text-slate-400 hover:text-[#D99A2B] hover:bg-[#F6F2EA] dark:hover:bg-[#162432] rounded-xl transition-all shrink-0"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-[#D99A2B]" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#52667A] dark:text-slate-400 hover:text-[#13232F] dark:hover:text-white rounded-xl transition-all"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>

        {/* Mobile Dropdown Menu (< lg) */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E2D9C8] dark:border-[#223446] bg-[#FFFDF8] dark:bg-[#0F1720] px-4 py-3 space-y-2 animate-fade-down">
            <nav className="flex flex-col space-y-2 text-xs font-sans font-medium text-[#52667A] dark:text-slate-300">
              <a 
                href="#how-it-works" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-[#F6F2EA] dark:hover:bg-[#162432] rounded-lg"
              >
                How it works
              </a>
              <a 
                href="#privacy" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-[#F6F2EA] dark:hover:bg-[#162432] rounded-lg"
              >
                Privacy & BYOK Architecture
              </a>
              <a 
                href="#faq" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-[#F6F2EA] dark:hover:bg-[#162432] rounded-lg"
              >
                Frequently Asked Questions
              </a>
            </nav>

            <div className="pt-2 border-t border-[#E2D9C8] dark:border-[#223446] flex flex-col gap-2">
              <button
                onClick={() => {
                  setSettingsOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 bg-[#FAF3E5] dark:bg-[#272216] border border-[#E8C98F] dark:border-[#5C4722] text-[#D99A2B] rounded-xl text-xs font-mono font-semibold flex items-center justify-center gap-1.5"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Configure AI Provider & API Key</span>
              </button>
              <button
                onClick={() => {
                  onOpenApiKeyGuide();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 bg-[#F6F2EA] dark:bg-[#162432] border border-[#E2D9C8] dark:border-[#223446] text-[#52667A] dark:text-slate-300 rounded-xl text-xs font-mono flex items-center justify-center gap-1.5"
              >
                <Key className="w-3.5 h-3.5 text-[#D99A2B]" />
                <span>Get Free API Key Guide</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Slide-over Provider Settings Drawer */}
      <ProviderSettingsDrawer
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        provider={provider}
        setProvider={setProvider}
        model={model}
        setModel={setModel}
        apiKey={apiKey}
        setApiKey={setApiKey}
        onOpenApiKeyGuide={onOpenApiKeyGuide}
      />
    </>
  );
}
