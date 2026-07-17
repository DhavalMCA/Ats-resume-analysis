import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './components/ThemeProvider';
import { Header } from './components/Header';
import { Analyzer } from './components/Analyzer';
import { HistoryDrawer } from './components/HistoryDrawer';
import { ApiKeyGuideModal } from './components/ApiKeyGuideModal';
import { getAllAnalyses } from './lib/history';
import { MODEL_CONFIGS } from './lib/llm';

export default function App() {
  const [apiKey, setApiKey] = useState(() => {
    return sessionStorage.getItem('byok_llm_key') || '';
  });

  const [provider, setProvider] = useState(() => {
    return sessionStorage.getItem('byok_provider') || 'gemini';
  });

  const [model, setModel] = useState(() => {
    const savedModel = sessionStorage.getItem('byok_model');
    const validModels = MODEL_CONFIGS[provider]?.options.map(o => o.id) || [];
    if (savedModel && validModels.includes(savedModel)) {
      return savedModel;
    }
    return MODEL_CONFIGS[provider]?.defaultModel || 'gemini-2.0-flash';
  });

  const [apiKeyGuideOpen, setApiKeyGuideOpen] = useState(false);

  const handleProviderChange = (newProvider) => {
    setProvider(newProvider);
    sessionStorage.setItem('byok_provider', newProvider);
    const newDefaultModel = MODEL_CONFIGS[newProvider]?.defaultModel;
    setModel(newDefaultModel);
    sessionStorage.setItem('byok_model', newDefaultModel);
  };

  const handleModelChange = (newModel) => {
    setModel(newModel);
    sessionStorage.setItem('byok_model', newModel);
  };

  const handleSaveKeyFromModal = (newKey, newProvider) => {
    if (newProvider && newProvider !== provider) {
      handleProviderChange(newProvider);
    }
    setApiKey(newKey);
    sessionStorage.setItem('byok_llm_key', newKey);
  };

  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

  const refreshHistoryCount = async () => {
    try {
      const items = await getAllAnalyses();
      setHistoryCount(items.length);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    refreshHistoryCount();
  }, []);

  return (
    <ThemeProvider>
      <div className="relative min-h-screen bg-[#0a0d14] text-slate-100 font-sans antialiased bg-tech-grid transition-colors duration-300">
        {/* Background Ambient Glowing Blobs */}
        <div className="ambient-blobs">
          <div className="ambient-blob-1" />
          <div className="ambient-blob-2" />
        </div>

        {/* Global Navbar */}
        <Header
          apiKey={apiKey}
          setApiKey={setApiKey}
          provider={provider}
          setProvider={handleProviderChange}
          model={model}
          setModel={handleModelChange}
          onOpenHistory={() => setHistoryOpen(true)}
          historyCount={historyCount}
          onOpenApiKeyGuide={() => setApiKeyGuideOpen(true)}
        />

        {/* Main Application Content */}
        <main className="relative z-10">
          <Analyzer
            apiKey={apiKey}
            provider={provider}
            model={model}
            onHistoryUpdated={refreshHistoryCount}
            selectedHistoryItem={selectedHistoryItem}
            onOpenApiKeyGuide={() => setApiKeyGuideOpen(true)}
          />
        </main>

        {/* Slide-over Past Scans Drawer */}
        <HistoryDrawer
          isOpen={historyOpen}
          onClose={() => setHistoryOpen(false)}
          onSelectHistoryItem={(item) => setSelectedHistoryItem(item)}
          onHistoryUpdated={refreshHistoryCount}
        />

        {/* API Key Guide & Helper Tools Modal */}
        <ApiKeyGuideModal
          isOpen={apiKeyGuideOpen}
          onClose={() => setApiKeyGuideOpen(false)}
          currentProvider={provider}
          apiKey={apiKey}
          onSaveKey={handleSaveKeyFromModal}
        />
      </div>
    </ThemeProvider>
  );
}
