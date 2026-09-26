'use client';

import React, { useState } from 'react';
import { useEditorStore, TextLayer } from '../../../store/useEditorStore';
import { AlignLeft, AlignCenter, AlignRight, Type, Edit2, Bold, Italic, Underline } from 'lucide-react';
import { StepperSlider, ColorPickerPopup } from './BackgroundPanel';

const TABS = ['Typography', 'Shadow', 'Effects', 'Transform'];

export default function TextPanel() {
  const { layers, selectedLayerId, updateLayer, setTypingOverlayOpen, saveHistory, customFonts } = useEditorStore();
  const selectedLayer = layers.find((l) => l.id === selectedLayerId) as TextLayer;
  
  // Tab state (could be lifted to store if needed, but local is fine)
  const [activeTab, setActiveTab] = useState('Typography');

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
    <div className="space-y-4 animate-in slide-in-from-right-4 duration-300 pb-4">
      
      {/* Quick Edit Input - Always Pinned */}
      <div 
        className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-500/20 p-3 rounded-2xl flex justify-between items-center cursor-pointer hover:bg-blue-100/50 dark:hover:bg-blue-900/20 transition-colors shrink-0" 
        onClick={() => setTypingOverlayOpen(true)}
      >
         <div className="flex-1 min-w-0 pr-4">
           <p className="text-sm truncate text-blue-900 dark:text-blue-100 font-medium">{selectedLayer.text || "Type something..."}</p>
         </div>
         <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-md"><Edit2 size={14} /></div>
      </div>

      {/* Horizontal Tab Bar */}
      <div className="relative">
        <div className="flex overflow-x-auto custom-scrollbar pb-2 gap-2 snap-x px-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-none px-4 py-2 rounded-xl text-xs font-bold tracking-wide uppercase transition-all snap-center border ${
                activeTab === tab 
                  ? 'bg-zinc-800 text-white dark:bg-white dark:text-black border-transparent shadow-sm' 
                  : 'bg-zinc-100 dark:bg-black/40 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-white/5 hover:border-zinc-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        {/* Subtle fade edge to hint at scrolling */}
        <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-white dark:from-zinc-900 to-transparent pointer-events-none" />
      </div>

      {/* Tab Content Area */}
      <div className="bg-white dark:bg-white/5 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm p-4 overflow-hidden min-h-[250px]">
        {activeTab === 'Typography' && (
          <div key="Typography" className="space-y-6 animate-in fade-in duration-200">
            {/* Font Family */}
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

            {/* Alignment & Style */}
            <div className="flex gap-2">
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

            {/* Color & Fill */}
            <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-white/5">
              <ColorPickerPopup 
                label="Text Fill Color" 
                color={selectedLayer.fill} 
                onAction={saveHistory}
                onChange={(c) => updateLayer(selectedLayer.id, { fill: c, isGradient: false })} 
              />
              <StepperSlider label="Global Opacity" value={selectedLayer.opacity} min={0} max={1} step={0.1} onAction={saveHistory} onChange={(v: number) => updateLayer(selectedLayer.id, { opacity: v })} />
            </div>

            {/* Spacing & Size */}
            <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-white/5">
              <StepperSlider label="Font Size" value={selectedLayer.fontSize} min={12} max={200} onAction={saveHistory} onChange={(v: number) => updateLayer(selectedLayer.id, { fontSize: v })} unit="px" />
              <StepperSlider label="Letter Spacing" value={selectedLayer.letterSpacing} min={-10} max={50} step={1} onAction={saveHistory} onChange={(v: number) => updateLayer(selectedLayer.id, { letterSpacing: v })} unit="px" />
              <StepperSlider label="Line Height" value={selectedLayer.lineHeight} min={0.5} max={3} step={0.1} onAction={saveHistory} onChange={(v: number) => updateLayer(selectedLayer.id, { lineHeight: v })} />
            </div>
          </div>
        )}

        {activeTab === 'Shadow' && (
          <div key="Shadow" className="space-y-4 animate-in fade-in duration-200">
            <div className="flex justify-between items-center mb-4">
               <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Enable Shadow</span>
               <button onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { shadowEnabled: !selectedLayer.shadowEnabled }); }} className={`w-10 h-5 rounded-full relative transition-colors ${selectedLayer.shadowEnabled ? 'bg-blue-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}>
                 <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${selectedLayer.shadowEnabled ? 'left-5' : 'left-1'}`} />
               </button>
            </div>
            {selectedLayer.shadowEnabled && (
              <div className="animate-in slide-in-from-top-2 duration-200">
                {selectedLayer.glowEnabled && <p className="text-[10px] text-amber-500 mb-3 leading-tight bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">Shadow is overridden by Glow effect.</p>}
                <div className="flex justify-between gap-2 mb-4">
                  <button onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { shadowColor: 'transparent', shadowBlur: 0, shadowOffsetX: 0, shadowOffsetY: 0 }); }} className="flex-1 py-1.5 text-[10px] uppercase font-bold rounded-lg bg-zinc-100 dark:bg-black/40 hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/5">None</button>
                  <button onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { shadowColor: 'rgba(0,0,0,0.5)', shadowBlur: 4, shadowOffsetX: 0, shadowOffsetY: 4 }); }} className="flex-1 py-1.5 text-[10px] uppercase font-bold rounded-lg bg-zinc-100 dark:bg-black/40 hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/5">Soft</button>
                  <button onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { shadowColor: 'rgba(0,0,0,1)', shadowBlur: 0, shadowOffsetX: 4, shadowOffsetY: 4 }); }} className="flex-1 py-1.5 text-[10px] uppercase font-bold rounded-lg bg-zinc-100 dark:bg-black/40 hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/5">Hard</button>
                </div>
                <ColorPickerPopup label="Shadow Color" color={selectedLayer.shadowColor || 'rgba(0,0,0,0.5)'} onAction={saveHistory} onChange={(c) => updateLayer(selectedLayer.id, { shadowColor: c })} />
                <div className="mt-4 space-y-4">
                  <StepperSlider label="Offset X" value={selectedLayer.shadowOffsetX || 0} min={-50} max={50} step={1} onAction={saveHistory} onChange={(v: number) => updateLayer(selectedLayer.id, { shadowOffsetX: v })} unit="px" />
                  <StepperSlider label="Offset Y" value={selectedLayer.shadowOffsetY || 0} min={-50} max={50} step={1} onAction={saveHistory} onChange={(v: number) => updateLayer(selectedLayer.id, { shadowOffsetY: v })} unit="px" />
                  <StepperSlider label="Blur Radius" value={selectedLayer.shadowBlur || 0} min={0} max={50} step={1} onAction={saveHistory} onChange={(v: number) => updateLayer(selectedLayer.id, { shadowBlur: v })} unit="px" />
                  <StepperSlider label="Opacity" value={selectedLayer.shadowOpacity !== undefined ? selectedLayer.shadowOpacity : 1} min={0} max={1} step={0.1} onAction={saveHistory} onChange={(v: number) => updateLayer(selectedLayer.id, { shadowOpacity: v })} />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Effects' && (
          <div key="Effects" className="animate-in fade-in duration-200">
            {/* Outline / Stroke */}
            <div className="mb-5 pb-5 border-b border-zinc-100 dark:border-white/5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-3 block">Outline (Stroke)</span>
              <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-black/40 rounded-xl mb-3">
                <button onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { strokeType: 'outer' }); }} className={`py-1.5 rounded-lg text-xs font-medium transition-all ${selectedLayer.strokeType === 'outer' || !selectedLayer.strokeType ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'opacity-50 hover:opacity-100'}`}>Outer Stroke</button>
                <button onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { strokeType: 'inner' }); }} className={`py-1.5 rounded-lg text-xs font-medium transition-all ${selectedLayer.strokeType === 'inner' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'opacity-50 hover:opacity-100'}`}>Inner Stroke</button>
              </div>
              <StepperSlider label="Stroke Thickness" value={selectedLayer.strokeWidth || 0} min={0} max={20} step={0.5} onAction={saveHistory} onChange={(v: number) => updateLayer(selectedLayer.id, { strokeWidth: v })} unit="px" />
              <div className="mt-4">
                <ColorPickerPopup label="Stroke Color" color={selectedLayer.stroke || 'transparent'} onAction={saveHistory} onChange={(c) => updateLayer(selectedLayer.id, { stroke: c })} />
              </div>
            </div>

            {/* Glow */}
            <div className="mb-5 pb-5 border-b border-zinc-100 dark:border-white/5">
              <div className="flex justify-between items-center mb-3">
                 <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Glow Effect</span>
                 <button onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { glowEnabled: !selectedLayer.glowEnabled }); }} className={`w-10 h-5 rounded-full relative transition-colors ${selectedLayer.glowEnabled ? 'bg-blue-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}>
                   <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${selectedLayer.glowEnabled ? 'left-5' : 'left-1'}`} />
                 </button>
              </div>
              {selectedLayer.glowEnabled && (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                  <ColorPickerPopup label="Glow Color" color={selectedLayer.glowColor || '#ffffff'} onAction={saveHistory} onChange={(c) => updateLayer(selectedLayer.id, { glowColor: c })} />
                  <StepperSlider label="Intensity" value={selectedLayer.glowIntensity !== undefined ? selectedLayer.glowIntensity : 15} min={0} max={50} step={1} onAction={saveHistory} onChange={(v: number) => updateLayer(selectedLayer.id, { glowIntensity: v })} unit="px" />
                </div>
              )}
            </div>

            {/* Background Highlight */}
            <div className="mb-5 pb-5 border-b border-zinc-100 dark:border-white/5">
              <div className="flex justify-between items-center mb-3">
                 <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Background Highlight</span>
                 <button onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { hasBgHighlight: !selectedLayer.hasBgHighlight }); }} className={`w-10 h-5 rounded-full relative transition-colors ${selectedLayer.hasBgHighlight ? 'bg-blue-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}>
                   <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${selectedLayer.hasBgHighlight ? 'left-5' : 'left-1'}`} />
                 </button>
              </div>
              {selectedLayer.hasBgHighlight && (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                  <ColorPickerPopup label="Background Color" color={selectedLayer.bgHighlightColor || '#ffea00'} onAction={saveHistory} onChange={(c) => updateLayer(selectedLayer.id, { bgHighlightColor: c })} />
                  <StepperSlider label="Opacity" value={selectedLayer.bgHighlightOpacity !== undefined ? selectedLayer.bgHighlightOpacity : 1} min={0} max={1} step={0.1} onAction={saveHistory} onChange={(v: number) => updateLayer(selectedLayer.id, { bgHighlightOpacity: v })} />
                  <StepperSlider label="Corner Radius" value={selectedLayer.bgHighlightRadius || 0} min={0} max={50} step={1} onAction={saveHistory} onChange={(v: number) => updateLayer(selectedLayer.id, { bgHighlightRadius: v })} unit="px" />
                  <StepperSlider label="Padding" value={selectedLayer.bgHighlightPadding || 8} min={0} max={50} step={1} onAction={saveHistory} onChange={(v: number) => updateLayer(selectedLayer.id, { bgHighlightPadding: v })} unit="px" />
                </div>
              )}
            </div>

            {/* Gradient Fill */}
            <div>
              <div className="flex justify-between items-center mb-3">
                 <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Gradient Fill</span>
                 <button onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { isGradient: !selectedLayer.isGradient }); }} className={`w-10 h-5 rounded-full relative transition-colors ${selectedLayer.isGradient ? 'bg-blue-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}>
                   <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${selectedLayer.isGradient ? 'left-5' : 'left-1'}`} />
                 </button>
              </div>
              {selectedLayer.isGradient && (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                  <ColorPickerPopup label="Color 1" color={selectedLayer.gradientColors?.[0] || '#f6d365'} onAction={saveHistory} onChange={(c) => updateLayer(selectedLayer.id, { gradientColors: [c, selectedLayer.gradientColors?.[1] || '#fda085'] })} />
                  <ColorPickerPopup label="Color 2" color={selectedLayer.gradientColors?.[1] || '#fda085'} onAction={saveHistory} onChange={(c) => updateLayer(selectedLayer.id, { gradientColors: [selectedLayer.gradientColors?.[0] || '#f6d365', c] })} />
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'Transform' && (
          <div key="Transform" className="space-y-4 animate-in fade-in duration-200">
            <StepperSlider label="Scale" value={Math.round(selectedLayer.scaleX * 100)} min={10} max={400} step={1} onAction={saveHistory} onChange={(v: number) => updateLayer(selectedLayer.id, { scaleX: v / 100, scaleY: v / 100 })} unit="%" />
            <StepperSlider label="Rotation" value={Math.round(selectedLayer.rotation)} min={-180} max={180} step={1} onAction={saveHistory} onChange={(v: number) => updateLayer(selectedLayer.id, { rotation: v })} unit="°" />
            
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2 block">Flip</label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-black/40 rounded-xl mb-3 border border-zinc-200 dark:border-white/5">
                 <button onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { scaleX: selectedLayer.scaleX * -1 }); }} className={`py-1.5 rounded-lg text-xs font-medium transition-all opacity-70 hover:opacity-100 bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white`}>Flip Horizontal</button>
                 <button onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { scaleY: selectedLayer.scaleY * -1 }); }} className={`py-1.5 rounded-lg text-xs font-medium transition-all opacity-70 hover:opacity-100 bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white`}>Flip Vertical</button>
              </div>
            </div>
            
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2 block">Align to Canvas</label>
              <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-100 dark:bg-black/40 rounded-xl border border-zinc-200 dark:border-white/5">
                 <button onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { x: 0 }); }} className="py-1.5 rounded-lg text-xs font-medium transition-all opacity-70 hover:opacity-100 bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white text-center">Left</button>
                 <button onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { x: (useEditorStore.getState().canvasWidth / 2) - ((selectedLayer.width || 200) * selectedLayer.scaleX) / 2 }); }} className="py-1.5 rounded-lg text-xs font-medium transition-all opacity-70 hover:opacity-100 bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white text-center">Center</button>
                 <button onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { x: useEditorStore.getState().canvasWidth - ((selectedLayer.width || 200) * selectedLayer.scaleX) }); }} className="py-1.5 rounded-lg text-xs font-medium transition-all opacity-70 hover:opacity-100 bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white text-center">Right</button>
                 
                 <button onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { y: 0 }); }} className="py-1.5 rounded-lg text-xs font-medium transition-all opacity-70 hover:opacity-100 bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white text-center">Top</button>
                 <button onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { y: (useEditorStore.getState().canvasHeight / 2) - ((selectedLayer.fontSize * selectedLayer.scaleY) / 2) }); }} className="py-1.5 rounded-lg text-xs font-medium transition-all opacity-70 hover:opacity-100 bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white text-center">Middle</button>
                 <button onClick={() => { saveHistory(); updateLayer(selectedLayer.id, { y: useEditorStore.getState().canvasHeight - (selectedLayer.fontSize * selectedLayer.scaleY) }); }} className="py-1.5 rounded-lg text-xs font-medium transition-all opacity-70 hover:opacity-100 bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white text-center">Bottom</button>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}