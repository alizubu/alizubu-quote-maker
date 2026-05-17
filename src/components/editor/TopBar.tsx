'use client';

import React from 'react';
import { Download } from 'lucide-react';

const TopBar = () => {
  // এক্সপোর্ট ইভেন্ট ফায়ার করার লজিক
  const handleExport = () => {
    window.dispatchEvent(new Event('export-story'));
  };

  return (
    <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
      <h1 className="text-white font-semibold tracking-wide pointer-events-auto">
        Story<span className="text-zinc-500">Maker</span>
      </h1>
      <button 
        onClick={handleExport}
        className="pointer-events-auto bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-200 transition-colors flex items-center gap-2"
      >
        <Download size={16} /> Export
      </button>
    </div>
  );
};

export default TopBar;