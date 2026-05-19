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
  const style = { 
    transform: CSS.Transform.toString(transform), 
    transition, 
    zIndex: isDragging ? 50 : 'auto', 
    opacity: isDragging ? 0.5 : 1,
    scale: isDragging ? 1.05 : 1,
  };

  const isSelected = selectedLayerId === layer.id;
  const isTextLayer = layer.type === 'text';

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      onClick={() => setSelectedLayer(layer.id)} 
      className={`relative flex flex-col gap-3 p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer group overflow-hidden ${
        isDragging 
          ? 'shadow-2xl border-blue-400 bg-blue-500/20 scale-105' 
          : isSelected 
            ? 'bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/15 dark:to-purple-500/15 border-blue-400/60 shadow-lg shadow-blue-500/20' 
            : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-600'
      }`}
    >
      {/* Selected Layer Gradient Overlay */}
      {isSelected && !isDragging && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse pointer-events-none"></div>
      )}

      {/* Drag Indicator Bar */}
      {isDragging && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 shadow-lg"></div>
      )}
      
      <div className="relative z-10 flex justify-between items-center gap-2">
        {/* Drag Handle Icon */}
        <div 
          {...attributes} 
          {...listeners} 
          className="cursor-grab active:cursor-grabbing p-1.5 rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10 transition-all" 
          title="Drag to reorder"
        >
          <GripVertical size={15} />
        </div>
        
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {/* Layer Type Icon with Color */}
          <div className={`p-1.5 rounded-lg ${isTextLayer ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
            {isTextLayer ? <Type size={13} /> : <ImageIcon size={13} />}
          </div>
          
          {editingLayerId === layer.id ? (
            <input 
              autoFocus 
              value={tempLayerName} 
              onChange={(e) => setTempLayerName(e.target.value)} 
              onBlur={() => finishRename(layer.id)} 
              onKeyDown={(e) => e.key === 'Enter' && finishRename(layer.id)} 
              className="bg-black/60 text-xs text-white px-2.5 py-1.5 rounded-lg outline-none border-2 border-blue-500 w-full focus:border-purple-500 transition-colors" 
            />
          ) : (
            <p 
              className={`text-xs font-semibold truncate flex-1 transition-colors ${
                isSelected ? 'text-blue-600 dark:text-white' : 'text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white'
              }`} 
              onDoubleClick={(e) => { e.stopPropagation(); startRename(layer.id, layer.name); }}
            >
              {layer.name}
            </p>
          )}
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); startRename(layer.id, layer.name); }} 
          className="p-1.5 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-white transition-all active:scale-90" 
          title="Rename"
        >
          <Edit3 size={13} />
        </button>
      </div>

      <div className="relative z-10 flex justify-between items-center pt-2.5 border-t border-zinc-200 dark:border-zinc-700/50" onClick={(e) => e.stopPropagation()}>
        <div className="flex gap-1.5">
          <button 
            onClick={() => toggleVisibility(layer.id)} 
            className={`p-2 sm:p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg transition-all ${
              layer.visible 
                ? 'hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white' 
                : 'bg-red-500/10 dark:bg-red-500/20 text-red-500 dark:text-red-400 hover:bg-red-500/20 dark:hover:bg-red-500/30'
            }`}
            title={layer.visible ? 'Hide layer' : 'Show layer'}
          >
            {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          
          <button 
            onClick={() => toggleLock(layer.id)} 
            className={`p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg transition-all ${
              layer.locked 
                ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 dark:hover:bg-amber-500/30' 
                : 'hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white'
            }`}
            title={layer.locked ? 'Unlock layer' : 'Lock layer'}
          >
            {layer.locked ? <Lock size={14} /> : <Unlock size={14} />}
          </button>
        </div>
        
        <div className="flex gap-1.5">
          <button 
            onClick={() => duplicateLayer(layer.id)} 
            className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center hover:bg-blue-500/10 dark:hover:bg-blue-500/20 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all active:scale-90" 
            title="Duplicate"
          >
            <Copy size={14} />
          </button>
          <button 
            onClick={() => deleteLayer(layer.id)} 
            className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center hover:bg-red-500/10 dark:hover:bg-red-500/20 rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-all active:scale-90" 
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
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
      {isLayersOpen && <div className="fixed inset-0 bg-black/70 z-40 md:hidden backdrop-blur-md animate-fade-in" onClick={() => setLayersOpen(false)} />}
      
      <div
        className={`fixed top-0 left-0 h-full w-[85vw] max-w-[340px] sm:w-[320px] bg-white dark:bg-gradient-to-br dark:from-zinc-900 dark:via-black dark:to-zinc-900 border-r border-zinc-200 dark:border-white/20 shadow-2xl z-50 transform transition-all duration-300 ease-out flex flex-col ${isLayersOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        
        {/* Header with Gradient */}
        <div className="relative p-4 border-b border-zinc-200 dark:border-white/10 flex justify-between items-center sticky top-0 z-10 backdrop-blur-xl bg-white/90 dark:bg-black/60">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10"></div>
          
          <div className="relative flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-lg">
              <Layers size={16} className="text-white"/>
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Layers</h2>
              <p className="text-[9px] text-zinc-500 dark:text-zinc-400">{layers.length} {layers.length === 1 ? 'layer' : 'layers'}</p>
            </div>
          </div>
          
          <div className="relative flex gap-2">
            <button 
              onClick={() => addTextLayer({})} 
              className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl text-white transition-all shadow-lg hover:shadow-xl active:scale-90" 
              title="Add Text Layer"
            >
              <Plus size={16} />
            </button>
            <button 
              onClick={() => setLayersOpen(false)} 
              className="p-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-all active:scale-90"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        
        {/* Layers List */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {layers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
              <div className="p-4 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl mb-4 border border-zinc-700">
                <Layers size={40} className="text-zinc-600" />
              </div>
              <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-2">No Layers Yet</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-600 mb-4">Create your first layer to get started</p>
              <button 
                onClick={() => addTextLayer({})}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl text-white text-xs font-bold transition-all shadow-lg active:scale-95"
              >
                <Plus size={14} className="inline mr-1" /> Add Text Layer
              </button>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={layers.map(l => l.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2.5">
                  {layers.map((layer) => (
                    <SortableLayerItem 
                      key={layer.id} 
                      layer={layer} 
                      editingLayerId={editingLayerId} 
                      tempLayerName={tempLayerName} 
                      setTempLayerName={setTempLayerName} 
                      finishRename={finishRename} 
                      startRename={startRename} 
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Footer Info */}
        <div className="p-3 border-t border-zinc-200 dark:border-white/10 bg-zinc-50/80 dark:bg-black/60 backdrop-blur-xl">
          <div className="flex items-center justify-between text-[10px] text-zinc-400 dark:text-zinc-500">
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              Ready
            </span>
            <span>Drag to reorder</span>
          </div>
        </div>
      </div>
    </>
  );
}