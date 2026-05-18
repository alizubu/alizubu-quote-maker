'use client';

import React from 'react';
import { useEditorStore, TextLayer } from '../../../store/useEditorStore';
import { Sparkles, Layers } from 'lucide-react';

// --- BackgroundPanel থেকে শেয়ার্ড কম্পোনেন্টগুলো ইম্পোর্ট করা হলো ---
import { StepperSlider, ColorPickerPopup } from './BackgroundPanel';

export default function EffectsPanel() {
  const { layers, selectedLayerId, updateLayer, saveHistory } = useEditorStore();
  const selectedLayer = layers.find((l) => l.id === selectedLayerId);

  // যদি কোনো লেয়ার সিলেক্ট করা না থাকে
  if (!selectedLayer) {
    return (
      <div className="h-[200px] flex flex-col items-center justify-center border border-dashed border-zinc-300 dark:border-white/10 rounded-3xl text-zinc-500 text-center px-6 mt-4">
        <Sparkles size={32} className="text-zinc-400 mb-3" />
        <p className="text-sm">Select a layer to apply effects.</p>
      </div>
    );
  }

  const isText = selectedLayer.type === 'text';
  // Typescript Error এড়ানোর জন্য TextLayer এ কনভার্ট করা হলো
  const textLayer = selectedLayer as TextLayer;

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 pb-4">
      
      {/* Blend Mode for both Image and Text */}
      <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm space-y-3">
         <h4 className="text-[10px] font-bold uppercase tracking-wider text-blue-500 flex items-center gap-1.5">
           <Layers size={14} /> Blend Mode
         </h4>
         <select 
           value={selectedLayer.blendMode} 
           onChange={(e) => { saveHistory(); updateLayer(selectedLayer.id, { blendMode: e.target.value }); }} 
           className="w-full bg-zinc-100 dark:bg-black/40 border border-zinc-200/50 dark:border-white/5 rounded-xl p-2.5 text-xs text-zinc-900 dark:text-white outline-none cursor-pointer appearance-none"
         >
            <option value="source-over">Normal</option>
            <option value="multiply">Multiply</option>
            <option value="screen">Screen</option>
            <option value="overlay">Overlay</option>
            <option value="darken">Darken</option>
            <option value="lighten">Lighten</option>
         </select>
      </div>

      {/* Shadow & Glow Engine (Only visible for Text Layers as per types) */}
      {isText && (
        <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm space-y-4">
           <h4 className="text-[10px] font-bold uppercase tracking-wider text-blue-500 flex items-center gap-1.5">
             <Sparkles size={14} /> Shadow & Glow Engine
           </h4>
           
           <StepperSlider label="Blur Amount" value={textLayer.shadowBlur || 0} min={0} max={100} step={1} onAction={saveHistory} onChange={(v: number) => updateLayer(textLayer.id, { shadowBlur: v })} unit="px" />
           <StepperSlider label="Offset X (Horizontal)" value={textLayer.shadowOffsetX || 0} min={-50} max={50} step={1} onAction={saveHistory} onChange={(v: number) => updateLayer(textLayer.id, { shadowOffsetX: v })} unit="px" />
           <StepperSlider label="Offset Y (Vertical)" value={textLayer.shadowOffsetY || 0} min={-50} max={50} step={1} onAction={saveHistory} onChange={(v: number) => updateLayer(textLayer.id, { shadowOffsetY: v })} unit="px" />
           
           {/* Shadow Color Popup (With Built-in Opacity Support) */}
           <ColorPickerPopup 
             label="Shadow Color" 
             color={textLayer.shadowColor || 'transparent'} 
             onAction={saveHistory}
             onChange={(c) => updateLayer(textLayer.id, { shadowColor: c })} 
           />
        </div>
      )}

    </div>
  );
}