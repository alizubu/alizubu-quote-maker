'use client';

import React from 'react';
import { Group, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';

export default function ImageNode({ layer, isTypingOverlayOpen, isSpacePressed, isShiftPressed, isCropMode, multiSelectedIds, setSelectedLayer, setMultiSelectedIds, updateLayer, handleSnap, setSnapLines }: any) {
  const [img] = useImage(layer.url, 'anonymous');
  
  // Crop Logic — use stored crop or full image dimensions
  const cropProps = layer.cropArea && img ? {
    crop: layer.cropArea,
    width: layer.cropArea.width,
    height: layer.cropArea.height,
  } : img ? { width: img.width, height: img.height } : {};

  return (
    <Group
      id={`layer-${layer.id}`}
      x={layer.x}
      y={layer.y}
      rotation={layer.rotation}
      scaleX={layer.scaleX}
      scaleY={layer.scaleY}
      draggable={!layer.locked && !isTypingOverlayOpen && !isSpacePressed}
      onClick={(e: any) => { 
        e.cancelBubble = true; 
        if (!isSpacePressed) {
          if (isShiftPressed) {
            const newSelection = multiSelectedIds.includes(layer.id)
              ? multiSelectedIds.filter((id: string) => id !== layer.id)
              : [...multiSelectedIds, layer.id];
            setMultiSelectedIds(newSelection);
            setSelectedLayer(null);
          } else {
            setSelectedLayer(layer.id);
          }
        } 
      }} 
      onTap={(e: any) => { e.cancelBubble = true; if (!isSpacePressed) setSelectedLayer(layer.id); }}
      onDragMove={handleSnap}
      onDragEnd={(e: any) => {
        // FIX #5: Clear snap lines when drag ends (was missing, causing stuck guide lines)
        if (setSnapLines) setSnapLines({ v: null, h: null });
        updateLayer(layer.id, { x: e.target.x(), y: e.target.y() });
      }}
      onTransformEnd={(e: any) => {
        const node = e.target;
        if (isCropMode && layer.cropArea) {
          // FIX #6: Crop scale bug — use the STORED crop dimensions (not multiplied again).
          // Previously: cropArea.width * node.scaleX() compounded on every resize.
          // Now: we store the new visual pixel dimensions by computing from the original image.
          const baseW = img ? img.width : layer.cropArea.width;
          const baseH = img ? img.height : layer.cropArea.height;
          const newCrop = {
            ...layer.cropArea,
            width: Math.min(baseW, layer.cropArea.width * Math.abs(node.scaleX())),
            height: Math.min(baseH, layer.cropArea.height * Math.abs(node.scaleY())),
          };
          updateLayer(layer.id, { cropArea: newCrop });
          node.setAttrs({ scaleX: 1, scaleY: 1 }); // reset scale after applying
        } else {
          updateLayer(layer.id, {
            x: node.x(),
            y: node.y(),
            scaleX: node.scaleX(),
            scaleY: node.scaleY(),
            rotation: node.rotation(),
          });
        }
      }}
      clipFunc={(ctx: any) => {
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
      <KonvaImage
        image={img}
        {...cropProps}
        opacity={layer.opacity}
        globalCompositeOperation={layer.blendMode as any}
      />
    </Group>
  );
}
