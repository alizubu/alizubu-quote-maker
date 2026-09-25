import { useState, useCallback, useEffect } from 'react';

export type BottomSheetState = 'closed' | 'collapsed' | 'medium' | 'expanded';

export function useBottomSheet() {
  const [sheetState, setSheetState] = useState<BottomSheetState>('closed');
  const [panelHeight, setPanelHeight] = useState(0);

  // Snap points defined in vh (viewport height) percentages
  // Adjusted to be more compact like PixelLab, prioritizing canvas space
  const snapPoints = {
    closed: 0,
    collapsed: 30,
    medium: 45,
    expanded: 60,
  };

  const openSheet = useCallback((state: BottomSheetState = 'collapsed') => {
    setSheetState(state);
  }, []);
  
  const closeSheet = useCallback(() => {
    setSheetState('closed');
  }, []);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const vh = window.innerHeight;
      const height = (snapPoints[sheetState] / 100) * vh;
      setPanelHeight(height);
    }
  }, [sheetState]);

  return {
    sheetState,
    setSheetState,
    panelHeight,
    openSheet,
    closeSheet,
    snapPoints
  };
}
