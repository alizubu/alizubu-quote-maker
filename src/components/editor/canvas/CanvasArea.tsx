'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Rect, Image as KonvaImage, Transformer, Line, Group } from 'react-konva';
import { useEditorStore } from '../../../store/useEditorStore';
import useImage from 'use-image';
import Konva from 'konva';
import { Maximize, ZoomIn, ZoomOut } from 'lucide-react';

// --- Modular Components ---
import ImageNode from './ImageNode';
import TextNode from './TextNode';
import TypingOverlay from './TypingOverlay';

export default function CanvasArea() {
  const { 
    bgColor, bgImage, bgBlur, bgBrightness, bgScale, bgX, bgY, customFonts,
    layers, updateLayer, setSelectedLayer, selectedLayerId,
    multiSelectedIds, setMultiSelectedIds, isCropMode, 
    isTypingOverlayOpen, setTypingOverlayOpen, initPersistentFonts,
    canvasWidth, canvasHeight,
    stageScale, stagePosition, setStageScale, setStagePosition, resetWorkspace
  } = useEditorStore();
  
  const [stageSize, setStageSize] = useState({ width: 360, height: 640 });
  const [snapLines, setSnapLines] = useState<{v: number | null, h: number | null}>({v: null, h: null});
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isShiftPressed, setIsShiftPressed] = useState(false); 
  
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const bgImageRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const artboardRef = useRef<any>(null);
  const lastDist = useRef<number>(0);
  const lastCenter = useRef<{ x: number, y: number } | null>(null);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  const [bgImg] = useImage(bgImage || '', 'anonymous');

  useEffect(() => { initPersistentFonts(); }, [initPersistentFonts]);

  // Spacebar Pan & Shift Multi-Select Logic
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { 
      if (e.key === 'Shift') setIsShiftPressed(true);
      if (e.code === 'Space' && !isTypingOverlayOpen && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') { e.preventDefault(); setIsSpacePressed(true); } 
    };
    const handleKeyUp = (e: KeyboardEvent) => { 
      if (e.key === 'Shift') setIsShiftPressed(false);
      if (e.code === 'Space') setIsSpacePressed(false); 
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, [isTypingOverlayOpen]);

  // --- Zoom Bounds ---
  const MIN_ZOOM = 0.25;
  const MAX_ZOOM = 4.0;
  const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

  // --- Computed Display Values ---
  // Stage stays at 1:1 (no transforms). The artboard Group handles all zoom/pan.
  const MARGIN = 16; // px padding around artboard
  const baseScale = Math.min((stageSize.width - MARGIN * 2) / canvasWidth, (stageSize.height - MARGIN * 2) / canvasHeight) || 1;
  const finalScale = baseScale * stageScale;
  const groupX = (stageSize.width - canvasWidth * finalScale) / 2 + stagePosition.x;
  const groupY = (stageSize.height - canvasHeight * finalScale) / 2 + stagePosition.y;
  const zoomPercent = Math.round(stageScale * 100);

  // Helper: read fresh state for rapid event handlers
  const getTransform = useCallback(() => {
    const s = useEditorStore.getState();
    const fs = baseScale * s.stageScale;
    return {
      stageScale: s.stageScale,
      finalScale: fs,
      groupX: (stageSize.width - canvasWidth * fs) / 2 + s.stagePosition.x,
      groupY: (stageSize.height - canvasHeight * fs) / 2 + s.stagePosition.y,
    };
  }, [baseScale, stageSize.width, stageSize.height, canvasWidth, canvasHeight]);

  // --- Mouse Wheel Zoom ---
  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const pointer = e.target.getStage().getPointerPosition();
    const t = getTransform();
    
    const mousePointTo = { 
      x: (pointer.x - t.groupX) / t.finalScale, 
      y: (pointer.y - t.groupY) / t.finalScale 
    };
    
    const newSS = clampZoom(e.evt.deltaY < 0 ? t.stageScale * scaleBy : t.stageScale / scaleBy);
    const newFS = baseScale * newSS;
    const newGX = pointer.x - mousePointTo.x * newFS;
    const newGY = pointer.y - mousePointTo.y * newFS;
    const cx = (stageSize.width - canvasWidth * newFS) / 2;
    const cy = (stageSize.height - canvasHeight * newFS) / 2;
    
    setStageScale(newSS);
    setStagePosition({ x: newGX - cx, y: newGY - cy });
  };

  // --- Mobile Multi-touch Zoom & Pan ---
  const handleTouchMove = (e: any) => {
    const touch1 = e.evt.touches[0];
    const touch2 = e.evt.touches[1];

    if (touch1 && touch2) {
      e.evt.preventDefault();
      
      const stage = stageRef.current;
      const containerBounds = containerRef.current?.getBoundingClientRect();
      if (!stage || !containerBounds) return;
      if (stage.isDragging()) { stage.stopDrag(); }

      const p1 = { x: touch1.clientX - containerBounds.left, y: touch1.clientY - containerBounds.top };
      const p2 = { x: touch2.clientX - containerBounds.left, y: touch2.clientY - containerBounds.top };

      const newCenter = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      const dist = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

      if (!lastCenter.current || !lastDist.current) {
        lastCenter.current = newCenter;
        lastDist.current = dist;
        return;
      }

      const t = getTransform();

      const pointTo = {
        x: (newCenter.x - t.groupX) / t.finalScale,
        y: (newCenter.y - t.groupY) / t.finalScale,
      };

      const scaleBy = dist / lastDist.current;
      const newSS = clampZoom(t.stageScale * scaleBy);
      const newFS = baseScale * newSS;

      const dx = newCenter.x - lastCenter.current.x;
      const dy = newCenter.y - lastCenter.current.y;

      const newGX = newCenter.x - pointTo.x * newFS + dx;
      const newGY = newCenter.y - pointTo.y * newFS + dy;
      const cx = (stageSize.width - canvasWidth * newFS) / 2;
      const cy = (stageSize.height - canvasHeight * newFS) / 2;

      setStageScale(newSS);
      setStagePosition({ x: newGX - cx, y: newGY - cy });

      lastCenter.current = newCenter;
      lastDist.current = dist;
    }
  };

  const handleTouchEnd = () => {
    lastDist.current = 0;
    lastCenter.current = null;
  };

  // --- Spacebar Pan (Manual mouse drag) ---
  const handleMouseDown = (e: any) => {
    if (!isSpacePressed) return;
    isPanningRef.current = true;
    const pointer = e.target.getStage().getPointerPosition();
    const sp = useEditorStore.getState().stagePosition;
    panStartRef.current = { x: pointer.x - sp.x, y: pointer.y - sp.y };
  };

  const handleMouseMove = (e: any) => {
    if (!isPanningRef.current) return;
    const pointer = e.target.getStage().getPointerPosition();
    setStagePosition({
      x: pointer.x - panStartRef.current.x,
      y: pointer.y - panStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    isPanningRef.current = false;
  };

  // --- Zoom Buttons ---
  const zoomCanvas = (direction: 'in' | 'out') => {
    const scaleBy = 1.25;
    const t = getTransform();
    const newSS = clampZoom(direction === 'in' ? t.stageScale * scaleBy : t.stageScale / scaleBy);
    const newFS = baseScale * newSS;
    
    const center = { x: stageSize.width / 2, y: stageSize.height / 2 };
    const pointTo = {
      x: (center.x - t.groupX) / t.finalScale,
      y: (center.y - t.groupY) / t.finalScale,
    };
    
    const newGX = center.x - pointTo.x * newFS;
    const newGY = center.y - pointTo.y * newFS;
    const cx = (stageSize.width - canvasWidth * newFS) / 2;
    const cy = (stageSize.height - canvasHeight * newFS) / 2;

    setStageScale(newSS);
    setStagePosition({ x: newGX - cx, y: newGY - cy });
  };

  // --- Container Resize (ResizeObserver for responsive tracking) ---
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setStageSize({ width, height });
        }
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []); 

  // --- Export Engine ---
  useEffect(() => {
    const handleDownload = (e: any) => {
      const targetWidth = e.detail?.targetWidth || canvasWidth;
      const group = artboardRef.current;
      const stage = stageRef.current;
      if (stage && group) {
        setSelectedLayer(null);
        setMultiSelectedIds([]);
        setTimeout(() => {
          // Save current state
          const oldSX = group.scaleX();
          const oldSY = group.scaleY();
          const oldGX = group.x();
          const oldGY = group.y();
          const oldStageW = stage.width();
          const oldStageH = stage.height();
          
          // Temporarily resize Stage to fit the full canvas and reset Group
          stage.width(canvasWidth);
          stage.height(canvasHeight);
          group.scaleX(1);
          group.scaleY(1);
          group.x(0);
          group.y(0);

          // Uncache the background image for sharp export
          if (bgImageRef.current) {
            bgImageRef.current.clearCache();
          }

          // Force a full re-render at the new dimensions
          stage.batchDraw();

          const pixelRatio = targetWidth / canvasWidth;
          const link = document.createElement('a');
          link.download = `Alizubu_${targetWidth}px.png`;
          link.href = stage.toDataURL({ 
            pixelRatio, 
            mimeType: 'image/png',
            x: 0, y: 0, width: canvasWidth, height: canvasHeight
          });
          link.click();

          // Restore everything
          stage.width(oldStageW);
          stage.height(oldStageH);
          group.scaleX(oldSX);
          group.scaleY(oldSY);
          group.x(oldGX);
          group.y(oldGY);

          // Re-cache background image for display performance
          if (bgImageRef.current) {
            bgImageRef.current.cache();
          }
          stage.batchDraw();
        }, 200);
      }
    };
    window.addEventListener('trigger-safe-download', handleDownload);
    return () => window.removeEventListener('trigger-safe-download', handleDownload);
  }, [setSelectedLayer, setMultiSelectedIds, canvasWidth, canvasHeight]);

  useEffect(() => { if (bgImg && bgImageRef.current) bgImageRef.current.cache(); }, [bgImg, bgBlur, bgBrightness]);

  const attachTransformer = useCallback(() => {
    if (!trRef.current || !stageRef.current) return;
    const activeIds = multiSelectedIds.length > 0 ? multiSelectedIds : selectedLayerId ? [selectedLayerId] : [];
    if (activeIds.length === 0 || isTypingOverlayOpen) { trRef.current.nodes([]); trRef.current.getLayer()?.batchDraw(); return; }
    const nodes = activeIds.map((id: string) => stageRef.current.findOne(`#layer-${id}`)).filter(Boolean);
    const validNodes = nodes.filter((node: any) => {
      const l = layers.find(layer => layer.id === node.id().replace('layer-', ''));
      return l && !l.locked && l.visible;
    });
    if (validNodes.length > 0) { trRef.current.nodes(validNodes); trRef.current.getLayer()?.batchDraw(); } else { trRef.current.nodes([]); trRef.current.getLayer()?.batchDraw(); }
  }, [selectedLayerId, multiSelectedIds, layers, isTypingOverlayOpen]);

  useEffect(() => {
    attachTransformer();
    const t1 = setTimeout(attachTransformer, 100); const t2 = setTimeout(attachTransformer, 400); const t3 = setTimeout(attachTransformer, 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [attachTransformer]);

  const handleImageLoaded = useCallback((layerId: string) => {
    const activeIds = multiSelectedIds.length > 0 ? multiSelectedIds : (selectedLayerId ? [selectedLayerId] : []);
    if (activeIds.includes(layerId)) { setTimeout(attachTransformer, 50); }
  }, [selectedLayerId, multiSelectedIds, attachTransformer]);

  const handleDoubleTap = (id: string, text: string) => { setSelectedLayer(id); setTypingOverlayOpen(true); };

  const handleSnapMove = (e: any) => {
    const node = e.target; const width = node.width() * node.scaleX(); const height = node.height() * node.scaleY();
    const nodeCenterX = node.x() + width / 2; const nodeCenterY = node.y() + height / 2;
    const SNAP_TOLERANCE = 30; let snapV = null, snapH = null;
    if (Math.abs(nodeCenterX - (canvasWidth / 2)) < SNAP_TOLERANCE) { node.x((canvasWidth / 2) - width / 2); snapV = canvasWidth / 2; }
    if (Math.abs(nodeCenterY - (canvasHeight / 2)) < SNAP_TOLERANCE) { node.y((canvasHeight / 2) - height / 2); snapH = canvasHeight / 2; }
    setSnapLines({ v: snapV, h: snapH });
  };

  let bgProps = { x: 0, y: 0, width: canvasWidth, height: canvasHeight };
  if (bgImg) {
    const scale = Math.max(canvasWidth / bgImg.width, canvasHeight / bgImg.height);
    bgProps = { width: bgImg.width * scale * bgScale, height: bgImg.height * scale * bgScale, x: ((canvasWidth - bgImg.width * scale * bgScale) / 2) + bgX, y: ((canvasHeight - bgImg.height * scale * bgScale) / 2) + bgY };
  }

  const activeIdsForTr = multiSelectedIds.length > 0 ? multiSelectedIds : (selectedLayerId ? [selectedLayerId] : []);

  // Click/Tap on empty workspace = deselect
  const handleDeselect = (e: any) => {
    if (isSpacePressed) return;
    const target = e.target;
    if (target === target.getStage() || target.name() === 'bg' || target.name() === 'workspace-bg') {
      setSelectedLayer(null);
      setMultiSelectedIds([]);
    }
  };

  return (
    <div ref={containerRef} className={`w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-[#09090b] overflow-hidden relative transition-colors duration-300 ${isSpacePressed ? 'cursor-grab active:cursor-grabbing' : ''}`}>
      <style dangerouslySetInnerHTML={{ __html: customFonts.map(f => `@font-face { font-family: '${f.name}'; src: url('${f.url}'); }`).join('\n') }} />

      {/* Zoom Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 bg-black/70 dark:bg-black/80 backdrop-blur-xl rounded-full px-1.5 py-1.5 border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
        <button onClick={() => zoomCanvas('out')} className="p-2 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-all active:scale-90" title="Zoom Out">
          <ZoomOut size={16} />
        </button>
        <button onClick={resetWorkspace} className="min-w-[52px] px-2 py-1 text-[11px] font-mono font-semibold text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-all active:scale-95 text-center" title="Reset to Fit">
          {zoomPercent}%
        </button>
        <button onClick={() => zoomCanvas('in')} className="p-2 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-all active:scale-90" title="Zoom In">
          <ZoomIn size={16} />
        </button>
        {(stageScale !== 1 || stagePosition.x !== 0 || stagePosition.y !== 0) && (
          <button onClick={resetWorkspace} className="p-2 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-all active:scale-90 border-l border-white/10 ml-0.5 pl-2.5" title="Fit to Screen">
            <Maximize size={14} />
          </button>
        )}
      </div>

      <div className="w-full h-full overflow-hidden relative pointer-events-auto">
        <Stage 
          ref={stageRef} 
          width={stageSize.width || 360} 
          height={stageSize.height || 640}
          onWheel={handleWheel} 
          onTouchMove={handleTouchMove} 
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={handleDeselect}
          onTap={handleDeselect}
        >
          <Layer>
            {/* Artboard Group: carries ALL zoom/pan transforms */}
            <Group
              ref={artboardRef}
              x={groupX}
              y={groupY}
              scaleX={finalScale}
              scaleY={finalScale}
            >
              {/* Artboard base — shadow renders freely because Stage is unscaled */}
              <Rect 
                x={0} y={0} width={canvasWidth} height={canvasHeight} fill={bgColor} name="bg" 
                shadowColor="black" shadowBlur={25} shadowOpacity={0.2} shadowOffsetY={4}
                stroke="rgba(0,0,0,0.08)" strokeWidth={1}
                cornerRadius={canvasWidth === 1080 && canvasHeight === 1080 ? 4 : 12}
              />
              
              {/* Clipped internal canvas contents */}
              <Group clipX={0} clipY={0} clipWidth={canvasWidth} clipHeight={canvasHeight}>
                {bgImg && <KonvaImage ref={bgImageRef} image={bgImg} name="bg" {...bgProps} filters={[Konva.Filters.Blur, Konva.Filters.Brighten]} blurRadius={bgBlur} brightness={bgBrightness / 100} />}
                
                {layers.map((layer) => {
                  if (!layer.visible) return null;
                  if (layer.type === 'image') return <ImageNode key={layer.id} layer={layer} isTypingOverlayOpen={isTypingOverlayOpen} isSpacePressed={isSpacePressed} isShiftPressed={isShiftPressed} isCropMode={isCropMode} multiSelectedIds={multiSelectedIds} setSelectedLayer={setSelectedLayer} setMultiSelectedIds={setMultiSelectedIds} updateLayer={updateLayer} handleSnap={handleSnapMove} setSnapLines={setSnapLines} onImageLoaded={handleImageLoaded} />;
                  if (layer.type === 'text') return <TextNode key={layer.id} textObj={layer} isTypingOverlayOpen={isTypingOverlayOpen} selectedLayerId={selectedLayerId} isSpacePressed={isSpacePressed} isShiftPressed={isShiftPressed} multiSelectedIds={multiSelectedIds} setMultiSelectedIds={setMultiSelectedIds} setSelectedLayer={setSelectedLayer} handleDoubleTap={handleDoubleTap} handleSnapMove={handleSnapMove} setSnapLines={setSnapLines} updateLayer={updateLayer} />;
                  return null;
                })}
              </Group>
              
              {snapLines.v !== null && <Line points={[snapLines.v, 0, snapLines.v, canvasHeight]} stroke="#ec4899" strokeWidth={2} dash={[15, 10]} />}
              {snapLines.h !== null && <Line points={[0, snapLines.h, canvasWidth, snapLines.h]} stroke="#ec4899" strokeWidth={2} dash={[15, 10]} />}
              
              {activeIdsForTr.length > 0 && !isTypingOverlayOpen && !isSpacePressed && (
                <Transformer 
                  ref={trRef} 
                  enabledAnchors={isCropMode && activeIdsForTr.length === 1 ? ['top-left', 'top-right', 'bottom-left', 'bottom-right'] : ['top-left', 'top-center', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right']} 
                  boundBoxFunc={(oldBox, newBox) => newBox.width < 10 || newBox.height < 10 ? oldBox : newBox} 
                  borderStroke={isCropMode ? "#10b981" : "#3b82f6"} 
                  anchorStroke={isCropMode ? "#10b981" : "#3b82f6"} 
                  anchorFill="#ffffff" anchorSize={12} cornerRadius={5} 
                />
              )}
            </Group>
          </Layer>
        </Stage>
      </div>
    </div>
  );
}