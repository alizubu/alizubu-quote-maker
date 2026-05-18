// --- Types & Interfaces ---
export type LayerType = 'text' | 'image' | 'group';

export interface BaseLayer {
  id: string;
  name: string;
  type: LayerType;
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  blendMode: string;
  visible: boolean;
  locked: boolean;
  parentId?: string; // গ্রুপিং ট্র্যাক করার জন্য
}

export interface TextLayer extends BaseLayer {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  fill: string;
  isGradient: boolean;
  gradientType: 'linear' | 'radial';
  gradientColors: [string, string];
  align: 'left' | 'center' | 'right';
  letterSpacing: number;
  lineHeight: number;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  stroke: string;
  strokeWidth: number;
  strokeType: 'outer' | 'inner';
}

export interface ImageLayer extends BaseLayer {
  type: 'image';
  url: string;
  maskShape?: 'none' | 'circle' | 'square';
  cropArea?: { x: number; y: number; width: number; height: number };
}

export interface GroupLayer extends BaseLayer {
  type: 'group';
}

export type CanvasLayer = TextLayer | ImageLayer | GroupLayer;

export interface CustomFont {
  name: string;
  url: string;
}

export interface HistorySnapshot {
  layers: CanvasLayer[];
  bgColor: string;
  bgImage: string | null;
  bgBlur: number;
  bgBrightness: number;
  bgScale: number;
  bgX: number;
  bgY: number;
  canvasWidth: number;
  canvasHeight: number;
  aspectRatioName: string;
}

export interface EditorState {
  bgColor: string; bgImage: string | null; bgBlur: number; bgBrightness: number; bgScale: number; bgX: number; bgY: number;
  canvasWidth: number; canvasHeight: number; aspectRatioName: string;
  stageScale: number; stagePosition: { x: number; y: number };
  
  layers: CanvasLayer[];
  selectedLayerId: string | null;
  multiSelectedIds: string[];
  customFonts: CustomFont[];

  isLayersOpen: boolean; isTypingOverlayOpen: boolean; isExportModalOpen: boolean; isRatioModalOpen: boolean; isCropMode: boolean;
  past: HistorySnapshot[]; future: HistorySnapshot[];

  setLayersOpen: (isOpen: boolean) => void; setTypingOverlayOpen: (isOpen: boolean) => void; setExportModalOpen: (isOpen: boolean) => void; setRatioModalOpen: (isOpen: boolean) => void; setCropMode: (active: boolean) => void;
  setBgColor: (color: string) => void; setBgImage: (url: string | null) => void; setBgBlur: (blur: number) => void; setBgBrightness: (brightness: number) => void; setBgScale: (scale: number) => void; setBgX: (x: number) => void; setBgY: (y: number) => void;
  setCanvasSize: (width: number, height: number, ratioName: string) => void;
  setStageScale: (scale: number) => void; setStagePosition: (pos: { x: number; y: number }) => void; resetWorkspace: () => void;

  addTextLayer: (attrs?: Partial<TextLayer>) => void; addImageLayer: (url: string) => void;
  updateLayer: (id: string, attrs: Partial<CanvasLayer>) => void; renameLayer: (id: string, newName: string) => void;
  deleteLayer: (id: string) => void; duplicateLayer: (id: string) => void;
  setSelectedLayer: (id: string | null) => void; setMultiSelectedIds: (ids: string[]) => void;
  
  createGroup: () => void; ungroup: (groupId: string) => void;
  moveLayerUp: (id: string) => void; moveLayerDown: (id: string) => void; reorderLayers: (oldIndex: number, newIndex: number) => void;
  centerLayerOnCanvas: (id: string, canvasWidth: number, canvasHeight: number) => void;
  toggleVisibility: (id: string) => void; toggleLock: (id: string) => void;

  saveHistory: () => void; undo: () => void; redo: () => void;
  addCustomFont: (name: string, url: string, blob?: Blob) => void;
  loadProject: (projectData: any) => void; initPersistentFonts: () => void;
}