'use client';

import React, { useRef } from 'react';
import { Download, Layers, Save, FolderOpen } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';

const TopBar = () => {
  const { isLayersOpen, setLayersOpen, texts, bgColor, bgImage, bgBlur, bgBrightness, loadProject } = useEditorStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ইমেজ এক্সপোর্ট
  const handleExportImage = () => window.dispatchEvent(new Event('export-story'));

  // প্রজেক্ট সেভ করা (JSON ফাইল)
  const handleSaveProject = () => {
    const projectData = { version: 1, texts, bgColor, bgImage, bgBlur, bgBrightness };
    const blob = new Blob([JSON.stringify(projectData)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `StoryProject_${Date.now()}.alizubu`; // কাস্টম এক্সটেনশন
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // প্রজেক্ট ওপেন করা
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
    e.target.value = ''; // Reset input
  };

  return (
    <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/90 via-black/50 to-transparent pointer-events-none">
      
      {/* Left: Layers & Open */}
      <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
        <button onClick={() => setLayersOpen(!isLayersOpen)} className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-white border border-white/10 transition-all shadow-lg active:scale-95" title="Layers">
          <Layers size={18} />
        </button>
        <button onClick={() => fileInputRef.current?.click()} className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-white border border-white/10 transition-all shadow-lg active:scale-95" title="Open Project">
          <FolderOpen size={18} />
          <input type="file" ref={fileInputRef} accept=".alizubu,.json" onChange={handleLoadProject} className="hidden" />
        </button>
      </div>

      {/* Center Logo */}
      <h1 className="text-white font-bold tracking-widest hidden sm:block drop-shadow-md text-lg">
        STORY<span className="text-blue-400">MAKER</span>
      </h1>

      {/* Right: Save & Export */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <button onClick={handleSaveProject} className="p-2.5 bg-zinc-900/80 hover:bg-zinc-800 backdrop-blur-md rounded-xl text-white border border-zinc-700/50 transition-all shadow-lg active:scale-95" title="Save Project">
          <Save size={18} />
        </button>
        <button onClick={handleExportImage} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.4)] active:scale-95">
          <Download size={16} /> <span className="hidden sm:inline">Export HD</span>
        </button>
      </div>
    </div>
  );
};

export default TopBar;