'use client';

import React from 'react';
import { useEditorStore, TextLayer } from '../../../store/useEditorStore';
import { Sparkles, Layers } from 'lucide-react';

// --- BackgroundPanel থেকে শেয়ার্ড কম্পোনেন্টগুলো ইম্পোর্ট করা হলো ---
import { StepperSlider, ColorPickerPopup } from './BackgroundPanel';

export default function EffectsPanel() {
  const { layers, selectedLayerId, updateLayer, saveHistory } = useEditorStore();
  const selectedLayer = layers.find((l) => l.id === selectedLayerId);

  if (!selectedLayer) {
    return (
      <div className="min-h-[200px] flex flex-col items-center justify-center border border-dashed border-zinc-300 dark:border-white/10 rounded-3xl text-zinc-500 dark:text-zinc-400 text-center px-6 mt-4">
        <Sparkles size={32} className="text-zinc-400 mb-3" />
        <p className="text-sm">Select a layer to apply effects.</p>
      </div>
    );
  }

  // FIX #8: Safe type guard instead of unsafe `as TextLayer` cast.
  // Previously, accessing textLayer.shadowBlur on an ImageLayer returned undefined → NaN in sliders.
  const isText = selectedLayer.type === 'text';
  const textLayer = isText ? (selectedLayer as TextLayer) : null;

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 pb-4">
      
      {/* Blend Mode — works for both text and image layers */}
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
          <option value="color-dodge">Color Dodge</option>
          <option value="color-burn">Color Burn</option>
          <option value="hard-light">Hard Light</option>
          <option value="soft-light">Soft Light</option>
          <option value="difference">Difference</option>
          <option value="exclusion">Exclusion</option>
        </select>
      </div>

      {/* Shadow & Glow — only for text layers (safe guard) */}
      {isText && textLayer && (
        <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm space-y-4">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-blue-500 flex items-center gap-1.5">
            <Sparkles size={14} /> Shadow & Glow
          </h4>
          <StepperSlider label="Blur Amount" value={textLayer.shadowBlur ?? 0} min={0} max={100} step={1} onAction={saveHistory} onChange={(v: number) => updateLayer(textLayer.id, { shadowBlur: v })} unit="px" />
          <StepperSlider label="Offset X" value={textLayer.shadowOffsetX ?? 0} min={-50} max={50} step={1} onAction={saveHistory} onChange={(v: number) => updateLayer(textLayer.id, { shadowOffsetX: v })} unit="px" />
          <StepperSlider label="Offset Y" value={textLayer.shadowOffsetY ?? 0} min={-50} max={50} step={1} onAction={saveHistory} onChange={(v: number) => updateLayer(textLayer.id, { shadowOffsetY: v })} unit="px" />
          <ColorPickerPopup
            label="Shadow Color"
            color={textLayer.shadowColor || '#000000'}
            onAction={saveHistory}
            onChange={(c: string) => updateLayer(textLayer.id, { shadowColor: c })}
          />
        </div>
      )}

      {/* Info card for image layers */}
      {!isText && (
        <div className="bg-zinc-50 dark:bg-white/5 p-4 rounded-2xl border border-zinc-200 dark:border-white/10 text-center">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Shadow effects are available for text layers only. Use Blend Mode above to stylize image layers.</p>
        </div>
      )}
    </div>
  );
}
