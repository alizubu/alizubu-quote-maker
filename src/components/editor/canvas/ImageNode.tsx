'use client';

import React from 'react';
import { Group, Image as KonvaImage, Rect } from 'react-konva';
import useImage from 'use-image';

export default function ImageNode({
  layer,
  isTypingOverlayOpen,
  isSpacePressed,
  isShiftPressed,
  isCropMode,
  multiSelectedIds,
  setSelectedLayer,
  setMultiSelectedIds,
  updateLayer,
  handleSnap,
  setSnapLines,
}: any) {
  // CRITICAL FIX: blob: URLs created by URL.createObjectURL() MUST NOT
  // use crossOrigin='anonymous'. Passing it causes a CORS error and the
  // image silently never loads — making the layer invisible and non-interactive.
  const crossOrigin = (layer.url?.startsWith('blob:') || layer.url?.startsWith('data:'))
    ? undefined
    : ('anonymous' as const);

  const [img, status] = useImage(layer.url, crossOrigin);

  // Effective display dimensions
  const W = layer.cropArea?.width  ?? img?.width  ?? 300;
  const H = layer.cropArea?.height ?? img?.height ?? 300;

  const onInteract = (e: any) => {
    e.cancelBubble = true;
    if (isSpacePressed) return;
    if (isShiftPressed) {
      const already = (multiSelectedIds as string[]).includes(layer.id);
      setMultiSelectedIds(
        already
          ? multiSelectedIds.filter((id: string) => id !== layer.id)
          : [...multiSelectedIds, layer.id]
      );
      setSelectedLayer(null);
    } else {
      setSelectedLayer(layer.id);
    }
  };

  return (
    <Group
      id={`layer-${layer.id}`}
      x={layer.x}
      y={layer.y}
      rotation={layer.rotation}
      scaleX={layer.scaleX}
      scaleY={layer.scaleY}
      opacity={layer.opacity ?? 1}
      globalCompositeOperation={(layer.blendMode ?? 'source-over') as any}
      draggable={!layer.locked && !isTypingOverlayOpen && !isSpacePressed}
      onClick={onInteract}
      onTap={onInteract}
      onDragMove={handleSnap}
      onDragEnd={(e: any) => {
        if (setSnapLines) setSnapLines({ v: null, h: null });
        updateLayer(layer.id, { x: e.target.x(), y: e.target.y() });
      }}
      onTransformEnd={(e: any) => {
        const node = e.target;
        if (isCropMode && layer.cropArea) {
          const bW = img?.width  ?? layer.cropArea.width;
          const bH = img?.height ?? layer.cropArea.height;
          updateLayer(layer.id, {
            cropArea: {
              ...layer.cropArea,
              width:  Math.min(bW, layer.cropArea.width  * Math.abs(node.scaleX())),
              height: Math.min(bH, layer.cropArea.height * Math.abs(node.scaleY())),
            },
          });
          node.setAttrs({ scaleX: 1, scaleY: 1 });
        } else {
          updateLayer(layer.id, {
            x: node.x(), y: node.y(),
            scaleX: node.scaleX(), scaleY: node.scaleY(),
            rotation: node.rotation(),
          });
        }
      }}
    >
      {img ? (
        <KonvaImage
          image={img}
          width={W}
          height={H}
          crop={layer.cropArea ?? undefined}
        />
      ) : (
        /*
         * While the image is loading (or if it failed), render a visible
         * dashed-border placeholder.  This is CRITICAL: without any child
         * that has non-zero dimensions, the Konva Group has no hit area —
         * clicks and drags are ignored and the Transformer cannot attach.
         */
        <Rect
          width={300}
          height={300}
          fill="rgba(120,120,120,0.18)"
          stroke={status === 'failed' ? '#ef4444' : 'rgba(255,255,255,0.45)'}
          strokeWidth={2}
          dash={[10, 5]}
        />
      )}
    </Group>
  );
}
