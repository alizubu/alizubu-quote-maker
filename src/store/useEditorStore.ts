import { create } from 'zustand';
import { EditorState, CanvasLayer, TextLayer, ImageLayer, GroupLayer, HistorySnapshot } from './editorTypes';
import { openDB } from './fontDb';

// Re-export types so other files (like CanvasArea) don't break
export * from './editorTypes';

// --- Store Implementation ---
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
    // Initial States
    bgColor: '#ffffff', bgImage: null, bgBlur: 0, bgBrightness: 0, bgScale: 1, bgX: 0, bgY: 0,
    canvasWidth: 1080, canvasHeight: 1920, aspectRatioName: 'TikTok / IG Story (9:16)',
    stageScale: 1, stagePosition: { x: 0, y: 0 },
    
    // 🔥 Initial Design Logic (Ye Husn Se...) 🔥
    layers: [
      {
        id: "1", name: "Quote Text", type: "text", text: "Ye Husn Se \nBhare Chehere \nIttrate Bahut Hai",
        fontSize: 74, fontFamily: "Mont_Blanc_Light", isBold: false, isItalic: false, isUnderline: false,
        fill: "#FFFFFF", isGradient: false, gradientType: 'linear', gradientColors: ['#f6d365', '#fda085'],
        align: "left", letterSpacing: -2, lineHeight: 1.5,
        shadowColor: "#000000", shadowBlur: 4, shadowOffsetX: 0, shadowOffsetY: 4,
        stroke: "#000000", strokeWidth: 0.5, strokeType: 'outer',
        x: 83.1, y: 1137.4, rotation: 0, scaleX: 1, scaleY: 1, opacity: 1, blendMode: 'source-over',
        visible: true, locked: false
      } as TextLayer
    ],
    selectedLayerId: null, multiSelectedIds: [], customFonts: [],
    
    isLayersOpen: false, isTypingOverlayOpen: false, isExportModalOpen: false, isRatioModalOpen: false, isCropMode: false,
    past: [], future: [],

    // System Actions
    saveHistory: () => { const current = createSnapshot(); set((state) => ({ past: [...state.past, current], future: [] })); },
    undo: () => { const { past, future } = get(); if (past.length === 0) return; const previous = past[past.length - 1]; const newPast = past.slice(0, past.length - 1); set({ ...previous, past: newPast, future: [createSnapshot(), ...future], selectedLayerId: null, multiSelectedIds: [] }); },
    redo: () => { const { past, future } = get(); if (future.length === 0) return; const next = future[0]; const newFuture = future.slice(1); set({ ...next, past: [...past, createSnapshot()], future: newFuture, selectedLayerId: null, multiSelectedIds: [] }); },

    // UI Actions
    setLayersOpen: (isOpen) => set({ isLayersOpen: isOpen }), setTypingOverlayOpen: (isOpen) => set({ isTypingOverlayOpen: isOpen }), setExportModalOpen: (isOpen) => set({ isExportModalOpen: isOpen }), setRatioModalOpen: (isOpen) => set({ isRatioModalOpen: isOpen }), setCropMode: (active) => set({ isCropMode: active }),
    setBgColor: (color) => { get().saveHistory(); set({ bgColor: color }); }, setBgImage: (url) => { get().saveHistory(); set({ bgImage: url }); }, setBgBlur: (blur) => set({ bgBlur: blur }), setBgBrightness: (brightness) => set({ bgBrightness: brightness }), setBgScale: (scale) => set({ bgScale: scale }), setBgX: (x) => set({ bgX: x }), setBgY: (y) => set({ bgY: y }),
    setCanvasSize: (width, height, ratioName) => { get().saveHistory(); set({ canvasWidth: width, canvasHeight: height, aspectRatioName: ratioName, isRatioModalOpen: false }); },
    setStageScale: (scale) => set({ stageScale: scale }), setStagePosition: (pos) => set({ stagePosition: pos }), resetWorkspace: () => set({ stageScale: 1, stagePosition: { x: 0, y: 0 } }),

    // Layer Actions
    addTextLayer: (attrs) => { get().saveHistory(); set((state) => ({ layers: [...state.layers, { id: Date.now().toString(), name: `Text ${state.layers.length + 1}`, type: 'text', text: 'Double Tap to Edit 📝', fontSize: 40, fontFamily: 'sans-serif', isBold: false, isItalic: false, isUnderline: false, fill: '#000000', isGradient: false, gradientType: 'linear', gradientColors: ['#f6d365', '#fda085'], x: state.canvasWidth / 2 - 150, y: state.canvasHeight / 2, rotation: 0, scaleX: 1, scaleY: 1, opacity: 1, blendMode: 'source-over', align: 'center', letterSpacing: 0, lineHeight: 1.2, shadowColor: '#000000', shadowBlur: 0, shadowOffsetX: 0, shadowOffsetY: 0, stroke: 'transparent', strokeWidth: 0, strokeType: 'outer', visible: true, locked: false, ...attrs } as TextLayer], selectedLayerId: null, multiSelectedIds: [] })); },
    addImageLayer: (url) => {
      get().saveHistory();
      const newId = Date.now().toString();
      set((state) => ({
        layers: [
          ...state.layers,
          {
            id: newId,
            name: `Image ${state.layers.length + 1}`,
            type: 'image',
            url: url,
            x: state.canvasWidth / 2 - 150,
            y: state.canvasHeight / 2 - 150,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            opacity: 1,
            blendMode: 'source-over',
            visible: true,
            locked: false,
            naturalWidth: 0,
            naturalHeight: 0,
          } as ImageLayer,
        ],
        // Auto-select the new image so the Transformer attaches immediately
        selectedLayerId: newId,
        multiSelectedIds: [newId],
        // Auto-open the layers panel so user can see the new layer
        isLayersOpen: true,
      }));
    },
    updateLayer: (id, attrs) => set((state) => ({ layers: state.layers.map((l) => (l.id === id ? { ...l, ...attrs } : l)) as CanvasLayer[] })),
    renameLayer: (id, newName) => { get().saveHistory(); set((state) => ({ layers: state.layers.map((l) => (l.id === id ? { ...l, name: newName } : l)) as CanvasLayer[] })); },
    deleteLayer: (id) => { get().saveHistory(); set((state) => ({ layers: state.layers.filter((l) => l.id !== id), selectedLayerId: state.selectedLayerId === id ? null : state.selectedLayerId, multiSelectedIds: state.multiSelectedIds.filter(mId => mId !== id) })); },
    duplicateLayer: (id) => { get().saveHistory(); set((state) => { const source = state.layers.find((l) => l.id === id); if (!source) return state; const clone = { ...source, id: Date.now().toString(), name: `${source.name} Copy`, x: source.x + 30, y: source.y + 30, locked: false }; return { layers: [...state.layers, clone] as CanvasLayer[] }; }); },
    setSelectedLayer: (id) => set({ selectedLayerId: id, multiSelectedIds: id ? [id] : [], isCropMode: false }),
    setMultiSelectedIds: (ids) => set({ multiSelectedIds: ids, isCropMode: false }),
    
    // Grouping Logic
    createGroup: () => { const { selectedLayerId, multiSelectedIds, layers } = get(); const idsToGroup = multiSelectedIds.length > 0 ? multiSelectedIds : (selectedLayerId ? [selectedLayerId] : []); if (idsToGroup.length < 2) return; get().saveHistory(); const groupId = `group-${Date.now()}`; const updatedLayers = layers.map(l => idsToGroup.includes(l.id) ? { ...l, parentId: groupId } : l); const groupLayer: GroupLayer = { id: groupId, name: 'Group Folder 📁', type: 'group', x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1, opacity: 1, blendMode: 'source-over', visible: true, locked: false }; set({ layers: [groupLayer, ...updatedLayers] as CanvasLayer[], selectedLayerId: groupId, multiSelectedIds: [] }); },
    ungroup: (groupId) => { get().saveHistory(); set((state) => ({ layers: state.layers.filter(l => l.id !== groupId).map(l => l.parentId === groupId ? { ...l, parentId: undefined } : l) as CanvasLayer[], selectedLayerId: null, multiSelectedIds: [] })); },

    moveLayerUp: (id) => { get().saveHistory(); set((state) => { const index = state.layers.findIndex((l) => l.id === id); if (index === -1 || index === state.layers.length - 1) return state; const newLayers = [...state.layers]; [newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]]; return { layers: newLayers }; }); },
    moveLayerDown: (id) => { get().saveHistory(); set((state) => { const index = state.layers.findIndex((l) => l.id === id); if (index <= 0) return state; const newLayers = [...state.layers]; [newLayers[index - 1], newLayers[index]] = [newLayers[index], newLayers[index - 1]]; return { layers: newLayers }; }); },
    reorderLayers: (oldIndex, newIndex) => { get().saveHistory(); set((state) => { const newLayers = [...state.layers]; const [movedItem] = newLayers.splice(oldIndex, 1); newLayers.splice(newIndex, 0, movedItem); return { layers: newLayers }; }); },
    centerLayerOnCanvas: (id, cw, ch) => { get().saveHistory(); set((state) => ({ layers: state.layers.map((l) => (l.id === id ? { ...l, x: cw / 2 - 100, y: ch / 2 } : l)) as CanvasLayer[] })); },
    toggleVisibility: (id) => { get().saveHistory(); set((state) => ({ layers: state.layers.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)) as CanvasLayer[] })); },
    toggleLock: (id) => { get().saveHistory(); set((state) => ({ layers: state.layers.map((l) => (l.id === id ? { ...l, locked: !l.locked } : l)) as CanvasLayer[] })); },

    // Fonts & Load Logic
    addCustomFont: async (name, url, blob) => { set((state) => ({ customFonts: [...state.customFonts, { name, url }] })); if (blob) { try { const db = await openDB(); const tx = db.transaction('fonts', 'readwrite'); tx.objectStore('fonts').put({ name, blob }); } catch (e) { console.error(e); } } },
    initPersistentFonts: async () => { try { const db = await openDB(); const tx = db.transaction('fonts', 'readonly'); const req = tx.objectStore('fonts').getAll(); req.onsuccess = () => { const savedFonts = req.result || []; savedFonts.forEach((f: { name: string, blob: Blob }) => { const fontUrl = URL.createObjectURL(f.blob); const fontFace = new FontFace(f.name, `url(${fontUrl})`); fontFace.load().then((loadedFace) => { document.fonts.add(loadedFace); set((state) => ({ customFonts: [...state.customFonts, { name: f.name, url: fontUrl }] })); }).catch(err => console.error(err)); }); }; } catch (e) { console.log("No persistent fonts found"); } },
    loadProject: (projectData) => set({ layers: projectData.layers || projectData.texts || [], bgColor: projectData.bgColor || '#ffffff', bgImage: projectData.bgImage || null, bgBlur: projectData.bgBlur || 0, bgBrightness: projectData.bgBrightness || 0, bgScale: projectData.bgScale || 1, bgX: projectData.bgX || 0, bgY: projectData.bgY || 0, canvasWidth: projectData.canvasWidth || 1080, canvasHeight: projectData.canvasHeight || 1920, aspectRatioName: projectData.aspectRatioName || 'TikTok / IG Story (9:16)', selectedLayerId: null, stageScale: 1, stagePosition: { x: 0, y: 0 } }),
  };
});