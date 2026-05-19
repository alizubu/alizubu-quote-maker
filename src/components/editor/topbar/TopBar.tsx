'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Download,
  Layers,
  Save,
  FolderOpen,
  LayoutTemplate,
  X,
  Check,
  ImagePlus,
  MoreHorizontal,
} from 'lucide-react';

import { useEditorStore } from '../../../store/useEditorStore';
import ThemeToggle from '../../ThemeToggle';

const TopBar = () => {
  const {
    isLayersOpen,
    setLayersOpen,
    layers,
    bgColor,
    bgImage,
    bgBlur,
    bgBrightness,
    bgScale,
    bgX,
    bgY,
    loadProject,
    setExportModalOpen,
    isRatioModalOpen,
    setRatioModalOpen,
    setCanvasSize,
    aspectRatioName,
    canvasWidth,
    canvasHeight,
    addImageLayer,
  } = useEditorStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const stickerInputRef = useRef<HTMLInputElement>(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  // Close more-menu on outside click (mobile only)
  useEffect(() => {
    if (!moreMenuOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-more-menu]')) setMoreMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [moreMenuOpen]);

  const handleSaveProject = () => {
    const projectData = {
      version: 2,
      layers,
      bgColor,
      bgImage,
      bgBlur,
      bgBrightness,
      bgScale,
      bgX,
      bgY,
      canvasWidth,
      canvasHeight,
      aspectRatioName,
    };
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
    if (file.size > 5 * 1024 * 1024) {
      alert('Security Alert: File is too large!');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (!data || typeof data !== 'object') throw new Error('Invalid format');
        loadProject(data);
      } catch (err) {
        alert('Security Alert: Corrupted or malicious project file detected!');
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

  // Reusable icon button - bigger touch target on mobile (44x44 min)
  const iconBtnClass =
    'flex items-center justify-center w-10 h-10 sm:w-9 sm:h-9 bg-white/5 hover:bg-white/15 backdrop-blur-sm rounded-xl text-white border border-white/10 transition-all shadow-lg hover:shadow-xl active:scale-95 hover:border-white/30';

  return (
    <>
      {/* ============ TOP BAR CONTAINER ============ */}
      <div className="absolute top-0 left-0 w-full p-2 sm:p-4 z-20 pointer-events-none">
        <div className="max-w-[2000px] mx-auto bg-white/10 dark:bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-2 sm:p-3 pointer-events-auto">
          {/* === DESKTOP / TABLET LAYOUT (sm+) === */}
          <div className="hidden sm:flex justify-between items-center gap-3">
            {/* Left: Logo + Brand */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 pr-3 border-r border-white/20">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center shadow-lg overflow-hidden ring-1 ring-white/10">
                  <Image
                    src="/logo.svg"
                    alt="Alizubu Logo"
                    width={36}
                    height={36}
                    className="w-full h-full object-contain p-0.5"
                    priority
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-bold text-xs leading-none tracking-wide">Alizubu</span>
                  <span className="text-white/60 text-[9px] leading-none font-medium mt-0.5">Quote Maker</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setLayersOpen(!isLayersOpen)}
                  className={iconBtnClass}
                  title="Toggle Layers"
                >
                  <Layers size={17} />
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={iconBtnClass}
                  title="Open Project"
                >
                  <FolderOpen size={17} />
                </button>

                <button
                  onClick={() => stickerInputRef.current?.click()}
                  className={iconBtnClass}
                  title="Add Image/Sticker"
                >
                  <ImagePlus size={17} />
                </button>

                <div className="w-px h-6 bg-white/20 mx-1" />

                <button
                  onClick={() => setRatioModalOpen(true)}
                  className="flex items-center gap-2 px-3 h-9 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 backdrop-blur-sm rounded-xl text-blue-300 border border-blue-400/30 transition-all shadow-lg hover:shadow-xl active:scale-95"
                  title="Canvas Size"
                >
                  <LayoutTemplate size={15} />
                  <span className="text-[10px] font-bold tracking-wider uppercase">
                    {aspectRatioName.split(' ')[0]}
                  </span>
                </button>
              </div>
            </div>

            {/* Right: Theme + Save + Export */}
            <div className="flex items-center gap-1.5">
              <ThemeToggle variant="icon" />

              <button onClick={handleSaveProject} className={iconBtnClass} title="Save Project">
                <Save size={17} />
              </button>

              <button
                onClick={() => setExportModalOpen(true)}
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white px-4 h-9 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] active:scale-95"
              >
                <Download size={15} />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* === MOBILE LAYOUT (xs only) === */}
          <div className="sm:hidden flex items-center justify-between gap-2">
            {/* Left: Logo only (compact) */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center shadow-lg overflow-hidden ring-1 ring-white/10 shrink-0">
                <Image
                  src="/logo.svg"
                  alt="Alizubu"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain p-0.5"
                  priority
                />
              </div>

              {/* Compact canvas size pill */}
              <button
                onClick={() => setRatioModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 h-9 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl text-blue-300 border border-blue-400/30 active:scale-95 shrink-0"
              >
                <LayoutTemplate size={13} />
                <span className="text-[10px] font-bold uppercase whitespace-nowrap">
                  {aspectRatioName.split(' ')[0]}
                </span>
              </button>
            </div>

            {/* Right: Layers + More + Export */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setLayersOpen(!isLayersOpen)}
                className="flex items-center justify-center w-10 h-10 bg-white/5 hover:bg-white/15 active:bg-white/20 rounded-xl text-white border border-white/10 transition-all active:scale-95"
                title="Layers"
              >
                <Layers size={17} />
              </button>

              {/* More menu (Save, Open, Image, Theme) */}
              <div className="relative" data-more-menu>
                <button
                  onClick={() => setMoreMenuOpen((v) => !v)}
                  className={`flex items-center justify-center w-10 h-10 rounded-xl text-white border transition-all active:scale-95 ${
                    moreMenuOpen
                      ? 'bg-white/20 border-white/30'
                      : 'bg-white/5 hover:bg-white/15 border-white/10'
                  }`}
                  title="More"
                  aria-expanded={moreMenuOpen}
                >
                  <MoreHorizontal size={18} />
                </button>

                {moreMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-zinc-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-1.5 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                    <button
                      onClick={() => {
                        setMoreMenuOpen(false);
                        fileInputRef.current?.click();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white text-sm hover:bg-white/10 active:bg-white/15 transition-colors"
                    >
                      <FolderOpen size={16} className="text-blue-400" />
                      Open Project
                    </button>
                    <button
                      onClick={() => {
                        setMoreMenuOpen(false);
                        handleSaveProject();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white text-sm hover:bg-white/10 active:bg-white/15 transition-colors"
                    >
                      <Save size={16} className="text-green-400" />
                      Save Project
                    </button>
                    <button
                      onClick={() => {
                        setMoreMenuOpen(false);
                        stickerInputRef.current?.click();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white text-sm hover:bg-white/10 active:bg-white/15 transition-colors"
                    >
                      <ImagePlus size={16} className="text-purple-400" />
                      Add Image
                    </button>
                    <div className="h-px bg-white/10 my-1.5 mx-2" />
                    <div className="px-3 py-2 flex items-center justify-between">
                      <span className="text-xs text-zinc-400 font-medium">Theme</span>
                      <ThemeToggle variant="segmented" />
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setExportModalOpen(true)}
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 active:from-blue-600 active:via-purple-600 active:to-pink-600 text-white px-3.5 h-10 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-[0_4px_20px_rgba(139,92,246,0.5)] active:scale-95"
              >
                <Download size={14} />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file inputs for mobile (since menu uses refs) */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".alizubu,.json"
        onChange={handleLoadProject}
        className="hidden"
      />
      <input
        type="file"
        ref={stickerInputRef}
        accept="image/*"
        onChange={handleStickerUpload}
        className="hidden"
      />

      {/* ============ ASPECT RATIO MODAL ============ */}
      {isRatioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-zinc-900/95 via-black/95 to-zinc-900/95 backdrop-blur-2xl border border-white/20 p-5 sm:p-6 rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative space-y-4 sm:space-y-5 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            {/* Mobile drag handle */}
            <div className="sm:hidden absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/20 rounded-full" />

            <button
              onClick={() => setRatioModalOpen(false)}
              className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-400 hover:text-white transition-all active:scale-90 z-10"
            >
              <X size={18} />
            </button>

            <div className="space-y-2 pt-2 sm:pt-0 shrink-0">
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

            <div className="flex-1 space-y-2.5 overflow-y-auto pr-2 -mr-2 custom-scrollbar">
              {ratios.map((ratio) => {
                const isActive = canvasWidth === ratio.w && canvasHeight === ratio.h;
                return (
                  <button
                    key={ratio.name}
                    onClick={() => {
                      setCanvasSize(ratio.w, ratio.h, ratio.name);
                      // Auto-close on mobile after selection for smoother UX
                      if (typeof window !== 'undefined' && window.innerWidth < 640) {
                        setRatioModalOpen(false);
                      }
                    }}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border cursor-pointer transition-all flex justify-between items-center group relative overflow-hidden active:scale-[0.99] ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500/15 to-purple-500/15 border-blue-400/50 shadow-[0_0_25px_rgba(59,130,246,0.2)]'
                        : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse" />
                    )}
                    <div className="relative z-10 min-w-0">
                      <p
                        className={`text-sm font-bold mb-1 truncate ${
                          isActive
                            ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400'
                            : 'text-zinc-200 group-hover:text-white'
                        }`}
                      >
                        {ratio.name}
                      </p>
                      <p className="text-[10px] text-zinc-500 flex items-center gap-1.5">
                        <span className="font-mono">
                          {ratio.w} × {ratio.h}
                        </span>
                        <span className="text-zinc-600">•</span>
                        <span className="truncate">{ratio.desc}</span>
                      </p>
                    </div>
                    {isActive ? (
                      <div className="relative z-10 w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white shadow-lg shrink-0 ml-2">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="relative z-10 w-7 h-7 rounded-full border-2 border-zinc-700 group-hover:border-zinc-500 transition-colors shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom safe area */}
            <div className="sm:hidden h-2 shrink-0" />
          </div>
        </div>
      )}
    </>
  );
};

export default TopBar;
