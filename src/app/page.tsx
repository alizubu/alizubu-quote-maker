'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, Plus, Eye, EyeOff, Lock, Unlock, Copy, Trash2, X, Sparkles, ShieldCheck, ArrowUp, ArrowDown, Edit3, Layers, Type } from 'lucide-react';
import ControlPanel from '../components/editor/ControlPanel';
import TopBar from '../components/editor/TopBar';
import { useEditorStore } from '../store/useEditorStore';
import { useHotkeys } from 'react-hotkeys-hook';

// 4. Lazy Loading: Canvas Engine will load faster
const CanvasArea = dynamic(() => import('../components/editor/CanvasArea'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#09090b] text-zinc-500">
      <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
      <p className="text-sm uppercase tracking-widest font-bold">Loading Canvas Engine...</p>
    </div>
  ),
});

export default function EditorPage() {
  const { 
    texts, selectedTextId, isLayersOpen, setLayersOpen, 
    setSelectedText, toggleVisibility, toggleLock, duplicateText, deleteText, addText,
    isExportModalOpen, setExportModalOpen, renameText, moveLayerUp, moveLayerDown,
    undo, redo
  } = useEditorStore();

  const [selectedQuality, setSelectedQuality] = useState<number>(1080);
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [tempLayerName, setTempLayerName] = useState<string>('');

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

  // 2. KEYBOARD SHORTCUTS ENGINE
  useHotkeys('ctrl+z, meta+z', () => undo(), { preventDefault: true });
  useHotkeys('ctrl+y, meta+y, ctrl+shift+z, meta+shift+z', () => redo(), { preventDefault: true });
  useHotkeys('delete, backspace', () => {
    if (selectedTextId && !editingLayerId) deleteText(selectedTextId);
  }, { preventDefault: true }, [selectedTextId, editingLayerId]);
  useHotkeys('ctrl+d, meta+d', () => {
    if (selectedTextId && !editingLayerId) duplicateText(selectedTextId);
  }, { preventDefault: true }, [selectedTextId, editingLayerId]);

  // Layer Rename Logic
  const startRename = (id: string, currentName: string) => {
    setEditingLayerId(id);
    setTempLayerName(currentName);
  };

  const finishRename = (id: string) => {
    if (tempLayerName.trim() !== '') {
      renameText(id, tempLayerName);
    }
    setEditingLayerId(null);
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

      {/* 1. FIGMA STYLE LAYERS DRAWER */}
      {isLayersOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" onClick={() => setLayersOpen(false)} />}
      <div className={`fixed top-0 left-0 h-full w-[320px] bg-[#121212] border-r border-white/10 shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${isLayersOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#121212] sticky top-0 z-10">
          <h2 className="text-xs font-bold tracking-widest uppercase text-white flex items-center gap-2"><Layers size={14} className="text-blue-400"/> Layers Panel</h2>
          <div className="flex gap-2">
            <button onClick={() => addText({})} className="p-1.5 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors"><Plus size={14} /></button>
            <button onClick={() => setLayersOpen(false)} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"><X size={14} /></button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {texts.map((layer) => (
            <div key={layer.id} onClick={() => setSelectedText(layer.id)} className={`flex flex-col gap-2 p-3 rounded-xl border transition-all cursor-pointer ${selectedTextId === layer.id ? 'bg-blue-500/10 border-blue-500/50 shadow-md' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-[10px] text-zinc-500"><Type size={12} /></span>
                  
                  {/* Layer Rename Feature */}
                  {editingLayerId === layer.id ? (
                    <input 
                      autoFocus 
                      value={tempLayerName} 
                      onChange={(e) => setTempLayerName(e.target.value)} 
                      onBlur={() => finishRename(layer.id)}
                      onKeyDown={(e) => e.key === 'Enter' && finishRename(layer.id)}
                      className="bg-black/50 text-xs text-white px-2 py-1 rounded outline-none border border-blue-500 w-full"
                    />
                  ) : (
                    <p className={`text-xs font-medium truncate flex-1 ${selectedTextId === layer.id ? 'text-white' : 'text-zinc-300'}`} onDoubleClick={(e) => { e.stopPropagation(); startRename(layer.id, layer.name); }}>
                      {layer.name}
                    </p>
                  )}
                </div>

                {/* Bring Forward / Send Backward & Edit */}
                <div className="flex gap-1">
                  <button onClick={(e) => { e.stopPropagation(); startRename(layer.id, layer.name); }} className="p-1 hover:bg-white/10 rounded text-zinc-500 hover:text-white" title="Rename Layer"><Edit3 size={12} /></button>
                  <button onClick={(e) => { e.stopPropagation(); moveLayerUp(layer.id); }} className="p-1 hover:bg-white/10 rounded text-zinc-500 hover:text-white" title="Bring Forward"><ArrowUp size={12} /></button>
                  <button onClick={(e) => { e.stopPropagation(); moveLayerDown(layer.id); }} className="p-1 hover:bg-white/10 rounded text-zinc-500 hover:text-white" title="Send Backward"><ArrowDown size={12} /></button>
                </div>
              </div>

              {/* Lock, Hide, Duplicate, Delete */}
              <div className="flex justify-between items-center pt-2 border-t border-white/5" onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-2">
                  <button onClick={() => toggleVisibility(layer.id)} className="p-1.5 hover:bg-white/10 rounded transition-colors" title="Toggle Visibility">{layer.visible ? <Eye size={14} className="text-zinc-400 hover:text-white" /> : <EyeOff size={14} className="text-red-500" />}</button>
                  <button onClick={() => toggleLock(layer.id)} className="p-1.5 hover:bg-white/10 rounded transition-colors" title="Lock/Unlock Layer">{layer.locked ? <Lock size={14} className="text-amber-500" /> : <Unlock size={14} className="text-zinc-400 hover:text-white" />}</button>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => duplicateText(layer.id)} className="p-1.5 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors" title="Duplicate Layer"><Copy size={14} /></button>
                  <button onClick={() => deleteText(layer.id)} className="p-1.5 hover:bg-red-500/20 rounded text-zinc-500 hover:text-red-400 transition-colors" title="Delete Layer"><Trash2 size={14} /></button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </main>
  );
}