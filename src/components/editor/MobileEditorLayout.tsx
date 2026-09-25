'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useBottomSheet } from '../../hooks/useBottomSheet';
import { useEnsureVisible } from '../../hooks/useEnsureVisible';
import { calculateViewportScale } from '../../utils/canvasViewport';
import EditorBottomSheet from './EditorBottomSheet';
import CanvasViewport from './CanvasViewport';
import { useEditorStore } from '../../store/useEditorStore';

// Assuming TopBar, CanvasArea, MobileActionBar are passed as children or imported
import TopBar from './topbar/TopBar';
import CanvasArea from './canvas/CanvasArea';
import MobileActionBar from './mobile/MobileActionBar';

// Collapsible section component for panel content
const PanelSection = ({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-zinc-200/60 dark:border-white/10 rounded-2xl overflow-hidden mb-4 bg-zinc-50 dark:bg-zinc-900/50 transition-colors">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 font-semibold text-[15px] text-zinc-800 dark:text-zinc-200 focus:outline-none"
      >
        <span>{title}</span>
        <svg 
          className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="p-4 pt-0">
          {children}
        </div>
      )}
    </div>
  );
};

export default function MobileEditorLayout() {
  const { sheetState, setSheetState, panelHeight, openSheet, closeSheet, snapPoints } = useBottomSheet();
  const { panOffset, ensureVisible } = useEnsureVisible();
  const { selectedLayerId, layers } = useEditorStore();
  
  const [mounted, setMounted] = useState(false);
  const [windowHeight, setWindowHeight] = useState(800);
  
  useEffect(() => {
    setMounted(true);
    setWindowHeight(window.innerHeight);
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const selectedLayer = useMemo(() => layers.find(l => l.id === selectedLayerId), [layers, selectedLayerId]);

  // Sync sheet state with layer selection
  useEffect(() => {
    if (selectedLayerId && sheetState === 'closed') {
      openSheet('collapsed');
    }
  }, [selectedLayerId, openSheet]);

  // Calculate scaling based on panel state
  const { scale } = useMemo(() => {
    if (!mounted) return { scale: 1, offsetY: 0 };
    return calculateViewportScale(windowHeight, panelHeight, 1920); // Base design height assumed to be 1920
  }, [mounted, windowHeight, panelHeight]);

  // Ensure selected object is visible
  useEffect(() => {
    if (selectedLayer && sheetState !== 'closed') {
      // Mock bounds for demonstration. In a real app, calculate real bounding box from canvas.
      const mockBounds = { y: 1000, height: 200 };
      ensureVisible(mockBounds, panelHeight, windowHeight, scale);
    } else {
      ensureVisible(null, 0, windowHeight, scale);
    }
  }, [selectedLayer, sheetState, panelHeight, windowHeight, scale, ensureVisible]);

  if (!mounted) return null;

  return (
    <div className="h-[100dvh] w-screen overflow-hidden bg-white dark:bg-black relative">
      <div className="z-10 relative">
        <TopBar />
      </div>
      
      {/* Canvas Viewport automatically shrinks when panel opens */}
      <CanvasViewport panelHeight={panelHeight} panOffset={panOffset} scale={scale}>
        <CanvasArea />
      </CanvasViewport>

      {/* Editor Panel - Draggable Bottom Sheet */}
      <EditorBottomSheet 
        isOpen={sheetState !== 'closed'} 
        onClose={closeSheet}
        title={selectedLayer?.type === 'text' ? 'Edit Text' : 'Editor'}
        snapPoints={snapPoints}
        currentState={sheetState === 'closed' ? 'collapsed' : sheetState}
        onStateChange={(state) => setSheetState(state)}
      >
        <div className="space-y-1">
           <PanelSection title="Text" defaultOpen={true}>
             <div className="h-20 bg-zinc-200/50 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/5"></div>
           </PanelSection>
           <PanelSection title="Typography">
             <div className="h-24 bg-zinc-200/50 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/5"></div>
           </PanelSection>
           <PanelSection title="Color">
             <div className="h-20 bg-zinc-200/50 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/5"></div>
           </PanelSection>
           <PanelSection title="Spacing">
             <div className="h-20 bg-zinc-200/50 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/5"></div>
           </PanelSection>
           <PanelSection title="Effects">
             <div className="h-32 bg-zinc-200/50 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/5"></div>
           </PanelSection>
           <PanelSection title="Shadow">
             <div className="h-24 bg-zinc-200/50 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/5"></div>
           </PanelSection>
           <PanelSection title="Stroke">
             <div className="h-24 bg-zinc-200/50 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/5"></div>
           </PanelSection>
           <PanelSection title="Transform">
             <div className="h-20 bg-zinc-200/50 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/5"></div>
           </PanelSection>
        </div>
      </EditorBottomSheet>

      {/* When sheet is closed, show the main Action Bar */}
      {sheetState === 'closed' && (
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <MobileActionBar />
        </div>
      )}
    </div>
  );
}
