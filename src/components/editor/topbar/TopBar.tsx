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
      <div className="absolute top-0 left-0 w-full p-3 sm:p-4 z-10 pointer-events-none">
        <div className="max-w-[2000px] mx-auto bg-white/10 dark:bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-3 pointer-events-auto">
          <div className="flex justify-between items-center">
            
            {/* Left: Logo + Brand */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="hidden sm:flex items-center gap-2.5 pr-3 border-r border-white/20">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <span className="text-white font-black text-sm">AQ</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-bold text-xs leading-none">Alizubu</span>
                  <span className="text-white/60 text-[9px] leading-none font-medium">Quote Maker</span>
                </div>
              </div>

              {/* Mobile Logo */}
              <div className="sm:hidden w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-xs">AQ</span>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button 
                  onClick={() => setLayersOpen(!isLayersOpen)} 
                  className="p-2 sm:p-2.5 bg-white/5 hover:bg-white/15 backdrop-blur-sm rounded-lg sm:rounded-xl text-white border border-white/10 transition-all shadow-lg hover:shadow-xl active:scale-95 hover:border-white/30"
                  title="Toggle Layers"
                >
                  <Layers size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
                
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="p-2 sm:p-2.5 bg-white/5 hover:bg-white/15 backdrop-blur-sm rounded-lg sm:rounded-xl text-white border border-white/10 transition-all shadow-lg hover:shadow-xl active:scale-95 hover:border-white/30"
                  title="Open Project"
                >
                  <FolderOpen size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <input type="file" ref={fileInputRef} accept=".alizubu,.json" onChange={handleLoadProject} className="hidden" />
                </button>

                <button 
                  onClick={() => stickerInputRef.current?.click()} 
                  className="p-2 sm:p-2.5 bg-white/5 hover:bg-white/15 backdrop-blur-sm rounded-lg sm:rounded-xl text-white border border-white/10 transition-all shadow-lg hover:shadow-xl active:scale-95 hover:border-white/30"
                  title="Add Image/Sticker"
                >
                  <ImagePlus size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <input type="file" ref={stickerInputRef} accept="image/*" onChange={handleStickerUpload} className="hidden" />
                </button>

                <div className="hidden sm:block w-px h-6 bg-white/20 mx-1"></div>

                <button 
                  onClick={() => setRatioModalOpen(true)} 
                  className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 backdrop-blur-sm rounded-xl text-blue-300 border border-blue-400/30 transition-all shadow-lg hover:shadow-xl active:scale-95"
                >
                  <LayoutTemplate size={15} /> 
                  <span className="text-[10px] font-bold tracking-wider uppercase">{aspectRatioName.split(' ')[0]}</span>
                </button>
              </div>
            </div>

            {/* Mobile Canvas Size Badge */}
            <button 
              onClick={() => setRatioModalOpen(true)} 
              className="sm:hidden flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-lg text-blue-300 border border-blue-400/30 active:scale-95"
            >
              <LayoutTemplate size={13} />
              <span className="text-[9px] font-bold uppercase">{aspectRatioName.split('(')[0].trim()}</span>
            </button>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button 
                onClick={handleSaveProject} 
                className="p-2 sm:p-2.5 bg-white/5 hover:bg-white/15 backdrop-blur-sm rounded-lg sm:rounded-xl text-white border border-white/10 transition-all shadow-lg hover:shadow-xl active:scale-95 hover:border-white/30"
                title="Save Project"
              >
                <Save size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
              
              <button 
                onClick={() => setExportModalOpen(true)} 
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 sm:gap-2 shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] active:scale-95"
              >
                <Download size={14} className="sm:w-[15px] sm:h-[15px]" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- ASPECT RATIO MODAL --- */}
      {isRatioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-zinc-900/95 via-black/95 to-zinc-900/95 backdrop-blur-2xl border border-white/20 p-6 rounded-3xl w-full max-w-md shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative space-y-5 animate-in zoom-in-95 duration-300">
            
            <button 
              onClick={() => setRatioModalOpen(false)} 
              className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-400 hover:text-white transition-all active:scale-90"
            >
              <X size={18} />
            </button>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                  <LayoutTemplate size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Canvas Size</h3>
                  <p className="text-[10px] text-zinc-400">Choose your platform</p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
              {ratios.map((ratio) => {
                const isActive = canvasWidth === ratio.w && canvasHeight === ratio.h;
                return (
                  <div 
                    key={ratio.name}
                    onClick={() => setCanvasSize(ratio.w, ratio.h, ratio.name)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex justify-between items-center group relative overflow-hidden ${isActive ? 'bg-gradient-to-r from-blue-500/15 to-purple-500/15 border-blue-400/50 shadow-[0_0_25px_rgba(59,130,246,0.2)]' : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'}`}
                  >
                    {isActive && <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse"></div>}
                    <div className="relative z-10">
                      <p className={`text-sm font-bold mb-1 ${isActive ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400' : 'text-zinc-200 group-hover:text-white'}`}>
                        {ratio.name}
                      </p>
                      <p className="text-[10px] text-zinc-500 flex items-center gap-1.5">
                        <span className="font-mono">{ratio.w} × {ratio.h}</span>
                        <span className="text-zinc-600">•</span>
                        <span>{ratio.desc}</span>
                      </p>
                    </div>
                    {isActive ? (
                      <div className="relative z-10 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white shadow-lg">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="relative z-10 text-[10px] font-mono text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        Select
                      </div>
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