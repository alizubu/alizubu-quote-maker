'use client';

import React from 'react';
import { Check, Trash2 } from 'lucide-react';

export default function TypingOverlay({ localTextValue, setLocalTextValue, closeTypingOverlay }: any) {
  return (
    <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-xl flex flex-col p-6 animate-in fade-in duration-200">
      <div className="flex justify-between items-center mb-6">
        <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Editor Keyboard</span>
        <div className="flex gap-3">
          <button onClick={() => setLocalTextValue("")} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-full font-bold flex items-center gap-1.5 transition-colors border border-red-500/20">
            <Trash2 size={16} /> Clear
          </button>
          <button onClick={closeTypingOverlay} className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2 rounded-full font-bold flex items-center gap-1.5 shadow-lg active:scale-95 transition-transform">
            <Check size={16} /> Done
          </button>
        </div>
      </div>
      <textarea 
        autoFocus 
        value={localTextValue} 
        onChange={(e) => setLocalTextValue(e.target.value)} 
        className="flex-1 w-full bg-transparent text-white text-2xl text-center resize-none outline-none font-sans pt-12 placeholder-white/10" 
        placeholder="Type content here..." 
      />
    </div>
  );
}