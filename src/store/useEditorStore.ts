import { create } from 'zustand';

export interface TextLayer {
  id: string;
  name: string; // Figma style layer name
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  fill: string;
  isGradient: boolean;
  gradientColors: [string, string];
  x: number;
  y: number;
  align: 'left' | 'center' | 'right';
  letterSpacing: number;
  lineHeight: number;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  stroke: string;
  strokeWidth: number;
  strokeType: 'outer' | 'inner'; // Inner/Outer stroke option
  visible: boolean;
  locked: boolean;
}

interface CustomFont {
  name: string;
  url: string;
}

interface HistorySnapshot {
  texts: TextLayer[];
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
  texts: TextLayer[];
  customFonts: CustomFont[];
  selectedTextId: string | null;
  
  canvasWidth: number;
  canvasHeight: number;
  aspectRatioName: string;
  
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
  
  addText: (text: Partial<TextLayer>) => void;
  updateText: (id: string, attrs: Partial<TextLayer>) => void;
  renameText: (id: string, newName: string) => void; // Rename function added
  deleteText: (id: string) => void;
  duplicateText: (id: string) => void;
  setSelectedText: (id: string | null) => void;
  moveLayerUp: (id: string) => void;
  moveLayerDown: (id: string) => void;
  centerTextOnCanvas: (id: string, canvasWidth: number, canvasHeight: number) => void;
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
    request.onupgradeneeded = () => {
      request.result.createObjectStore('fonts', { keyPath: 'name' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const useEditorStore = create<EditorState>((set, get) => {
  
  const createSnapshot = (): HistorySnapshot => {
    const state = get();
    return {
      texts: JSON.parse(JSON.stringify(state.texts)),
      bgColor: state.bgColor,
      bgImage: state.bgImage,
      bgBlur: state.bgBlur,
      bgBrightness: state.bgBrightness,
      bgScale: state.bgScale,
      bgX: state.bgX,
      bgY: state.bgY,
      canvasWidth: state.canvasWidth,
      canvasHeight: state.canvasHeight,
      aspectRatioName: state.aspectRatioName,
    };
  };

  return {
    bgColor: '#ffffff',
    bgImage: null,
    bgBlur: 0,
    bgBrightness: 0,
    bgScale: 1,
    bgX: 0,
    bgY: 0,
    selectedTextId: null,
    customFonts: [],
    
    canvasWidth: 1080,
    canvasHeight: 1920,
    aspectRatioName: 'TikTok / IG Story (9:16)',
    
    isLayersOpen: false,
    isTypingOverlayOpen: false,
    isExportModalOpen: false,
    isRatioModalOpen: false,
    
    past: [],
    future: [],
    
    texts: [
      {
        id: '1',
        name: 'Husn Quote', // Default Layer Name
        text: 'Ye Husn Se \nBhare Chehere \nIttrate Bahut Hai',
        fontSize: 74,
        fontFamily: "'Hind Siliguri', sans-serif",
        fontWeight: 'normal',
        fill: '#FFFFFF',
        isGradient: false,
        gradientColors: ['#f6d365', '#fda085'],
        x: 83,
        y: 1137,
        align: 'left',
        letterSpacing: -2,
        lineHeight: 1.5,
        shadowColor: '#000000',
        shadowBlur: 4,
        shadowOffsetX: 0,
        shadowOffsetY: 4,
        stroke: '#000000',
        strokeWidth: 0.5,
        strokeType: 'outer', // Default Stroke
        visible: true,
        locked: false
      }
    ],

    saveHistory: () => {
      const current = createSnapshot();
      set((state) => ({ past: [...state.past, current], future: [] }));
    },

    undo: () => {
      const { past, future } = get();
      if (past.length === 0) return;
      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      const currentSnapshot = createSnapshot();
      set({ ...previous, past: newPast, future: [currentSnapshot, ...future], selectedTextId: null });
    },

    redo: () => {
      const { past, future } = get();
      if (future.length === 0) return;
      const next = future[0];
      const newFuture = future.slice(1);
      const currentSnapshot = createSnapshot();
      set({ ...next, past: [...past, currentSnapshot], future: newFuture, selectedTextId: null });
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
    
    setCanvasSize: (width, height, ratioName) => { 
      get().saveHistory(); 
      set({ canvasWidth: width, canvasHeight: height, aspectRatioName: ratioName, isRatioModalOpen: false }); 
    },

    addText: (newText) => {
      get().saveHistory();
      set((state) => ({
        texts: [...state.texts, { 
          id: Date.now().toString(), 
          name: `Layer ${state.texts.length + 1}`, // Auto layer naming
          text: 'Double Tap to Edit 📝', 
          fontSize: 40, fontFamily: 'sans-serif', fontWeight: 'normal', fill: '#000000', 
          isGradient: false, gradientColors: ['#f6d365', '#fda085'], 
          x: state.canvasWidth / 2 - 150, y: state.canvasHeight / 2, align: 'center', 
          letterSpacing: 0, lineHeight: 1.2, shadowColor: '#000000', shadowBlur: 0, shadowOffsetX: 0, shadowOffsetY: 0, 
          stroke: 'transparent', strokeWidth: 0, strokeType: 'outer', 
          visible: true, locked: false, ...newText 
        }],
        selectedTextId: null,
      }));
    },

    updateText: (id, attrs) => {
      set((state) => ({ texts: state.texts.map((t) => (t.id === id ? { ...t, ...attrs } : t)) }));
    },
    
    renameText: (id, newName) => {
      get().saveHistory();
      set((state) => ({ texts: state.texts.map((t) => (t.id === id ? { ...t, name: newName } : t)) }));
    },

    deleteText: (id) => {
      get().saveHistory();
      set((state) => ({ texts: state.texts.filter((t) => t.id !== id), selectedTextId: state.selectedTextId === id ? null : state.selectedTextId }));
    },

    duplicateText: (id) => {
      get().saveHistory();
      set((state) => {
        const source = state.texts.find((t) => t.id === id);
        if (!source) return state;
        const clone = { ...source, id: Date.now().toString(), name: `${source.name} Copy`, x: source.x + 30, y: source.y + 30, locked: false };
        return { texts: [...state.texts, clone] };
      });
    },

    setSelectedText: (id) => set({ selectedTextId: id }),
    
    moveLayerUp: (id) => {
      get().saveHistory();
      set((state) => {
        const index = state.texts.findIndex((t) => t.id === id);
        if (index === -1 || index === state.texts.length - 1) return state;
        const newTexts = [...state.texts];
        [newTexts[index], newTexts[index + 1]] = [newTexts[index + 1], newTexts[index]];
        return { texts: newTexts };
      });
    },

    moveLayerDown: (id) => {
      get().saveHistory();
      set((state) => {
        const index = state.texts.findIndex((t) => t.id === id);
        if (index <= 0) return state;
        const newTexts = [...state.texts];
        [newTexts[index - 1], newTexts[index]] = [newTexts[index], newTexts[index - 1]];
        return { texts: newTexts };
      });
    },

    centerTextOnCanvas: (id, canvasWidth, canvasHeight) => {
      get().saveHistory();
      set((state) => ({ texts: state.texts.map((t) => (t.id === id ? { ...t, x: canvasWidth / 2 - 200, y: canvasHeight / 2 } : t)) }));
    },

    toggleVisibility: (id) => { get().saveHistory(); set((state) => ({ texts: state.texts.map((t) => (t.id === id ? { ...t, visible: !t.visible } : t)) })); },
    toggleLock: (id) => { get().saveHistory(); set((state) => ({ texts: state.texts.map((t) => (t.id === id ? { ...t, locked: !t.locked } : t)) })); },

    addCustomFont: async (name, url, blob) => {
      set((state) => ({ customFonts: [...state.customFonts, { name, url }] }));
      if (blob) {
        try {
          const db = await openDB();
          const tx = db.transaction('fonts', 'readwrite');
          tx.objectStore('fonts').put({ name, blob });
        } catch (e) {
          console.error("Failed to save font", e);
        }
      }
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
            }).catch(err => console.error("Persistent font load error", err));
          });
        };
      } catch (e) {
        console.log("No persistent fonts found");
      }
    },

    loadProject: (projectData) => set({ 
      texts: projectData.texts || [], 
      bgColor: projectData.bgColor || '#ffffff', 
      bgImage: projectData.bgImage || null, 
      bgBlur: projectData.bgBlur || 0, 
      bgBrightness: projectData.bgBrightness || 0, 
      bgScale: projectData.bgScale || 1, 
      bgX: projectData.bgX || 0, 
      bgY: projectData.bgY || 0, 
      canvasWidth: projectData.canvasWidth || 1080,
      canvasHeight: projectData.canvasHeight || 1920,
      aspectRatioName: projectData.aspectRatioName || 'TikTok / IG Story (9:16)',
      selectedTextId: null 
    }),
  };
});