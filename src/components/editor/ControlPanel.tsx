'use client';

import React, { useRef, useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { 
  AlignLeft, AlignCenter, AlignRight, ImagePlus, X, 
  MoveUp, MoveDown, Focus, UploadCloud, Type, Palette, Sparkles, Edit2,
  Undo2, Redo2, Maximize2, Minus, Plus 
} from 'lucide-react';

const StepperSlider = ({ 
  label, value, min, max, step = 1, unit = "", 
  onChange, onAction 
}: { 
  label: string, value: number, min: number, max: number, step?: number, unit?: string,
  onChange: (val: number) => void, onAction: () => void 
}) => {
  const handleDecrement = () => { onAction(); onChange(Math.max(min, Number((value - step).toFixed(2)))); };
  const handleIncrement = () => { onAction(); onChange(Math.min(max, Number((value + step).toFixed(2)))); };
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[11px] font-medium text-zinc-300">
        <label>{label}</label>
        <span className="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">{value}{unit}</span>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={handleDecrement} className="w-8 h-8 flex flex-shrink-0 items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-zinc-400 hover:text-white transition-all active:scale-90"><Minus size={14} /></button>
        <input type="range" min={min} max={max} step={step} value={value} onMouseDown={onAction} onTouchStart={onAction} onChange={(e) => onChange(Number(e.target.value))} className="flex-1 accent-blue-500 h-1.5 rounded-full cursor-pointer" />
        <button onClick={handleIncrement} className="w-8 h-8 flex flex-shrink-0 items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-zinc-400 hover:text-white transition-all active:scale-90"><Plus size={14} /></button>
      </div>
    </div>
  );
};

const ControlPanel = () => {
  const { 
    texts, selectedTextId, updateText, addText, bgColor, setBgColor, 
    bgImage, setBgImage, customFonts, addCustomFont, bgBlur, setBgBlur, 
    bgBrightness, setBgBrightness, bgScale, setBgScale, bgX, setBgX, bgY, setBgY,
    moveLayerUp, moveLayerDown, centerTextOnCanvas, setTypingOverlayOpen, aspectRatio,
    undo, redo, past, future 
  } = useEditorStore();
  
  const [activeTab, setActiveTab] = useState<'bg' | 'edit' | 'effects'>('edit');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedText = texts.find((t) => t.id === selectedTextId);
  const bgColors = ['transparent', '#000000', '#18181b', '#27272a', '#ffffff', '#1e1e1e', '#0f172a', '#450a0a'];

  const aspectRatios: Record<string, { w: number, h: number }> = {
    '9:16': { w: 1080, h: 1920 },
    '1:1': { w: 1080, h: 1080 },
    '4:5': { w: 1080, h: 1350 },
    '16:9': { w: 1920, h: 1080 },
  };

  const currentCanvasWidth = aspectRatios[aspectRatio]?.w || 1080;
  const currentCanvasHeight = aspectRatios[aspectRatio]?.h || 1920;

  const handleFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fontName = file.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_');
      const fontUrl = URL.createObjectURL(file);
      const fontFace = new FontFace(fontName, `url(${fontUrl})`);
      fontFace.load().then((loadedFace) => { 
        document.fonts.add(loadedFace); 
        addCustomFont(fontName, fontUrl, file); 
        if (selectedTextId) updateText(selectedTextId, { fontFamily: fontName }); 
      }).catch(err => alert("Font error"));
    }
  };

  const saveH = () => useEditorStore.getState().saveHistory();

  return (
    <div className="flex flex-col h-full select-none bg-gradient-to-b from-[#0c0c0e] to-[#050505] relative shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
      
      <div className="flex justify-between items-center px-5 py-3 border-b border-white/5 bg-black/20 shrink-0">
        <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">History Engine</span>
        <div className="flex gap-2">
          <button onClick={undo} disabled={past.length === 0} className={`p-1.5 rounded-lg flex items-center gap-1.5 transition-all ${past.length === 0 ? 'text-zinc-700' : 'text-zinc-300 hover:bg-white/5 active:scale-90'}`}>
            <Undo2 size={15} /> <span className="text-[11px]">Undo</span>
          </button>
          <div className="w-px bg-white/5 my-1"></div>
          <button onClick={redo} disabled={future.length === 0} className={`p-1.5 rounded-lg flex items-center gap-1.5 transition-all ${future.length === 0 ? 'text-zinc-700' : 'text-zinc-300 hover:bg-white/5 active:scale-90'}`}>
            <span className="text-[11px]">Redo</span> <Redo2 size={15} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 p-5 space-y-6 custom-scrollbar">

        {/* TAB 1: BACKGROUND */}
        {activeTab === 'bg' && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 pb-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2"><Palette size={14} className="text-blue-400"/> Canvas Background</h3>
            <div className="flex flex-wrap gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
              {bgColors.map((color) => (
                <button key={color} onClick={() => { setBgColor(color); setBgImage(null); }} className={`w-10 h-10 rounded-full border-2 transition-all ${bgColor === color && !bgImage ? 'border-white scale-110 shadow-lg' : 'border-zinc-700/50 hover:scale-105'}`} style={color === 'transparent' ? { backgroundImage: 'repeating-conic-gradient(#3f3f46 0% 25%, transparent 0% 50%)', backgroundSize: '10px 10px' } : { backgroundColor: color }} />
              ))}
              <label className="w-10 h-10 rounded-full border-2 border-dashed border-zinc-500 hover:border-white flex items-center justify-center cursor-pointer transition-all bg-zinc-900 text-zinc-400 shadow-lg">
                <ImagePlus size={18} />
                <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if(f) setBgImage(URL.createObjectURL(f)); }} className="hidden" />
              </label>
            </div>
            
            {bgImage && (
              <div className="space-y-6 bg-white/5 p-4 rounded-2xl border border-white/10 shadow-xl">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h4 className="text-[10px] font-bold uppercase text-blue-400 tracking-wider">Image Transform</h4>
                  <button onClick={() => setBgImage(null)} className="p-1 text-zinc-500 hover:text-red-400 transition-colors"><X size={14} /></button>
                </div>
                <StepperSlider label="Image Scale (Zoom)" value={bgScale} min={0.5} max={4} step={0.05} unit="x" onAction={saveH} onChange={setBgScale} />
                <StepperSlider label="Position X (Horizontal)" value={bgX} min={-1000} max={1000} step={1} unit="px" onAction={saveH} onChange={setBgX} />
                <StepperSlider label="Position Y (Vertical)" value={bgY} min={-1000} max={1000} step={1} unit="px" onAction={saveH} onChange={setBgY} />
                <div className="pt-2 border-t border-white/5 space-y-5">
                  <StepperSlider label="Blur Intensity" value={bgBlur} min={0} max={50} onAction={saveH} onChange={setBgBlur} />
                  <StepperSlider label="Brightness" value={bgBrightness} min={-100} max={100} unit="%" onAction={saveH} onChange={setBgBrightness} />
                </div>
              </div>
            )}
          </div>
        )}

        {(activeTab === 'edit' || activeTab === 'effects') && !selectedText && (
          <div className="h-full min-h-[200px] flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl text-zinc-400 text-center px-6 bg-white/5 gap-5 mt-4 shadow-inner">
            <Type size={32} className="text-zinc-700" />
            <p className="text-sm">Select a text layer to enable editing.</p>
            <button onClick={() => addText({})} className="bg-white text-black px-6 py-2.5 rounded-full font-bold shadow-lg hover:scale-105 active:scale-95 transition-transform">New Text</button>
          </div>
        )}

        {/* TAB 2: TEXT EDIT */}
        {activeTab === 'edit' && selectedText && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 pb-4">
            
            <div className="flex gap-2 bg-white/5 p-1.5 rounded-xl border border-white/10 shadow-sm">
              <button onClick={() => centerTextOnCanvas(selectedText.id, currentCanvasWidth, currentCanvasHeight)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium text-zinc-300 hover:bg-white/10 rounded-lg transition-colors"><Focus size={14} /> Center</button>
              <div className="w-px bg-white/10 my-1 mx-1"></div>
              <button onClick={() => moveLayerUp(selectedText.id)} className="px-4 text-zinc-400 hover:text-white rounded-lg transition-colors"><MoveUp size={16} /></button>
              <button onClick={() => moveLayerDown(selectedText.id)} className="px-4 text-zinc-400 hover:text-white rounded-lg transition-colors"><MoveDown size={16} /></button>
            </div>

            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 p-4 rounded-2xl flex justify-between items-center shadow-inner cursor-pointer hover:bg-white/5 transition-colors group" onClick={() => setTypingOverlayOpen(true)}>
               <div className="flex-1 min-w-0 pr-4">
                 <p className="text-[10px] uppercase text-blue-400 font-bold mb-1">Content Input</p>
                 <p className="text-sm text-white truncate">{selectedText.text || "Type something..."}</p>
               </div>
               <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><Edit2 size={16} /></div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Alignment</label>
                <div className="flex bg-white/5 p-1.5 rounded-xl border border-white/10">
                  {['left', 'center', 'right'].map((alignOpt) => (
                    <button key={alignOpt} onClick={() => { saveH(); updateText(selectedText.id, { align: alignOpt as any }); }} className={`flex-1 flex justify-center py-2 rounded-lg transition-all ${selectedText.align === alignOpt ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-white'}`}>
                      {alignOpt === 'left' && <AlignLeft size={16} />}
                      {alignOpt === 'center' && <AlignCenter size={16} />}
                      {alignOpt === 'right' && <AlignRight size={16} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* PIXELLAB STYLE COLOR & GRADIENT SECTION */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Color & Gradients</label>
                <div className="flex gap-3 flex-wrap bg-white/5 p-3 rounded-xl border border-white/10 items-center justify-start">
                  
                  {/* ১. সাদা এবং কালো কালার প্রিসেট */}
                  {['#FFFFFF', '#000000'].map((color) => (
                    <button 
                      key={color} 
                      onClick={() => { saveH(); updateText(selectedText.id, { fill: color, isGradient: false }); }} 
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${selectedText.fill === color && !selectedText.isGradient ? 'border-blue-500 scale-110 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'border-zinc-700/50 hover:scale-110'}`} 
                      style={{ backgroundColor: color }} 
                    />
                  ))}

                  {/* ২. যেকোনো কালার চুজ করার অপশন (Color Wheel Style) */}
                  <div 
                    className={`relative w-8 h-8 rounded-full border-2 overflow-hidden hover:scale-110 transition-transform ${!selectedText.isGradient && selectedText.fill !== '#FFFFFF' && selectedText.fill !== '#000000' ? 'border-blue-500 scale-110 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'border-zinc-700/50'}`}
                    style={{ background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }}
                    title="Choose Custom Color"
                  >
                    <input 
                      type="color" 
                      value={!selectedText.isGradient ? selectedText.fill : '#ffffff'} 
                      onChange={(e) => { saveH(); updateText(selectedText.id, { fill: e.target.value, isGradient: false }); }} 
                      className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer opacity-0"
                    />
                  </div>

                  <div className="w-px h-6 bg-white/10 mx-1"></div>

                  {/* ৩. গ্রেডিয়েন্ট অপশন */}
                  <button onClick={() => { saveH(); updateText(selectedText.id, { isGradient: true, gradientColors: ['#f6d365', '#fda085'] }); }} className={`w-8 h-8 rounded-full border-2 transition-transform bg-gradient-to-b from-[#f6d365] to-[#fda085] ${selectedText.isGradient && selectedText.gradientColors[0] === '#f6d365' ? 'border-white scale-110 shadow-lg' : 'border-zinc-700/50 hover:scale-110'}`} title="Sunset Gradient" />
                  <button onClick={() => { saveH(); updateText(selectedText.id, { isGradient: true, gradientColors: ['#84fab0', '#8fd3f4'] }); }} className={`w-8 h-8 rounded-full border-2 transition-transform bg-gradient-to-b from-[#84fab0] to-[#8fd3f4] ${selectedText.isGradient && selectedText.gradientColors[0] === '#84fab0' ? 'border-white scale-110 shadow-lg' : 'border-zinc-700/50 hover:scale-110'}`} title="Ocean Gradient" />
                  <button onClick={() => { saveH(); updateText(selectedText.id, { isGradient: true, gradientColors: ['#a18cd1', '#fbc2eb'] }); }} className={`w-8 h-8 rounded-full border-2 transition-transform bg-gradient-to-b from-[#a18cd1] to-[#fbc2eb] ${selectedText.isGradient && selectedText.gradientColors[0] === '#a18cd1' ? 'border-white scale-110 shadow-lg' : 'border-zinc-700/50 hover:scale-110'}`} title="Purple Haze" />
                </div>
              </div>
            </div>

            <div className="space-y-5 bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  <label>Typography</label>
                  <span className="text-blue-400 bg-blue-400/10 px-2 py-1 rounded-md cursor-pointer flex items-center gap-1 hover:bg-blue-400/20" onClick={() => fileInputRef.current?.click()}><UploadCloud size={12} /> Add .ttf</span>
                </div>
                <input type="file" ref={fileInputRef} accept=".ttf,.otf,.woff" onChange={handleFontUpload} className="hidden" />
                <select value={selectedText.fontFamily} onChange={(e) => { saveH(); updateText(selectedText.id, { fontFamily: e.target.value }); }} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500">
                  <optgroup label="Saved Fonts">{customFonts.map(font => <option key={font.name} value={font.name}>{font.name}</option>)}</optgroup>
                  <optgroup label="Presets">
                    <option value="'Mont Blanc Light', sans-serif">Mont Blanc (Premium)</option>
                    <option value="sans-serif">System Default</option>
                    <option value="'Playfair Display', serif">Playfair (Elegant)</option>
                    <option value="'Cinzel', serif">Cinzel (Luxury)</option>
                  </optgroup>
                </select>
              </div>
              <StepperSlider label="Font Size" value={selectedText.fontSize} min={12} max={150} onAction={saveH} onChange={(val) => updateText(selectedText.id, { fontSize: val })} unit="px" />
            </div>
          </div>
        )}

        {/* TAB 3: EFFECTS */}
        {activeTab === 'effects' && selectedText && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 pb-4">
             <div className="grid grid-cols-1 gap-6 bg-white/5 p-4 rounded-2xl border border-white/10 shadow-lg">
                <StepperSlider label="Letter Spacing" value={selectedText.letterSpacing} min={-5} max={30} onAction={saveH} onChange={(v) => updateText(selectedText.id, { letterSpacing: v })} unit="px" />
                <StepperSlider label="Line Height (Vertical)" value={selectedText.lineHeight || 1.2} min={0.5} max={3} step={0.1} onAction={saveH} onChange={(v) => updateText(selectedText.id, { lineHeight: v })} />
             </div>

            <div className="space-y-4 bg-white/5 p-4 rounded-2xl border border-white/10">
              <h4 className="text-[10px] font-bold uppercase text-blue-400 tracking-wider">Outline (Stroke)</h4>
              <StepperSlider label="Thickness" value={selectedText.strokeWidth || 0} min={0} max={10} step={0.5} onAction={saveH} onChange={(v) => updateText(selectedText.id, { strokeWidth: v })} unit="px" />
              <div className="flex gap-3 pt-1">
                {['transparent', '#000000', '#FFFFFF', '#EF4444'].map((color) => (
                  <button key={color} onClick={() => { saveH(); updateText(selectedText.id, { stroke: color }); }} className={`w-8 h-8 rounded-full border-2 transition-all ${selectedText.stroke === color ? 'border-white scale-110 shadow-lg' : 'border-zinc-700/50'}`} style={color === 'transparent' ? { backgroundImage: 'repeating-conic-gradient(#3f3f46 0% 25%, transparent 0% 50%)', backgroundSize: '8px 8px' } : { backgroundColor: color }} />
                ))}
              </div>
            </div>

            <div className="space-y-5 bg-white/5 p-4 rounded-2xl border border-white/10 shadow-lg">
              <h4 className="text-[10px] font-bold uppercase text-blue-400 tracking-wider">Shadow & Glow Positioning</h4>
              <StepperSlider label="Blur Amount" value={selectedText.shadowBlur || 0} min={0} max={50} onAction={saveH} onChange={(v) => updateText(selectedText.id, { shadowBlur: v })} />
              
              <div className="grid grid-cols-1 gap-6 pt-2">
                <StepperSlider label="Offset X (Shadow)" value={selectedText.shadowOffsetX || 0} min={-30} max={30} onAction={saveH} onChange={(v) => updateText(selectedText.id, { shadowOffsetX: v })} unit="px" />
                <StepperSlider label="Offset Y (Shadow)" value={selectedText.shadowOffsetY || 0} min={-30} max={30} onAction={saveH} onChange={(v) => updateText(selectedText.id, { shadowOffsetY: v })} unit="px" />
              </div>

              <div className="flex gap-3 pt-3 border-t border-white/5">
                <button onClick={() => { saveH(); updateText(selectedText.id, { shadowColor: '#000000' }); }} className={`flex-1 py-2.5 text-xs font-bold rounded-xl border transition-all ${selectedText.shadowColor === '#000000' ? 'bg-zinc-800 border-zinc-500 text-white shadow-lg' : 'border-white/10 text-zinc-400 hover:bg-white/5'}`}>Dark</button>
                <button onClick={() => { saveH(); updateText(selectedText.id, { shadowColor: '#FFFFFF' }); }} className={`flex-1 py-2.5 text-xs font-bold rounded-xl border transition-all ${selectedText.shadowColor === '#FFFFFF' ? 'bg-white border-white text-black shadow-lg' : 'border-white/10 text-zinc-400 hover:bg-white/5'}`}>Glow</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 p-3 bg-black/60 backdrop-blur-3xl border-t border-white/10 shrink-0 z-20 pb-6 md:pb-4">
        <button onClick={() => setActiveTab('bg')} className={`flex-1 flex flex-col justify-center items-center gap-1.5 py-3 rounded-2xl transition-all duration-300 ${activeTab === 'bg' ? 'bg-blue-500 text-white shadow-xl scale-105' : 'bg-white/5 text-zinc-400 hover:text-white'}`}>
          <Palette size={20} />
          <span className="text-[10px] font-bold tracking-wider">Background</span>
        </button>
        <button onClick={() => setActiveTab('edit')} className={`flex-1 flex flex-col justify-center items-center gap-1.5 py-3 rounded-2xl transition-all duration-300 ${activeTab === 'edit' ? 'bg-blue-500 text-white shadow-xl scale-105' : 'bg-white/5 text-zinc-400 hover:text-white'}`}>
          <Type size={20} />
          <span className="text-[10px] font-bold tracking-wider">Text Edit</span>
        </button>
        <button onClick={() => setActiveTab('effects')} className={`flex-1 flex flex-col justify-center items-center gap-1.5 py-3 rounded-2xl transition-all duration-300 ${activeTab === 'effects' ? 'bg-blue-500 text-white shadow-xl scale-105' : 'bg-white/5 text-zinc-400 hover:text-white'}`}>
          <Sparkles size={20} />
          <span className="text-[10px] font-bold tracking-wider">Effects</span>
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;