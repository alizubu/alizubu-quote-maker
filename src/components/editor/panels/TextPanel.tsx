'use client';

import React from 'react';
import { useEditorStore, TextLayer } from '../../../store/useEditorStore';
import { AlignLeft, AlignCenter, AlignRight, Type, Edit2, Bold, Italic, Underline } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { StepperSlider } from './BackgroundPanel';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';

// --- Reusable Smooth Popup Color Picker ---
const ColorPickerPopup = ({ label, color, onChange, onAction }: { label: string, color: string, onChange: (c: string) => void, onAction: () => void }) => {
  const presets = ['#FFFFFF', '#000000', '#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#8b5cf6', 'transparent'];
  
  return (
    <div className="flex items-center justify-between p-2 bg-zinc-100 dark:bg-black/40 rounded-xl">
      <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 pl-2">{label}</span>
      <Popover>
        <PopoverTrigger asChild>
          <button 
            onClick={onAction} 
            className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-700 shadow-sm transition-transform active:scale-90 hover:scale-110" 
            style={{ 
              backgroundColor: color === 'transparent' ? '#e4e4e7' : color, 
              backgroundImage: color === 'transparent' ? 'repeating-conic-gradient(#a1a1aa 0% 25%, transparent 0% 50%)' : '',
              backgroundSize: '8px 8px'
            }} 
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
           <HexColorPicker color={color !== 'transparent' ? color : '#ffffff'} onChange={onChange} />
           <div className="flex flex-wrap gap-2 mt-4 max-w-[200px]">
             {presets.map(p => (
               <button 
                 key={p} 
                 onClick={() => onChange(p)} 
                 className={`w-6 h-6 rounded-full border-2 transition-all ${color === p ? 'scale-125 border-blue-500 shadow-md' : 'border-zinc-200 dark:border-zinc-700 hover:scale-110'}`} 
                 style={{ 
                   backgroundColor: p === 'transparent' ? '#e4e4e7' : p, 
                   backgroundImage: p === 'transparent' ? 'repeating-conic-gradient(#a1a1aa 0% 25%, transparent 0% 50%)' : '', 
                   backgroundSize: '8px 8px' 
                 }} 
               />
             ))}
           </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

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
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-4 rounded-2xl flex justify-between items-center cursor-pointer group hover:border-blue-500 transition-colors shadow-sm" onClick={() => setTypingOverlayOpen(true)}>
         <div className="flex-1 min-w-0 pr-4">
           <p className="text-[10px] uppercase font-bold mb-1 text-blue-500">Edit Content</p>
           <p className="text-sm truncate text-zinc-800 dark:text-white font-medium">{selectedLayer.text || "Type something..."}</p>
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
              <button key={a} onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { align: a as any }); }} className={`flex-1 py-1.5 rounded-lg flex justify-center transition-all ${selectedLayer.align === a ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'opacity-50 hover:opacity-100'}`}>
                {a === 'left' && <AlignLeft size={16} />} {a === 'center' && <AlignCenter size={16} />} {a === 'right' && <AlignRight size={16} />}
              </button>
            ))}
          </div>
          <div className="flex bg-zinc-100 dark:bg-black/40 p-1 rounded-xl gap-1">
            <button onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { isBold: !selectedLayer.isBold }); }} className={`w-8 flex items-center justify-center rounded-lg transition-all ${selectedLayer.isBold ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'opacity-50 hover:opacity-100'}`}><Bold size={14} /></button>
            <button onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { isItalic: !selectedLayer.isItalic }); }} className={`w-8 flex items-center justify-center rounded-lg transition-all ${selectedLayer.isItalic ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'opacity-50 hover:opacity-100'}`}><Italic size={14} /></button>
            <button onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { isUnderline: !selectedLayer.isUnderline }); }} className={`w-8 flex items-center justify-center rounded-lg transition-all ${selectedLayer.isUnderline ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'opacity-50 hover:opacity-100'}`}><Underline size={14} /></button>
          </div>
        </div>

        {/* Smooth Popup Color Picker for Fill */}
        <ColorPickerPopup 
          label="Text Fill Color" 
          color={selectedLayer.fill} 
          onAction={saveHistory}
          onChange={(c) => updateLayer(selectedLayer.id, { fill: c, isGradient: false })} 
        />
      </div>

      {/* Advanced Settings */}
      <div className="space-y-5 bg-white dark:bg-white/5 p-4 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm">
        <StepperSlider label="Font Size" value={selectedLayer.fontSize} min={12} max={200} onAction={saveHistory} onChange={(v: number) => updateLayer(selectedLayer.id, { fontSize: v })} unit="px" />
        <StepperSlider label="Opacity" value={selectedLayer.opacity} min={0} max={1} step={0.1} onAction={saveHistory} onChange={(v: number) => updateLayer(selectedLayer.id, { opacity: v })} />
        
        {/* Stroke Engine with Color Picker */}
        <div className="pt-4 border-t border-zinc-100 dark:border-white/5 space-y-3">
           <h4 className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Outline (Stroke)</h4>
           
           <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-black/40 rounded-xl mb-3">
              <button onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { strokeType: 'outer' }); }} className={`py-1.5 rounded-lg text-xs font-medium transition-all ${selectedLayer.strokeType === 'outer' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'opacity-50 hover:opacity-100'}`}>Outer Stroke</button>
              <button onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { strokeType: 'inner' }); }} className={`py-1.5 rounded-lg text-xs font-medium transition-all ${selectedLayer.strokeType === 'inner' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'opacity-50 hover:opacity-100'}`}>Inner Stroke</button>
           </div>
           
           <StepperSlider label="Stroke Thickness" value={selectedLayer.strokeWidth} min={0} max={20} step={0.5} onAction={saveHistory} onChange={(v: number) => updateLayer(selectedLayer.id, { strokeWidth: v })} unit="px" />
           
           {/* Smooth Popup Color Picker for Stroke */}
           <ColorPickerPopup 
             label="Stroke Color" 
             color={selectedLayer.stroke} 
             onAction={saveHistory}
             onChange={(c) => updateLayer(selectedLayer.id, { stroke: c })} 
           />
        </div>
      </div>
    </div>
  );
}