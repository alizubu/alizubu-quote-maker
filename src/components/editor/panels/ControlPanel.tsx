'use client';

import React, { useState, useEffect } from 'react';
import { useEditorStore } from '../../../store/useEditorStore';
import { Undo2, Redo2, Palette, Type, Layers } from 'lucide-react';
import BackgroundPanel from '../panels/BackgroundPanel';
import TextPanel from '../panels/TextPanel';

export default function ControlPanel() {
  const { undo, redo, past, future } = useEditorStore();
  const [activeTab, setActiveTab] = useState<'bg' | 'edit'>('edit');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <div className="h-full bg-[#f4f4f5] dark:bg-[#050505]"></div>;

  return (
    <div className="flex flex-col h-full select-none bg-[#f4f4f5] dark:bg-[#050505] text-zinc-900 dark:text-zinc-100 relative transition-colors duration-300">
      
      {/* HISTORY HEADER */}
      <div className="flex justify-between items-center px-5 py-3 border-b border-zinc-200 dark:border-white/5 bg-white/50 dark:bg-black/20 shrink-0">
        <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest flex items-center gap-1.5"><Layers size={13}/> Workspace Hub</span>
        <div className="flex gap-2">
          <button onClick={undo} disabled={past.length === 0} className={`p-1.5 rounded-lg transition-all ${past.length === 0 ? 'opacity-30' : 'hover:bg-zinc-200 dark:hover:bg-zinc-800 active:scale-90'}`}>
            <Undo2 size={15} />
          </button>
          <div className="w-px bg-zinc-300 dark:bg-white/10 my-1"></div>
          <button onClick={redo} disabled={future.length === 0} className={`p-1.5 rounded-lg transition-all ${future.length === 0 ? 'opacity-30' : 'hover:bg-zinc-200 dark:hover:bg-zinc-800 active:scale-90'}`}>
            <Redo2 size={15} />
          </button>
        </div>
      </div>

      {/* DYNAMIC CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        {activeTab === 'bg' ? <BackgroundPanel /> : <TextPanel />}
      </div>

      {/* BOTTOM NAVIGATION TABS */}
      <div className="flex gap-2 p-3 bg-white/80 dark:bg-black/80 backdrop-blur-3xl border-t border-zinc-200 dark:border-white/10 shrink-0 z-20 pb-6 md:pb-4">
        <button 
          onClick={() => setActiveTab('bg')} 
          className={`flex-1 flex flex-col justify-center items-center gap-1.5 py-3 rounded-2xl transition-all duration-300 ${activeTab === 'bg' ? 'bg-blue-500 text-white shadow-lg' : 'hover:bg-zinc-200 dark:hover:bg-white/5 text-zinc-500'}`}
        >
          <Palette size={20} />
          <span className="text-[10px] font-bold tracking-wider">Background</span>
        </button>
        <button 
          onClick={() => setActiveTab('edit')} 
          className={`flex-1 flex flex-col justify-center items-center gap-1.5 py-3 rounded-2xl transition-all duration-300 ${activeTab === 'edit' ? 'bg-blue-500 text-white shadow-lg' : 'hover:bg-zinc-200 dark:hover:bg-white/5 text-zinc-500'}`}
        >
          <Type size={20} />
          <span className="text-[10px] font-bold tracking-wider">Edit Tools</span>
        </button>
      </div>
    </div>
  );
}