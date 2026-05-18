import { create } from 'zustand';

export type LayerType = 'text' | 'image';

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
}

export type CanvasLayer = TextLayer | ImageLayer;

interface CustomFont {
  name: string;
  url: string;
}

interface HistorySnapshot {
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

interface EditorState {
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
  
  // Workspace Navigation (New)
  stageScale: number;
  stagePosition: { x: number; y: number };

  layers: CanvasLayer[];
  selectedLayerId: string | null;
  customFonts: CustomFont[];

  isLayersOpen: boolean;
  isTypingOverlayOpen: boolean;
  isExportModalOpen: boolean;
  isRatioModalOpen: boolean;

  past: HistorySnapshot[];
  future: HistorySnapshot[];

  setLayersOpen: (isOpen: boolean) => void;
  setTypingOverlayOpen: (isOpen: boolean) => void;
  setExportModalOpen: (isOpen: boolean) => void;
  setRatioModalOpen: (isOpen: boolean) => void;

  setBgColor: (color: string) => void;
  setBgImage: (url: string | null) => void;
  setBgBlur: (blur: number) => void;
  setBgBrightness: (brightness: number) => void;
  setBgScale: (scale: number) => void;
  setBgX: (x: number) => void;
  setBgY: (y: number) => void;
  setCanvasSize: (width: number, height: number, ratioName: string) => void;
  
  // New Setters for Zoom & Pan
  setStageScale: (scale: number) => void;
  setStagePosition: (pos: { x: number; y: number }) => void;
  resetWorkspace: () => void;

  addTextLayer: (attrs?: Partial<TextLayer>) => void;
  addImageLayer: (url: string) => void;
  updateLayer: (id: string, attrs: Partial<CanvasLayer>) => void;
  renameLayer: (id: string, newName: string) => void;
  deleteLayer: (id: string) => void;
  duplicateLayer: (id: string) => void;
  setSelectedLayer: (id: string | null) => void;
  moveLayerUp: (id: string) => void;
  moveLayerDown: (id: string) => void;
  reorderLayers: (oldIndex: number, newIndex: number) => void;
  centerLayerOnCanvas: (id: string, canvasWidth: number, canvasHeight: number) => void;
  toggleVisibility: (id: string) => void;
  toggleLock: (id: string) => void;

  saveHistory: () => void;
  undo: () => void;
  redo: () => void;
  addCustomFont: (name: string, url: string, blob?: Blob) => void;
  loadProject: (projectData: any) => void;
  initPersistentFonts: () => void;
}

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('StoryMakerFontsDB', 1);
    request.onupgradeneeded = () => { request.result.createObjectStore('fonts', { keyPath: 'name' }); };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const useEditorStore = create<EditorState>((set, get) => {
  const createSnapshot = (): HistorySnapshot => {
    const state = get();
    return {
      layers: JSON.parse(JSON.stringify(state.layers)),
      bgColor: state.bgColor, bgImage: state.bgImage, bgBlur: state.bgBlur,
      bgBrightness: state.bgBrightness, bgScale: state.bgScale, bgX: state.bgX, bgY: state.bgY,
      canvasWidth: state.canvasWidth, canvasHeight: state.canvasHeight, aspectRatioName: state.aspectRatioName,
    };
  };

  return {
    bgColor: '#ffffff', bgImage: null, bgBlur: 0, bgBrightness: 0, bgScale: 1, bgX: 0, bgY: 0,
    canvasWidth: 1080, canvasHeight: 1920, aspectRatioName: 'TikTok / IG Story (9:16)',
    
    stageScale: 1, stagePosition: { x: 0, y: 0 },
    
    layers: [], selectedLayerId: null, customFonts: [],
    isLayersOpen: false, isTypingOverlayOpen: false, isExportModalOpen: false, isRatioModalOpen: false,
    past: [], future: [],

    saveHistory: () => { const current = createSnapshot(); set((state) => ({ past: [...state.past, current], future: [] })); },
    undo: () => {
      const { past, future } = get();
      if (past.length === 0) return;
      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      set({ ...previous, past: newPast, future: [createSnapshot(), ...future], selectedLayerId: null });
    },
    redo: () => {
      const { past, future } = get();
      if (future.length === 0) return;
      const next = future[0];
      const newFuture = future.slice(1);
      set({ ...next, past: [...past, createSnapshot()], future: newFuture, selectedLayerId: null });
    },

    setLayersOpen: (isOpen) => set({ isLayersOpen: isOpen }),
    setTypingOverlayOpen: (isOpen) => set({ isTypingOverlayOpen: isOpen }),
    setExportModalOpen: (isOpen) => set({ isExportModalOpen: isOpen }),
    setRatioModalOpen: (isOpen) => set({ isRatioModalOpen: isOpen }),

    setBgColor: (color) => { get().saveHistory(); set({ bgColor: color }); },
    setBgImage: (url) => { get().saveHistory(); set({ bgImage: url }); },
    setBgBlur: (blur) => set({ bgBlur: blur }),
    setBgBrightness: (brightness) => set({ bgBrightness: brightness }),
    setBgScale: (scale) => set({ bgScale: scale }),
    setBgX: (x) => set({ bgX: x }),
    setBgY: (y) => set({ bgY: y }),
    setCanvasSize: (width, height, ratioName) => { get().saveHistory(); set({ canvasWidth: width, canvasHeight: height, aspectRatioName: ratioName, isRatioModalOpen: false }); },
    
    setStageScale: (scale) => set({ stageScale: scale }),
    setStagePosition: (pos) => set({ stagePosition: pos }),
    resetWorkspace: () => set({ stageScale: 1, stagePosition: { x: 0, y: 0 } }),

    addTextLayer: (attrs) => {
      get().saveHistory();
      set((state) => ({
        layers: [...state.layers, {
          id: Date.now().toString(), name: `Text ${state.layers.length + 1}`, type: 'text',
          text: 'Double Tap to Edit 📝', fontSize: 40, fontFamily: 'sans-serif',
          isBold: false, isItalic: false, isUnderline: false,
          fill: '#000000', isGradient: false, gradientType: 'linear', gradientColors: ['#f6d365', '#fda085'],
          x: state.canvasWidth / 2 - 150, y: state.canvasHeight / 2, rotation: 0, scaleX: 1, scaleY: 1, opacity: 1, blendMode: 'source-over',
          align: 'center', letterSpacing: 0, lineHeight: 1.2, shadowColor: '#000000', shadowBlur: 0, shadowOffsetX: 0, shadowOffsetY: 0,
          stroke: 'transparent', strokeWidth: 0, strokeType: 'outer', visible: true, locked: false, ...attrs
        } as TextLayer],
        selectedLayerId: null,
      }));
    },

    addImageLayer: (url) => {
      get().saveHistory();
      set((state) => ({
        layers: [...state.layers, {
          id: Date.now().toString(), name: `Image ${state.layers.length + 1}`, type: 'image',
          url: url, x: state.canvasWidth / 2 - 150, y: state.canvasHeight / 2,
          rotation: 0, scaleX: 1, scaleY: 1, opacity: 1, blendMode: 'source-over', visible: true, locked: false
        } as ImageLayer],
        selectedLayerId: null,
      }));
    },

    updateLayer: (id, attrs) => set((state) => ({ layers: state.layers.map((l) => (l.id === id ? { ...l, ...attrs } : l)) as CanvasLayer[] })),
    renameLayer: (id, newName) => { get().saveHistory(); set((state) => ({ layers: state.layers.map((l) => (l.id === id ? { ...l, name: newName } : l)) as CanvasLayer[] })); },
    deleteLayer: (id) => { get().saveHistory(); set((state) => ({ layers: state.layers.filter((l) => l.id !== id), selectedLayerId: state.selectedLayerId === id ? null : state.selectedLayerId })); },
    duplicateLayer: (id) => {
      get().saveHistory();
      set((state) => {
        const source = state.layers.find((l) => l.id === id);
        if (!source) return state;
        const clone = { ...source, id: Date.now().toString(), name: `${source.name} Copy`, x: source.x + 30, y: source.y + 30, locked: false };
        return { layers: [...state.layers, clone] as CanvasLayer[] };
      });
    },
    setSelectedLayer: (id) => set({ selectedLayerId: id }),
    
    moveLayerUp: (id) => {
      get().saveHistory();
      set((state) => {
        const index = state.layers.findIndex((l) => l.id === id);
        if (index === -1 || index === state.layers.length - 1) return state;
        const newLayers = [...state.layers];
        [newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]];
        return { layers: newLayers };
      });
    },
    
    moveLayerDown: (id) => {
      get().saveHistory();
      set((state) => {
        const index = state.layers.findIndex((l) => l.id === id);
        if (index <= 0) return state;
        const newLayers = [...state.layers];
        [newLayers[index - 1], newLayers[index]] = [newLayers[index], newLayers[index - 1]];
        return { layers: newLayers };
      });
    },

    reorderLayers: (oldIndex, newIndex) => {
      get().saveHistory();
      set((state) => {
        const newLayers = [...state.layers];
        const [movedItem] = newLayers.splice(oldIndex, 1);
        newLayers.splice(newIndex, 0, movedItem);
        return { layers: newLayers };
      });
    },

    centerLayerOnCanvas: (id, cw, ch) => { get().saveHistory(); set((state) => ({ layers: state.layers.map((l) => (l.id === id ? { ...l, x: cw / 2 - 100, y: ch / 2 } : l)) as CanvasLayer[] })); },
    toggleVisibility: (id) => { get().saveHistory(); set((state) => ({ layers: state.layers.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)) as CanvasLayer[] })); },
    toggleLock: (id) => { get().saveHistory(); set((state) => ({ layers: state.layers.map((l) => (l.id === id ? { ...l, locked: !l.locked } : l)) as CanvasLayer[] })); },

    addCustomFont: async (name, url, blob) => {
      set((state) => ({ customFonts: [...state.customFonts, { name, url }] }));
      if (blob) { try { const db = await openDB(); const tx = db.transaction('fonts', 'readwrite'); tx.objectStore('fonts').put({ name, blob }); } catch (e) { console.error(e); } }
    },
    initPersistentFonts: async () => {
      try {
        const db = await openDB();
        const tx = db.transaction('fonts', 'readonly');
        const req = tx.objectStore('fonts').getAll();
        req.onsuccess = () => {
          const savedFonts = req.result || [];
          savedFonts.forEach((f: { name: string, blob: Blob }) => {
            const fontUrl = URL.createObjectURL(f.blob);
            const fontFace = new FontFace(f.name, `url(${fontUrl})`);
            fontFace.load().then((loadedFace) => {
              document.fonts.add(loadedFace);
              set((state) => ({ customFonts: [...state.customFonts, { name: f.name, url: fontUrl }] }));
            }).catch(err => console.error(err));
          });
        };
      } catch (e) { console.log("No persistent fonts found"); }
    },
    
    loadProject: (projectData) => set({
      layers: projectData.layers || projectData.texts || [], 
      bgColor: projectData.bgColor || '#ffffff', bgImage: projectData.bgImage || null,
      bgBlur: projectData.bgBlur || 0, bgBrightness: projectData.bgBrightness || 0,
      bgScale: projectData.bgScale || 1, bgX: projectData.bgX || 0, bgY: projectData.bgY || 0,
      canvasWidth: projectData.canvasWidth || 1080, canvasHeight: projectData.canvasHeight || 1920,
      aspectRatioName: projectData.aspectRatioName || 'TikTok / IG Story (9:16)',
      selectedLayerId: null, stageScale: 1, stagePosition: { x: 0, y: 0 }
    }),
  };
});