import { create } from 'zustand';

export interface TextLayer {
  id: string;
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  fill: string;
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
  visible: boolean;
  locked: boolean;
}

interface CustomFont { name: string; url: string; }

interface HistorySnapshot {
  texts: TextLayer[];
  bgColor: string;
  bgImage: string | null;
  aspectRatio: string;
}

interface EditorState {
  aspectRatio: string; // ক্যানভাস রেশিও (9:16, 1:1, 4:5, 16:9)
  bgColor: string;
  bgImage: string | null;
  bgBlur: number;
  bgBrightness: number;
  texts: TextLayer[];
  customFonts: CustomFont[];
  selectedTextId: string | null;
  isLayersOpen: boolean;
  isTypingOverlayOpen: boolean;
  
  // হিস্ট্রি ট্র্যাকিং (Undo/Redo)
  past: HistorySnapshot[];
  future: HistorySnapshot[];
  saveHistory: () => void;
  undo: () => void;
  redo: () => void;

  setAspectRatio: (ratio: string) => void;
  setLayersOpen: (isOpen: boolean) => void;
  setTypingOverlayOpen: (isOpen: boolean) => void;
  setBgColor: (color: string) => void;
  setBgImage: (url: string | null) => void;
  setBgBlur: (blur: number) => void;
  setBgBrightness: (brightness: number) => void;
  addText: (text: Partial<TextLayer>) => void;
  updateText: (id: string, attrs: Partial<TextLayer>) => void;
  deleteText: (id: string) => void;
  duplicateText: (id: string) => void;
  setSelectedText: (id: string | null) => void;
  moveLayerUp: (id: string) => void;
  moveLayerDown: (id: string) => void;
  centerTextOnCanvas: (id: string, canvasWidth: number, canvasHeight: number) => void;
  toggleVisibility: (id: string) => void;
  toggleLock: (id: string) => void;
  addCustomFont: (name: string, url: string) => void;
  loadProject: (projectData: any) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  aspectRatio: '9:16',
  bgColor: '#000000',
  bgImage: null,
  bgBlur: 0,
  bgBrightness: 0,
  selectedTextId: null,
  customFonts: [],
  isLayersOpen: false,
  isTypingOverlayOpen: false,
  past: [],
  future: [],
  texts: [{
    id: '1', text: '"The only way to do great work\nis to love what you do." ✨',
    fontSize: 45, fontFamily: "'Playfair Display', serif", fontWeight: 'normal', fill: '#FFFFFF',
    x: 80, y: 1350, align: 'left', letterSpacing: 0, lineHeight: 1.2, shadowColor: '#000000', shadowBlur: 10, shadowOffsetX: 0, shadowOffsetY: 4, stroke: 'transparent', strokeWidth: 0, visible: true, locked: false,
  }],

  // --- UNDO / REDO LOGIC ---
  saveHistory: () => set((state) => {
    const snapshot: HistorySnapshot = { texts: JSON.parse(JSON.stringify(state.texts)), bgColor: state.bgColor, bgImage: state.bgImage, aspectRatio: state.aspectRatio };
    const newPast = [...state.past, snapshot];
    if (newPast.length > 20) newPast.shift(); // Max 20 steps
    return { past: newPast, future: [] };
  }),
  undo: () => set((state) => {
    if (state.past.length === 0) return state;
    const previous = state.past[state.past.length - 1];
    const newPast = state.past.slice(0, -1);
    const currentSnapshot: HistorySnapshot = { texts: state.texts, bgColor: state.bgColor, bgImage: state.bgImage, aspectRatio: state.aspectRatio };
    return { ...previous, past: newPast, future: [currentSnapshot, ...state.future], selectedTextId: null };
  }),
  redo: () => set((state) => {
    if (state.future.length === 0) return state;
    const next = state.future[0];
    const newFuture = state.future.slice(1);
    const currentSnapshot: HistorySnapshot = { texts: state.texts, bgColor: state.bgColor, bgImage: state.bgImage, aspectRatio: state.aspectRatio };
    return { ...next, past: [...state.past, currentSnapshot], future: newFuture, selectedTextId: null };
  }),

  // --- ACTIONS ---
  setAspectRatio: (ratio) => { get().saveHistory(); set({ aspectRatio: ratio }); },
  setLayersOpen: (isOpen) => set({ isLayersOpen: isOpen }),
  setTypingOverlayOpen: (isOpen) => set({ isTypingOverlayOpen: isOpen }),
  setBgColor: (color) => { get().saveHistory(); set({ bgColor: color }); },
  setBgImage: (url) => { get().saveHistory(); set({ bgImage: url }); },
  setBgBlur: (blur) => set({ bgBlur: blur }),
  setBgBrightness: (brightness) => set({ bgBrightness: brightness }),
  
  addText: (newText) => {
    get().saveHistory();
    set((state) => ({
      texts: [...state.texts, { id: Date.now().toString(), text: 'Double Tap to Edit', fontSize: 40, fontFamily: 'sans-serif', fontWeight: 'normal', fill: '#FFFFFF', x: 150, y: 800, align: 'center', letterSpacing: 0, lineHeight: 1.2, shadowColor: '#000000', shadowBlur: 0, shadowOffsetX: 0, shadowOffsetY: 0, stroke: 'transparent', strokeWidth: 0, visible: true, locked: false, ...newText }],
      selectedTextId: null,
    }));
  },

  updateText: (id, attrs) => set((state) => ({ texts: state.texts.map((t) => (t.id === id ? { ...t, ...attrs } : t)) })),
  
  deleteText: (id) => { get().saveHistory(); set((state) => ({ texts: state.texts.filter((t) => t.id !== id), selectedTextId: state.selectedTextId === id ? null : state.selectedTextId })); },
  duplicateText: (id) => { get().saveHistory(); set((state) => { const source = state.texts.find((t) => t.id === id); if (!source) return state; const clone = { ...source, id: Date.now().toString(), x: source.x + 30, y: source.y + 30, locked: false }; return { texts: [...state.texts, clone] }; }); },
  setSelectedText: (id) => set({ selectedTextId: id }),
  moveLayerUp: (id) => { get().saveHistory(); set((state) => { const index = state.texts.findIndex((t) => t.id === id); if (index === -1 || index === state.texts.length - 1) return state; const newTexts = [...state.texts]; [newTexts[index], newTexts[index + 1]] = [newTexts[index + 1], newTexts[index]]; return { texts: newTexts }; }); },
  moveLayerDown: (id) => { get().saveHistory(); set((state) => { const index = state.texts.findIndex((t) => t.id === id); if (index <= 0) return state; const newTexts = [...state.texts]; [newTexts[index - 1], newTexts[index]] = [newTexts[index], newTexts[index - 1]]; return { texts: newTexts }; }); },
  centerTextOnCanvas: (id, canvasWidth, canvasHeight) => { get().saveHistory(); set((state) => ({ texts: state.texts.map((t) => (t.id === id ? { ...t, x: canvasWidth / 2 - 200, y: canvasHeight / 2 } : t)) })); },
  
  toggleVisibility: (id) => set((state) => ({ texts: state.texts.map((t) => (t.id === id ? { ...t, visible: !t.visible } : t)) })),
  toggleLock: (id) => set((state) => ({ texts: state.texts.map((t) => (t.id === id ? { ...t, locked: !t.locked } : t)) })),
  addCustomFont: (name, url) => set((state) => ({ customFonts: [...state.customFonts, { name, url }] })),
  
  loadProject: (projectData) => { get().saveHistory(); set({ texts: projectData.texts || [], bgColor: projectData.bgColor || '#000000', bgImage: projectData.bgImage || null, aspectRatio: projectData.aspectRatio || '9:16', selectedTextId: null }); },
}));