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
  // নতুন শ্যাডো এবং পজিশনিং প্রপার্টিজ
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  // নতুন স্ট্রোক প্রপার্টিজ
  stroke: string;
  strokeWidth: number;
  // লেয়ার উইন্ডো কন্ট্রোল
  visible: boolean;
  locked: boolean;
}

interface CustomFont {
  name: string;
  url: string;
}

interface EditorState {
  bgColor: string;
  bgImage: string | null;
  bgBlur: number;
  bgBrightness: number;
  texts: TextLayer[];
  customFonts: CustomFont[]; // আপলোড করা কাস্টম ফন্ট ট্র্যাক করার জন্য
  selectedTextId: string | null;
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
}

export const useEditorStore = create<EditorState>((set) => ({
  bgColor: '#000000',
  bgImage: null,
  bgBlur: 0,
  bgBrightness: 0,
  selectedTextId: null,
  customFonts: [],
  texts: [
    {
      id: '1',
      text: '"The only way to do great work\nis to love what you do." ✨',
      fontSize: 45,
      fontFamily: "'Playfair Display', serif",
      fontWeight: 'normal',
      fill: '#FFFFFF',
      x: 80,
      y: 1350,
      align: 'left',
      letterSpacing: 0,
      shadowColor: '#000000',
      shadowBlur: 10,
      shadowOffsetX: 0,
      shadowOffsetY: 4,
      stroke: 'transparent',
      strokeWidth: 0,
      visible: true,
      locked: false,
    },
  ],

  setBgColor: (color) => set({ bgColor: color }),
  setBgImage: (url) => set({ bgImage: url }),
  setBgBlur: (blur) => set({ bgBlur: blur }),
  setBgBrightness: (brightness) => set({ bgBrightness: brightness }),
  
  addText: (newText) =>
    set((state) => ({
      texts: [
        ...state.texts,
        {
          id: Date.now().toString(),
          text: 'New Layer Text',
          fontSize: 36,
          fontFamily: 'sans-serif',
          fontWeight: 'normal',
          fill: '#FFFFFF',
          x: 150,
          y: 800,
          align: 'left',
          letterSpacing: 0,
          shadowColor: '#000000',
          shadowBlur: 0,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          stroke: 'transparent',
          strokeWidth: 0,
          visible: true,
          locked: false,
          ...newText,
        },
      ],
    })),

  updateText: (id, attrs) =>
    set((state) => ({
      texts: state.texts.map((t) => (t.id === id ? { ...t, ...attrs } : t)),
    })),

  deleteText: (id) =>
    set((state) => ({
      texts: state.texts.filter((t) => t.id !== id),
      selectedTextId: state.selectedTextId === id ? null : state.selectedTextId,
    })),

  duplicateText: (id) =>
    set((state) => {
      const source = state.texts.find((t) => t.id === id);
      if (!source) return state;
      const clone = {
        ...source,
        id: Date.now().toString(),
        x: source.x + 30, // সামান্য সরিয়ে কপি করা
        y: source.y + 30,
        locked: false, // ডুপ্লিকেট লেয়ার ডিফল্ট আনলক থাকবে
      };
      return { texts: [...state.texts, clone] };
    }),

  setSelectedText: (id) => set({ selectedTextId: id }),

  moveLayerUp: (id) =>
    set((state) => {
      const index = state.texts.findIndex((t) => t.id === id);
      if (index === -1 || index === state.texts.length - 1) return state;
      const newTexts = [...state.texts];
      [newTexts[index], newTexts[index + 1]] = [newTexts[index + 1], newTexts[index]];
      return { texts: newTexts };
    }),

  moveLayerDown: (id) =>
    set((state) => {
      const index = state.texts.findIndex((t) => t.id === id);
      if (index <= 0) return state;
      const newTexts = [...state.texts];
      [newTexts[index - 1], newTexts[index]] = [newTexts[index], newTexts[index - 1]];
      return { texts: newTexts };
    }),

  centerTextOnCanvas: (id, canvasWidth, canvasHeight) =>
    set((state) => ({
      texts: state.texts.map((t) => (t.id === id ? { ...t, x: canvasWidth / 2 - 200, y: canvasHeight / 2 } : t)),
    })),

  toggleVisibility: (id) =>
    set((state) => ({
      texts: state.texts.map((t) => (t.id === id ? { ...t, visible: !t.visible } : t)),
    })),

  toggleLock: (id) =>
    set((state) => ({
      texts: state.texts.map((t) => (t.id === id ? { ...t, locked: !t.locked } : t)),
    })),

  addCustomFont: (name, url) =>
    set((state) => ({
      customFonts: [...state.customFonts, { name, url }],
    })),
}));