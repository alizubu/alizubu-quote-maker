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
      <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
      <p className="text-sm uppercase tracking-widest font-bold">Loading Canvas Engine...</p>
    </div>
  ),
});

export default function EditorPage() {
  const { selectedLayerId, deleteLayer, duplicateLayer, isExportModalOpen, setExportModalOpen, undo, redo } = useEditorStore();
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
    <main className="h-[100dvh] w-screen bg-black text-white flex flex-col md:flex-row overflow-hidden font-sans selection:bg-purple-500/30 relative">
      
      {/* Canvas Area with Professional Background */}
      <div className="flex-none h-[55dvh] md:h-full md:flex-1 relative bg-gradient-to-br from-zinc-950 via-black to-zinc-900 overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)]"></div>
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <TopBar />
        <CanvasArea />
      </div>

      {/* Control Panel with Enhanced Shadow */}
      <div className="flex-1 md:w-[380px] md:flex-none border-t md:border-t-0 md:border-l border-zinc-800/50 shadow-[-10px_0_40px_rgba(0,0,0,0.5)] md:shadow-[-20px_0_60px_rgba(0,0,0,0.6)] flex flex-col z-10 min-h-0 overflow-hidden">
        <ControlPanel />
      </div>

      {/* --- ENHANCED EXPORT MODAL --- */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
          <div className="relative bg-gradient-to-br from-zinc-900/98 via-black/98 to-zinc-900/98 backdrop-blur-2xl border border-white/20 p-6 rounded-3xl w-full max-w-md shadow-[0_20px_70px_rgba(0,0,0,0.9)] animate-scale-in">
            
            {/* Gradient Glow Effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-2xl opacity-50 -z-10"></div>
            
            <button 
              onClick={() => setExportModalOpen(false)} 
              className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-400 hover:text-white transition-all active:scale-90 hover-lift"
            >
              <X size={18} />
            </button>

            <div className="space-y-2 mb-6">
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

            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar mb-6">
              {qualityOptions.map((opt) => (
                <div 
                  key={opt.width} 
                  onClick={() => setSelectedQuality(opt.width)} 
                  className={`relative p-4 rounded-2xl border cursor-pointer transition-all flex justify-between items-center group overflow-hidden ${
                    selectedQuality === opt.width 
                      ? 'bg-gradient-to-r from-blue-500/15 to-purple-500/15 border-blue-400/60 shadow-[0_0_30px_rgba(59,130,246,0.25)]' 
                      : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  {selectedQuality === opt.width && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse"></div>
                  )}
                  
                  <div className="relative z-10">
                    <p className={`text-sm font-bold mb-1 transition-colors ${
                      selectedQuality === opt.width 
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400' 
                        : 'text-zinc-200 group-hover:text-white'
                    }`}>
                      {opt.label}
                    </p>
                    <p className="text-[10px] text-zinc-500 flex items-center gap-1.5">
                      <span className="font-mono">{opt.width}p</span>
                      <span className="text-zinc-600">•</span>
                      <span>{opt.sub}</span>
                    </p>
                  </div>
                  
                  {selectedQuality === opt.width ? (
                    <div className="relative z-10 w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/50">
                      <ShieldCheck size={16} strokeWidth={2.5} />
                    </div>
                  ) : (
                    <div className="relative z-10 w-7 h-7 rounded-full border-2 border-zinc-700 group-hover:border-zinc-500 transition-colors"></div>
                  )}
                </div>
              ))}
            </div>

            <button 
              onClick={triggerDownloadAction} 
              className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold py-3.5 rounded-2xl text-sm uppercase tracking-wider transition-all shadow-[0_10px_40px_rgba(139,92,246,0.4)] hover:shadow-[0_15px_50px_rgba(139,92,246,0.6)] active:scale-[0.98] flex items-center justify-center gap-2 hover-lift"
            >
              <ShieldCheck size={18} strokeWidth={2.5} /> 
              <span>Download Now</span>
            </button>
            
            <p className="text-center text-[9px] text-zinc-600 mt-3">
              High-quality export with vector scaling
            </p>
          </div>
        </div>
      )}

      {/* --- INJECTED MODULAR LAYER PANEL --- */}
      <LayerPanel />

    </main>
  );
}