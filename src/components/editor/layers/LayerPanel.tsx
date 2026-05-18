'use client';

import React, { useState } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Eye, EyeOff, Lock, Unlock, Copy, Trash2, X, Plus, Edit3, Layers, Type, Image as ImageIcon, GripVertical } from 'lucide-react';
import { useEditorStore } from '../../../store/useEditorStore';

// --- Sortable Drag Item Component ---
const SortableLayerItem = ({ layer, editingLayerId, tempLayerName, setTempLayerName, finishRename, startRename }: any) => {
  const { setSelectedLayer, selectedLayerId, toggleVisibility, toggleLock, duplicateLayer, deleteLayer } = useEditorStore();
  
  // dnd-kit hooks
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: layer.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 'auto', opacity: isDragging ? 0.6 : 1 };

  return (
    <div ref={setNodeRef} style={style} onClick={() => setSelectedLayer(layer.id)} className={`flex flex-col gap-2 p-3 rounded-xl border transition-all cursor-pointer ${selectedLayerId === layer.id ? 'bg-blue-500/10 border-blue-500/50 shadow-md' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
      
      <div className="flex justify-between items-center gap-2">
        {/* Drag Handle Icon */}
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-zinc-500 hover:text-white transition-colors" title="Drag to reorder">
          <GripVertical size={14} />
        </div>
        
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-[10px] text-zinc-500">
            {layer.type === 'text' ? <Type size={12} /> : <ImageIcon size={12} />}
          </span>
          
          {editingLayerId === layer.id ? (
            <input autoFocus value={tempLayerName} onChange={(e) => setTempLayerName(e.target.value)} onBlur={() => finishRename(layer.id)} onKeyDown={(e) => e.key === 'Enter' && finishRename(layer.id)} className="bg-black/50 text-xs text-white px-2 py-1 rounded outline-none border border-blue-500 w-full" />
          ) : (
            <p className={`text-xs font-medium truncate flex-1 ${selectedLayerId === layer.id ? 'text-white' : 'text-zinc-300'}`} onDoubleClick={(e) => { e.stopPropagation(); startRename(layer.id, layer.name); }}>
              {layer.name}
            </p>
          )}
        </div>

        <button onClick={(e) => { e.stopPropagation(); startRename(layer.id, layer.name); }} className="p-1 hover:bg-white/10 rounded text-zinc-500 hover:text-white" title="Rename"><Edit3 size={12} /></button>
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-white/5" onClick={(e) => e.stopPropagation()}>
        <div className="flex gap-2">
          <button onClick={() => toggleVisibility(layer.id)} className="p-1.5 hover:bg-white/10 rounded transition-colors">{layer.visible ? <Eye size={14} className="text-zinc-400 hover:text-white" /> : <EyeOff size={14} className="text-red-500" />}</button>
          <button onClick={() => toggleLock(layer.id)} className="p-1.5 hover:bg-white/10 rounded transition-colors">{layer.locked ? <Lock size={14} className="text-amber-500" /> : <Unlock size={14} className="text-zinc-400 hover:text-white" />}</button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => duplicateLayer(layer.id)} className="p-1.5 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors"><Copy size={14} /></button>
          <button onClick={() => deleteLayer(layer.id)} className="p-1.5 hover:bg-red-500/20 rounded text-zinc-500 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
        </div>
      </div>
    </div>
  );
};

export default function LayerPanel() {
  const { layers, isLayersOpen, setLayersOpen, addTextLayer, reorderLayers } = useEditorStore();
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [tempLayerName, setTempLayerName] = useState<string>('');

  // 5px ড্র্যাগ করার পর dnd-kit এক্টিভ হবে, যাতে নরমাল ক্লিক কাজ করে
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = layers.findIndex((l) => l.id === active.id);
      const newIndex = layers.findIndex((l) => l.id === over.id);
      reorderLayers(oldIndex, newIndex); // Zustand স্টোরে পজিশন সেভ হবে
    }
  };

  const startRename = (id: string, currentName: string) => { setEditingLayerId(id); setTempLayerName(currentName); };
  const finishRename = (id: string) => {
    if (tempLayerName.trim() !== '') useEditorStore.getState().renameLayer(id, tempLayerName);
    setEditingLayerId(null);
  };

  return (
    <>
      {isLayersOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" onClick={() => setLayersOpen(false)} />}
      <div className={`fixed top-0 left-0 h-full w-[300px] bg-[#121212] border-r border-white/10 shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${isLayersOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#121212] sticky top-0 z-10">
          <h2 className="text-xs font-bold tracking-widest uppercase text-white flex items-center gap-2"><Layers size={14} className="text-blue-400"/> Layers Panel</h2>
          <div className="flex gap-2">
            <button onClick={() => addTextLayer({})} className="p-1.5 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors" title="Add Text"><Plus size={14} /></button>
            <button onClick={() => setLayersOpen(false)} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"><X size={14} /></button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
          {/* Drag and Drop Engine */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={layers.map(l => l.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {layers.map((layer) => (
                  <SortableLayerItem key={layer.id} layer={layer} editingLayerId={editingLayerId} tempLayerName={tempLayerName} setTempLayerName={setTempLayerName} finishRename={finishRename} startRename={startRename} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </>
  );
}