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

interface CustomFont {
  name: string;
  url: string;
}

// হিস্ট্রির জন্য স্ন্যাপশট স্ট্রাকচার
interface HistorySnapshot {
  texts: TextLayer[];
  bgColor: string;
  bgImage: string | null;
  bgBlur: number;
  bgBrightness: number;
  bgScale: number;
  bgX: number;
  bgY: number;
  aspectRatio: string;
}

interface EditorState {
  // ক্যাশ ব্যাকগ্রাউন্ড স্টেইটস
  bgColor: string;
  bgImage: string | null;
  bgBlur: number;
  bgBrightness: number;
  bgScale: number;     // ছবির সাইজ (Zoom) কন্ট্রোল
  bgX: number;         // ছবির ডানে-বামে পজিশন
  bgY: number;         // ছবির উপরে-নিচে পজিশন
  
  texts: TextLayer[];
  customFonts: CustomFont[];
  selectedTextId: string | null;
  aspectRatio: string;
  
  // উইন্ডো/ওভারলে স্টেইটস
  isLayersOpen: boolean;
  isTypingOverlayOpen: boolean;
  isExportModalOpen: boolean;

  // Undo / Redo স্ট্যাকস
  past: HistorySnapshot[];
  future: HistorySnapshot[];

  // অ্যাকশনসসমূহ
  setLayersOpen: (isOpen: boolean) => void;
  setTypingOverlayOpen: (isOpen: boolean) => void;
  setExportModalOpen: (isOpen: boolean) => void;
  setBgColor: (color: string) => void;
  setBgImage: (url: string | null) => void;
  setBgBlur: (blur: number) => void;
  setBgBrightness: (brightness: number) => void;
  setBgScale: (scale: number) => void;
  setBgX: (x: number) => void;
  setBgY: (y: number) => void;
  setAspectRatio: (ratio: string) => void;
  
  // টেক্সট লেয়ার অপারেশনস
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
  
  // হিস্ট্রি এবং ফন্ট লজিক
  saveHistory: () => void;
  undo: () => void;
  redo: () => void;
  addCustomFont: (name: string, url: string, blob?: Blob) => void;
  loadProject: (projectData: any) => void;
  initPersistentFonts: () => void;
}

// IndexedDB Helper (ফন্ট স্থায়ীভাবে ব্রাউজারে সেভ রাখার জন্য)
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
  
  // বর্তমান নিখুঁত অবস্থার স্ন্যাপশট নেয়ার ফাংশন
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
      aspectRatio: state.aspectRatio,
    };
  };

  return {
    bgColor: '#000000',
    bgImage: null,
    bgBlur: 0,
    bgBrightness: 0,
    bgScale: 1,      // ডিফল্ট ছবির সাইজ স্কেল ১
    bgX: 0,          // ডিফল্ট এক্স পজিশন ০
    bgY: 0,          // ডিফল্ট ওয়া পজিশন ০
    selectedTextId: null,
    customFonts: [],
    aspectRatio: '9:16',
    isLayersOpen: false,
    isTypingOverlayOpen: false,
    isExportModalOpen: false,
    past: [],
    future: [],
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
        lineHeight: 1.2,
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

    // প্রতিটি পরিবর্তনের আগে হিস্ট্রি সেভ করার লজিক
    saveHistory: () => {
      const current = createSnapshot();
      set((state) => ({
        past: [...state.past, current],
        future: [], // নতুন কোনো কাজ করলে রিডু স্ট্যাক খালি হয়ে যাবে
      }));
    },

    // ১. UNDO ফাংশনালিটি
    undo: () => {
      const { past, future } = get();
      if (past.length === 0) return; // আগের কোনো হিস্ট্রি না থাকলে ব্যাক করবে না

      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      const currentSnapshot = createSnapshot();

      set({
        ...previous,
        past: newPast,
        future: [currentSnapshot, ...future],
        selectedTextId: null, // রিসেট সিলেকশন
      });
    },

    // ১. REDO ফাংশনালিটি
    redo: () => {
      const { past, future } = get();
      if (future.length === 0) return;

      const next = future[0];
      const newFuture = future.slice(1);
      const currentSnapshot = createSnapshot();

      set({
        ...next,
        past: [...past, currentSnapshot],
        future: newFuture,
        selectedTextId: null,
      });
    },

    setLayersOpen: (isOpen) => set({ isLayersOpen: isOpen }),
    setTypingOverlayOpen: (isOpen) => set({ isTypingOverlayOpen: isOpen }),
    setExportModalOpen: (isOpen) => set({ isExportModalOpen: isOpen }),
    
    setBgColor: (color) => { get().saveHistory(); set({ bgColor: color }); },
    setBgImage: (url) => { get().saveHistory(); set({ bgImage: url }); },
    setBgBlur: (blur) => set({ bgBlur: blur }), // স্লাইডার ড্র্যাগ করার সময় যেন হিস্ট্রি জ্যাম না হয়
    setBgBrightness: (brightness) => set({ bgBrightness: brightness }),
    setBgScale: (scale) => set({ bgScale: scale }),
    setBgX: (x) => set({ bgX: x }),
    setBgY: (y) => set({ bgY: y }),
    setAspectRatio: (ratio) => { get().saveHistory(); set({ aspectRatio: ratio }); },

    addText: (newText) => {
      get().saveHistory();
      set((state) => ({
        texts: [...state.texts, { id: Date.now().toString(), text: 'Double Tap to Edit 📝', fontSize: 40, fontFamily: 'sans-serif', fontWeight: 'normal', fill: '#FFFFFF', x: 150, y: 800, align: 'center', letterSpacing: 0, lineHeight: 1.2, shadowColor: '#000000', shadowBlur: 0, shadowOffsetX: 0, shadowOffsetY: 0, stroke: 'transparent', strokeWidth: 0, visible: true, locked: false, ...newText }],
        selectedTextId: null,
      }));
    },

    updateText: (id, attrs) => {
      // ড্র্যাগ করার সময় মাউস/টাচ ছাড়লে ফাইনাল পজিশন ট্র্যাক করতে হিস্ট্রি সেভ
      if (attrs.x !== undefined || attrs.y !== undefined) {
        // ড্র্যাগ শুরু বা শেষের পজিশন চেক করে সেভ করা হয় কম্পোনেন্ট লেভেলে
      }
      set((state) => ({ texts: state.texts.map((t) => (t.id === id ? { ...t, ...attrs } : t)) }));
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
        const clone = { ...source, id: Date.now().toString(), x: source.x + 30, y: source.y + 30, locked: false };
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

    // ৩. কাস্টম ফন্ট পার্মানেন্টলি ডাটাবেজে সেভ রাখার মেকানিজম
    addCustomFont: async (name, url, blob) => {
      set((state) => ({ customFonts: [...state.customFonts, { name, url }] }));
      
      // যদি ফাইলটি নতুন আপলোড হয়, তবে IndexedDB তে রাইট করো
      if (blob) {
        try {
          const db = await openDB();
          const tx = db.transaction('fonts', 'readwrite');
          tx.objectStore('fonts').put({ name, blob });
        } catch (e) {
          console.error("Failed to save font to persistent IndexedDB", e);
        }
      }
    },

    // ৩. অ্যাপ চালুর সময় ডাটাবেজ থেকে ফন্ট রি-হাইড্রেট করা
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
        console.log("No persistent fonts found or IndexedDB error");
      }
    },

    loadProject: (projectData) => set({ texts: projectData.texts || [], bgColor: projectData.bgColor || '#000000', bgImage: projectData.bgImage || null, bgBlur: projectData.bgBlur || 0, bgBrightness: projectData.bgBrightness || 0, bgScale: projectData.bgScale || 1, bgX: projectData.bgX || 0, bgY: projectData.bgY || 0, selectedTextId: null }),
  };
});