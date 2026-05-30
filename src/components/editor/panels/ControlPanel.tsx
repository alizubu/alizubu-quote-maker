'use client';

import React, { useState, useEffect } from 'react';
import { useEditorStore } from '../../../store/useEditorStore';
import { Undo2, Redo2, Palette, Type, Layers, Sparkles } from 'lucide-react';

// Modular Panels
import BackgroundPanel from './BackgroundPanel';
import TextPanel from './TextPanel';
import ImagePanel from './ImagePanel';
import EffectsPanel from './EffectsPanel';

export default function ControlPanel() {
  const { undo, redo, past, future, layers, selectedLayerId } = useEditorStore();
  const [activeTab, setActiveTab] = useState<'bg' | 'edit' | 'effects'>('edit');
  const [mounted, setMounted] = useState(false);

  const selectedLayer = layers.find(l => l.id === selectedLayerId);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <div className="h-full bg-[#f4f4f5] dark:bg-[#050505]"></div>;

  // ডাইনামিক এডিট প্যানেল রেন্ডারিং
  const renderEditPanel = () => {
    if (!selectedLayer) {
       return (
         <div className="min-h-[250px] flex flex-col items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-3xl text-zinc-500 dark:text-zinc-400 text-center px-6 mt-2 bg-zinc-50 dark:bg-white/5 transition-all">
           <div className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl mb-4">
             <Layers size={36} className="text-zinc-400 dark:text-zinc-500" />
           </div>
           <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">No Layer Selected</p>
           <p className="text-xs text-zinc-500 dark:text-zinc-500">Click on a layer or create a new one to start editing</p>
         </div>
       );
    }
    return selectedLayer.type === 'image' ? <ImagePanel /> : <TextPanel />;
  };

  return (
    <div className="flex flex-col h-full select-none bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-black dark:to-zinc-900 text-zinc-900 dark:text-zinc-100 relative transition-all duration-300">
      
      {/* HEADER WITH GRADIENT */}
      <div className="relative px-5 py-4 border-b border-zinc-200/50 dark:border-white/10 shrink-0 backdrop-blur-sm bg-white/70 dark:bg-black/40">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10"></div>
        
        <div className="relative flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg shadow-lg">
              <Layers size={14} className="text-white"/>
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-800 dark:text-white">Workspace</span>
              <p className="text-[9px] text-zinc-500 dark:text-zinc-400">Design Hub</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-white/5 p-1 rounded-xl border border-zinc-200 dark:border-white/10">
            <button 
              onClick={undo} 
              disabled={past.length === 0} 
              className={`p-2 rounded-lg transition-all ${past.length === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white dark:hover:bg-white/10 active:scale-90 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'}`}
              title="Undo"
            >
              <Undo2 size={14} />
            </button>
            <div className="w-px h-4 bg-zinc-300 dark:bg-white/20"></div>
            <button 
              onClick={redo} 
              disabled={future.length === 0} 
              className={`p-2 rounded-lg transition-all ${future.length === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white dark:hover:bg-white/10 active:scale-90 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'}`}
              title="Redo"
            >
              <Redo2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* DYNAMIC CONTENT AREA */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-4 custom-scrollbar">
        {activeTab === 'bg' && <BackgroundPanel />}
        {activeTab === 'edit' && renderEditPanel()}
        {activeTab === 'effects' && <EffectsPanel />}
      </div>

      {/* BOTTOM NAVIGATION TABS WITH GLASSMORPHISM */}
      <div
        className="relative shrink-0 z-20 pb-3 md:pb-4"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-black dark:via-black/95 dark:to-transparent backdrop-blur-xl"></div>
        <div className="relative flex gap-1.5 sm:gap-2 p-2.5 sm:p-3">
          {[
            { id: 'bg', icon: <Palette size={18} />, label: 'Background', gradient: 'from-orange-500 to-red-500' },
            { id: 'edit', icon: <Type size={18} />, label: 'Edit', gradient: 'from-blue-500 to-cyan-500' },
            { id: 'effects', icon: <Sparkles size={18} />, label: 'Effects', gradient: 'from-purple-500 to-pink-500' }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)} 
              className={`relative flex-1 min-h-[58px] flex flex-col justify-center items-center gap-1 sm:gap-1.5 py-3 sm:py-3.5 rounded-2xl transition-all duration-300 overflow-hidden group active:scale-95 ${
                activeTab === tab.id 
                  ? 'shadow-lg' 
                  : 'hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-500 dark:text-zinc-400'
              }`}
            >
              {activeTab === tab.id && (
                <div className={`absolute inset-0 bg-gradient-to-br ${tab.gradient} opacity-100`}></div>
              )}
              {activeTab === tab.id && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              )}
              <div className={`relative z-10 transition-all ${activeTab === tab.id ? 'text-white scale-110' : ''}`}>
                {tab.icon}
              </div>
              <span className={`relative z-10 text-[9px] sm:text-[10px] font-bold tracking-wider transition-all ${
                activeTab === tab.id ? 'text-white' : ''
              }`}>
                {tab.label}
              </span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-white rounded-full shadow-lg"></div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}