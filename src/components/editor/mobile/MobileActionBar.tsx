'use client';

import React, { useEffect, useState } from 'react';
import { useEditorStore } from '../../../store/useEditorStore';
import { Palette, Settings2, Plus, Sparkles } from 'lucide-react';

interface MobileActionBarProps {
  activeSheet: 'none' | 'bg' | 'edit' | 'effects';
  setActiveSheet: (sheet: 'none' | 'bg' | 'edit' | 'effects') => void;
}

export default function MobileActionBar({ activeSheet, setActiveSheet }: MobileActionBarProps) {
  const { selectedLayerId, addTextLayer } = useEditorStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-zinc-200 dark:border-white/10 p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] flex items-center justify-around shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
      
      <button 
        onClick={() => setActiveSheet('bg')}
        className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-colors ${activeSheet === 'bg' ? 'text-blue-500' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
      >
        <Palette size={20} className="mb-1" />
        <span className="text-[10px] font-medium">Canvas</span>
      </button>

      <button 
        onClick={() => addTextLayer({})}
        className="relative -top-5 flex flex-col items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 hover:scale-105 active:scale-95 transition-all"
      >
        <Plus size={28} />
      </button>

      <button 
        onClick={() => setActiveSheet('edit')}
        disabled={!selectedLayerId}
        className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-colors ${!selectedLayerId ? 'opacity-40 cursor-not-allowed text-zinc-400' : (activeSheet === 'edit' ? 'text-purple-500' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white')}`}
      >
        <Settings2 size={20} className="mb-1" />
        <span className="text-[10px] font-medium">Edit</span>
      </button>
    </div>
  );
}
