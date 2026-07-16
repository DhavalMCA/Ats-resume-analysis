import React, { useEffect, useState } from 'react';
import { getAllAnalyses, deleteAnalysis, clearAllAnalyses } from '../lib/history';
import { History, X, Trash2, Clock, FileText, ChevronRight, AlertTriangle } from 'lucide-react';

export function HistoryDrawer({ isOpen, onClose, onSelectHistoryItem, onHistoryUpdated }) {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const items = await getAllAnalyses();
      setHistoryItems(items);
      onHistoryUpdated?.(items.length);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await deleteAnalysis(id);
    await loadHistory();
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to delete all past analyses from IndexedDB?')) {
      await clearAllAnalyses();
      await loadHistory();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm animate-fade-up">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0a0d14] border-l border-slate-800 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-base text-white">Past Scans Drawer</h2>
                <p className="text-[11px] font-mono text-slate-400">Stored in Local IndexedDB</p>
              </div>
            </div>

            <button
              onClick={onClose}
              data-testid="close-history-drawer-btn"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="text-center py-12 text-slate-400 font-mono text-xs">
                Loading stored scans...
              </div>
            ) : historyItems.length === 0 ? (
              <div className="text-center py-16 text-slate-500 space-y-2">
                <Clock className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                <p className="font-heading font-semibold text-sm text-slate-400">No past analyses saved yet</p>
                <p className="text-xs font-mono text-slate-600 max-w-xs mx-auto">
                  Run an ATS scan to auto-save reports to your browser's IndexedDB.
                </p>
              </div>
            ) : (
              historyItems.map((item) => {
                const res = item.result || {};
                const dateStr = new Date(item.createdAt).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectHistoryItem(item);
                      onClose();
                    }}
                    className="p-4 bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 rounded-2xl cursor-pointer transition-all group relative space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-heading font-bold text-xs text-white truncate flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        {item.fileName}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, item.id)}
                        className="p-1 text-slate-500 hover:text-red-400 rounded-md transition-colors"
                        title="Delete from history"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>{dateStr}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">{res.ats_score_before || 0} →</span>
                        <span className="font-bold text-emerald-400">{res.ats_score_after || 0} pts</span>
                      </div>
                    </div>

                    <div className="text-[10px] font-mono text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-0.5 pt-1">
                      Restore Report <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {historyItems.length > 0 && (
            <div className="p-4 border-t border-slate-800 bg-slate-900/40 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">
                Total Saved: {historyItems.length}
              </span>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs font-mono text-red-400 hover:text-red-300 hover:underline flex items-center gap-1"
              >
                <AlertTriangle className="w-3 h-3" /> Clear History
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
