'use client';

import React from 'react';
import { useEditorStore, TextLayer } from '../../../store/useEditorStore';
import { AlignLeft, AlignCenter, AlignRight, Type, Edit2, Bold, Italic, Underline } from 'lucide-react';

// --- BackgroundPanel থেকে শেয়ার্ড কম্পোনেন্টগুলো ইম্পোর্ট করা হলো ---
import { StepperSlider, ColorPickerPopup } from './BackgroundPanel';

export default function TextPanel() {
  const { layers, selectedLayerId, updateLayer, setTypingOverlayOpen, saveHistory, customFonts } = useEditorStore();
  const selectedLayer = layers.find((l) => l.id === selectedLayerId) as TextLayer;

  if (!selectedLayer || selectedLayer.type !== 'text') {
    return (
      <div className="h-[200px] flex flex-col items-center justify-center border border-dashed border-zinc-300 dark:border-white/10 rounded-3xl text-zinc-500 text-center px-6 mt-4">
        <Type size={32} className="text-zinc-400 mb-3" />
        <p className="text-sm">Select a text layer to enable editing tools.</p>
      </div>
    );
  }

  const standardFonts = ['sans-serif', 'serif', 'monospace', 'Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Comic Sans MS', 'Mont_Blanc_Light'];

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 pb-4">
      
      {/* Text Input Block */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-4 rounded-2xl flex justify-between items-center cursor-pointer group hover:border-blue-500 transition-colors shadow-sm" onClick={() => setTypingOverlayOpen(true)}>
         <div className="flex-1 min-w-0 pr-4">
           <p className="text-[10px] uppercase font-bold mb-1 text-blue-500">Edit Content</p>
           <p className="text-sm truncate text-zinc-800 dark:text-white font-medium">{selectedLayer.text || "Type something..."}</p>
         </div>
         <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform"><Edit2 size={16} /></div>
      </div>

      {/* Typography System */}
      <div className="space-y-4 bg-white dark:bg-white/5 p-4 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Typography Controls</h4>
        
        {/* Font Family Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Font Style</label>
          <select 
            value={selectedLayer.fontFamily || 'sans-serif'} 
            onChange={(e) => { saveHistory(); updateLayer(selectedLayer.id, { fontFamily: e.target.value }); }} 
            className="w-full bg-zinc-100 dark:bg-black/40 border border-zinc-200/50 dark:border-white/5 rounded-xl p-2.5 text-xs text-zinc-900 dark:text-white outline-none cursor-pointer appearance-none"
          >
            <optgroup label="Standard Fonts">
              {standardFonts.map(font => (
                <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
              ))}
            </optgroup>
            {customFonts.length > 0 && (
              <optgroup label="My Custom Fonts">
                {customFonts.map(font => (
                  <option key={font.name} value={font.name} style={{ fontFamily: font.name }}>{font.name}</option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        <div className="flex gap-2 pt-1">
          <div className="flex bg-zinc-100 dark:bg-black/40 p-1 rounded-xl flex-1">
            {['left', 'center', 'right'].map((a) => (
              <button key={a} onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { align: a as any }); }} className={`flex-1 py-1.5 rounded-lg flex justify-center transition-all ${selectedLayer.align === a ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'opacity-50 hover:opacity-100'}`}>
                {a === 'left' && <AlignLeft size={16} />} {a === 'center' && <AlignCenter size={16} />} {a === 'right' && <AlignRight size={16} />}
              </button>
            ))}
          </div>
          <div className="flex bg-zinc-100 dark:bg-black/40 p-1 rounded-xl gap-1">
            <button onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { isBold: !selectedLayer.isBold }); }} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${selectedLayer.isBold ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'opacity-50 hover:opacity-100'}`}><Bold size={14} /></button>
            <button onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { isItalic: !selectedLayer.isItalic }); }} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${selectedLayer.isItalic ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'opacity-50 hover:opacity-100'}`}><Italic size={14} /></button>
            <button onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { isUnderline: !selectedLayer.isUnderline }); }} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${selectedLayer.isUnderline ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'opacity-50 hover:opacity-100'}`}><Underline size={14} /></button>
          </div>
        </div>

        {/* Text Fill Popup */}
        <ColorPickerPopup 
          label="Text Fill Color" 
          color={selectedLayer.fill} 
          onAction={saveHistory}
          onChange={(c) => updateLayer(selectedLayer.id, { fill: c, isGradient: false })} 
        />
      </div>

      {/* Sizers Configuration */}
      <div className="space-y-5 bg-white dark:bg-white/5 p-4 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm">
        <StepperSlider label="Font Size" value={selectedLayer.fontSize} min={12} max={200} onAction={saveHistory} onChange={(v: number) => updateLayer(selectedLayer.id, { fontSize: v })} unit="px" />
        <StepperSlider label="Letter Spacing" value={selectedLayer.letterSpacing} min={-10} max={50} step={1} onAction={saveHistory} onChange={(v: number) => updateLayer(selectedLayer.id, { letterSpacing: v })} unit="px" />
        <StepperSlider label="Line Height" value={selectedLayer.lineHeight} min={0.5} max={3} step={0.1} onAction={saveHistory} onChange={(v: number) => updateLayer(selectedLayer.id, { lineHeight: v })} />
        <StepperSlider label="Global Opacity" value={selectedLayer.opacity} min={0} max={1} step={0.1} onAction={saveHistory} onChange={(v: number) => updateLayer(selectedLayer.id, { opacity: v })} />
      </div>

      {/* Outline Engine */}
      <div className="space-y-4 bg-white dark:bg-white/5 p-4 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm">
         <h4 className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Outline (Stroke)</h4>
         
         <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-black/40 rounded-xl">
            <button onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { strokeType: 'outer' }); }} className={`py-1.5 rounded-lg text-xs font-medium transition-all ${selectedLayer.strokeType === 'outer' || !selectedLayer.strokeType ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'opacity-50 hover:opacity-100'}`}>Outer Stroke</button>
            <button onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { strokeType: 'inner' }); }} className={`py-1.5 rounded-lg text-xs font-medium transition-all ${selectedLayer.strokeType === 'inner' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'opacity-50 hover:opacity-100'}`}>Inner Stroke</button>
         </div>
         
         <StepperSlider label="Stroke Thickness" value={selectedLayer.strokeWidth || 0} min={0} max={20} step={0.5} onAction={saveHistory} onChange={(v: number) => updateLayer(selectedLayer.id, { strokeWidth: v })} unit="px" />
         
         {/* Stroke Color Popup */}
         <ColorPickerPopup 
           label="Stroke Color" 
           color={selectedLayer.stroke || 'transparent'} 
           onAction={saveHistory}
           onChange={(c) => updateLayer(selectedLayer.id, { stroke: c })} 
         />
      </div>

      {/* Shadow & Glow Engine */}
      <div className="space-y-4 bg-white dark:bg-white/5 p-4 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm">
         <h4 className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Shadow & Glow</h4>
         
         <StepperSlider label="Blur Amount" value={selectedLayer.shadowBlur || 0} min={0} max={100} step={1} onAction={saveHistory} onChange={(v: number) => updateLayer(selectedLayer.id, { shadowBlur: v })} unit="px" />
         <StepperSlider label="Offset X (Horizontal)" value={selectedLayer.shadowOffsetX || 0} min={-50} max={50} step={1} onAction={saveHistory} onChange={(v: number) => updateLayer(selectedLayer.id, { shadowOffsetX: v })} unit="px" />
         <StepperSlider label="Offset Y (Vertical)" value={selectedLayer.shadowOffsetY || 0} min={-50} max={50} step={1} onAction={saveHistory} onChange={(v: number) => updateLayer(selectedLayer.id, { shadowOffsetY: v })} unit="px" />
         
         {/* Shadow Color Popup */}
         <ColorPickerPopup 
           label="Shadow Color" 
           color={selectedLayer.shadowColor || 'transparent'} 
           onAction={saveHistory}
           onChange={(c) => updateLayer(selectedLayer.id, { shadowColor: c })} 
         />
      </div>

    </div>
  );
}