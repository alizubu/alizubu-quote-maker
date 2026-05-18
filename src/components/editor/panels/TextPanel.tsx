'use client';

import React from 'react';
import { useEditorStore, TextLayer } from '../../../store/useEditorStore';
import { AlignLeft, AlignCenter, AlignRight, Type, Edit2, Bold, Italic, Underline } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { StepperSlider } from './BackgroundPanel'; // Reusing slider

export default function TextPanel() {
  const { layers, selectedLayerId, updateLayer, setTypingOverlayOpen, saveHistory } = useEditorStore();
  const selectedLayer = layers.find((l) => l.id === selectedLayerId) as TextLayer;

  if (!selectedLayer || selectedLayer.type !== 'text') {
    return (
      <div className="h-[200px] flex flex-col items-center justify-center border border-dashed border-zinc-300 dark:border-white/10 rounded-3xl text-zinc-500 text-center px-6 mt-4">
        <Type size={32} className="text-zinc-400 mb-3" />
        <p className="text-sm">Select a text layer to enable editing tools.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 pb-4">
      
      {/* Text Input Trigger */}
      <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-4 rounded-2xl flex justify-between items-center cursor-pointer group hover:border-blue-500 transition-colors" onClick={() => setTypingOverlayOpen(true)}>
         <div className="flex-1 min-w-0 pr-4">
           <p className="text-[10px] uppercase font-bold mb-1 text-blue-500">Edit Content</p>
           <p className="text-sm truncate text-zinc-800 dark:text-white">{selectedLayer.text || "Type something..."}</p>
         </div>
         <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform"><Edit2 size={16} /></div>
      </div>

      {/* Typography Tools */}
      <div className="space-y-4 bg-white dark:bg-white/5 p-4 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Typography Tools</h4>
        
        {/* Alignment & Styles */}
        <div className="flex gap-2">
          <div className="flex bg-zinc-100 dark:bg-black/40 p-1 rounded-xl flex-1">
            {['left', 'center', 'right'].map((a) => (
              <button key={a} onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { align: a as any }); }} className={`flex-1 py-1.5 rounded-lg flex justify-center ${selectedLayer.align === a ? 'bg-white dark:bg-zinc-800 shadow-sm' : 'opacity-50'}`}>
                {a === 'left' && <AlignLeft size={16} />} {a === 'center' && <AlignCenter size={16} />} {a === 'right' && <AlignRight size={16} />}
              </button>
            ))}
          </div>
          <div className="flex bg-zinc-100 dark:bg-black/40 p-1 rounded-xl gap-1">
            <button onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { isBold: !selectedLayer.isBold }); }} className={`w-8 flex items-center justify-center rounded-lg ${selectedLayer.isBold ? 'bg-white dark:bg-zinc-800 shadow-sm' : 'opacity-50'}`}><Bold size={14} /></button>
            <button onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { isItalic: !selectedLayer.isItalic }); }} className={`w-8 flex items-center justify-center rounded-lg ${selectedLayer.isItalic ? 'bg-white dark:bg-zinc-800 shadow-sm' : 'opacity-50'}`}><Italic size={14} /></button>
            <button onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { isUnderline: !selectedLayer.isUnderline }); }} className={`w-8 flex items-center justify-center rounded-lg ${selectedLayer.isUnderline ? 'bg-white dark:bg-zinc-800 shadow-sm' : 'opacity-50'}`}><Underline size={14} /></button>
          </div>
        </div>

        {/* Color Picker (React Colorful) */}
        <div className="space-y-2 pt-2">
           <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Text Color</label>
           <div className="flex gap-4 items-center">
             <div className="w-24 h-24 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <HexColorPicker color={selectedLayer.fill} onChange={(c) => updateLayer(selectedLayer.id, { fill: c, isGradient: false })} />
             </div>
             <div className="flex-1 space-y-2">
                {['#FFFFFF', '#000000', '#f59e0b', '#ec4899', '#3b82f6'].map((color) => (
                  <button key={color} onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { fill: color, isGradient: false }); }} className={`w-6 h-6 rounded-full border-2 m-1 inline-block ${selectedLayer.fill === color ? 'scale-125 border-blue-500' : 'border-zinc-300 dark:border-zinc-700 hover:scale-110'}`} style={{ backgroundColor: color }} />
                ))}
             </div>
           </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="space-y-5 bg-white dark:bg-white/5 p-4 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm">
        <StepperSlider label="Font Size" value={selectedLayer.fontSize} min={12} max={200} onAction={saveHistory} onChange={(v: number) => updateLayer(selectedLayer.id, { fontSize: v })} unit="px" />
        <StepperSlider label="Opacity" value={selectedLayer.opacity} min={0} max={1} step={0.1} onAction={saveHistory} onChange={(v: number) => updateLayer(selectedLayer.id, { opacity: v })} />
        
        {/* Stroke Engine */}
        <div className="pt-4 border-t border-zinc-100 dark:border-white/5 space-y-3">
           <h4 className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Outline (Stroke)</h4>
           <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-black/40 rounded-xl mb-3">
              <button onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { strokeType: 'outer' }); }} className={`py-1.5 rounded-lg text-xs font-medium ${selectedLayer.strokeType === 'outer' ? 'bg-white dark:bg-zinc-800 shadow-sm' : 'opacity-50'}`}>Outer Stroke</button>
              <button onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { strokeType: 'inner' }); }} className={`py-1.5 rounded-lg text-xs font-medium ${selectedLayer.strokeType === 'inner' ? 'bg-white dark:bg-zinc-800 shadow-sm' : 'opacity-50'}`}>Inner Stroke</button>
           </div>
           <StepperSlider label="Stroke Thickness" value={selectedLayer.strokeWidth} min={0} max={20} step={0.5} onAction={saveHistory} onChange={(v: number) => updateLayer(selectedLayer.id, { strokeWidth: v })} unit="px" />
        </div>
      </div>
    </div>
  );
}