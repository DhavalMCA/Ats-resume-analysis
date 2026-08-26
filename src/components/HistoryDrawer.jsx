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
    if (window.confirm('Are you sure you want to delete all past analyses from IndexedDB? This action cannot be undone.')) {
      await clearAllAnalyses();
      await loadHistory();
      onHistoryUpdated?.(0);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#13232F]/60 backdrop-blur-sm animate-fade-up">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-full sm:max-w-md bg-[#FFFDF8] dark:bg-[#162432] border-l border-[#E2D9C8] dark:border-[#223446] shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-5 border-b border-[#E2D9C8] dark:border-[#223446] flex items-center justify-between bg-[#F6F2EA]/60 dark:bg-[#0F1720]/60">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#FAF3E5] dark:bg-[#272216] border border-[#E8C98F] dark:border-[#5C4722] rounded-xl text-[#D99A2B]">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-base text-[#13232F] dark:text-white">Past Scans Drawer</h2>
                <p className="text-[11px] font-mono text-[#52667A] dark:text-slate-400">Stored in Local IndexedDB</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {historyItems.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  data-testid="clear-all-history-btn"
                  className="px-2.5 py-1 text-xs font-mono font-medium bg-[#FBF0EE] hover:bg-[#F8E1DC] text-[#B85242] border border-[#E8B8B0] dark:bg-[#2A1715] dark:text-[#D96957] dark:border-[#592922] rounded-lg transition-colors flex items-center gap-1"
                  title="Clear All History"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear All
                </button>
              )}

              <button
                onClick={onClose}
                data-testid="close-history-drawer-btn"
                className="p-2 text-[#52667A] dark:text-slate-400 hover:text-[#13232F] dark:hover:text-white rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {loading ? (
              <div className="text-center py-12 text-[#52667A] dark:text-slate-400 font-mono text-xs">
                Loading stored scans…
              </div>
            ) : historyItems.length === 0 ? (
              <div className="text-center py-16 text-[#52667A] dark:text-slate-500 space-y-2">
                <Clock className="w-10 h-10 mx-auto text-[#8295A6] dark:text-slate-600 mb-2" />
                <p className="font-heading font-semibold text-sm text-[#13232F] dark:text-slate-300">No past analyses saved yet</p>
                <p className="text-xs font-mono text-[#52667A] dark:text-slate-500 max-w-xs mx-auto">
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
                    className="p-4 bg-[#FFFDF8] dark:bg-[#162432] border border-[#E2D9C8] dark:border-[#223446] hover:border-[#D99A2B] rounded-2xl cursor-pointer transition-all group relative space-y-2 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-heading font-bold text-xs text-[#13232F] dark:text-white truncate flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#D99A2B] shrink-0" />
                        {item.fileName}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, item.id)}
                        className="p-1 text-[#52667A] dark:text-slate-500 hover:text-[#B85242] rounded-md transition-colors"
                        title="Delete from history"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-[#52667A] dark:text-slate-400">
                      <span>{dateStr}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[#52667A] dark:text-slate-400">{res.ats_score_before || 0} →</span>
                        <span className="font-bold text-[#3B7A57] dark:text-[#4E9A70]">{res.ats_score_after || 0} pts</span>
                      </div>
                    </div>

                    <div className="text-[10px] font-mono text-[#D99A2B] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-0.5 pt-1">
                      Restore Report <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {historyItems.length > 0 && (
            <div className="p-4 border-t border-[#E2D9C8] dark:border-[#223446] bg-[#F6F2EA]/40 dark:bg-[#0F1720]/40 flex items-center justify-between">
              <span className="text-xs font-mono text-[#52667A] dark:text-slate-400">
                Total Saved: {historyItems.length}
              </span>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs font-mono text-[#B85242] dark:text-[#D96957] hover:underline flex items-center gap-1"
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
