'use client';

import React from 'react';
import { useEditorStore, TextLayer } from '../../../store/useEditorStore';
import { AlignLeft, AlignCenter, AlignRight, Type, Edit2, Bold, Italic, Underline, Zap } from 'lucide-react';

import { StepperSlider, ColorPickerPopup } from './BackgroundPanel';

export default function TextPanel() {
  const { layers, selectedLayerId, updateLayer, saveHistory, customFonts } = useEditorStore();
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
    <div className="space-y-4 sm:space-y-5 animate-in slide-in-from-right-4 duration-300 pb-4">

      {/* Text Input Block */}
      <div
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-3 sm:p-4 rounded-2xl flex justify-between items-center cursor-pointer group hover:border-blue-500 transition-colors shadow-sm"
        onClick={() => {
          window.dispatchEvent(new CustomEvent('open-typing-overlay', {
            detail: { id: selectedLayer.id, text: selectedLayer.text }
          }));
        }}
      >
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-[10px] uppercase font-bold mb-1 text-blue-500">Edit Content</p>
          <p className="text-sm truncate text-zinc-800 dark:text-white font-medium">{selectedLayer.text || "Type something..."}</p>
        </div>
        <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform shrink-0"><Edit2 size={16} /></div>
      </div>

      {/* Typography System */}
      <div className="space-y-4 bg-white dark:bg-white/5 p-3 sm:p-4 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm">
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
              <button key={a} onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { align: a as any }); }} className={`flex-1 py-2 rounded-lg flex justify-center transition-all ${selectedLayer.align === a ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'opacity-50 hover:opacity-100'}`}>
                {a === 'left' && <AlignLeft size={16} />} {a === 'center' && <AlignCenter size={16} />} {a === 'right' && <AlignRight size={16} />}
              </button>
            ))}
          </div>
          <div className="flex bg-zinc-100 dark:bg-black/40 p-1 rounded-xl gap-1">
            <button onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { isBold: !selectedLayer.isBold }); }} className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${selectedLayer.isBold ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'opacity-50 hover:opacity-100'}`}><Bold size={14} /></button>
            <button onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { isItalic: !selectedLayer.isItalic }); }} className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${selectedLayer.isItalic ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'opacity-50 hover:opacity-100'}`}><Italic size={14} /></button>
            <button onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { isUnderline: !selectedLayer.isUnderline }); }} className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${selectedLayer.isUnderline ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'opacity-50 hover:opacity-100'}`}><Underline size={14} /></button>
          </div>
        </div>

        {/* Text Fill */}
        <ColorPickerPopup
          label="Text Fill Color"
          color={selectedLayer.fill}
          onAction={saveHistory}
          onChange={(c) => updateLayer(selectedLayer.id, { fill: c, isGradient: false })}
        />
      </div>

      {/* Text Sharpening */}
      <div className="bg-white dark:bg-white/5 p-3 sm:p-4 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm space-y-3">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-blue-500 flex items-center gap-1.5">
          <Zap size={13} /> Text Sharpening
        </h4>
        <button
          onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { textSharpening: !selectedLayer.textSharpening }); }}
          className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer active:scale-[0.98] ${
            selectedLayer.textSharpening
              ? 'bg-gradient-to-r from-yellow-500/15 to-orange-500/15 border-yellow-400/60 shadow-md'
              : 'bg-zinc-100 dark:bg-black/40 border-zinc-200/50 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/20'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg transition-all ${selectedLayer.textSharpening ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-400/40' : 'bg-zinc-200 dark:bg-white/10 text-zinc-500 dark:text-zinc-400'}`}>
              <Zap size={14} />
            </div>
            <div className="text-left">
              <p className={`text-xs font-bold transition-colors ${selectedLayer.textSharpening ? 'text-yellow-600 dark:text-yellow-400' : 'text-zinc-700 dark:text-zinc-300'}`}>
                {selectedLayer.textSharpening ? 'Sharp Mode ON' : 'Sharp Mode OFF'}
              </p>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">Crisp pixel-perfect rendering</p>
            </div>
          </div>
          <div className={`w-10 h-6 rounded-full transition-all relative ${selectedLayer.textSharpening ? 'bg-yellow-400' : 'bg-zinc-300 dark:bg-zinc-600'}`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${selectedLayer.textSharpening ? 'left-5' : 'left-1'}`} />
          </div>
        </button>
        {selectedLayer.textSharpening && (
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 px-1">
            Active: pixel-snapped rendering + micro self-stroke for crispness.
          </p>
        )}
      </div>

      {/* Sizers */}
      <div className="space-y-4 sm:space-y-5 bg-white dark:bg-white/5 p-3 sm:p-4 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm">
        <StepperSlider label="Font Size" value={selectedLayer.fontSize} min={12} max={200} onAction={saveHistory} onChange={(v: number) => updateLayer(selectedLayer.id, { fontSize: v })} unit="px" />
        <StepperSlider label="Letter Spacing" value={selectedLayer.letterSpacing} min={-10} max={50} step={1} onAction={saveHistory} onChange={(v: number) => updateLayer(selectedLayer.id, { letterSpacing: v })} unit="px" />
        <StepperSlider label="Line Height" value={selectedLayer.lineHeight} min={0.5} max={3} step={0.1} onAction={saveHistory} onChange={(v: number) => updateLayer(selectedLayer.id, { lineHeight: v })} />
        <StepperSlider label="Global Opacity" value={selectedLayer.opacity} min={0} max={1} step={0.1} onAction={saveHistory} onChange={(v: number) => updateLayer(selectedLayer.id, { opacity: v })} />
      </div>

      {/* Outline Engine */}
      <div className="space-y-4 bg-white dark:bg-white/5 p-3 sm:p-4 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Outline (Stroke)</h4>

        <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-black/40 rounded-xl">
          <button onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { strokeType: 'outer' }); }} className={`py-2 rounded-lg text-xs font-medium transition-all ${selectedLayer.strokeType === 'outer' || !selectedLayer.strokeType ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'opacity-50 hover:opacity-100'}`}>Outer Stroke</button>
          <button onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { strokeType: 'inner' }); }} className={`py-2 rounded-lg text-xs font-medium transition-all ${selectedLayer.strokeType === 'inner' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'opacity-50 hover:opacity-100'}`}>Inner Stroke</button>
        </div>

        <StepperSlider label="Stroke Thickness" value={selectedLayer.strokeWidth || 0} min={0} max={20} step={0.5} onAction={saveHistory} onChange={(v: number) => updateLayer(selectedLayer.id, { strokeWidth: v })} unit="px" />

        <ColorPickerPopup
          label="Stroke Color"
          color={selectedLayer.stroke || 'transparent'}
          onAction={saveHistory}
          onChange={(c) => updateLayer(selectedLayer.id, { stroke: c })}
        />
      </div>

    </div>
  );
}
