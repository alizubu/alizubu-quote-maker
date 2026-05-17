'use client';

import React, { useRef } from 'react';
import { Download, Layers, Save, FolderOpen, Undo2, Redo2 } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';

const TopBar = () => {
  const { isLayersOpen, setLayersOpen, texts, bgColor, bgImage, aspectRatio, loadProject, undo, redo, past, future } = useEditorStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportImage = () => window.dispatchEvent(new Event('export-story'));

  const handleSaveProject = () => {
    const projectData = { version: 2, texts, bgColor, bgImage, aspectRatio };
    const blob = new Blob([JSON.stringify(projectData)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `StoryProject_${Date.now()}.alizubu`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLoadProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        loadProject(data);
      } catch (err) {
        alert("Invalid Project File!");
      }
    };
    reader.readAsText(file);
    e.target.value = ''; 
  };

  return (
    <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/90 via-black/50 to-transparent pointer-events-none">
      
      {/* Left: Layers & Open */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <button onClick={() => setLayersOpen(!isLayersOpen)} className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-white border border-white/10 transition-all shadow-lg active:scale-95" title="Layers"><Layers size={18} /></button>
        <button onClick={() => fileInputRef.current?.click()} className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-white border border-white/10 transition-all shadow-lg active:scale-95 hidden sm:block" title="Open Project">
          <FolderOpen size={18} />
          <input type="file" ref={fileInputRef} accept=".alizubu,.json" onChange={handleLoadProject} className="hidden" />
        </button>
      </div>

      {/* Center: Title & Undo/Redo */}
      <div className="flex flex-col sm:flex-row items-center gap-4 pointer-events-auto">
        <h1 className="text-white font-bold tracking-widest hidden md:block drop-shadow-md text-lg">
          STORY<span className="text-blue-400">MAKER</span>
        </h1>
        <div className="flex gap-2 bg-white/5 border border-white/10 p-1 rounded-full backdrop-blur-md shadow-lg">
          <button onClick={undo} disabled={past.length === 0} className={`p-1.5 rounded-full transition-colors ${past.length > 0 ? 'text-white hover:bg-white/20' : 'text-zinc-600 cursor-not-allowed'}`} title="Undo"><Undo2 size={16} /></button>
          <button onClick={redo} disabled={future.length === 0} className={`p-1.5 rounded-full transition-colors ${future.length > 0 ? 'text-white hover:bg-white/20' : 'text-zinc-600 cursor-not-allowed'}`} title="Redo"><Redo2 size={16} /></button>
        </div>
      </div>

      {/* Right: Save & Export */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <button onClick={handleSaveProject} className="p-2.5 bg-zinc-900/80 hover:bg-zinc-800 backdrop-blur-md rounded-xl text-white border border-zinc-700/50 transition-all shadow-lg active:scale-95 hidden sm:block" title="Save Project"><Save size={18} /></button>
        <button onClick={handleExportImage} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.4)] active:scale-95">
          <Download size={16} /> <span className="hidden sm:inline">Export</span>
        </button>
      </div>
    </div>
  );
};

export default TopBar;