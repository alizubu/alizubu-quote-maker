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
    // মোবাইলের জন্য h-[100dvh] ব্যবহার করা হয়েছে যাতে ব্রাউজারের এড্রেস বার ডিস্টার্ব না করে
    <main className="h-[100dvh] w-screen bg-black text-white flex flex-col md:flex-row overflow-hidden font-sans selection:bg-white/30 relative">
      
      {/* --- CANVAS AREA (Top on mobile, Left on desktop) --- */}
      <div className="flex-1 relative bg-[#09090b]">
        <TopBar />
        <CanvasArea />
      </div>

      {/* --- BOTTOM / RIGHT CONTROL PANEL --- */}
      <div className="w-full md:w-[380px] h-[45vh] md:h-full bg-[#0c0c0e] border-t md:border-l border-white/10 p-4 md:p-6 shadow-2xl flex flex-col z-10">
        <ControlPanel />
      </div>

      {/* --- SLIDE-OUT LAYERS DRAWER (Left Sidebar) --- */}
      {/* Backdrop overlay for mobile when drawer is open */}
      {isLayersOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setLayersOpen(false)}
        />
      )}

      <div className={`fixed top-0 left-0 h-full w-72 bg-zinc-950 border-r border-zinc-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isLayersOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-zinc-900 flex justify-between items-center bg-zinc-950 sticky top-0">
          <h2 className="text-sm font-semibold tracking-wider text-zinc-300">Layers</h2>
          <div className="flex gap-2">
            <button onClick={() => addText({})} className="p-1.5 bg-zinc-900 hover:bg-zinc-800 rounded-md text-white transition-colors" title="Add Layer"><Plus size={16} /></button>
            <button onClick={() => setLayersOpen(false)} className="p-1.5 hover:bg-zinc-900 rounded-md text-zinc-500 hover:text-white transition-colors" title="Close"><X size={16} /></button>
          </div>
        </div>

        {/* Layers List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-black/20">
          {texts.map((layer, idx) => (
            <div 
              key={layer.id} 
              onClick={() => setSelectedText(layer.id)}
              className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedTextId === layer.id ? 'bg-zinc-900 border-zinc-600 shadow-lg' : 'bg-zinc-950 border-zinc-900 hover:bg-zinc-900/50'}`}
            >
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-[11px] font-mono text-zinc-500 mb-0.5">Layer {idx + 1}</p>
                <p className={`text-xs truncate ${selectedTextId === layer.id ? 'text-white font-medium' : 'text-zinc-400'}`}>
                  {layer.text || "Empty Text"}
                </p>
              </div>
              
              <div className="flex flex-col gap-2 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
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