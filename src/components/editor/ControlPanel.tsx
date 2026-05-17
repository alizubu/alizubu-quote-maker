'use client';

import React, { useRef } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { 
  AlignLeft, AlignCenter, AlignRight, Plus, Trash2, ImagePlus, X, 
  MoveUp, MoveDown, Focus, Eye, EyeOff, Lock, Unlock, Copy, UploadCloud 
} from 'lucide-react';

const ControlPanel = () => {
  const { 
    texts, selectedTextId, updateText, addText, deleteText, duplicateText,
    bgColor, setBgColor, bgImage, setBgImage, customFonts, addCustomFont,
    bgBlur, setBgBlur, bgBrightness, setBgBrightness,
    moveLayerUp, moveLayerDown, centerTextOnCanvas, toggleVisibility, toggleLock, setSelectedText
  } = useEditorStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedText = texts.find((t) => t.id === selectedTextId);
  const bgColors = ['transparent', '#000000', '#18181b', '#27272a', '#ffffff'];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setBgImage(URL.createObjectURL(file));
  };

  // এক্সটার্নাল লোকাল ফন্ট আপলোড (.ttf, .otf, .woff)
  const handleFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fontName = file.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_');
      const fontUrl = URL.createObjectURL(file);
      
      // FontFace API দিয়ে ব্রাউজারে ফন্ট লোড করা
      const fontFace = new FontFace(fontName, `url(${fontUrl})`);
      fontFace.load().then((loadedFace) => {
        document.fonts.add(loadedFace);
        addCustomFont(fontName, fontUrl);
        if (selectedTextId) {
          updateText(selectedTextId, { fontFamily: fontName });
        }
      }).catch(err => alert("Font upload failed: " + err));
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto pb-10 pr-1 select-none">
      
      {/* --- BACKGROUND SETTINGS --- */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Canvas Background</h3>
        <div className="flex gap-3">
          {bgColors.map((color) => (
            <button
              key={color}
              onClick={() => { setBgColor(color); setBgImage(null); }}
              className={`w-8 h-8 rounded-full border-2 transition-all ${bgColor === color && !bgImage ? 'border-white scale-110 shadow-lg' : 'border-zinc-800 hover:scale-105'}`}
              style={color === 'transparent' ? { backgroundImage: 'repeating-conic-gradient(#3f3f46 0% 25%, transparent 0% 50%)', backgroundSize: '10px 10px' } : { backgroundColor: color }}
            />
          ))}
          <label className="w-8 h-8 rounded-full border-2 border-zinc-800 hover:border-zinc-600 flex items-center justify-center cursor-pointer transition-colors bg-zinc-900">
            <ImagePlus size={14} className="text-zinc-400" />
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        </div>

        {bgImage && (
          <div className="space-y-3 bg-zinc-900/40 p-3 rounded-lg border border-zinc-800 relative mt-2">
            <button onClick={() => setBgImage(null)} className="absolute top-2 right-2 text-zinc-500 hover:text-red-400"><X size={14} /></button>
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-zinc-500"><label>Blur</label><span>{bgBlur}</span></div>
              <input type="range" min="0" max="50" value={bgBlur} onChange={(e) => setBgBlur(Number(e.target.value))} className="w-full accent-white" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-zinc-500"><label>Brightness</label><span>{bgBrightness}%</span></div>
              <input type="range" min="-100" max="100" value={bgBrightness} onChange={(e) => setBgBrightness(Number(e.target.value))} className="w-full accent-white" />
            </div>
          </div>
        )}
      </div>

      <hr className="border-zinc-900" />

      {/* --- ৩. LAYERS WINDOW PANEL --- */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Layers Window</h3>
          <button onClick={() => addText({})} className="flex items-center gap-1 text-[11px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-2.5 py-1 rounded-md text-white transition-colors">
            <Plus size={12} /> New Layer
          </button>
        </div>
        
        <div className="max-h-40 overflow-y-auto border border-zinc-900 bg-zinc-950/50 rounded-lg p-1.5 space-y-1">
          {texts.map((layer, idx) => (
            <div 
              key={layer.id} 
              onClick={() => setSelectedText(layer.id)}
              className={`flex items-center justify-between p-2 rounded-md text-xs border cursor-pointer transition-all ${selectedTextId === layer.id ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-transparent border-transparent text-zinc-400 hover:bg-zinc-900/30'}`}
            >
              <span className="truncate max-w-[120px] font-mono text-[11px]">
                {idx + 1}. {layer.text.substring(0, 15) || "Empty Text"}
              </span>
              
              {/* লেয়ার কুইক অ্যাকশন বাটনসমূহ */}
              <div className="flex items-center gap-1.5 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => toggleVisibility(layer.id)} className="p-1 hover:text-white transition-colors">
                  {layer.visible ? <Eye size={13} /> : <EyeOff size={13} className="text-red-500" />}
                </button>
                <button onClick={() => toggleLock(layer.id)} className="p-1 hover:text-white transition-colors">
                  {layer.locked ? <Lock size={13} className="text-amber-500" /> : <Unlock size={13} />}
                </button>
                <button onClick={() => duplicateText(layer.id)} className="p-1 hover:text-white transition-colors" title="Duplicate">
                  <Copy size={13} />
                </button>
                <button onClick={() => deleteText(layer.id)} className="p-1 text-zinc-600 hover:text-red-400 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-zinc-900" />

      {/* --- TYPOGRAPHY EDITING CONTROLS --- */}
      <div className="space-y-4 flex-1">
        {selectedText ? (
          <div className="space-y-5 animate-in fade-in duration-200">
            
            {/* Quick Layout Positioning */}
            <div className="flex gap-2 bg-zinc-950 p-1.5 rounded-lg border border-zinc-900">
              <button onClick={() => centerTextOnCanvas(selectedText.id, 1080, 1920)} className="flex-1 flex items-center justify-center gap-1 py-1 text-[11px] text-zinc-400 hover:text-white bg-zinc-900 rounded transition-colors"><Focus size={12} /> Center</button>
              <button onClick={() => moveLayerUp(selectedText.id)} className="p-1 text-zinc-400 hover:text-white bg-zinc-900 rounded"><MoveUp size={13} /></button>
              <button onClick={() => moveLayerDown(selectedText.id)} className="p-1 text-zinc-400 hover:text-white bg-zinc-900 rounded"><MoveDown size={13} /></button>
            </div>

            {/* Inline Text Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-zinc-500">Content Input</label>
              <textarea
                value={selectedText.text}
                onChange={(e) => updateText(selectedText.id, { text: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-zinc-700 resize-none h-16 font-sans"
              />
            </div>

            {/* ৪. EXTERNAL LOCAL FONT UPLOAD SETTINGS */}
            <div className="space-y-2">
              <label className="text-[11px] text-zinc-500 flex justify-between">
                <span>Font & Typography</span>
                <span className="text-blue-400 text-[10px] cursor-pointer flex items-center gap-0.5" onClick={() => fileInputRef.current?.click()}>
                  <UploadCloud size={11} /> Upload .ttf/.otf
                </span>
              </label>
              <input type="file" ref={fileInputRef} accept=".ttf,.otf,.woff" onChange={handleFontUpload} className="hidden" />
              
              <select
                value={selectedText.fontFamily}
                onChange={(e) => updateText(selectedText.id, { fontFamily: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2 text-xs text-white focus:outline-none cursor-pointer"
              >
                <optgroup label="Uploaded Custom Fonts" className="bg-zinc-950">
                  {customFonts.map(font => <option key={font.name} value={font.name}>{font.name} (Custom)</option>)}
                </optgroup>
                <optgroup label="Aesthetic Presets" className="bg-zinc-950">
                  <option value="sans-serif">System Default</option>
                  <option value="'Playfair Display', serif">Playfair Display (Elegant)</option>
                  <option value="'Cinzel', serif">Cinzel (Luxury Serif)</option>
                  <option value="'Cormorant Garamond', serif">Cormorant (Cinematic)</option>
                  <option value="'Inter', sans-serif">Inter (Modern Clean)</option>
                </optgroup>
              </select>
            </div>

            {/* Size & Spacing Controls */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-zinc-500"><label>Font Size</label><span>{selectedText.fontSize}px</span></div>
                <input type="range" min="12" max="150" value={selectedText.fontSize} onChange={(e) => updateText(selectedText.id, { fontSize: Number(e.target.value) })} className="w-full accent-white" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-zinc-500"><label>Spacing</label><span>{selectedText.letterSpacing}px</span></div>
                <input type="range" min="-5" max="30" value={selectedText.letterSpacing} onChange={(e) => updateText(selectedText.id, { letterSpacing: Number(e.target.value) })} className="w-full accent-white" />
              </div>
            </div>

            {/* Alignment & Fill Color */}
            <div className="grid grid-cols-2 gap-4 items-center">
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-500">Align</label>
                <div className="flex bg-zinc-950 p-0.5 rounded-md border border-zinc-900">
                  {['left', 'center', 'right'].map((alignOpt) => (
                    <button
                      key={alignOpt}
                      onClick={() => updateText(selectedText.id, { align: alignOpt as any })}
                      className={`flex-1 flex justify-center py-1 rounded text-zinc-500 ${selectedText.align === alignOpt ? 'bg-zinc-900 text-white' : 'hover:text-white'}`}
                    >
                      {alignOpt === 'left' && <AlignLeft size={14} />}
                      {alignOpt === 'center' && <AlignCenter size={14} />}
                      {alignOpt === 'right' && <AlignRight size={14} />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-500">Color Palette</label>
                <div className="flex gap-2">
                  {['#FFFFFF', '#A1A1AA', '#FCA5A5', '#000000'].map((color) => (
                    <button key={color} onClick={() => updateText(selectedText.id, { fill: color })} className={`w-5 h-5 rounded-full border ${selectedText.fill === color ? 'border-blue-500 scale-110' : 'border-zinc-800'}`} style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
            </div>

            {/* --- ২. TEXT STROKE (OUTLINE) CONTROLS --- */}
            <div className="space-y-3 bg-zinc-950/40 p-3 rounded-lg border border-zinc-900">
              <h4 className="text-[11px] font-medium text-zinc-400">Text Outline (Stroke)</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] text-zinc-500"><label>Stroke Width</label><span>{selectedText.strokeWidth || 0}px</span></div>
                <input type="range" min="0" max="10" step="0.5" value={selectedText.strokeWidth || 0} onChange={(e) => updateText(selectedText.id, { strokeWidth: Number(e.target.value) })} className="w-full accent-white" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-500">Stroke Color</label>
                <div className="flex gap-2">
                  {['transparent', '#000000', '#FFFFFF', '#EF4444', '#F59E0B'].map((color) => (
                    <button 
                      key={color} 
                      onClick={() => updateText(selectedText.id, { stroke: color })} 
                      className={`w-5 h-5 rounded border ${selectedText.stroke === color ? 'border-white scale-110' : 'border-zinc-800'}`} 
                      style={color === 'transparent' ? { backgroundImage: 'repeating-conic-gradient(#3f3f46 0% 25%, transparent 0% 50%)', backgroundSize: '6px 6px' } : { backgroundColor: color }} 
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* --- ১. TEXT SHADOW / GLOW POSITIONS --- */}
            <div className="space-y-3 bg-zinc-950/40 p-3 rounded-lg border border-zinc-900">
              <h4 className="text-[11px] font-medium text-zinc-400">Text Shadow & Glow Positioning</h4>
              
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] text-zinc-500"><label>Blur Radius</label><span>{selectedText.shadowBlur || 0}</span></div>
                <input type="range" min="0" max="50" value={selectedText.shadowBlur || 0} onChange={(e) => updateText(selectedText.id, { shadowBlur: Number(e.target.value) })} className="w-full accent-white" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-zinc-500"><label>Offset X</label><span>{selectedText.shadowOffsetX || 0}px</span></div>
                  <input type="range" min="-30" max="30" value={selectedText.shadowOffsetX || 0} onChange={(e) => updateText(selectedText.id, { shadowOffsetX: Number(e.target.value) })} className="w-full accent-white" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-zinc-500"><label>Offset Y</label><span>{selectedText.shadowOffsetY || 0}px</span></div>
                  <input type="range" min="-30" max="30" value={selectedText.shadowOffsetY || 0} onChange={(e) => updateText(selectedText.id, { shadowOffsetY: Number(e.target.value) })} className="w-full accent-white" />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={() => updateText(selectedText.id, { shadowColor: '#000000' })} className={`flex-1 py-1 text-[11px] rounded border transition-colors ${selectedText.shadowColor === '#000000' ? 'bg-zinc-900 border-zinc-600 text-white' : 'border-zinc-900 text-zinc-500'}`}>Dark Shadow</button>
                <button onClick={() => updateText(selectedText.id, { shadowColor: '#FFFFFF' })} className={`flex-1 py-1 text-[11px] rounded border transition-colors ${selectedText.shadowColor === '#FFFFFF' ? 'bg-white border-white text-black font-medium' : 'border-zinc-900 text-zinc-500'}`}>Light Glow</button>
              </div>
            </div>

          </div>
        ) : (
          <div className="h-40 flex items-center justify-center border border-dashed border-zinc-900 rounded-lg text-zinc-500 text-xs text-center px-4 bg-zinc-900/10">
            Select or add a text layer from the Layers Window to start editing.
          </div>
        )}
      </div>
    </div>
  );
};

export default ControlPanel;