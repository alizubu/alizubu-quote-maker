'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  const [render, setRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) setRender(true);
  }, [isOpen]);

  const handleAnimationEnd = () => {
    if (!isOpen) setRender(false);
  };

  if (!render) return null;

  return (
    <div className="fixed bottom-[70px] left-0 right-0 z-30 sm:hidden pointer-events-none flex flex-col justify-end overflow-hidden" style={{ top: '10vh' }}>
      
      {/* Sheet */}
      <div 
        onAnimationEnd={handleAnimationEnd}
        className={`relative w-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.6)] border-t border-zinc-200/50 dark:border-white/10 flex flex-col transform transition-transform duration-300 ease-out pointer-events-auto ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ maxHeight: '100%' }}
      >
        {/* Drag Handle & Header */}
        <div className="flex-none flex items-center justify-between px-5 pt-4 pb-3 border-b border-zinc-100 dark:border-white/5">
          {/* Subtle drag pill */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
          
          <h3 className="font-bold text-zinc-900 dark:text-white text-base mt-1">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-full text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white transition-colors mt-1"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </div>
  );
}
