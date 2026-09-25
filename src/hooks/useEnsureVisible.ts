import { useState, useCallback } from 'react';

export function useEnsureVisible() {
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  const ensureVisible = useCallback((
    selectedObjectBounds: { y: number; height: number } | null,
    panelHeight: number,
    containerHeight: number,
    scale: number
  ) => {
    if (!selectedObjectBounds || panelHeight === 0) {
      setPanOffset({ x: 0, y: 0 });
      return;
    }

    const availableHeight = containerHeight - panelHeight;
    const objectBottom = (selectedObjectBounds.y + selectedObjectBounds.height) * scale;
    
    // Add safe area padding
    const padding = 60;
    
    if (objectBottom > availableHeight - padding) {
      const overflow = objectBottom - (availableHeight - padding);
      // Auto-pan canvas upward
      setPanOffset({ x: 0, y: -overflow });
    } else {
      setPanOffset({ x: 0, y: 0 });
    }
  }, []);

  return { panOffset, ensureVisible };
}
