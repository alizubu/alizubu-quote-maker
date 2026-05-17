'use client';

import React, { useRef, useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { 
  AlignLeft, AlignCenter, AlignRight, ImagePlus, X, 
  MoveUp, MoveDown, Focus, UploadCloud, Type, Palette, Sparkles 
} from 'lucide-react';

const ControlPanel = () => {
  const { 
    texts, selectedTextId, updateText, addText,
    bgColor, setBgColor, bgImage, setBgImage, customFonts, addCustomFont,
    bgBlur, setBgBlur, bgBrightness, setBgBrightness,
    moveLayerUp, moveLayerDown, centerTextOnCanvas
  } = useEditorStore();

  const [activeTab, setActiveTab] = useState<'bg' | 'edit' | 'effects'>('edit');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedText = texts.find((t) => t.id === selectedTextId);
  const bgColors = ['transparent', '#000000', '#18181b', '#27272a', '#ffffff', '#1e1e1e', '#172554', '#450a0a'];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setBgImage(URL.createObjectURL(file));
  };

  const handleFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fontName = file.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_');
      const fontUrl = URL.createObjectURL(file);
      const fontFace = new FontFace(fontName, `url(${fontUrl})`);
      fontFace.load().then((loadedFace) => {
        document.fonts.add(loadedFace);
        addCustomFont(fontName, fontUrl);
        if (selectedTextId) updateText(selectedTextId, { fontFamily: fontName });
      }).catch(err => alert("Font upload failed: " + err));
    }
  };

  return (
    <div className="flex flex-col h-full select-none bg-[#0c0c0e]">
      
      {/* --- SCROLLABLE WORKSPACE AREA --- */}
      <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-5 custom-scrollbar">

        {/* TAB 1: BACKGROUND */}
        {activeTab === 'bg' && (
          <div className="space-y-4 animate-in fade-in duration-200 pb-4">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase">Background Setup</h3>
            <div className="flex flex-wrap gap-3">
              {bgColors.map((color) => (
                <button
                  key={color}
                  onClick={() => { setBgColor(color); setBgImage(null); }}
                  className={`w-9 h-9 rounded-full border-2 transition-all ${bgColor === color && !bgImage ? 'border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.2)]' : 'border-zinc-800'}`}
                  style={color === 'transparent' ? { backgroundImage: 'repeating-conic-gradient(#3f3f46 0% 25%, transparent 0% 50%)', backgroundSize: '10px 10px' } : { backgroundColor: color }}
                />
              ))}
              <label className="w-9 h-9 rounded-full border-2 border-dashed border-zinc-600 hover:border-zinc-400 flex items-center justify-center cursor-pointer transition-colors bg-zinc-900">
                <ImagePlus size={16} className="text-zinc-400" />
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
            
            {bgImage && (
              <div className="space-y-3 bg-zinc-950/80 p-3 rounded-xl border border-zinc-800 relative mt-4">
                <button onClick={() => setBgImage(null)} className="absolute top-2 right-2 p-1 text-zinc-500 hover:text-red-400 bg-zinc-900 rounded"><X size={14} /></button>
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-zinc-400"><label>Image Blur</label><span>{bgBlur}</span></div>
                  <input type="range" min="0" max="50" value={bgBlur} onChange={(e) => setBgBlur(Number(e.target.value))} className="w-full accent-white" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-zinc-400"><label>Brightness</label><span>{bgBrightness}%</span></div>
                  <input type="range" min="-100" max="100" value={bgBrightness} onChange={(e) => setBgBrightness(Number(e.target.value))} className="w-full accent-white" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* EMPTY STATE */}
        {(activeTab === 'edit' || activeTab === 'effects') && !selectedText && (
          <div className="h-full min-h-[150px] flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-xl text-zinc-500 text-xs text-center px-4 bg-zinc-950/30 gap-4 mt-4">
            <Sparkles size={24} className="text-zinc-700" />
            <span>Select a text layer to start editing.</span>
            <button onClick={() => addText({})} className="bg-white text-black px-5 py-2 rounded-full font-semibold shadow-lg">Create New Text</button>
          </div>
        )}

        {/* TAB 2: TEXT EDIT */}
        {activeTab === 'edit' && selectedText && (
          <div className="space-y-4 animate-in fade-in duration-200 pb-4">
            
            <div className="flex gap-2 bg-zinc-950 p-1.5 rounded-lg border border-zinc-800">
              <button onClick={() => centerTextOnCanvas(selectedText.id, 1080, 1920)} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] text-zinc-300 hover:text-white bg-zinc-900 rounded transition-colors"><Focus size={13} /> Center</button>
              <div className="w-px bg-zinc-800 my-1 mx-1"></div>
              <button onClick={() => moveLayerUp(selectedText.id)} className="px-3 text-zinc-400 hover:text-white bg-zinc-900 rounded"><MoveUp size={14} /></button>
              <button onClick={() => moveLayerDown(selectedText.id)} className="px-3 text-zinc-400 hover:text-white bg-zinc-900 rounded"><MoveDown size={14} /></button>
            </div>

            <textarea
              value={selectedText.text}
              onChange={(e) => updateText(selectedText.id, { text: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-zinc-500 resize-none h-16 shadow-inner"
              placeholder="Write quote here..."
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-zinc-500">Align</label>
                <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                  {['left', 'center', 'right'].map((alignOpt) => (
                    <button key={alignOpt} onClick={() => updateText(selectedText.id, { align: alignOpt as any })} className={`flex-1 flex justify-center py-1.5 rounded text-zinc-400 ${selectedText.align === alignOpt ? 'bg-zinc-800 text-white' : 'hover:text-white'}`}>
                      {alignOpt === 'left' && <AlignLeft size={14} />}
                      {alignOpt === 'center' && <AlignCenter size={14} />}
                      {alignOpt === 'right' && <AlignRight size={14} />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-zinc-500">Color Palette</label>
                <div className="flex gap-2 flex-wrap">
                  {['#FFFFFF', '#A1A1AA', '#FCA5A5', '#000000'].map((color) => (
                    <button key={color} onClick={() => updateText(selectedText.id, { fill: color })} className={`w-6 h-6 rounded-full border-2 ${selectedText.fill === color ? 'border-blue-500 scale-110' : 'border-zinc-800'}`} style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3 bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-zinc-500">
                  <label>Font Family</label>
                  <span className="text-blue-400 cursor-pointer flex items-center gap-1" onClick={() => fileInputRef.current?.click()}><UploadCloud size={11} /> Upload</span>
                </div>
                <input type="file" ref={fileInputRef} accept=".ttf,.otf,.woff" onChange={handleFontUpload} className="hidden" />
                
                <select value={selectedText.fontFamily} onChange={(e) => updateText(selectedText.id, { fontFamily: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none">
                  {/* কাস্টমাইজড লোকাল ফন্ট গ্রুপ */}
                  <optgroup label="Permanent Files">
                    <option value="'Mont Blanc'">Mont Blanc (Premium Local)</option>
                  </optgroup>
                  <optgroup label="Uploaded Custom Fonts">{customFonts.map(font => <option key={font.name} value={font.name}>{font.name}</option>)}</optgroup>
                  <optgroup label="Aesthetic Presets">
                    <option value="sans-serif">System Default</option>
                    <option value="'Playfair Display', serif">Playfair (Elegant)</option>
                    <option value="'Cinzel', serif">Cinzel (Luxury)</option>
                    <option value="'Cormorant Garamond', serif">Cormorant (Cinematic)</option>
                    <option value="'Inter', sans-serif">Inter (Modern)</option>
                  </optgroup>
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-zinc-400"><label>Font Size</label><span>{selectedText.fontSize}px</span></div>
                <input type="range" min="12" max="150" value={selectedText.fontSize} onChange={(e) => updateText(selectedText.id, { fontSize: Number(e.target.value) })} className="w-full accent-white" />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EFFECTS */}
        {activeTab === 'effects' && selectedText && (
          <div className="space-y-4 animate-in fade-in duration-200 pb-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><div className="flex justify-between text-[11px] text-zinc-400"><label>Spacing</label><span>{selectedText.letterSpacing}px</span></div><input type="range" min="-5" max="30" value={selectedText.letterSpacing} onChange={(e) => updateText(selectedText.id, { letterSpacing: Number(e.target.value) })} className="w-full accent-white" /></div>
              <div className="space-y-1"><div className="flex justify-between text-[11px] text-zinc-400"><label>Line Height</label><span>{selectedText.lineHeight || 1.2}</span></div><input type="range" min="0.5" max="3" step="0.1" value={selectedText.lineHeight || 1.2} onChange={(e) => updateText(selectedText.id, { lineHeight: Number(e.target.value) })} className="w-full accent-white" /></div>
            </div>

            <div className="space-y-3 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
              <h4 className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">Stroke / Outline</h4>
              <div className="space-y-1"><div className="flex justify-between text-[11px] text-zinc-400"><label>Thickness</label><span>{selectedText.strokeWidth || 0}px</span></div><input type="range" min="0" max="10" step="0.5" value={selectedText.strokeWidth || 0} onChange={(e) => updateText(selectedText.id, { strokeWidth: Number(e.target.value) })} className="w-full accent-white" /></div>
              <div className="flex gap-2">
                {['transparent', '#000000', '#FFFFFF', '#EF4444', '#F59E0B'].map((color) => (
                  <button key={color} onClick={() => updateText(selectedText.id, { stroke: color })} className={`w-6 h-6 rounded border ${selectedText.stroke === color ? 'border-white scale-110' : 'border-zinc-800'}`} style={color === 'transparent' ? { backgroundImage: 'repeating-conic-gradient(#3f3f46 0% 25%, transparent 0% 50%)', backgroundSize: '6px 6px' } : { backgroundColor: color }} />
                ))}
              </div>
            </div>

            <div className="space-y-3 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
              <h4 className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">Shadow & Glow</h4>
              <div className="space-y-1"><div className="flex justify-between text-[11px] text-zinc-400"><label>Blur Amount</label><span>{selectedText.shadowBlur || 0}</span></div><input type="range" min="0" max="50" value={selectedText.shadowBlur || 0} onChange={(e) => updateText(selectedText.id, { shadowBlur: Number(e.target.value) })} className="w-full accent-white" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><div className="flex justify-between text-[10px] text-zinc-400"><label>Offset X</label><span>{selectedText.shadowOffsetX || 0}</span></div><input type="range" min="-30" max="30" value={selectedText.shadowOffsetX || 0} onChange={(e) => updateText(selectedText.id, { shadowOffsetX: Number(e.target.value) })} className="w-full accent-white" /></div>
                <div className="space-y-1"><div className="flex justify-between text-[10px] text-zinc-400"><label>Offset Y</label><span>{selectedText.shadowOffsetY || 0}</span></div><input type="range" min="-30" max="30" value={selectedText.shadowOffsetY || 0} onChange={(e) => updateText(selectedText.id, { shadowOffsetY: Number(e.target.value) })} className="w-full accent-white" /></div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => updateText(selectedText.id, { shadowColor: '#000000' })} className={`flex-1 py-1.5 text-[11px] rounded border transition-colors ${selectedText.shadowColor === '#000000' ? 'bg-zinc-800 border-zinc-500 text-white shadow-sm' : 'border-zinc-800/50 text-zinc-500 bg-zinc-900/50'}`}>Dark Shadow</button>
                <button onClick={() => updateText(selectedText.id, { shadowColor: '#FFFFFF' })} className={`flex-1 py-1.5 text-[11px] rounded border transition-colors ${selectedText.shadowColor === '#FFFFFF' ? 'bg-white border-white text-black font-semibold shadow-sm' : 'border-zinc-800/50 text-zinc-500 bg-zinc-900/50'}`}>Light Glow</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- BOTTOM NAVIGATION TABS --- */}
      <div className="flex gap-1 border-t border-zinc-900 bg-[#09090b] p-2 pb-4 shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.5)] z-20">
        <button onClick={() => setActiveTab('bg')} className={`flex-1 flex flex-col justify-center items-center gap-1.5 py-2.5 rounded-xl transition-all ${activeTab === 'bg' ? 'bg-zinc-900 text-white shadow-inner' : 'text-zinc-500 hover:text-zinc-300'}`}>
          <Palette size={18} />
          <span className="text-[10px] font-medium">Background</span>
        </button>
        <button onClick={() => setActiveTab('edit')} className={`flex-1 flex flex-col justify-center items-center gap-1.5 py-2.5 rounded-xl transition-all ${activeTab === 'edit' ? 'bg-zinc-900 text-white shadow-inner' : 'text-zinc-500 hover:text-zinc-300'}`}>
          <Type size={18} />
          <span className="text-[10px] font-medium">Text Edit</span>
        </button>
        <button onClick={() => setActiveTab('effects')} className={`flex-1 flex flex-col justify-center items-center gap-1.5 py-2.5 rounded-xl transition-all ${activeTab === 'effects' ? 'bg-zinc-900 text-white shadow-inner' : 'text-zinc-500 hover:text-zinc-300'}`}>
          <Sparkles size={18} />
          <span className="text-[10px] font-medium">Effects</span>
        </button>
      </div>

    </div>
  );
};

export default ControlPanel;