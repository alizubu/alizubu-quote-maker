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
    <main className="h-[100dvh] w-screen bg-black text-white flex flex-col md:flex-row overflow-hidden font-sans selection:bg-white/30 relative">
      
      {/* Canvas Layer */}
      <div className="flex-none h-[55dvh] md:h-full md:flex-1 relative bg-[#09090b]">
        <TopBar />
        <CanvasArea />
      </div>

      {/* Control Panel Layer */}
      <div className="flex-1 md:w-[380px] md:flex-none bg-[#0c0c0e] border-t md:border-l border-white/10 shadow-xl flex flex-col z-10 min-h-0 overflow-hidden">
        <ControlPanel />
      </div>

      {/* --- EXPORT MODAL --- */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-gradient-to-b from-zinc-900 to-black border border-white/10 p-5 rounded-3xl w-full max-w-sm shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-200">
            <button onClick={() => setExportModalOpen(false)} className="absolute top-4 right-4 p-1.5 bg-white/5 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors">
              <X size={15} />
            </button>
            <div className="space-y-1">
              <h3 className="text-sm font-bold tracking-wider text-white uppercase flex items-center gap-1.5"><Sparkles size={15} className="text-blue-400 animate-pulse" /> Export Engine</h3>
              <p className="text-[11px] text-zinc-400">Select output resolution. Emojis and text fonts will be vector-upscaled automatically.</p>
            </div>
            <div className="space-y-2">
              {qualityOptions.map((opt) => (
                <div key={opt.width} onClick={() => setSelectedQuality(opt.width)} className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex justify-between items-center ${selectedQuality === opt.width ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'bg-white/5 border-white/5 hover:border-zinc-700/50'}`}>
                  <div><p className={`text-xs font-semibold ${selectedQuality === opt.width ? 'text-blue-400' : 'text-white'}`}>{opt.label}</p><p className="text-[10px] text-zinc-400 mt-0.5">{opt.sub}</p></div>
                  {selectedQuality === opt.width && <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />}
                </div>
              ))}
            </div>
            <button onClick={triggerDownloadAction} className="w-full bg-white text-black hover:bg-zinc-200 font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-1.5"><ShieldCheck size={15} /> Download Now</button>
          </div>
        </div>
      )}

      {/* --- INJECTED MODULAR LAYER PANEL --- */}
      <LayerPanel />

    </main>
  );
}