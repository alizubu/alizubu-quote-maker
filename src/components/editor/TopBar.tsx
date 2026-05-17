'use client';

import React from 'react';
import { Download, Layers } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';

const TopBar = () => {
  const { isLayersOpen, setLayersOpen } = useEditorStore();

  const handleExport = () => {
    window.dispatchEvent(new Event('export-story'));
  };

  return (
    <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
      
      {/* Left Area: Layers Toggle + Logo */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <button 
          onClick={() => setLayersOpen(!isLayersOpen)}
          className="p-2 bg-zinc-900/80 hover:bg-zinc-800 rounded-lg text-white border border-zinc-700 transition-colors shadow-lg"
          title="Layers Menu"
        >
          <Layers size={18} />
        </button>
        <h1 className="text-white font-semibold tracking-wide hidden sm:block">
          Story<span className="text-zinc-500">Maker</span>
        </h1>
      </div>

      {/* Right Area: Export */}
      <button 
        onClick={handleExport}
        className="pointer-events-auto bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-200 transition-colors flex items-center gap-2 shadow-lg shadow-white/10"
      >
        <Download size={16} /> <span className="hidden sm:inline">Export</span>
      </button>
    </div>
  );
};

export default TopBar;