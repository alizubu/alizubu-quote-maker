'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { X, Sparkles, ShieldCheck } from 'lucide-react';
import { useHotkeys } from 'react-hotkeys-hook';

// Modular Imports
import ControlPanel from '../components/editor/panels/ControlPanel';
import TopBar from '../components/editor/topbar/TopBar';
import LayerPanel from '../components/editor/layers/LayerPanel';
import { useEditorStore } from '../store/useEditorStore';

// Lazy Load Canvas
const CanvasArea = dynamic(() => import('../components/editor/canvas/CanvasArea'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#09090b] text-zinc-500">
      <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
      <p className="text-xs sm:text-sm uppercase tracking-widest font-bold">Loading Canvas Engine...</p>
    </div>
  ),
});

export default function EditorPage() {
  const {
    selectedLayerId,
    deleteLayer,
    duplicateLayer,
    isExportModalOpen,
    setExportModalOpen,
    undo,
    redo,
  } = useEditorStore();
  const [selectedQuality, setSelectedQuality] = useState<number>(1080);

  const qualityOptions = [
    { label: 'Normal Quality', sub: '720p (Fast Upload)', width: 720 },
    { label: 'Medium Quality', sub: '1080p FHD (Standard Story)', width: 1080 },
    { label: 'High Quality', sub: '2K Crispy (Super Sharp Text)', width: 1440 },
    { label: 'Ultra High Quality', sub: '4K Cinematic (Crystal Clear Emojis)', width: 2160 },
  ];

  const triggerDownloadAction = () => {
    window.dispatchEvent(new CustomEvent('trigger-safe-download', { detail: { targetWidth: selectedQuality } }));
    setExportModalOpen(false);
  };

  // --- KEYBOARD SHORTCUTS ---
  useHotkeys('ctrl+z, meta+z', () => undo(), { preventDefault: true });
  useHotkeys('ctrl+y, meta+y, ctrl+shift+z, meta+shift+z', () => redo(), { preventDefault: true });
  useHotkeys('delete, backspace', () => { if (selectedLayerId) deleteLayer(selectedLayerId); }, { preventDefault: true }, [selectedLayerId]);
  useHotkeys('ctrl+d, meta+d', () => { if (selectedLayerId) duplicateLayer(selectedLayerId); }, { preventDefault: true }, [selectedLayerId]);

  return (
    <main
      data-editor-shell
      className="h-[100dvh] w-screen bg-white dark:bg-black text-zinc-900 dark:text-white flex flex-col md:flex-row overflow-hidden font-sans selection:bg-purple-500/30 relative transition-colors duration-300"
      style={{
        // iOS safe areas
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* ============ CANVAS AREA ============ */}
      <div
        data-canvas-area
        className="flex-none h-[58dvh] md:h-full md:flex-1 relative bg-gradient-to-br from-zinc-100 via-zinc-50 to-zinc-100 dark:from-zinc-950 dark:via-black dark:to-zinc-900 overflow-hidden transition-colors duration-300"
      >
        {/* Animated Background Pattern (lighter on mobile for performance) */}
        <div className="absolute inset-0 opacity-20 dark:opacity-30 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.15),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)]" />
          <div className="hidden sm:block absolute top-1/4 right-1/4 w-96 h-96 bg-blue-400/15 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div
            className="hidden sm:block absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-400/15 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: '1s' }}
          />
        </div>

        <TopBar />
        <CanvasArea />
      </div>

      {/* ============ CONTROL PANEL ============ */}
      <div
        data-control-shell
        className="flex-1 md:w-[380px] md:flex-none border-t md:border-t-0 md:border-l border-zinc-200 dark:border-zinc-800/50 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:shadow-[-20px_0_60px_rgba(0,0,0,0.1)] md:dark:shadow-[-20px_0_60px_rgba(0,0,0,0.6)] flex flex-col z-10 min-h-0 overflow-hidden transition-colors duration-300"
      >
        <ControlPanel />
      </div>

      {/* ============ EXPORT MODAL (bottom-sheet on mobile) ============ */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
          <div className="relative bg-gradient-to-br from-zinc-900/98 via-black/98 to-zinc-900/98 backdrop-blur-2xl border border-white/20 p-5 sm:p-6 rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-[0_20px_70px_rgba(0,0,0,0.9)] animate-slide-in-up sm:animate-scale-in max-h-[92vh] sm:max-h-[90vh] flex flex-col">
            {/* Mobile drag handle */}
            <div className="sm:hidden absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/20 rounded-full" />

            {/* Gradient Glow */}
            <div className="absolute inset-0 rounded-t-3xl sm:rounded-3xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-2xl opacity-50 -z-10" />

            <button
              onClick={() => setExportModalOpen(false)}
              className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-400 hover:text-white transition-all active:scale-90 z-10"
            >
              <X size={18} />
            </button>

            <div className="space-y-2 mb-5 sm:mb-6 pt-2 sm:pt-0 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl shadow-lg">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Export Your Design</h3>
                  <p className="text-[10px] text-zinc-400">Choose quality for best results</p>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-2.5 overflow-y-auto pr-2 -mr-2 custom-scrollbar mb-5 sm:mb-6 min-h-0">
              {qualityOptions.map((opt) => (
                <button
                  key={opt.width}
                  onClick={() => setSelectedQuality(opt.width)}
                  className={`relative w-full text-left p-3.5 sm:p-4 rounded-2xl border cursor-pointer transition-all flex justify-between items-center group overflow-hidden active:scale-[0.99] ${
                    selectedQuality === opt.width
                      ? 'bg-gradient-to-r from-blue-500/15 to-purple-500/15 border-blue-400/60 shadow-[0_0_30px_rgba(59,130,246,0.25)]'
                      : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  {selectedQuality === opt.width && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse" />
                  )}

                  <div className="relative z-10 min-w-0">
                    <p
                      className={`text-sm font-bold mb-1 transition-colors truncate ${
                        selectedQuality === opt.width
                          ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400'
                          : 'text-zinc-200 group-hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </p>
                    <p className="text-[10px] text-zinc-500 flex items-center gap-1.5">
                      <span className="font-mono">{opt.width}p</span>
                      <span className="text-zinc-600">•</span>
                      <span className="truncate">{opt.sub}</span>
                    </p>
                  </div>

                  {selectedQuality === opt.width ? (
                    <div className="relative z-10 w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/50 shrink-0 ml-2">
                      <ShieldCheck size={16} strokeWidth={2.5} />
                    </div>
                  ) : (
                    <div className="relative z-10 w-7 h-7 rounded-full border-2 border-zinc-700 group-hover:border-zinc-500 transition-colors shrink-0 ml-2" />
                  )}
                </button>
              ))}
            </div>

            <div className="shrink-0">
              <button
                onClick={triggerDownloadAction}
                className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold py-3.5 rounded-2xl text-sm uppercase tracking-wider transition-all shadow-[0_10px_40px_rgba(139,92,246,0.4)] hover:shadow-[0_15px_50px_rgba(139,92,246,0.6)] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <ShieldCheck size={18} strokeWidth={2.5} />
                <span>Download Now</span>
              </button>
              <p className="text-center text-[9px] text-zinc-600 mt-3">High-quality export with vector scaling</p>
            </div>
          </div>
        </div>
      )}

      {/* --- MODULAR LAYER PANEL --- */}
      <LayerPanel />
    </main>
  );
}
