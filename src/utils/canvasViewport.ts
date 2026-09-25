export interface CanvasViewportState {
  scale: number;
  offsetY: number;
}

export function calculateViewportScale(
  containerHeight: number, 
  panelHeight: number,
  designHeight: number
): CanvasViewportState {
  const availableHeight = containerHeight - panelHeight;
  
  // Safe area support
  const safeAreaTop = 60; // TopBar approx height
  const safeAreaBottom = 20; // Bottom spacing
  
  const targetHeight = availableHeight - safeAreaTop - safeAreaBottom;
  
  // Scale down automatically to fit available height
  // Maintain aspect ratio
  const scale = targetHeight / designHeight;
  
  // Cap max scale to 1.0 (do not over-enlarge)
  const finalScale = Math.min(1, Math.max(0.1, scale));
  
  return { 
    scale: finalScale, 
    offsetY: 0 
  };
}
