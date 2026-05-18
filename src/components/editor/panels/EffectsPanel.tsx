'use client';

import React from 'react';
import { useEditorStore, TextLayer } from '../../../store/useEditorStore';
import { StepperSlider } from './BackgroundPanel';

export default function EffectsPanel() {
  const { layers, selectedLayerId, updateLayer, saveHistory } = useEditorStore();
  const selectedLayer = layers.find((l) => l.id === selectedLayerId);

  if (!selectedLayer) {
    return <div className="text-center text-zinc-500 mt-10 text-sm">Select a layer to apply effects.</div>;
  }

  const isText = selectedLayer.type === 'text';
  const textLayer = selectedLayer as TextLayer;

  return (
    <div className="space-y-5 animate-in slide-in-from-right-4 duration-300 pb-4">
      {/* Blend Mode for both Image and Text */}
      <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm space-y-3">
         <h4 className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Blend Mode</h4>
         <select value={selectedLayer.blendMode} onChange={(e) => { saveHistory(); updateLayer(selectedLayer.id, { blendMode: e.target.value }); }} className="w-full bg-zinc-100 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-zinc-900 dark:text-white outline-none cursor-pointer">
            <option value="source-over">Normal</option>
            <option value="multiply">Multiply</option>
            <option value="screen">Screen</option>
            <option value="overlay">Overlay</option>
            <option value="darken">Darken</option>
            <option value="lighten">Lighten</option>
         </select>
      </div>

      {/* Text Only Effects */}
      {isText && (
        <>
          <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Spacing</h4>
            <StepperSlider label="Letter Spacing" value={textLayer.letterSpacing} min={-10} max={50} onAction={saveHistory} onChange={(v:number) => updateLayer(selectedLayer.id, { letterSpacing: v })} unit="px" />
            <StepperSlider label="Line Height" value={textLayer.lineHeight} min={0.5} max={3} step={0.1} onAction={saveHistory} onChange={(v:number) => updateLayer(selectedLayer.id, { lineHeight: v })} />
          </div>

          <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Shadow & Glow</h4>
            <StepperSlider label="Blur Amount" value={textLayer.shadowBlur} min={0} max={50} onAction={saveHistory} onChange={(v:number) => updateLayer(selectedLayer.id, { shadowBlur: v })} />
            <StepperSlider label="Offset X" value={textLayer.shadowOffsetX} min={-30} max={30} onAction={saveHistory} onChange={(v:number) => updateLayer(selectedLayer.id, { shadowOffsetX: v })} unit="px" />
            <StepperSlider label="Offset Y" value={textLayer.shadowOffsetY} min={-30} max={30} onAction={saveHistory} onChange={(v:number) => updateLayer(selectedLayer.id, { shadowOffsetY: v })} unit="px" />
            
            <div className="flex gap-3 pt-2">
              <button onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { shadowColor: '#000000' }); }} className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-colors ${textLayer.shadowColor === '#000000' ? 'bg-zinc-800 text-white border-zinc-800' : 'border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-300'}`}>Dark</button>
              <button onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { shadowColor: '#FFFFFF' }); }} className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-colors ${textLayer.shadowColor === '#FFFFFF' ? 'bg-white text-black border-white' : 'border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-300'}`}>Glow</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}