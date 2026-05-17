'use client';

import React, { useRef, useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { 
  AlignLeft, AlignCenter, AlignRight, ImagePlus, X, 
  MoveUp, MoveDown, Focus, UploadCloud, Type, Palette, Sparkles, Edit2,
  Undo2, Redo2, Maximize2, Move
} from 'lucide-react';

const ControlPanel = () => {
  const { 
    texts, selectedTextId, updateText, addText, bgColor, setBgColor, 
    bgImage, setBgImage, customFonts, addCustomFont, bgBlur, setBgBlur, 
    bgBrightness, setBgBrightness, bgScale, setBgScale, bgX, setBgX, bgY, setBgY,
    moveLayerUp, moveLayerDown, centerTextOnCanvas, setTypingOverlayOpen, aspectRatio,
    undo, redo, past, future // Undo/Redo অ্যাকশন ও স্ট্যাক ইমপোর্ট করা হলো
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
        addCustomFont(fontName, fontUrl, file); // ৩. এখানে file (Blob) পাস করা হলো পার্মানেন্টলি সেভের জন্য
        if (selectedTextId) updateText(selectedTextId, { fontFamily: fontName }); 
      }).catch(err => alert("Font error"));
    }
  };

  return (
    <div className="flex flex-col h-full select-none bg-gradient-to-b from-[#0c0c0e] to-[#050505] relative shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
      
      {/* --- ১. UNDO / REDO ENGINE HEADER BAR (Top of Panel) --- */}
      <div className="flex justify-between items-center px-5 py-2.5 border-b border-white/5 bg-black/20 shrink-0">
        <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">History Engine</span>
        <div className="flex gap-1">
          <button 
            onClick={undo} 
            disabled={past.length === 0}
            className={`p-1.5 rounded-lg transition-all flex items-center gap-1 text-xs ${past.length === 0 ? 'text-zinc-700 cursor-not-allowed' : 'text-zinc-300 hover:bg-white/5 hover:text-white active:scale-95'}`}
            title="Undo"
          >
            <Undo2 size={15} /> <span className="text-[11px]">Undo</span>
          </button>
          <div className="w-px bg-white/5 my-1 mx-1"></div>
          <button 
            onClick={redo} 
            disabled={future.length === 0}
            className={`p-1.5 rounded-lg transition-all flex items-center gap-1 text-xs ${future.length === 0 ? 'text-zinc-700 cursor-not-allowed' : 'text-zinc-300 hover:bg-white/5 hover:text-white active:scale-95'}`}
            title="Redo"
          >
            <span className="text-[11px]">Redo</span> <Redo2 size={15} />
          </button>
        </div>
      </div>

      {/* --- SCROLLABLE WORKSPACE AREA --- */}
      <div className="flex-1 overflow-y-auto min-h-0 p-5 space-y-6 custom-scrollbar">

        {/* TAB 1: BACKGROUND MANAGEMENT */}
        {activeTab === 'bg' && (
          <div className="space-y-5 animate-in slide-in-from-right-4 duration-300 pb-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2"><Palette size={14} className="text-blue-400"/> Canvas Background</h3>
            <div className="flex flex-wrap gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm shadow-inner">
              {bgColors.map((color) => (
                <button key={color} onClick={() => { setBgColor(color); setBgImage(null); }} className={`w-10 h-10 rounded-full border-2 transition-all duration-300 ${bgColor === color && !bgImage ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'border-zinc-700/50 hover:scale-105 hover:border-zinc-500'}`} style={color === 'transparent' ? { backgroundImage: 'repeating-conic-gradient(#3f3f46 0% 25%, transparent 0% 50%)', backgroundSize: '10px 10px' } : { backgroundColor: color }} />
              ))}
              <label className="w-10 h-10 rounded-full border-2 border-dashed border-zinc-500 hover:border-white hover:text-white flex items-center justify-center cursor-pointer transition-all duration-300 bg-zinc-900 text-zinc-400 hover:scale-105 shadow-lg">
                <ImagePlus size={18} />
                <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if(f) setBgImage(URL.createObjectURL(f)); }} className="hidden" />
              </label>
            </div>
            
            {/* ২. ছবির সাইজ এবং ডানে-বামে সরানোর সম্পূর্ণ কন্ট্রোল প্যানেল (Image Transformer Options) */}
            {bgImage && (
              <div className="space-y-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md shadow-lg">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h4 className="text-[11px] font-bold uppercase text-blue-400 tracking-wider flex items-center gap-1.5"><Maximize2 size={13}/> Image Geometry</h4>
                  <button onClick={() => setBgImage(null)} className="p-1 text-zinc-400 hover:text-red-400 bg-black/40 rounded-full transition-colors"><X size={12} /></button>
                </div>
                
                {/* ২. সাইজ বড়-ছোট করার বার (Zoom Scale) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-medium text-zinc-300"><label>Image Size (Zoom)</label><span className="text-blue-400">{Math.round(bgScale * 100)}%</span></div>
                  <input type="range" min="0.5" max="4" step="0.05" value={bgScale} onChange={(e) => setBgScale(Number(e.target.value))} className="w-full accent-blue-500" />
                </div>

                {/* ২. ডানে-বামে সরানোর বার (Horizontal Offset X) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-medium text-zinc-300"><label>Position X (Horizontal)</label><span className="text-blue-400">{bgX}px</span></div>
                  <input type="range" min="-1000" max="1000" step="1" value={bgX} onChange={(e) => setBgX(Number(e.target.value))} className="w-full accent-blue-500" />
                </div>

                {/* ২. উপরে-নিচে সরানোর বার (Vertical Offset Y) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-medium text-zinc-300"><label>Position Y (Vertical)</label><span className="text-blue-400">{bgY}px</span></div>
                  <input type="range" min="-1000" max="1000" step="1" value={bgY} onChange={(e) => setBgY(Number(e.target.value))} className="w-full accent-blue-500" />
                </div>

                <div className="w-full border-t border-white/5 pt-2 flex gap-2">
                  <button onClick={() => { setBgScale(1); setBgX(0); setBgY(0); }} className="w-full text-center py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] font-bold text-zinc-400 uppercase tracking-wide transition-colors">Reset Image Transformation</button>
                </div>

                {/* ফিল্টার স্লাইডারসমূহ */}
                <div className="border-t border-white/5 pt-3 space-y-3">
                  <div className="space-y-1.5"><div className="flex justify-between text-[11px] font-medium text-zinc-300"><label>Image Blur</label><span className="text-blue-400">{bgBlur}</span></div><input type="range" min="0" max="50" value={bgBlur} onChange={(e) => setBgBlur(Number(e.target.value))} className="w-full accent-blue-500" /></div>
                  <div className="space-y-1.5"><div className="flex justify-between text-[11px] font-medium text-zinc-300"><label>Brightness</label><span className="text-blue-400">{bgBrightness}%</span></div><input type="range" min="-100" max="100" value={bgBrightness} onChange={(e) => setBgBrightness(Number(e.target.value))} className="w-full accent-blue-500" /></div>
                </div>
              </div>
            )}
          </div>
        )}

        {(activeTab === 'edit' || activeTab === 'effects') && !selectedText && (
          <div className="h-full min-h-[200px] flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl text-zinc-400 text-sm text-center px-6 bg-gradient-to-b from-white/5 to-transparent gap-5 mt-4 shadow-inner">
            <div className="p-4 bg-blue-500/10 rounded-full"><Type size={32} className="text-blue-400" /></div>
            <p>Select a layer or tap the button below to start creating magic.</p>
            <button onClick={() => addText({})} className="bg-white text-black px-6 py-2.5 rounded-full font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-105 transition-transform active:scale-95">Add New Text</button>
          </div>
        )}

        {activeTab === 'edit' && selectedText && (
          <div className="space-y-5 animate-in slide-in-from-right-4 duration-300 pb-4">
            
            {/* Quick Actions */}
            <div className="flex gap-2 bg-white/5 p-1.5 rounded-xl border border-white/10 backdrop-blur-sm shadow-sm">
              <button onClick={() => centerTextOnCanvas(selectedText.id, currentCanvasWidth, currentCanvasHeight)} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-medium text-zinc-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"><Focus size={14} /> Center Frame</button>
              <div className="w-px bg-white/10 my-1 mx-1"></div>
              <button onClick={() => moveLayerUp(selectedText.id)} className="px-4 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"><MoveUp size={16} /></button>
              <button onClick={() => moveLayerDown(selectedText.id)} className="px-4 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"><MoveDown size={16} /></button>
            </div>

            {/* Smart Keyboard Triger Button */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 p-4 rounded-2xl flex justify-between items-center shadow-inner cursor-pointer hover:bg-white/5 transition-colors group" onClick={() => setTypingOverlayOpen(true)}>
               <div className="flex-1 min-w-0 pr-4">
                 <p className="text-[10px] uppercase text-blue-400 font-bold mb-1 tracking-wider">Content</p>
                 <p className="text-sm text-white truncate">{selectedText.text || "Empty..."}</p>
               </div>
               <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><Edit2 size={16} /></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Alignment</label>
                <div className="flex bg-white/5 p-1.5 rounded-xl border border-white/10">
                  {['left', 'center', 'right'].map((alignOpt) => (
                    <button key={alignOpt} onClick={() => { useEditorStore.getState().saveHistory(); updateText(selectedText.id, { align: alignOpt as any }); }} className={`flex-1 flex justify-center py-2 rounded-lg transition-all ${selectedText.align === alignOpt ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-white'}`}>
                      {alignOpt === 'left' && <AlignLeft size={16} />}
                      {alignOpt === 'center' && <AlignCenter size={16} />}
                      {alignOpt === 'right' && <AlignRight size={16} />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Color Palette</label>
                <div className="flex gap-2 flex-wrap bg-white/5 p-2 rounded-xl border border-white/10 justify-center">
                  {['#FFFFFF', '#A1A1AA', '#FCA5A5', '#000000'].map((color) => (
                    <button key={color} onClick={() => { useEditorStore.getState().saveHistory(); updateText(selectedText.id, { fill: color }); }} className={`w-7 h-7 rounded-full border-2 transition-transform ${selectedText.fill === color ? 'border-blue-500 scale-125 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'border-zinc-700/50 hover:scale-110'}`} style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Typography Section */}
            <div className="space-y-4 bg-white/5 p-4 rounded-2xl border border-white/10 shadow-lg">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  <label>Font Family</label>
                  <span className="text-blue-400 bg-blue-400/10 px-2 py-1 rounded-md cursor-pointer flex items-center gap-1 hover:bg-blue-400/20 transition-colors" onClick={() => fileInputRef.current?.click()}><UploadCloud size={12} /> Add Font</span>
                </div>
                <input type="file" ref={fileInputRef} accept=".ttf,.otf,.woff" onChange={handleFontUpload} className="hidden" />
                <select value={selectedText.fontFamily} onChange={(e) => { useEditorStore.getState().saveHistory(); updateText(selectedText.id, { fontFamily: e.target.value }); }} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors">
                  <optgroup label="Custom Fonts (Saved Forever)">{customFonts.map(font => <option key={font.name} value={font.name}>{font.name}</option>)}</optgroup>
                  <optgroup label="Aesthetic Presets">
                    <option value="'Mont Blanc', sans-serif">Mont Blanc (Premium)</option>
                    <option value="sans-serif">System Default</option>
                    <option value="'Playfair Display', serif">Playfair (Elegant)</option>
                    <option value="'Cinzel', serif">Cinzel (Luxury)</option>
                  </optgroup>
                </select>
              </div>
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-[11px] font-medium text-zinc-300"><label>Font Size</label><span className="text-blue-400">{selectedText.fontSize}px</span></div>
                {/* স্লাইডারে হাত দিলে যেন একগাদা হিস্ট্রি জমা না হয়, তাই মাউস আপ/টাচ এন্ডে ফাইনাল ডাটায় হিস্ট্রি রেডি হবে */}
                <input type="range" min="12" max="150" value={selectedText.fontSize} onMouseDown={() => useEditorStore.getState().saveHistory()} onTouchStart={() => useEditorStore.getState().saveHistory()} onChange={(e) => updateText(selectedText.id, { fontSize: Number(e.target.value) })} className="w-full accent-blue-500" />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EFFECTS CONTROLS */}
        {activeTab === 'effects' && selectedText && (
          <div className="space-y-5 animate-in slide-in-from-right-4 duration-300 pb-4">
             <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><div className="flex justify-between text-[11px] font-medium text-zinc-300"><label>Spacing</label><span className="text-blue-400">{selectedText.letterSpacing}px</span></div><input type="range" min="-5" max="30" value={selectedText.letterSpacing} onMouseDown={() => useEditorStore.getState().saveHistory()} onTouchStart={() => useEditorStore.getState().saveHistory()} onChange={(e) => updateText(selectedText.id, { letterSpacing: Number(e.target.value) })} className="w-full accent-blue-500" /></div>
              <div className="space-y-1.5"><div className="flex justify-between text-[11px] font-medium text-zinc-300"><label>Line Height</label><span className="text-blue-400">{selectedText.lineHeight || 1.2}</span></div><input type="range" min="0.5" max="3" step="0.1" value={selectedText.lineHeight || 1.2} onMouseDown={() => useEditorStore.getState().saveHistory()} onTouchStart={() => useEditorStore.getState().saveHistory()} onChange={(e) => updateText(selectedText.id, { lineHeight: Number(e.target.value) })} className="w-full accent-blue-500" /></div>
            </div>

            <div className="space-y-4 bg-white/5 p-4 rounded-2xl border border-white/10 shadow-lg">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Outline (Stroke)</h4>
              <div className="space-y-1.5"><div className="flex justify-between text-[11px] font-medium text-zinc-300"><label>Thickness</label><span className="text-white">{selectedText.strokeWidth || 0}px</span></div><input type="range" min="0" max="10" step="0.5" value={selectedText.strokeWidth || 0} onMouseDown={() => useEditorStore.getState().saveHistory()} onTouchStart={() => useEditorStore.getState().saveHistory()} onChange={(e) => updateText(selectedText.id, { strokeWidth: Number(e.target.value) })} className="w-full accent-blue-500" /></div>
              <div className="flex gap-2 pt-1">
                {['transparent', '#000000', '#FFFFFF', '#EF4444', '#F59E0B'].map((color) => (
                  <button key={color} onClick={() => { useEditorStore.getState().saveHistory(); updateText(selectedText.id, { stroke: color }); }} className={`w-8 h-8 rounded-full border-2 transition-transform ${selectedText.stroke === color ? 'border-white scale-125' : 'border-zinc-700 hover:scale-110'}`} style={color === 'transparent' ? { backgroundImage: 'repeating-conic-gradient(#3f3f46 0% 25%, transparent 0% 50%)', backgroundSize: '8px 8px' } : { backgroundColor: color }} />
                ))}
              </div>
            </div>

            <div className="space-y-4 bg-white/5 p-4 rounded-2xl border border-white/10 shadow-lg">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Shadow & Glow Positioning</h4>
              <div className="space-y-1.5"><div className="flex justify-between text-[11px] font-medium text-zinc-300"><label>Blur Amount</label><span className="text-white">{selectedText.shadowBlur || 0}</span></div><input type="range" min="0" max="50" value={selectedText.shadowBlur || 0} onMouseDown={() => useEditorStore.getState().saveHistory()} onTouchStart={() => useEditorStore.getState().saveHistory()} onChange={(e) => updateText(selectedText.id, { shadowBlur: Number(e.target.value) })} className="w-full accent-blue-500" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><div className="flex justify-between text-[10px] text-zinc-400"><label>Offset X</label><span>{selectedText.shadowOffsetX || 0}</span></div><input type="range" min="-30" max="30" value={selectedText.shadowOffsetX || 0} onMouseDown={() => useEditorStore.getState().saveHistory()} onTouchStart={() => useEditorStore.getState().saveHistory()} onChange={(e) => updateText(selectedText.id, { shadowOffsetX: Number(e.target.value) })} className="w-full accent-blue-500" /></div>
                <div className="space-y-1.5"><div className="flex justify-between text-[10px] text-zinc-400"><label>Offset Y</label><span>{selectedText.shadowOffsetY || 0}</span></div><input type="range" min="-30" max="30" value={selectedText.shadowOffsetY || 0} onMouseDown={() => useEditorStore.getState().saveHistory()} onTouchStart={() => useEditorStore.getState().saveHistory()} onChange={(e) => updateText(selectedText.id, { shadowOffsetY: Number(e.target.value) })} className="w-full accent-blue-500" /></div>
              </div>
              <div className="flex gap-3 pt-3">
                <button onClick={() => { useEditorStore.getState().saveHistory(); updateText(selectedText.id, { shadowColor: '#000000' }); }} className={`flex-1 py-2 text-xs font-medium rounded-xl border transition-all ${selectedText.shadowColor === '#000000' ? 'bg-zinc-800 border-zinc-500 text-white shadow-md' : 'border-white/10 text-zinc-400 hover:bg-white/5'}`}>Dark Shadow</button>
                <button onClick={() => { useEditorStore.getState().saveHistory(); updateText(selectedText.id, { shadowColor: '#FFFFFF' }); }} className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${selectedText.shadowColor === '#FFFFFF' ? 'bg-white border-white text-black shadow-md' : 'border-white/10 text-zinc-400 hover:bg-white/5'}`}>Light Glow</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- GLOSSY TABS FOOTER --- */}
      <div className="flex gap-2 p-3 bg-black/60 backdrop-blur-2xl border-t border-white/10 shrink-0 z-20 pb-5 md:pb-3">
        <button onClick={() => setActiveTab('bg')} className={`flex-1 flex flex-col justify-center items-center gap-1.5 py-3 rounded-2xl transition-all duration-300 ${activeTab === 'bg' ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-105' : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'}`}>
          <Palette size={20} />
          <span className="text-[10px] font-bold tracking-wider">Background</span>
        </button>
        <button onClick={() => setActiveTab('edit')} className={`flex-1 flex flex-col justify-center items-center gap-1.5 py-3 rounded-2xl transition-all duration-300 ${activeTab === 'edit' ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-105' : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'}`}>
          <Type size={20} />
          <span className="text-[10px] font-bold tracking-wider">Text Edit</span>
        </button>
        <button onClick={() => setActiveTab('effects')} className={`flex-1 flex flex-col justify-center items-center gap-1.5 py-3 rounded-2xl transition-all duration-300 ${activeTab === 'effects' ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-105' : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'}`}>
          <Sparkles size={20} />
          <span className="text-[10px] font-bold tracking-wider">Effects</span>
        </button>
      </div>

    </div>
  );
};

export default ControlPanel;