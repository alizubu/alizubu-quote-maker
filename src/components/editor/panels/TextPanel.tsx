'use client';

import React, { useState } from 'react';
import { useEditorStore, TextLayer } from '../../../store/useEditorStore';
import { AlignLeft, AlignCenter, AlignRight, Type, Edit2, Bold, Italic, Underline, ChevronDown, ChevronUp } from 'lucide-react';
import { StepperSlider, ColorPickerPopup } from './BackgroundPanel';

function AccordionSection({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white dark:bg-white/5 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex items-center justify-between p-4 bg-transparent hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors"
      >
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">{title}</span>
        {isOpen ? <ChevronUp size={16} className="text-zinc-400" /> : <ChevronDown size={16} className="text-zinc-400" />}
      </button>
      {isOpen && (
        <div className="p-4 pt-0 border-t border-zinc-100 dark:border-white/5 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}

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

  const standardFonts = ['sans-serif', 'serif', 'monospace', 'Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Comic Sans MS', 'Inter', 'Montserrat', 'Playfair Display'];

  return (
    <div className="space-y-3 animate-in slide-in-from-right-4 duration-300 pb-4">
      
      {/* Quick Edit Input */}
      <div 
        className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-500/20 p-3 rounded-2xl flex justify-between items-center cursor-pointer hover:bg-blue-100/50 dark:hover:bg-blue-900/20 transition-colors" 
        onClick={() => setTypingOverlayOpen(true)}
      >
         <div className="flex-1 min-w-0 pr-4">
           <p className="text-sm truncate text-blue-900 dark:text-blue-100 font-medium">{selectedLayer.text || "Type something..."}</p>
         </div>
         <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-md"><Edit2 size={14} /></div>
      </div>

      <AccordionSection title="Typography" defaultOpen={true}>
        {/* Horizontally scrollable fonts */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Font Family</label>
          <div className="flex overflow-x-auto custom-scrollbar pb-2 gap-2 snap-x">
            {[...standardFonts, ...customFonts.map(f => f.name)].map((font) => (
              <button
                key={font}
                onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { fontFamily: font }); }}
                className={`flex-none px-3 py-1.5 rounded-lg text-sm transition-all snap-center border ${
                  (selectedLayer.fontFamily || 'sans-serif') === font 
                    ? 'bg-zinc-800 text-white dark:bg-white dark:text-black border-transparent shadow-sm' 
                    : 'bg-zinc-100 dark:bg-black/40 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-white/5 hover:border-zinc-300'
                }`}
                style={{ fontFamily: font }}
              >
                {font}
              </button>
            ))}
          </div>
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
      </AccordionSection>

      <AccordionSection title="Color & Fill">
        <ColorPickerPopup 
          label="Text Fill Color" 
          color={selectedLayer.fill} 
          onAction={saveHistory}
          onChange={(c) => updateLayer(selectedLayer.id, { fill: c, isGradient: false })} 
        />
        <StepperSlider label="Global Opacity" value={selectedLayer.opacity} min={0} max={1} step={0.1} onAction={saveHistory} onChange={(v: number) => updateLayer(selectedLayer.id, { opacity: v })} />
      </AccordionSection>

      <AccordionSection title="Spacing & Size">
        <StepperSlider label="Font Size" value={selectedLayer.fontSize} min={12} max={200} onAction={saveHistory} onChange={(v: number) => updateLayer(selectedLayer.id, { fontSize: v })} unit="px" />
        <StepperSlider label="Letter Spacing" value={selectedLayer.letterSpacing} min={-10} max={50} step={1} onAction={saveHistory} onChange={(v: number) => updateLayer(selectedLayer.id, { letterSpacing: v })} unit="px" />
        <StepperSlider label="Line Height" value={selectedLayer.lineHeight} min={0.5} max={3} step={0.1} onAction={saveHistory} onChange={(v: number) => updateLayer(selectedLayer.id, { lineHeight: v })} />
      </AccordionSection>

      <AccordionSection title="Stroke (Outline)">
         <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-black/40 rounded-xl mb-3">
            <button onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { strokeType: 'outer' }); }} className={`py-1.5 rounded-lg text-xs font-medium transition-all ${selectedLayer.strokeType === 'outer' || !selectedLayer.strokeType ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'opacity-50 hover:opacity-100'}`}>Outer Stroke</button>
            <button onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { strokeType: 'inner' }); }} className={`py-1.5 rounded-lg text-xs font-medium transition-all ${selectedLayer.strokeType === 'inner' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'opacity-50 hover:opacity-100'}`}>Inner Stroke</button>
         </div>
         <StepperSlider label="Stroke Thickness" value={selectedLayer.strokeWidth || 0} min={0} max={20} step={0.5} onAction={saveHistory} onChange={(v: number) => updateLayer(selectedLayer.id, { strokeWidth: v })} unit="px" />
         <div className="mt-4">
           <ColorPickerPopup 
             label="Stroke Color" 
             color={selectedLayer.stroke || 'transparent'} 
             onAction={saveHistory}
             onChange={(c) => updateLayer(selectedLayer.id, { stroke: c })} 
           />
         </div>
      </AccordionSection>

    </div>
  );
}