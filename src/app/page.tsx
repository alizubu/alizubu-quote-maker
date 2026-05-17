'use client';

import dynamic from 'next/dynamic';
import { Loader2, Plus, Eye, EyeOff, Lock, Unlock, Copy, Trash2, X } from 'lucide-react';
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
    setSelectedText, toggleVisibility, toggleLock, duplicateText, deleteText, addText 
  } = useEditorStore();

  return (
    <main className="h-[100dvh] w-screen bg-black text-white flex flex-col md:flex-row overflow-hidden font-sans selection:bg-white/30 relative">
      
      {/* --- CANVAS AREA (Fixed 55% height on mobile, Flex-1 on Desktop) --- */}
      <div className="flex-none h-[55dvh] md:h-full md:flex-1 relative bg-[#09090b]">
        <TopBar />
        <CanvasArea />
      </div>

      {/* --- CONTROL PANEL AREA (Takes exactly the remaining 45% and forces scroll) --- */}
      <div className="flex-1 md:w-[380px] md:flex-none bg-[#0c0c0e] border-t md:border-l border-white/10 shadow-xl flex flex-col z-10 min-h-0 overflow-hidden">
        <ControlPanel />
      </div>

      {/* --- SLIDE-OUT LAYERS DRAWER (Left Sidebar) --- */}
      {isLayersOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setLayersOpen(false)}
        />
      )}

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
            <div 
              key={layer.id} 
              onClick={() => setSelectedText(layer.id)}
              className={`flex flex-col gap-2 p-3 rounded-xl border transition-all ${selectedTextId === layer.id ? 'bg-zinc-900 border-zinc-600 shadow-lg' : 'bg-zinc-950 border-zinc-900 hover:bg-zinc-900/50'}`}
            >
              <div className="flex justify-between items-start">
                <div className="min-w-0 pr-2">
                  <p className="text-[10px] font-mono text-zinc-500 mb-1 uppercase tracking-wider">Layer {idx + 1}</p>
                  <p className={`text-xs truncate max-w-[150px] ${selectedTextId === layer.id ? 'text-white font-medium' : 'text-zinc-400'}`}>
                    {layer.text || "Empty Text"}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t border-zinc-800/50" onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-3">
                  <button onClick={() => toggleVisibility(layer.id)} className="hover:text-white">{layer.visible ? <Eye size={14} className="text-zinc-400" /> : <EyeOff size={14} className="text-red-500" />}</button>
                  <button onClick={() => toggleLock(layer.id)} className="hover:text-white">{layer.locked ? <Lock size={14} className="text-amber-500" /> : <Unlock size={14} className="text-zinc-400" />}</button>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => duplicateText(layer.id)} className="hover:text-white text-zinc-400"><Copy size={14} /></button>
                  <button onClick={() => deleteText(layer.id)} className="hover:text-red-400 text-zinc-600"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
          {texts.length === 0 && (
            <p className="text-center text-zinc-600 text-xs mt-10">No layers added yet.</p>
          )}
        </div>
      </div>
    </main>
  );
}