'use client';

import React, { useState, useEffect } from 'react';
import { useEditorStore } from '../../../store/useEditorStore';
import { Type, Image as ImageIcon, Palette, Settings2, Plus, Sparkles } from 'lucide-react';
import BottomSheet from './BottomSheet';

// Modular Panels
import BackgroundPanel from '../panels/BackgroundPanel';
import TextPanel from '../panels/TextPanel';
import ImagePanel from '../panels/ImagePanel';
import EffectsPanel from '../panels/EffectsPanel';

export default function MobileActionBar() {
  const { selectedLayerId, layers, addTextLayer } = useEditorStore();
  const [activeSheet, setActiveSheet] = useState<'none' | 'bg' | 'edit' | 'effects'>('none');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Auto-open edit sheet when a layer is selected if no sheet is open
  useEffect(() => {
    if (selectedLayerId && activeSheet === 'none') {
      setActiveSheet('edit');
    } else if (!selectedLayerId && activeSheet === 'edit') {
      setActiveSheet('none');
    }
  }, [selectedLayerId]);

  // Force open edit sheet when a layer is tapped (even if already selected)
  useEffect(() => {
    const handleLayerTapped = () => setActiveSheet('edit');
    window.addEventListener('layer-tapped', handleLayerTapped);
    return () => window.removeEventListener('layer-tapped', handleLayerTapped);
  }, []);

  if (!mounted) return null;

  const selectedLayer = layers.find(l => l.id === selectedLayerId);

  const getSheetTitle = () => {
    switch (activeSheet) {
      case 'bg': return 'Background Style';
      case 'edit': return selectedLayer?.type === 'text' ? 'Edit Text' : 'Edit Image';
      case 'effects': return 'Effects & Shapes';
      default: return '';
    }
  };

  const getSheetContent = () => {
    switch (activeSheet) {
      case 'bg': return <BackgroundPanel />;
      case 'edit': return selectedLayer?.type === 'text' ? <TextPanel /> : (selectedLayer?.type === 'image' ? <ImagePanel /> : <div className="text-center p-4 text-zinc-500">Select a layer to edit</div>);
      case 'effects': return <EffectsPanel />;
      default: return null;
    }
  };

  return (
    <>
      {/* Action Bar */}
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

        {selectedLayerId && (
          <button 
            onClick={() => setActiveSheet('edit')}
            className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-colors ${activeSheet === 'edit' ? 'text-purple-500' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
          >
            <Settings2 size={20} className="mb-1" />
            <span className="text-[10px] font-medium">Edit</span>
          </button>
        )}

        {!selectedLayerId && (
           <button 
           onClick={() => setActiveSheet('effects')}
           className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-colors ${activeSheet === 'effects' ? 'text-purple-500' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
         >
           <Sparkles size={20} className="mb-1" />
           <span className="text-[10px] font-medium">Effects</span>
         </button>
        )}
      </div>

      {/* Bottom Sheet Overlay */}
      <BottomSheet 
        isOpen={activeSheet !== 'none'} 
        onClose={() => setActiveSheet('none')}
        title={getSheetTitle()}
      >
        {getSheetContent()}
      </BottomSheet>
    </>
  );
}
