import React, { memo } from 'react';
import { motion } from 'framer-motion';

interface CanvasViewportProps {
  children: React.ReactNode;
  panelHeight: number;
}

const CanvasViewport = memo(function CanvasViewport({
  children,
  panelHeight,
}: CanvasViewportProps) {
  // Smoothly animate the available height when the bottom sheet opens/closes.
  // NO CSS scale transform — CanvasArea handles its own fit-to-container scaling
  // via Konva's baseScale. We just resize the container height.
  return (
    <motion.div
      animate={{
        height: `calc(100dvh - ${panelHeight}px)`,
      }}
      transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
      className="w-full relative overflow-hidden"
    >
      {children}
    </motion.div>
  );
});

export default CanvasViewport;
