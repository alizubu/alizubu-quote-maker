'use client';

import React, { useRef } from 'react';
import { Download, Layers, Save, FolderOpen, LayoutTemplate, X, Check, ImagePlus } from 'lucide-react';

// --- ফিক্সড পাথ: ../../../ (কারণ এখন আমরা topbar ফোল্ডারের আরও গভীরে আছি) ---
import { useEditorStore } from '../../../store/useEditorStore';

const TopBar = () => {
  const { 
    isLayersOpen, setLayersOpen, layers, bgColor, bgImage, bgBlur, 
    bgBrightness, bgScale, bgX, bgY, loadProject, setExportModalOpen, 
    isRatioModalOpen, setRatioModalOpen, setCanvasSize, aspectRatioName,
    canvasWidth, canvasHeight, addImageLayer
  } = useEditorStore();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stickerInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProject = () => {
    const projectData = { version: 2, layers, bgColor, bgImage, bgBlur, bgBrightness, bgScale, bgX, bgY, canvasWidth, canvasHeight, aspectRatioName };
    const blob = new Blob([JSON.stringify(projectData)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Project_${Date.now()}.alizubu`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLoadProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Security Alert: File is too large!"); return; }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (!data || typeof data !== 'object') { throw new Error("Invalid format"); }
        loadProject(data);
      } catch (err) {
        alert("Security Alert: Corrupted or malicious project file detected!");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleStickerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      addImageLayer(url);
    }
    e.target.value = '';
  };

  const ratios = [
    { name: 'TikTok / IG Story (9:16)', w: 1080, h: 1920, desc: 'Reels, Shorts, Stories' },
    { name: 'Instagram Square (1:1)', w: 1080, h: 1080, desc: 'Standard Feed Post' },
    { name: 'IG Portrait (4:5)', w: 1080, h: 1350, desc: 'Tall Feed Post' },
    { name: 'YouTube Thumb (16:9)', w: 1920, h: 1080, desc: 'Videos & Twitter' },
    { name: 'FB / Web Banner (1.91:1)', w: 1200, h: 630, desc: 'Link Previews' },
    { name: 'Pinterest Pin (2:3)', w: 1000, h: 1500, desc: 'Tall Pins' },
  ];

  return (
    <>
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-none">
        
        {/* Left Menu Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
          <button onClick={() => setLayersOpen(!isLayersOpen)} className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-white border border-white/10 transition-all shadow-lg active:scale-95" title="Toggle Layers">
            <Layers size={18} />
          </button>
          
          <button onClick={() => fileInputRef.current?.click()} className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-white border border-white/10 transition-all shadow-lg active:scale-95" title="Open Project">
            <FolderOpen size={18} />
            <input type="file" ref={fileInputRef} accept=".alizubu,.json" onChange={handleLoadProject} className="hidden" />
          </button>

          {/* New Add Sticker Button */}
          <button onClick={() => stickerInputRef.current?.click()} className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-white border border-white/10 transition-all shadow-lg active:scale-95" title="Add Image/Sticker">
            <ImagePlus size={18} />
            <input type="file" ref={stickerInputRef} accept="image/*" onChange={handleStickerUpload} className="hidden" />
          </button>

          <button 
            onClick={() => setRatioModalOpen(true)} 
            className="hidden sm:flex items-center gap-2 px-3 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 backdrop-blur-md rounded-xl text-blue-400 border border-blue-500/20 transition-all shadow-lg active:scale-95"
          >
            <LayoutTemplate size={16} /> 
            <span className="text-[11px] font-bold tracking-wider uppercase">{aspectRatioName.split(' ')[0]}</span>
          </button>
        </div>

        <button onClick={() => setRatioModalOpen(true)} className="sm:hidden flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 backdrop-blur-md rounded-full text-blue-400 border border-blue-500/20 pointer-events-auto active:scale-95">
          <LayoutTemplate size={14} />
          <span className="text-[10px] font-bold uppercase">{aspectRatioName.split('(')[0].trim()}</span>
        </button>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button onClick={handleSaveProject} className="p-2.5 bg-zinc-900/80 hover:bg-zinc-800 backdrop-blur-md rounded-xl text-white border border-zinc-700/50 transition-all shadow-lg active:scale-95" title="Save Project">
            <Save size={18} />
          </button>
          <button onClick={() => setExportModalOpen(true)} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.3)] active:scale-95">
            <Download size={15} /> Export
          </button>
        </div>
      </div>

      {/* --- ASPECT RATIO MODAL --- */}
      {isRatioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-gradient-to-b from-[#121214] to-black border border-white/10 p-5 rounded-3xl w-full max-w-md shadow-2xl relative space-y-4">
            
            <button onClick={() => setRatioModalOpen(false)} className="absolute top-4 right-4 p-1.5 bg-white/5 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors">
              <X size={16} />
            </button>

            <div className="space-y-1">
              <h3 className="text-sm font-bold tracking-wider text-white uppercase flex items-center gap-2">
                <LayoutTemplate size={16} className="text-blue-400" /> Canvas Size
              </h3>
              <p className="text-[11px] text-zinc-400">Select the aspect ratio for your social media platform.</p>
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
              {ratios.map((ratio) => {
                const isActive = canvasWidth === ratio.w && canvasHeight === ratio.h;
                return (
                  <div 
                    key={ratio.name}
                    onClick={() => setCanvasSize(ratio.w, ratio.h, ratio.name)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex justify-between items-center group ${isActive ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'bg-white/5 border-white/5 hover:border-zinc-500'}`}
                  >
                    <div>
                      <p className={`text-xs font-bold ${isActive ? 'text-blue-400' : 'text-zinc-200 group-hover:text-white'}`}>{ratio.name}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{ratio.w} × {ratio.h} px • {ratio.desc}</p>
                    </div>
                    {isActive ? (
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-[0_0_8px_#3b82f6]"><Check size={12}/></div>
                    ) : (
                      <div className="text-[10px] font-mono text-zinc-600">{ratio.w}:{ratio.h}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TopBar;