'use client';

import React from 'react';
import { useEditorStore, ImageLayer } from '../../../store/useEditorStore';
import { FlipHorizontal, FlipVertical, Image as ImageIcon, Crop, Circle, Square } from 'lucide-react';
import { StepperSlider } from './BackgroundPanel';

export default function ImagePanel() {
  const { layers, selectedLayerId, updateLayer, saveHistory, setCropMode, isCropMode } = useEditorStore();
  const selectedLayer = layers.find((l) => l.id === selectedLayerId) as ImageLayer;

  if (!selectedLayer || selectedLayer.type !== 'image') return null;

  const handleFlipX = () => { saveHistory(); updateLayer(selectedLayer.id, { scaleX: selectedLayer.scaleX * -1 }); };
  const handleFlipY = () => { saveHistory(); updateLayer(selectedLayer.id, { scaleY: selectedLayer.scaleY * -1 }); };

  return (
    <div className="space-y-5 animate-in slide-in-from-right-4 duration-300 pb-4">
      {/* Header Info */}
      <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-4 rounded-2xl flex justify-between items-center shadow-sm">
         <div>
           <p className="text-[10px] uppercase font-bold mb-1 text-blue-500">Image Layer</p>
           <p className="text-sm text-zinc-800 dark:text-white truncate max-w-[150px]">{selectedLayer.name}</p>
         </div>
         <ImageIcon size={24} className="text-zinc-400" />
      </div>

      {/* Core Tools (Crop & Masks) */}
      <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm space-y-4">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Image Tools</h4>
        
        {/* Phase 9 Crop Engine Integration */}
        <button 
          onClick={() => {
            saveHistory();
            if (!selectedLayer.cropArea) {
              updateLayer(selectedLayer.id, { cropArea: { x: 0, y: 0, width: 200, height: 200 } });
            }
            setCropMode(!isCropMode);
          }} 
          className={`w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold transition-colors cursor-pointer ${isCropMode ? 'bg-blue-500 text-white' : 'bg-zinc-100 dark:bg-black/50 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/10'}`}
        >
          <Crop size={14} /> {isCropMode ? "Apply Crop" : "Crop Image"}
        </button>

        {/* Phase 8 Image Masking Shapes */}
        <div className="space-y-2 pt-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Image Frame (Mask)</label>
          <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-black/40 rounded-xl">
             <button onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { maskShape: 'none' }); }} className={`flex-1 py-1.5 rounded-lg text-xs font-medium flex justify-center items-center gap-1.5 cursor-pointer ${selectedLayer.maskShape === 'none' || !selectedLayer.maskShape ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'opacity-50 hover:opacity-100'}`}><ImageIcon size={12}/> Normal</button>
             <button onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { maskShape: 'circle' }); }} className={`flex-1 py-1.5 rounded-lg text-xs font-medium flex justify-center items-center gap-1.5 cursor-pointer ${selectedLayer.maskShape === 'circle' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'opacity-50 hover:opacity-100'}`}><Circle size={12}/> Circle</button>
             <button onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { maskShape: 'square' }); }} className={`flex-1 py-1.5 rounded-lg text-xs font-medium flex justify-center items-center gap-1.5 cursor-pointer ${selectedLayer.maskShape === 'square' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'opacity-50 hover:opacity-100'}`}><Square size={12}/> Square</button>
          </div>
        </div>
      </div>

      {/* Transform & Opacity */}
      <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm space-y-4">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Transform & Opacity</h4>
        <div className="flex gap-2 mb-4">
           <button onClick={handleFlipX} className="flex-1 py-2.5 bg-zinc-100 dark:bg-black/50 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer">
              <FlipHorizontal size={14} /> Flip X
           </button>
           <button onClick={handleFlipY} className="flex-1 py-2.5 bg-zinc-100 dark:bg-black/50 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer">
              <FlipVertical size={14} /> Flip Y
           </button>
        </div>
        <StepperSlider label="Opacity" value={selectedLayer.opacity} min={0} max={1} step={0.1} onAction={saveHistory} onChange={(v:number) => updateLayer(selectedLayer.id, { opacity: v })} />
      </div>
    </div>
  );
}