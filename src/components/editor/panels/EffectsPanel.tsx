'use client';

import React from 'react';
import { useEditorStore, TextLayer } from '../../../store/useEditorStore';
import { Sparkles } from 'lucide-react';

// --- BackgroundPanel থেকে শেয়ার্ড কম্পোনেন্টগুলো ইম্পোর্ট করা হলো ---
import { StepperSlider, ColorPickerPopup } from './BackgroundPanel';

export default function EffectsPanel() {
  const { layers, selectedLayerId, updateLayer, saveHistory } = useEditorStore();
  const selectedLayer = layers.find((l) => l.id === selectedLayerId);

  // যদি টেক্সট লেয়ার সিলেক্ট করা না থাকে
  if (!selectedLayer || selectedLayer.type !== 'text') {
    return (
      <div className="h-[200px] flex flex-col items-center justify-center border border-dashed border-zinc-300 dark:border-white/10 rounded-3xl text-zinc-500 text-center px-6 mt-4">
        <Sparkles size={32} className="text-zinc-400 mb-3" />
        <p className="text-sm">Select a text layer to apply effects (Shadow & Glow).</p>
      </div>
    );
  }

  const textLayer = selectedLayer as TextLayer;

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 pb-4">
      
      {/* Shadow & Glow Engine */}
      <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm space-y-4">
         <h4 className="text-[10px] font-bold uppercase tracking-wider text-blue-500 flex items-center gap-1.5">
           <Sparkles size={14} /> Shadow & Glow Engine
         </h4>
         
         <StepperSlider label="Blur Amount" value={textLayer.shadowBlur || 0} min={0} max={100} step={1} onAction={saveHistory} onChange={(v: number) => updateLayer(textLayer.id, { shadowBlur: v })} unit="px" />
         <StepperSlider label="Offset X (Horizontal)" value={textLayer.shadowOffsetX || 0} min={-50} max={50} step={1} onAction={saveHistory} onChange={(v: number) => updateLayer(textLayer.id, { shadowOffsetX: v })} unit="px" />
         <StepperSlider label="Offset Y (Vertical)" value={textLayer.shadowOffsetY || 0} min={-50} max={50} step={1} onAction={saveHistory} onChange={(v: number) => updateLayer(textLayer.id, { shadowOffsetY: v })} unit="px" />
         
         {/* Shadow Color Popup (With Opacity Support) */}
         <ColorPickerPopup 
           label="Shadow Color" 
           color={textLayer.shadowColor || 'transparent'} 
           onAction={saveHistory}
           onChange={(c) => updateLayer(textLayer.id, { shadowColor: c })} 
         />
      </div>

    </div>
  );
}