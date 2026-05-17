'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, Plus, Eye, EyeOff, Lock, Unlock, Copy, Trash2, X, Sparkles, ShieldCheck } from 'lucide-react';
import ControlPanel from '../components/editor/ControlPanel';
import TopBar from '../components/editor/TopBar';
import { useEditorStore } from '../store/useEditorStore';

const CanvasArea = dynamic(() => import('../components/editor/CanvasArea'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <Loader2 className="animate-spin text-white w-8 h-8" />
    </div>
  ),
});

export default function EditorPage() {
  const { 
    texts, selectedTextId, isLayersOpen, setLayersOpen, 
    setSelectedText, toggleVisibility, toggleLock, duplicateText, deleteText, addText,
    isExportModalOpen, setExportModalOpen
  } = useEditorStore();

  // এক্সপোর্ট কোয়ালিটির জন্য লোকাল স্টেট
  const [selectedQuality, setSelectedQuality] = useState<number>(1080);

  const qualityOptions = [
    { label: 'Normal Quality', sub: '720p (Fast Upload)', width: 720 },
    { label: 'Medium Quality', sub: '1080p FHD (Standard Story)', width: 1080 },
    { label: 'High Quality', sub: '2K Crispy (Super Sharp Text)', width: 1440 },
    { label: 'Ultra High Quality', sub: '4K Cinematic (Crystal Clear Emojis)', width: 2160 },
  ];

  const triggerDownloadAction = () => {
    // CanvasArea কে সেভ কমান্ড ফায়ার করা হচ্ছে নির্দিষ্ট পিক্সেল উইডথ সহ
    window.dispatchEvent(new CustomEvent('trigger-safe-download', { 
      detail: { targetWidth: selectedQuality } 
    }));
    setExportModalOpen(false); // মোডাল বন্ধ
  };

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

      {/* --- EYE-CATCHING PRO EXPORT MODAL --- */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-gradient-to-b from-zinc-900 to-black border border-white/10 p-5 rounded-3xl w-full max-w-sm shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-200">
            
            {/* Close Button */}
            <button onClick={() => setExportModalOpen(false)} className="absolute top-4 right-4 p-1.5 bg-white/5 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors">
              <X size={15} />
            </button>

            {/* Modal Title */}
            <div className="space-y-1">
              <h3 className="text-sm font-bold tracking-wider text-white uppercase flex items-center gap-1.5">
                <Sparkles size={15} className="text-blue-400 animate-pulse" /> Export Engine
              </h3>
              <p className="text-[11px] text-zinc-400">Select output resolution. Emojis and text fonts will be vector-upscaled automatically.</p>
            </div>

            {/* Quality List Selection */}
            <div className="space-y-2">
              {qualityOptions.map((opt) => (
                <div 
                  key={opt.width}
                  onClick={() => setSelectedQuality(opt.width)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex justify-between items-center ${selectedQuality === opt.width ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'bg-white/5 border-white/5 hover:border-zinc-700/50'}`}
                >
                  <div>
                    <p className={`text-xs font-semibold ${selectedQuality === opt.width ? 'text-blue-400' : 'text-white'}`}>{opt.label}</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">{opt.sub}</p>
                  </div>
                  {selectedQuality === opt.width && <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />}
                </div>
              ))}
            </div>

            {/* Confirm Download Button */}
            <button 
              onClick={triggerDownloadAction}
              className="w-full bg-white text-black hover:bg-zinc-200 font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-1.5"
            >
              <ShieldCheck size={15} /> Download Now
            </button>
          </div>
        </div>
      )}

      {/* --- SLIDE-OUT LAYERS DRAWER --- */}
      {isLayersOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" onClick={() => setLayersOpen(false)} />}
      <div className={`fixed top-0 left-0 h-full w-[280px] bg-zinc-950 border-r border-zinc-800 shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${isLayersOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/80 backdrop-blur sticky top-0 z-10">
          <h2 className="text-sm font-bold tracking-wider text-white">Layers Panel</h2>
          <div className="flex gap-2">
            <button onClick={() => addText({})} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-white transition-colors"><Plus size={16} /></button>
            <button onClick={() => setLayersOpen(false)} className="p-1.5 hover:bg-zinc-900 rounded text-zinc-400 hover:text-white transition-colors"><X size={16} /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-[#09090b]">
          {texts.map((layer, idx) => (
            <div key={layer.id} onClick={() => setSelectedText(layer.id)} className={`flex flex-col gap-2 p-3 rounded-xl border transition-all ${selectedTextId === layer.id ? 'bg-zinc-900 border-zinc-600 shadow-lg' : 'bg-zinc-950 border-zinc-900 hover:bg-zinc-900/50'}`}>
              <div className="flex justify-between items-start"><div className="min-w-0 pr-2"><p className="text-[10px] font-mono text-zinc-500 mb-1 uppercase tracking-wider">Layer {idx + 1}</p><p className={`text-xs truncate max-w-[150px] ${selectedTextId === layer.id ? 'text-white font-medium' : 'text-zinc-400'}`}>{layer.text || "Empty Text"}</p></div></div>
              <div className="flex justify-between items-center pt-2 border-t border-zinc-800/50" onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-3"><button onClick={() => toggleVisibility(layer.id)} className="hover:text-white">{layer.visible ? <Eye size={14} className="text-zinc-400" /> : <EyeOff size={14} className="text-red-500" />}</button><button onClick={() => toggleLock(layer.id)} className="hover:text-white">{layer.locked ? <Lock size={14} className="text-amber-500" /> : <Unlock size={14} className="text-zinc-400" />}</button></div>
                <div className="flex gap-3"><button onClick={() => duplicateText(layer.id)} className="hover:text-white text-zinc-400"><Copy size={14} /></button><button onClick={() => deleteText(layer.id)} className="hover:text-red-400 text-zinc-600"><Trash2 size={14} /></button></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}