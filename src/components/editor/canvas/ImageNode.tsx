'use client';

import React, { useEffect, useRef } from 'react';
import { Group, Image as KonvaImage, Rect } from 'react-konva';
import useImage from 'use-image';
import { useEditorStore } from '../../../store/useEditorStore';

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
  onImageLoaded,
}: any) {
  const { canvasWidth, canvasHeight } = useEditorStore();

  // blob: / data: URLs must NOT use crossOrigin='anonymous' — it causes CORS errors
  const crossOrigin = (layer.url?.startsWith('blob:') || layer.url?.startsWith('data:'))
    ? undefined
    : ('anonymous' as const);

  const [img, status] = useImage(layer.url, crossOrigin);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!img) return;

    // Auto-scale on first load: naturalWidth === 0 is the sentinel set by addImageLayer.
    // naturalWidth === undefined means an old project file — skip to preserve layout.
    if (layer.naturalWidth === 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      const maxW = canvasWidth * 0.65;
      const maxH = canvasHeight * 0.65;
      const scale = Math.min(1, maxW / img.width, maxH / img.height);
      const scaledW = img.width * scale;
      const scaledH = img.height * scale;
      updateLayer(layer.id, {
        scaleX: scale,
        scaleY: scale,
        x: Math.round((canvasWidth - scaledW) / 2),
        y: Math.round((canvasHeight - scaledH) / 2),
        naturalWidth: img.width,
        naturalHeight: img.height,
      });
    }

    if (onImageLoaded) onImageLoaded(layer.id);
  }, [img]); // eslint-disable-line react-hooks/exhaustive-deps

  // Effective display dimensions — fall back to 300×300 before image loads
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
        // Placeholder while loading — gives the Group a hit area so the Transformer can attach
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
