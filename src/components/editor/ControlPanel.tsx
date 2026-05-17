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

  // মোবাইল ট্যাব স্টেট
  const [activeTab, setActiveTab] = useState<'bg' | 'edit' | 'effects'>('edit');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedText = texts.find((t) => t.id === selectedTextId);
  const bgColors = ['transparent', '#000000', '#18181b', '#27272a', '#ffffff'];

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
    <div className="flex flex-col h-full select-none">
      
      {/* --- TOP TABS NAVIGATION --- */}
      <div className="flex gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-900 mb-4 shrink-0">
        <button onClick={() => setActiveTab('bg')} className={`flex-1 flex justify-center items-center gap-1.5 py-2.5 text-[11px] rounded-lg transition-all ${activeTab === 'bg' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>
          <Palette size={14} /> Background
        </button>
        <button onClick={() => setActiveTab('edit')} className={`flex-1 flex justify-center items-center gap-1.5 py-2.5 text-[11px] rounded-lg transition-all ${activeTab === 'edit' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>
          <Type size={14} /> Text Edit
        </button>
        <button onClick={() => setActiveTab('effects')} className={`flex-1 flex justify-center items-center gap-1.5 py-2.5 text-[11px] rounded-lg transition-all ${activeTab === 'effects' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>
          <Sparkles size={14} /> Effects
        </button>
      </div>

      {/* --- SCROLLABLE CONTENT AREA --- */}
      <div className="flex-1 overflow-y-auto pr-1 pb-6 space-y-5">

        {/* TAB 1: BACKGROUND */}
        {activeTab === 'bg' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-wrap gap-3">
              {bgColors.map((color) => (
                <button
                  key={color}
                  onClick={() => { setBgColor(color); setBgImage(null); }}
                  className={`w-9 h-9 rounded-full border-2 transition-all ${bgColor === color && !bgImage ? 'border-white scale-110 shadow-lg' : 'border-zinc-800'}`}
                  style={color === 'transparent' ? { backgroundImage: 'repeating-conic-gradient(#3f3f46 0% 25%, transparent 0% 50%)', backgroundSize: '10px 10px' } : { backgroundColor: color }}
                />
              ))}
              <label className="w-9 h-9 rounded-full border-2 border-zinc-800 hover:border-zinc-600 flex items-center justify-center cursor-pointer transition-colors bg-zinc-900">
                <ImagePlus size={16} className="text-zinc-400" />
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
            {bgImage && (
              <div className="space-y-4 bg-zinc-950/50 p-4 rounded-xl border border-zinc-900 relative">
                <button onClick={() => setBgImage(null)} className="absolute top-2 right-2 p-1 text-zinc-500 hover:text-red-400 bg-zinc-900 rounded"><X size={14} /></button>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-zinc-500"><label>Image Blur</label><span>{bgBlur}</span></div>
                  <input type="range" min="0" max="50" value={bgBlur} onChange={(e) => setBgBlur(Number(e.target.value))} className="w-full accent-white" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-zinc-500"><label>Brightness</label><span>{bgBrightness}%</span></div>
                  <input type="range" min="-100" max="100" value={bgBrightness} onChange={(e) => setBgBrightness(Number(e.target.value))} className="w-full accent-white" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2 & 3: REQUIRE SELECTED TEXT */}
        {(activeTab === 'edit' || activeTab === 'effects') && !selectedText && (
          <div className="h-32 flex flex-col items-center justify-center border border-dashed border-zinc-900 rounded-xl text-zinc-500 text-xs text-center px-4 bg-zinc-950/30 gap-3">
            <span>Select a text layer or create a new one.</span>
            <button onClick={() => addText({})} className="bg-white text-black px-4 py-1.5 rounded-full font-medium">Add Text</button>
          </div>
        )}

        {/* TAB 2: TEXT EDIT */}
        {activeTab === 'edit' && selectedText && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex gap-2 bg-zinc-950 p-1.5 rounded-lg border border-zinc-900">
              <button onClick={() => centerTextOnCanvas(selectedText.id, 1080, 1920)} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] text-zinc-400 hover:text-white bg-zinc-900 rounded transition-colors"><Focus size={12} /> Center</button>
              <button onClick={() => moveLayerUp(selectedText.id)} className="p-1.5 text-zinc-400 hover:text-white bg-zinc-900 rounded"><MoveUp size={14} /></button>
              <button onClick={() => moveLayerDown(selectedText.id)} className="p-1.5 text-zinc-400 hover:text-white bg-zinc-900 rounded"><MoveDown size={14} /></button>
            </div>

            <div className="space-y-1.5">
              <textarea
                value={selectedText.text}
                onChange={(e) => updateText(selectedText.id, { text: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-zinc-700 resize-none h-20"
                placeholder="Write quote here..."
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-[11px] text-zinc-500">
                <label>Typography</label>
                <span className="text-blue-400 cursor-pointer flex items-center gap-1" onClick={() => fileInputRef.current?.click()}><UploadCloud size={12} /> Add Font</span>
              </div>
              <input type="file" ref={fileInputRef} accept=".ttf,.otf,.woff" onChange={handleFontUpload} className="hidden" />
              <select
                value={selectedText.fontFamily}
                onChange={(e) => updateText(selectedText.id, { fontFamily: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-xs text-white focus:outline-none"
              >
                <optgroup label="Custom Fonts">{customFonts.map(font => <option key={font.name} value={font.name}>{font.name}</option>)}</optgroup>
                <optgroup label="Presets">
                  <option value="sans-serif">System Default</option>
                  <option value="'Playfair Display', serif">Playfair Display (Elegant)</option>
                  <option value="'Cinzel', serif">Cinzel (Luxury)</option>
                  <option value="'Inter', sans-serif">Inter (Modern)</option>
                </optgroup>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] text-zinc-500">Align</label>
                <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-900">
                  {['left', 'center', 'right'].map((alignOpt) => (
                    <button key={alignOpt} onClick={() => updateText(selectedText.id, { align: alignOpt as any })} className={`flex-1 flex justify-center py-1.5 rounded-md ${selectedText.align === alignOpt ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}>
                      {alignOpt === 'left' && <AlignLeft size={14} />}
                      {alignOpt === 'center' && <AlignCenter size={14} />}
                      {alignOpt === 'right' && <AlignRight size={14} />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] text-zinc-500">Color</label>
                <div className="flex gap-2">
                  {['#FFFFFF', '#A1A1AA', '#FCA5A5', '#000000'].map((color) => (
                    <button key={color} onClick={() => updateText(selectedText.id, { fill: color })} className={`w-7 h-7 rounded-full border-2 ${selectedText.fill === color ? 'border-blue-500 scale-110' : 'border-zinc-800'}`} style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-zinc-500"><label>Font Size</label><span>{selectedText.fontSize}px</span></div>
              <input type="range" min="12" max="150" value={selectedText.fontSize} onChange={(e) => updateText(selectedText.id, { fontSize: Number(e.target.value) })} className="w-full accent-white" />
            </div>
          </div>
        )}

        {/* TAB 3: EFFECTS */}
        {activeTab === 'effects' && selectedText && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><div className="flex justify-between text-[11px] text-zinc-500"><label>Spacing</label><span>{selectedText.letterSpacing}px</span></div><input type="range" min="-5" max="30" value={selectedText.letterSpacing} onChange={(e) => updateText(selectedText.id, { letterSpacing: Number(e.target.value) })} className="w-full accent-white" /></div>
              <div className="space-y-1.5"><div className="flex justify-between text-[11px] text-zinc-500"><label>Line Height</label><span>{selectedText.lineHeight || 1.2}</span></div><input type="range" min="0.5" max="3" step="0.1" value={selectedText.lineHeight || 1.2} onChange={(e) => updateText(selectedText.id, { lineHeight: Number(e.target.value) })} className="w-full accent-white" /></div>
            </div>

            <div className="space-y-3 bg-zinc-950/40 p-3 rounded-xl border border-zinc-900">
              <h4 className="text-[11px] font-medium text-zinc-400">Stroke / Outline</h4>
              <div className="space-y-2"><div className="flex justify-between text-[11px] text-zinc-500"><label>Width</label><span>{selectedText.strokeWidth || 0}px</span></div><input type="range" min="0" max="10" step="0.5" value={selectedText.strokeWidth || 0} onChange={(e) => updateText(selectedText.id, { strokeWidth: Number(e.target.value) })} className="w-full accent-white" /></div>
              <div className="flex gap-2">
                {['transparent', '#000000', '#FFFFFF', '#EF4444'].map((color) => (
                  <button key={color} onClick={() => updateText(selectedText.id, { stroke: color })} className={`w-6 h-6 rounded border ${selectedText.stroke === color ? 'border-white scale-110' : 'border-zinc-800'}`} style={color === 'transparent' ? { backgroundImage: 'repeating-conic-gradient(#3f3f46 0% 25%, transparent 0% 50%)', backgroundSize: '6px 6px' } : { backgroundColor: color }} />
                ))}
              </div>
            </div>

            <div className="space-y-3 bg-zinc-950/40 p-3 rounded-xl border border-zinc-900">
              <h4 className="text-[11px] font-medium text-zinc-400">Shadow / Glow</h4>
              <div className="space-y-2"><div className="flex justify-between text-[11px] text-zinc-500"><label>Blur</label><span>{selectedText.shadowBlur || 0}</span></div><input type="range" min="0" max="50" value={selectedText.shadowBlur || 0} onChange={(e) => updateText(selectedText.id, { shadowBlur: Number(e.target.value) })} className="w-full accent-white" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><div className="flex justify-between text-[10px] text-zinc-500"><label>X</label><span>{selectedText.shadowOffsetX || 0}</span></div><input type="range" min="-30" max="30" value={selectedText.shadowOffsetX || 0} onChange={(e) => updateText(selectedText.id, { shadowOffsetX: Number(e.target.value) })} className="w-full accent-white" /></div>
                <div className="space-y-1"><div className="flex justify-between text-[10px] text-zinc-500"><label>Y</label><span>{selectedText.shadowOffsetY || 0}</span></div><input type="range" min="-30" max="30" value={selectedText.shadowOffsetY || 0} onChange={(e) => updateText(selectedText.id, { shadowOffsetY: Number(e.target.value) })} className="w-full accent-white" /></div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => updateText(selectedText.id, { shadowColor: '#000000' })} className={`flex-1 py-1.5 text-[11px] rounded-lg border transition-colors ${selectedText.shadowColor === '#000000' ? 'bg-zinc-800 border-zinc-600 text-white' : 'border-zinc-900 text-zinc-500'}`}>Dark</button>
                <button onClick={() => updateText(selectedText.id, { shadowColor: '#FFFFFF' })} className={`flex-1 py-1.5 text-[11px] rounded-lg border transition-colors ${selectedText.shadowColor === '#FFFFFF' ? 'bg-white border-white text-black' : 'border-zinc-900 text-zinc-500'}`}>Light</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ControlPanel;