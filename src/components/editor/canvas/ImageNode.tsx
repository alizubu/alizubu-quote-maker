'use client';

import React from 'react';
import { Group, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';

export default function ImageNode({ layer, isTypingOverlayOpen, isSpacePressed, isShiftPressed, isCropMode, multiSelectedIds, setSelectedLayer, setMultiSelectedIds, updateLayer, handleSnap, setSnapLines }: any) {
  // FIX: blob URLs (from createObjectURL) fail with crossOrigin='anonymous'
  // Only use 'anonymous' for http/https URLs, not for blob: or data: URLs
  const isBlobOrData = layer.url?.startsWith('blob:') || layer.url?.startsWith('data:');
  const [img] = useImage(layer.url, isBlobOrData ? undefined : 'anonymous');
  
  // Crop Logic — use stored crop or full image dimensions
  const cropProps = layer.cropArea && img ? {
    crop: layer.cropArea,
    width: layer.cropArea.width,
    height: layer.cropArea.height,
  } : img ? { width: img.width, height: img.height } : {};

  // If image hasn't loaded yet, render a placeholder-sized Group so it's still
  // clickable/draggable (avoids the "invisible node" problem)
  const placeholderSize = { width: 300, height: 300 };
  const effectiveSize = img 
    ? (layer.cropArea ? { width: layer.cropArea.width, height: layer.cropArea.height } : { width: img.width, height: img.height })
    : placeholderSize;

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
        if (setSnapLines) setSnapLines({ v: null, h: null });
        updateLayer(layer.id, { x: e.target.x(), y: e.target.y() });
      }}
      onTransformEnd={(e: any) => {
        const node = e.target;
        if (isCropMode && layer.cropArea) {
          const baseW = img ? img.width : layer.cropArea.width;
          const baseH = img ? img.height : layer.cropArea.height;
          const newCrop = {
            ...layer.cropArea,
            width: Math.min(baseW, layer.cropArea.width * Math.abs(node.scaleX())),
            height: Math.min(baseH, layer.cropArea.height * Math.abs(node.scaleY())),
          };
          updateLayer(layer.id, { cropArea: newCrop });
          node.setAttrs({ scaleX: 1, scaleY: 1 });
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
      // FIX: Only apply clipFunc when image is loaded AND has a mask shape
      // Without this, the Group has zero hit area when img is null
      clipFunc={img && (layer.maskShape && layer.maskShape !== 'none') ? (ctx: any) => {
        const w = layer.cropArea ? layer.cropArea.width : img.width; 
        const h = layer.cropArea ? layer.cropArea.height : img.height;
        if (layer.maskShape === 'circle') {
          ctx.arc(w / 2, h / 2, Math.min(w, h) / 2, 0, Math.PI * 2, false);
        } else if (layer.maskShape === 'square') {
          const size = Math.min(w, h);
          ctx.rect((w - size) / 2, (h - size) / 2, size, size);
        } else {
          ctx.rect(0, 0, w, h);
        }
      } : undefined}
    >
      {img ? (
        <KonvaImage
          image={img}
          {...cropProps}
          opacity={layer.opacity}
          globalCompositeOperation={layer.blendMode as any}
        />
      ) : (
        // Placeholder rect while image is loading — ensures the node has hit area
        <KonvaImage
          width={placeholderSize.width}
          height={placeholderSize.height}
          opacity={0.3}
        />
      )}
    </Group>
  );
}
