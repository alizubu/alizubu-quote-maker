'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { useTheme } from 'next-themes';
import { 
  AlignLeft, AlignCenter, AlignRight, ImagePlus, X, 
  MoveUp, MoveDown, Focus, UploadCloud, Type, Palette, Sparkles, Edit2,
  Undo2, Redo2, Minus, Plus, Sun, Moon, Monitor, Sliders
} from 'lucide-react';

// --- REUSABLE STEPPER SLIDER COMPONENT ---
const StepperSlider = ({ 
  label, value, min, max, step = 1, unit = "", onChange, onAction, accent = "#3b82f6" 
}: any) => {
  const handleDecrement = () => { onAction(); onChange(Math.max(min, Number((value - step).toFixed(2)))); };
  const handleIncrement = () => { onAction(); onChange(Math.min(max, Number((value + step).toFixed(2)))); };
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[11px] font-medium opacity-80 text-zinc-700 dark:text-zinc-300">
        <label>{label}</label>
        <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-zinc-200 dark:bg-white/10" style={{ color: accent }}>
          {value}{unit}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={handleDecrement} className="w-8 h-8 flex flex-shrink-0 items-center justify-center bg-zinc-200 dark:bg-zinc-500/10 hover:bg-zinc-300 dark:hover:bg-zinc-500/20 border border-zinc-300 dark:border-white/10 rounded-xl transition-all active:scale-90 text-zinc-700 dark:text-zinc-400"><Minus size={14} /></button>
        <input 
          type="range" min={min} max={max} step={step} value={value} 
          onMouseDown={onAction} onTouchStart={onAction} 
          onChange={(e) => onChange(Number(e.target.value))} 
          className="flex-1 h-1.5 rounded-full cursor-pointer appearance-none bg-zinc-300 dark:bg-zinc-800" 
        />
        <button onClick={handleIncrement} className="w-8 h-8 flex flex-shrink-0 items-center justify-center bg-zinc-200 dark:bg-zinc-500/10 hover:bg-zinc-300 dark:hover:bg-zinc-500/20 border border-zinc-300 dark:border-white/10 rounded-xl transition-all active:scale-90 text-zinc-700 dark:text-zinc-400"><Plus size={14} /></button>
      </div>
    </div>
  );
};

const ControlPanel = () => {
  const { 
    texts, selectedTextId, updateText, addText, bgColor, setBgColor, 
    bgImage, setBgImage, customFonts, addCustomFont, bgBlur, setBgBlur, 
    bgBrightness, setBgBrightness, setBgScale, bgScale, bgX, setBgX, bgY, setBgY,
    moveLayerUp, moveLayerDown, centerTextOnCanvas, setTypingOverlayOpen,
    undo, redo, past, future, canvasWidth, canvasHeight
  } = useEditorStore();
  
  // Theme System States
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [accentColor, setAccentColor] = useState('#3b82f6'); 
  
  const [activeTab, setActiveTab] = useState<'bg' | 'edit' | 'effects'>('edit');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedText = texts.find((t) => t.id === selectedTextId);
  const bgColors = ['transparent', '#000000', '#18181b', '#27272a', '#ffffff', '#1e1e1e', '#0f172a', '#450a0a'];
  const accentPresets = ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#a855f7'];

  // Prevent hydration mismatch
  useEffect(() => { setMounted(true); }, []);

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

  if (!mounted) return <div className="h-full bg-[#f4f4f5] dark:bg-[#050505]"></div>;

  return (
    <div className="flex flex-col h-full select-none bg-[#f4f4f5] dark:bg-gradient-to-b dark:from-[#0c0c0e] dark:to-[#050505] text-zinc-900 dark:text-zinc-100 relative shadow-[-10px_0_30px_rgba(0,0,0,0.1)] transition-colors duration-300">
      
      {/* HISTORY HEADER */}
      <div className="flex justify-between items-center px-5 py-3 border-b border-zinc-300 dark:border-white/5 bg-white/50 dark:bg-black/20 shrink-0">
        <span className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-500 tracking-widest">Workspace Hub</span>
        <div className="flex gap-2">
          <button onClick={undo} disabled={past.length === 0} className={`p-1.5 rounded-lg flex items-center gap-1.5 transition-all ${past.length === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-zinc-200 dark:hover:bg-zinc-500/10 active:scale-90'}`}>
            <Undo2 size={15} /> <span className="text-[11px]">Undo</span>
          </button>
          <div className="w-px bg-zinc-300 dark:bg-white/5 my-1"></div>
          <button onClick={redo} disabled={future.length === 0} className={`p-1.5 rounded-lg flex items-center gap-1.5 transition-all ${future.length === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-zinc-200 dark:hover:bg-zinc-500/10 active:scale-90'}`}>
            <span className="text-[11px]">Redo</span> <Redo2 size={15} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 p-5 space-y-6 custom-scrollbar">

        {/* TAB 1: BACKGROUND & THEME */}
        {activeTab === 'bg' && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 pb-4">
            
            {/* 3. Theme System Addition */}
            <div className="bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 p-4 rounded-2xl space-y-4 shadow-sm">
              <h4 className="text-[11px] font-bold uppercase tracking-wider opacity-60 flex items-center gap-2 text-zinc-800 dark:text-white"><Sliders size={13} style={{ color: accentColor }} /> App Appearance</h4>
              
              <div className="grid grid-cols-3 gap-2 p-1 bg-zinc-100 dark:bg-black/40 rounded-xl">
                {[
                  { name: 'light', icon: <Sun size={14} />, label: 'Light' },
                  { name: 'dark', icon: <Moon size={14} />, label: 'Dark' },
                  { name: 'system', icon: <Monitor size={14} />, label: 'System' }
                ].map((t) => (
                  <button 
                    key={t.name} 
                    onClick={() => setTheme(t.name)} 
                    className={`py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${theme === t.name ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm font-semibold' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider opacity-50 text-zinc-600 dark:text-zinc-400">Custom Accent Color</label>
                <div className="flex gap-3">
                  {accentPresets.map((color) => (
                    <button 
                      key={color} 
                      onClick={() => setAccentColor(color)} 
                      className="w-6 h-6 rounded-full border-2 transition-transform relative flex items-center justify-center hover:scale-110" 
                      style={{ backgroundColor: color, borderColor: accentColor === color ? (theme === 'dark' ? '#fff' : '#000') : 'transparent' }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 opacity-80 text-zinc-800 dark:text-white"><Palette size={14} style={{ color: accentColor }}/> Canvas Background</h3>
            <div className="flex flex-wrap gap-3 p-4 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-sm">
              {bgColors.map((color) => (
                <button key={color} onClick={() => { setBgColor(color); setBgImage(null); }} className={`w-10 h-10 rounded-full border-2 transition-all ${bgColor === color && !bgImage ? 'scale-110 border-zinc-900 dark:border-white shadow-md' : 'border-zinc-300 dark:border-zinc-700/50 hover:scale-105'}`} style={color === 'transparent' ? { backgroundImage: 'repeating-conic-gradient(#3f3f46 0% 25%, transparent 0% 50%)', backgroundSize: '10px 10px' } : { backgroundColor: color }} />
              ))}
              <label className="w-10 h-10 rounded-full border-2 border-dashed border-zinc-400 dark:border-zinc-500 hover:border-zinc-900 dark:hover:border-white flex items-center justify-center cursor-pointer transition-all bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 shadow-sm">
                <ImagePlus size={18} />
                <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if(f) setBgImage(URL.createObjectURL(f)); }} className="hidden" />
              </label>
            </div>
            
            {bgImage && (
              <div className="space-y-6 bg-white dark:bg-white/5 p-4 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-md">
                <div className="flex justify-between items-center border-b border-zinc-200 dark:border-white/5 pb-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider" style={{ color: accentColor }}>Image Transform</h4>
                  <button onClick={() => setBgImage(null)} className="p-1 text-zinc-400 hover:text-red-500 transition-colors"><X size={14} /></button>
                </div>
                <StepperSlider label="Image Scale (Zoom)" value={bgScale} min={0.5} max={4} step={0.05} unit="x" onAction={saveH} onChange={setBgScale} accent={accentColor} />
                <StepperSlider label="Position X (Horizontal)" value={bgX} min={-1000} max={1000} step={1} unit="px" onAction={saveH} onChange={setBgX} accent={accentColor} />
                <StepperSlider label="Position Y (Vertical)" value={bgY} min={-1000} max={1000} step={1} unit="px" onAction={saveH} onChange={setBgY} accent={accentColor} />
                <div className="pt-2 border-t border-zinc-200 dark:border-white/5 space-y-5">
                  <StepperSlider label="Blur Intensity" value={bgBlur} min={0} max={50} onAction={saveH} onChange={setBgBlur} accent={accentColor} />
                  <StepperSlider label="Brightness" value={bgBrightness} min={-100} max={100} unit="%" onAction={saveH} onChange={setBgBrightness} accent={accentColor} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* EMPTY STATE */}
        {(activeTab === 'edit' || activeTab === 'effects') && !selectedText && (
          <div className="h-full min-h-[200px] flex flex-col items-center justify-center border border-dashed border-zinc-300 dark:border-white/10 rounded-3xl text-zinc-500 dark:text-zinc-400 text-center px-6 bg-white dark:bg-white/5 gap-5 mt-4 shadow-sm">
            <Type size={32} className="text-zinc-400 dark:text-zinc-700" />
            <p className="text-sm">Select a text layer to enable editing.</p>
            <button onClick={() => addText({})} className="text-white px-6 py-2.5 rounded-full font-bold shadow-md hover:scale-105 active:scale-95 transition-transform" style={{ backgroundColor: accentColor }}>New Text</button>
          </div>
        )}

        {/* TAB 2: TEXT EDIT */}
        {activeTab === 'edit' && selectedText && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 pb-4">
            
            <div className="flex gap-2 bg-white dark:bg-white/5 p-1.5 rounded-xl border border-zinc-200 dark:border-white/10 shadow-sm">
              <button onClick={() => centerTextOnCanvas(selectedText.id, canvasWidth, canvasHeight)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-500/10 rounded-lg transition-colors"><Focus size={14} /> Center</button>
              <div className="w-px bg-zinc-200 dark:bg-white/10 my-1 mx-1"></div>
              <button onClick={() => moveLayerUp(selectedText.id)} className="px-4 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-colors"><MoveUp size={16} /></button>
              <button onClick={() => moveLayerDown(selectedText.id)} className="px-4 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-colors"><MoveDown size={16} /></button>
            </div>

            <div className="bg-zinc-100 dark:bg-gradient-to-r dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200 dark:border-white/5 p-4 rounded-2xl flex justify-between items-center shadow-sm cursor-pointer group" onClick={() => setTypingOverlayOpen(true)}>
               <div className="flex-1 min-w-0 pr-4">
                 <p className="text-[10px] uppercase font-bold mb-1 opacity-80" style={{ color: accentColor }}>Content Input</p>
                 <p className="text-sm truncate text-zinc-800 dark:text-white">{selectedText.text || "Type something..."}</p>
               </div>
               <div className="w-10 h-10 text-white rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform" style={{ backgroundColor: accentColor }}><Edit2 size={16} /></div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Alignment</label>
                <div className="flex bg-white dark:bg-white/5 p-1.5 rounded-xl border border-zinc-200 dark:border-white/10">
                  {['left', 'center', 'right'].map((alignOpt) => (
                    <button key={alignOpt} onClick={() => { saveH(); updateText(selectedText.id, { align: alignOpt as any }); }} className={`flex-1 flex justify-center py-2 rounded-lg transition-all ${selectedText.align === alignOpt ? 'bg-zinc-200 dark:bg-zinc-800 shadow-sm font-semibold text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}>
                      {alignOpt === 'left' && <AlignLeft size={16} />}
                      {alignOpt === 'center' && <AlignCenter size={16} />}
                      {alignOpt === 'right' && <AlignRight size={16} />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Color & Gradients</label>
                <div className="flex gap-3 flex-wrap bg-white dark:bg-white/5 p-3 rounded-xl border border-zinc-200 dark:border-white/10 items-center justify-start shadow-sm">
                  {['#FFFFFF', '#000000'].map((color) => (
                    <button key={color} onClick={() => { saveH(); updateText(selectedText.id, { fill: color, isGradient: false }); }} className={`w-8 h-8 rounded-full border-2 transition-transform ${selectedText.fill === color && !selectedText.isGradient ? 'scale-110 shadow-md' : 'border-zinc-300 dark:border-zinc-700/50 hover:scale-110'}`} style={{ backgroundColor: color, borderColor: selectedText.fill === color && !selectedText.isGradient ? accentColor : 'transparent' }} />
                  ))}

                  <div 
                    className={`relative w-8 h-8 rounded-full border-2 overflow-hidden hover:scale-110 transition-transform ${!selectedText.isGradient && selectedText.fill !== '#FFFFFF' && selectedText.fill !== '#000000' ? 'scale-110 shadow-md' : 'border-zinc-300 dark:border-zinc-700/50'}`} 
                    style={{ background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)', borderColor: !selectedText.isGradient && selectedText.fill !== '#FFFFFF' && selectedText.fill !== '#000000' ? accentColor : 'transparent' }} 
                    title="Choose Custom Color"
                  >
                    <input type="color" value={!selectedText.isGradient ? selectedText.fill : '#ffffff'} onChange={(e) => { saveH(); updateText(selectedText.id, { fill: e.target.value, isGradient: false }); }} className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer opacity-0" />
                  </div>

                  <div className="w-px h-6 bg-zinc-200 dark:bg-white/10 mx-1"></div>

                  <button onClick={() => { saveH(); updateText(selectedText.id, { isGradient: true, gradientColors: ['#f6d365', '#fda085'] }); }} className={`w-8 h-8 rounded-full border-2 transition-transform bg-gradient-to-b from-[#f6d365] to-[#fda085] ${selectedText.isGradient && selectedText.gradientColors[0] === '#f6d365' ? 'border-zinc-900 dark:border-white scale-110 shadow-md' : 'border-transparent hover:scale-110'}`} />
                  <button onClick={() => { saveH(); updateText(selectedText.id, { isGradient: true, gradientColors: ['#84fab0', '#8fd3f4'] }); }} className={`w-8 h-8 rounded-full border-2 transition-transform bg-gradient-to-b from-[#84fab0] to-[#8fd3f4] ${selectedText.isGradient && selectedText.gradientColors[0] === '#84fab0' ? 'border-zinc-900 dark:border-white scale-110 shadow-md' : 'border-transparent hover:scale-110'}`} />
                  <button onClick={() => { saveH(); updateText(selectedText.id, { isGradient: true, gradientColors: ['#a18cd1', '#fbc2eb'] }); }} className={`w-8 h-8 rounded-full border-2 transition-transform bg-gradient-to-b from-[#a18cd1] to-[#fbc2eb] ${selectedText.isGradient && selectedText.gradientColors[0] === '#a18cd1' ? 'border-zinc-900 dark:border-white scale-110 shadow-md' : 'border-transparent hover:scale-110'}`} />
                </div>
              </div>
            </div>

            <div className="space-y-5 bg-white dark:bg-white/5 p-4 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  <label>Typography</label>
                  <span className="bg-zinc-100 dark:bg-blue-400/10 px-2 py-1 rounded-md cursor-pointer flex items-center gap-1 hover:opacity-80" style={{ color: accentColor }} onClick={() => fileInputRef.current?.click()}><UploadCloud size={12} /> Add .ttf</span>
                </div>
                <input type="file" ref={fileInputRef} accept=".ttf,.otf,.woff" onChange={handleFontUpload} className="hidden" />
                <select value={selectedText.fontFamily} onChange={(e) => { saveH(); updateText(selectedText.id, { fontFamily: e.target.value }); }} className="w-full bg-white dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl p-3 text-sm text-zinc-900 dark:text-white outline-none focus:border-zinc-400 dark:focus:border-blue-500">
                  <optgroup label="Saved Fonts">{customFonts.map(font => <option key={font.name} value={font.name}>{font.name}</option>)}</optgroup>
                  <optgroup label="Presets">
                    <option value="'Hind Siliguri', sans-serif">Hind Siliguri (Bengali)</option>
                    <option value="'Mont Blanc Light', sans-serif">Mont Blanc (Premium)</option>
                    <option value="sans-serif">System Default</option>
                    <option value="'Playfair Display', serif">Playfair (Elegant)</option>
                    <option value="'Cinzel', serif">Cinzel (Luxury)</option>
                  </optgroup>
                </select>
              </div>
              <StepperSlider label="Font Size" value={selectedText.fontSize} min={12} max={150} onAction={saveH} onChange={(val: number) => updateText(selectedText.id, { fontSize: val })} unit="px" accent={accentColor} />
            </div>
          </div>
        )}

        {/* TAB 3: EFFECTS (INNER/OUTER STROKE) */}
        {activeTab === 'effects' && selectedText && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 pb-4">
             <div className="grid grid-cols-1 gap-6 bg-white dark:bg-white/5 p-4 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm">
                <StepperSlider label="Letter Spacing" value={selectedText.letterSpacing} min={-5} max={30} onAction={saveH} onChange={(v: number) => updateText(selectedText.id, { letterSpacing: v })} unit="px" accent={accentColor} />
                <StepperSlider label="Line Height (Vertical)" value={selectedText.lineHeight || 1.2} min={0.5} max={3} step={0.1} onAction={saveH} onChange={(v: number) => updateText(selectedText.id, { lineHeight: v })} accent={accentColor} />
             </div>

            {/* 5. STROKE ENGINE (INNER / OUTER / COLOR WHEEL) */}
            <div className="space-y-4 bg-white dark:bg-white/5 p-4 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm">
              <h4 className="text-[10px] font-bold uppercase tracking-wider" style={{ color: accentColor }}>Outline (Stroke Engine)</h4>
              
              <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-black/40 rounded-xl">
                <button 
                  onClick={() => { saveH(); updateText(selectedText.id, { strokeType: 'outer' }); }} 
                  className={`py-1.5 rounded-lg text-xs font-medium transition-all ${selectedText.strokeType === 'outer' || !selectedText.strokeType ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-950 dark:text-white font-semibold' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
                >
                  Outer Stroke
                </button>
                <button 
                  onClick={() => { saveH(); updateText(selectedText.id, { strokeType: 'inner' }); }} 
                  className={`py-1.5 rounded-lg text-xs font-medium transition-all ${selectedText.strokeType === 'inner' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-950 dark:text-white font-semibold' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
                >
                  Inner Stroke
                </button>
              </div>

              <StepperSlider label="Thickness" value={selectedText.strokeWidth || 0} min={0} max={10} step={0.5} onAction={saveH} onChange={(v: number) => updateText(selectedText.id, { strokeWidth: v })} unit="px" accent={accentColor} />
              
              <div className="flex gap-3 flex-wrap items-center justify-start pt-1">
                {['#FFFFFF', '#000000'].map((color) => (
                  <button 
                    key={color} 
                    onClick={() => { saveH(); updateText(selectedText.id, { stroke: color }); }} 
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${selectedText.stroke === color ? 'scale-110 shadow-md' : 'border-zinc-300 dark:border-zinc-700/50 hover:scale-110'}`} 
                    style={{ backgroundColor: color, borderColor: selectedText.stroke === color ? accentColor : 'transparent' }} 
                  />
                ))}

                {/* Color Wheel for Stroke */}
                <div 
                  className={`relative w-8 h-8 rounded-full border-2 overflow-hidden hover:scale-110 transition-transform ${selectedText.stroke !== '#FFFFFF' && selectedText.stroke !== '#000000' && selectedText.stroke !== 'transparent' ? 'scale-110 shadow-md' : 'border-zinc-300 dark:border-zinc-700/50'}`}
                  style={{ background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)', borderColor: selectedText.stroke !== '#FFFFFF' && selectedText.stroke !== '#000000' && selectedText.stroke !== 'transparent' ? accentColor : 'transparent' }}
                  title="Choose Custom Stroke Color"
                >
                  <input 
                    type="color" 
                    value={selectedText.stroke && selectedText.stroke !== 'transparent' ? selectedText.stroke : '#ffffff'} 
                    onChange={(e) => { saveH(); updateText(selectedText.id, { stroke: e.target.value }); }} 
                    className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer opacity-0"
                  />
                </div>

                <div className="w-px h-6 bg-zinc-200 dark:bg-white/10 mx-1"></div>

                <button 
                  onClick={() => { saveH(); updateText(selectedText.id, { stroke: 'transparent' }); }} 
                  className={`w-8 h-8 rounded-full border-2 transition-all ${selectedText.stroke === 'transparent' ? 'scale-110 border-red-500' : 'border-zinc-300 dark:border-zinc-700/50 hover:scale-110'}`} 
                  style={{ backgroundImage: 'repeating-conic-gradient(#e4e4e7 0% 25%, transparent 0% 50%)', backgroundSize: '8px 8px' }} 
                  title="Remove Outline"
                />
              </div>
            </div>

            <div className="space-y-5 bg-white dark:bg-white/5 p-4 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm">
              <h4 className="text-[10px] font-bold uppercase tracking-wider" style={{ color: accentColor }}>Shadow & Glow Positioning</h4>
              <StepperSlider label="Blur Amount" value={selectedText.shadowBlur || 0} min={0} max={50} onAction={saveH} onChange={(v: number) => updateText(selectedText.id, { shadowBlur: v })} accent={accentColor} />
              <div className="grid grid-cols-1 gap-6 pt-2">
                <StepperSlider label="Offset X (Shadow)" value={selectedText.shadowOffsetX || 0} min={-30} max={30} onAction={saveH} onChange={(v: number) => updateText(selectedText.id, { shadowOffsetX: v })} unit="px" accent={accentColor} />
                <StepperSlider label="Offset Y (Shadow)" value={selectedText.shadowOffsetY || 0} min={-30} max={30} onAction={saveH} onChange={(v: number) => updateText(selectedText.id, { shadowOffsetY: v })} unit="px" accent={accentColor} />
              </div>
              <div className="flex gap-3 pt-3 border-t border-zinc-100 dark:border-white/5">
                <button onClick={() => { saveH(); updateText(selectedText.id, { shadowColor: '#000000' }); }} className={`flex-1 py-2.5 text-xs font-bold rounded-xl border transition-all ${selectedText.shadowColor === '#000000' ? 'bg-zinc-800 border-zinc-500 text-white shadow-lg' : 'border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-500/10'}`}>Dark</button>
                <button onClick={() => { saveH(); updateText(selectedText.id, { shadowColor: '#FFFFFF' }); }} className={`flex-1 py-2.5 text-xs font-bold rounded-xl border transition-all ${selectedText.shadowColor === '#FFFFFF' ? 'bg-white border-zinc-400 text-black shadow-lg' : 'border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-500/10'}`}>Glow</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM GLOSSY NAVIGATION TABS */}
      <div className="flex gap-2 p-3 bg-white/80 dark:bg-black/60 backdrop-blur-3xl border-t border-zinc-200 dark:border-white/10 shrink-0 z-20 pb-6 md:pb-4">
        {[
          { name: 'bg', icon: <Palette size={20} />, label: 'Background' },
          { name: 'edit', icon: <Type size={20} />, label: 'Text Edit' },
          { name: 'effects', icon: <Sparkles size={20} />, label: 'Effects' }
        ].map((tab) => (
          <button 
            key={tab.name}
            onClick={() => setActiveTab(tab.name as any)} 
            className="flex-1 flex flex-col justify-center items-center gap-1.5 py-3 rounded-2xl transition-all duration-300"
            style={{ 
              backgroundColor: activeTab === tab.name ? accentColor : 'transparent',
              color: activeTab === tab.name ? '#ffffff' : (theme === 'light' ? '#71717a' : '#a1a1aa')
            }}
          >
            {tab.icon}
            <span className="text-[10px] font-bold tracking-wider">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ControlPanel;