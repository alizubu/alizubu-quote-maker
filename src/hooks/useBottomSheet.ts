import { useState, useCallback, useEffect } from 'react';

export type BottomSheetState = 'closed' | 'collapsed' | 'medium' | 'expanded';

export function useBottomSheet() {
  const [sheetState, setSheetState] = useState<BottomSheetState>('closed');
  const [panelHeight, setPanelHeight] = useState(0);

  // Snap points defined in vh (viewport height) percentages
  const snapPoints = {
    closed: 0,
    collapsed: 35,
    medium: 50,
    expanded: 75,
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
