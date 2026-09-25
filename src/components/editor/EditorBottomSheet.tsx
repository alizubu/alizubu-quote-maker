import React, { memo } from 'react';
import { motion, PanInfo, Variants, useDragControls } from 'framer-motion';
import { X } from 'lucide-react';
import { BottomSheetState } from '../../hooks/useBottomSheet';

interface EditorBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  snapPoints: { closed: number; collapsed: number; medium: number; expanded: number };
  currentState: BottomSheetState;
  onStateChange: (state: BottomSheetState) => void;
}

const EditorBottomSheet = memo(function EditorBottomSheet({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  snapPoints, 
  currentState, 
  onStateChange 
}: EditorBottomSheetProps) {
  const dragControls = useDragControls();
  const onDragEnd = (event: any, info: PanInfo) => {
    const velocity = info.velocity.y;
    const offset = info.offset.y;
    
    // Swipe down or drag down heavily
    if (velocity > 500 || offset > 100) {
      if (currentState === 'expanded') onStateChange('medium');
      else if (currentState === 'medium') onStateChange('collapsed');
      else {
        onStateChange('closed');
        onClose();
      }
    } 
    // Swipe up or drag up heavily
    else if (velocity < -500 || offset < -100) {
      if (currentState === 'collapsed') onStateChange('medium');
      else if (currentState === 'medium') onStateChange('expanded');
      else onStateChange('expanded'); // default pull up
    } 
    // Snap back
    else {
      onStateChange(currentState);
    }
  };

  const variants: Variants = {
    closed: { height: 0, y: '100%', transition: { type: 'spring', bounce: 0, duration: 0.4 } },
    collapsed: { height: `${snapPoints.collapsed}dvh`, y: 0, transition: { type: 'spring', bounce: 0.2, duration: 0.5 } },
    medium: { height: `${snapPoints.medium}dvh`, y: 0, transition: { type: 'spring', bounce: 0.2, duration: 0.5 } },
    expanded: { height: `${snapPoints.expanded}dvh`, y: 0, transition: { type: 'spring', bounce: 0.2, duration: 0.5 } }
  };

  return (
    <>
      <motion.div
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={onDragEnd}
        animate={isOpen ? currentState : 'closed'}
        initial="closed"
        variants={variants}
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex flex-col bg-white dark:bg-zinc-900 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.6)] border-t border-zinc-200 dark:border-white/10 will-change-[height,transform] rounded-t-[32px] overflow-visible after:content-[''] after:absolute after:top-[100%] after:left-0 after:right-0 after:h-[100dvh] after:bg-white dark:after:bg-zinc-900 after:-z-10"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Drag Handle & Header */}
        <div 
          onPointerDown={(e) => dragControls.start(e)}
          className="relative z-10 flex-none flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-100 dark:border-white/5 rounded-t-[32px] cursor-grab active:cursor-grabbing touch-none bg-white dark:bg-zinc-900"
        >
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
          <h3 className="font-bold text-zinc-900 dark:text-white text-lg mt-1 tracking-tight">{title}</h3>
          <button 
            onClick={() => { onStateChange('closed'); onClose(); }}
            className="p-2 -mr-2 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-full text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white transition-colors mt-1"
          >
            <X size={20} />
          </button>
        </div>
        
        
        {/* Panel Content Scrolls */}
        <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar px-6 pt-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] bg-white dark:bg-zinc-900 pointer-events-auto">
          {children}
        </div>
      </motion.div>
    </>
  );
});

export default EditorBottomSheet;
