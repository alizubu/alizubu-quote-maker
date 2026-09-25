import React, { memo } from 'react';
import { motion } from 'framer-motion';

interface CanvasViewportProps {
  children: React.ReactNode;
  panelHeight: number;
  panOffset: { x: number; y: number };
  scale: number;
}

const CanvasViewport = memo(function CanvasViewport({
  children,
  panelHeight,
  panOffset,
  scale,
}: CanvasViewportProps) {
  // Use framer-motion to smoothly animate layout shifts when panel opens
  // No layout thrashing, uses GPU-accelerated transforms
  return (
    <motion.div
      animate={{
        height: `calc(100dvh - ${panelHeight}px)`,
      }}
      transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
      className="w-full relative flex flex-col items-center justify-center overflow-hidden"
    >
      <motion.div 
        animate={{
          y: panOffset.y,
          x: panOffset.x,
          scale: scale,
        }}
        transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
        className="relative flex items-center justify-center transform-gpu origin-center w-full h-full"
      >
        {children}
      </motion.div>
    </motion.div>
  );
});

export default CanvasViewport;
