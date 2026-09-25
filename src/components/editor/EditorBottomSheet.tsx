import React, { memo } from 'react';
import { motion, PanInfo } from 'framer-motion';
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

  const variants = {
    closed: { y: '100%', transition: { type: 'spring', bounce: 0, duration: 0.4 } },
    collapsed: { y: `${100 - snapPoints.collapsed}dvh`, transition: { type: 'spring', bounce: 0.2, duration: 0.5 } },
    medium: { y: `${100 - snapPoints.medium}dvh`, transition: { type: 'spring', bounce: 0.2, duration: 0.5 } },
    expanded: { y: `${100 - snapPoints.expanded}dvh`, transition: { type: 'spring', bounce: 0.2, duration: 0.5 } }
  };

  return (
    <>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            onStateChange('closed');
            onClose();
          }}
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] md:hidden"
        />
      )}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={onDragEnd}
        animate={isOpen ? currentState : 'closed'}
        initial="closed"
        variants={variants}
        className="fixed top-0 left-0 right-0 z-50 md:hidden flex flex-col bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.6)] border-t border-zinc-200/50 dark:border-white/10 touch-none will-change-transform"
        style={{ height: '100dvh', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Drag Handle & Header */}
        <div className="flex-none flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-100 dark:border-white/5 rounded-t-[32px] cursor-grab active:cursor-grabbing">
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
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pt-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] bg-white dark:bg-zinc-900 touch-pan-y overscroll-contain">
          {children}
        </div>
      </motion.div>
    </>
  );
});

export default EditorBottomSheet;
