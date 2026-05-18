'use client';

import React from 'react';
import { Group, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';

export default function ImageNode({ layer, isTypingOverlayOpen, isSpacePressed, isShiftPressed, isCropMode, multiSelectedIds, setSelectedLayer, setMultiSelectedIds, updateLayer, handleSnap }: any) {
  const [img] = useImage(layer.url, 'anonymous');
  
  // Crop Logic
  const cropProps = layer.cropArea && img ? {
    crop: layer.cropArea,
    width: layer.cropArea.width,
    height: layer.cropArea.height
  } : img ? { width: img.width, height: img.height } : {};

  return (
    <Group
      id={`layer-${layer.id}`} x={layer.x} y={layer.y}
      rotation={layer.rotation} scaleX={layer.scaleX} scaleY={layer.scaleY}
      draggable={!layer.locked && !isTypingOverlayOpen && !isSpacePressed}
      onClick={(e) => { 
        e.cancelBubble = true; 
        if(!isSpacePressed) {
          if(isShiftPressed) {
            const newSelection = multiSelectedIds.includes(layer.id) ? multiSelectedIds.filter((id: string) => id !== layer.id) : [...multiSelectedIds, layer.id];
            setMultiSelectedIds(newSelection);
            setSelectedLayer(null);
          } else {
            setSelectedLayer(layer.id);
          }
        } 
      }} 
      onTap={(e) => { e.cancelBubble = true; if(!isSpacePressed) setSelectedLayer(layer.id); }}
      onDragMove={handleSnap}
      onDragEnd={(e) => updateLayer(layer.id, { x: e.target.x(), y: e.target.y() })}
      onTransformEnd={(e) => {
        const node = e.target;
        if (isCropMode && layer.cropArea) {
          // ক্রপ বক্স রিসাইজ করা
          const newCrop = { ...layer.cropArea, width: layer.cropArea.width * node.scaleX(), height: layer.cropArea.height * node.scaleY() };
          updateLayer(layer.id, { cropArea: newCrop });
          node.setAttrs({ scaleX: 1, scaleY: 1 }); // স্কেল রিসেট
        } else {
          updateLayer(layer.id, { x: node.x(), y: node.y(), scaleX: node.scaleX(), scaleY: node.scaleY(), rotation: node.rotation() });
        }
      }}
      clipFunc={(ctx) => {
        if (!img) return;
        const maskShape = layer.maskShape || 'none';
        const w = layer.cropArea ? layer.cropArea.width : img.width; 
        const h = layer.cropArea ? layer.cropArea.height : img.height;
        if (maskShape === 'circle') {
          ctx.arc(w / 2, h / 2, Math.min(w, h) / 2, 0, Math.PI * 2, false);
        } else if (maskShape === 'square') {
          const size = Math.min(w, h);
          ctx.rect((w - size) / 2, (h - size) / 2, size, size);
        } else {
          ctx.rect(0, 0, w, h);
        }
      }}
    >
      <KonvaImage image={img} {...cropProps} opacity={layer.opacity} globalCompositeOperation={layer.blendMode as any} />
    </Group>
  );
}