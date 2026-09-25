'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Rect, Image as KonvaImage, Transformer, Line, Group } from 'react-konva';
import { useEditorStore } from '../../../store/useEditorStore';
import useImage from 'use-image';
import Konva from 'konva';
import { Maximize, ZoomIn, ZoomOut } from 'lucide-react';

// --- ইমপোর্ট করা নতুন মডুলার কম্পোনেন্টগুলো ---
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
  const lastDist = useRef<number>(0);
  const lastCenter = useRef<{ x: number, y: number } | null>(null);

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

  const baseScale = Math.min((stageSize.width * 0.95) / canvasWidth, (stageSize.height * 0.95) / canvasHeight) || 1;
  const finalScale = baseScale * stageScale;
  const centerX = (stageSize.width - canvasWidth * finalScale) / 2;
  const centerY = (stageSize.height - canvasHeight * finalScale) / 2;
  const stageX = centerX + stagePosition.x;
  const stageY = centerY + stagePosition.y;

  // Mouse Wheel Zoom
  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    const oldStageScale = stageScale;
    const pointer = stage.getPointerPosition();
    
    const mousePointTo = { 
      x: (pointer.x - stage.x()) / stage.scaleX(), 
      y: (pointer.y - stage.y()) / stage.scaleY() 
    };
    
    const newStageScale = e.evt.deltaY < 0 ? oldStageScale * scaleBy : oldStageScale / scaleBy;
    const newFinalScale = baseScale * newStageScale;
    
    const newPos = {
      x: pointer.x - mousePointTo.x * newFinalScale,
      y: pointer.y - mousePointTo.y * newFinalScale
    };
    
    const newCenterX = (stageSize.width - canvasWidth * newFinalScale) / 2;
    const newCenterY = (stageSize.height - canvasHeight * newFinalScale) / 2;
    
    setStageScale(newStageScale);
    setStagePosition({ x: newPos.x - newCenterX, y: newPos.y - newCenterY });
  };

  // Mobile Multi-touch Zoom & Pan
  const handleTouchMove = (e: any) => {
    const touch1 = e.evt.touches[0];
    const touch2 = e.evt.touches[1];

    if (touch1 && touch2) {
      e.evt.preventDefault();
      
      const stage = stageRef.current;
      const containerBounds = containerRef.current?.getBoundingClientRect();
      if (!stage || !containerBounds) return;
      if (stage.isDragging()) { stage.stopDrag(); }

      const p1 = { x: touch1.clientX, y: touch1.clientY };
      const p2 = { x: touch2.clientX, y: touch2.clientY };

      const centerPoint = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      const newCenter = { x: centerPoint.x - containerBounds.left, y: centerPoint.y - containerBounds.top };
      const dist = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

      if (!lastCenter.current || !lastDist.current) {
        lastCenter.current = newCenter;
        lastDist.current = dist;
        return;
      }

      const pointTo = {
        x: (newCenter.x - stage.x()) / stage.scaleX(),
        y: (newCenter.y - stage.y()) / stage.scaleY(),
      };

      const scaleBy = dist / lastDist.current;
      const newStageScale = stageScale * scaleBy;
      const newFinalScale = baseScale * newStageScale;

      const dx = newCenter.x - lastCenter.current.x;
      const dy = newCenter.y - lastCenter.current.y;

      const newPos = {
        x: newCenter.x - pointTo.x * newFinalScale + dx,
        y: newCenter.y - pointTo.y * newFinalScale + dy,
      };

      const newCenterX = (stageSize.width - canvasWidth * newFinalScale) / 2;
      const newCenterY = (stageSize.height - canvasHeight * newFinalScale) / 2;

      setStageScale(newStageScale);
      setStagePosition({ x: newPos.x - newCenterX, y: newPos.y - newCenterY });

      lastCenter.current = newCenter;
      lastDist.current = dist;
    }
  };

  const handleTouchEnd = () => {
    lastDist.current = 0;
    lastCenter.current = null;
  };

  const zoomCanvas = (direction: 'in' | 'out') => {
    const scaleBy = 1.2;
    const oldStageScale = stageScale;
    const newStageScale = direction === 'in' ? oldStageScale * scaleBy : oldStageScale / scaleBy;
    const newFinalScale = baseScale * newStageScale;
    
    const stage = stageRef.current;
    if (!stage) {
      setStageScale(newStageScale);
      return;
    }
    
    const centerPoint = { x: stage.width() / 2, y: stage.height() / 2 };
    
    const pointTo = {
      x: (centerPoint.x - stage.x()) / stage.scaleX(),
      y: (centerPoint.y - stage.y()) / stage.scaleY(),
    };
    
    const newPos = {
      x: centerPoint.x - pointTo.x * newFinalScale,
      y: centerPoint.y - pointTo.y * newFinalScale,
    };
    
    const newCenterX = (stageSize.width - canvasWidth * newFinalScale) / 2;
    const newCenterY = (stageSize.height - canvasHeight * newFinalScale) / 2;

    setStageScale(newStageScale);
    setStagePosition({ x: newPos.x - newCenterX, y: newPos.y - newCenterY });
  };

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setStageSize({ width: containerRef.current.clientWidth, height: containerRef.current.clientHeight });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []); 

  // Export Engine — pixelRatio must be based on canvas logical size only, not display scale
  useEffect(() => {
    const handleDownload = (e: any) => {
      const targetWidth = e.detail?.targetWidth || canvasWidth; 
      if (stageRef.current) {
        setSelectedLayer(null);
        setMultiSelectedIds([]);
        setTimeout(() => {
          // Temporarily set scale and position to export perfectly
          const oldScale = stageRef.current.scaleX();
          const oldX = stageRef.current.x();
          const oldY = stageRef.current.y();
          
          stageRef.current.scaleX(1);
          stageRef.current.scaleY(1);
          stageRef.current.x(0);
          stageRef.current.y(0);

          const pixelRatio = targetWidth / canvasWidth;
          const link = document.createElement('a');
          link.download = `Alizubu_${targetWidth}px.png`;
          // clip rect for export matches canvas bounds
          link.href = stageRef.current.toDataURL({ 
            pixelRatio, 
            mimeType: 'image/png',
            x: 0, y: 0, width: canvasWidth, height: canvasHeight
          });
          link.click();

          // Restore
          stageRef.current.scaleX(oldScale);
          stageRef.current.scaleY(oldScale);
          stageRef.current.x(oldX);
          stageRef.current.y(oldY);
        }, 150);
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

  return (
    <div ref={containerRef} className={`w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-[#09090b] overflow-hidden relative transition-colors duration-300 ${isSpacePressed ? 'cursor-grab active:cursor-grabbing' : ''}`}>
      <style dangerouslySetInnerHTML={{ __html: customFonts.map(f => `@font-face { font-family: '${f.name}'; src: url('${f.url}'); }`).join('\n') }} />

      {(stageScale !== 1 || stagePosition.x !== 0 || stagePosition.y !== 0) && (
        <button onClick={resetWorkspace} className="absolute bottom-6 left-6 z-10 p-3 bg-white/80 dark:bg-black/50 hover:bg-blue-500 dark:hover:bg-blue-600 border border-zinc-200 dark:border-white/10 rounded-full text-zinc-700 dark:text-white hover:text-white backdrop-blur-md shadow-lg transition-all active:scale-90" title="Reset View">
           <Maximize size={16} />
        </button>
      )}

      <div className="absolute bottom-6 right-6 z-10 flex flex-row gap-3">
        <button onClick={() => zoomCanvas('out')} className="p-3 bg-zinc-800/80 hover:bg-zinc-700/80 dark:bg-black/50 dark:hover:bg-zinc-800/80 border border-zinc-200/20 dark:border-white/10 rounded-full text-white backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.3)] transition-all active:scale-90" title="Zoom Out">
          <ZoomOut size={20} />
        </button>
        <button onClick={() => zoomCanvas('in')} className="p-3 bg-zinc-800/80 hover:bg-zinc-700/80 dark:bg-black/50 dark:hover:bg-zinc-800/80 border border-zinc-200/20 dark:border-white/10 rounded-full text-white backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.3)] transition-all active:scale-90" title="Zoom In">
          <ZoomIn size={20} />
        </button>
      </div>

      <div className="w-full h-full overflow-hidden relative pointer-events-auto">
        <Stage 
          ref={stageRef} width={stageSize.width || 360} height={stageSize.height || 640} 
          scaleX={finalScale} scaleY={finalScale} x={stageX} y={stageY} draggable={isSpacePressed} 
          onWheel={handleWheel} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
          onDragEnd={(e) => { 
            if(e.target === e.target.getStage()) {
              setStagePosition({ x: e.target.x() - centerX, y: e.target.y() - centerY });
            } 
          }}
          onClick={(e) => { if(!isSpacePressed && (e.target === e.target.getStage() || e.target.name() === 'bg')) { setSelectedLayer(null); setMultiSelectedIds([]); } }}
          onTap={(e) => { if(!isSpacePressed && (e.target === e.target.getStage() || e.target.name() === 'bg')) { setSelectedLayer(null); setMultiSelectedIds([]); } }}
        >
          <Layer>
            {/* The outer part (Artboard Base) that scales visually but acts as the boundary */}
            <Rect 
              x={0} y={0} width={canvasWidth} height={canvasHeight} fill={bgColor} name="bg" 
              shadowColor="black" shadowBlur={30 / finalScale} shadowOpacity={0.15} 
              stroke="rgba(0,0,0,0.05)" strokeWidth={1 / finalScale}
              cornerRadius={canvasWidth === 1080 && canvasHeight === 1080 ? 4 : 12}
            />
            
            {/* The clipped internal canvas contents */}
            <Group clipX={0} clipY={0} clipWidth={canvasWidth} clipHeight={canvasHeight}>
              {bgImg && <KonvaImage ref={bgImageRef} image={bgImg} name="bg" {...bgProps} filters={[Konva.Filters.Blur, Konva.Filters.Brighten]} blurRadius={bgBlur} brightness={bgBrightness / 100} />}
              
              {layers.map((layer) => {
                if (!layer.visible) return null;
                if (layer.type === 'image') return <ImageNode key={layer.id} layer={layer} isTypingOverlayOpen={isTypingOverlayOpen} isSpacePressed={isSpacePressed} isShiftPressed={isShiftPressed} isCropMode={isCropMode} multiSelectedIds={multiSelectedIds} setSelectedLayer={setSelectedLayer} setMultiSelectedIds={setMultiSelectedIds} updateLayer={updateLayer} handleSnap={handleSnapMove} setSnapLines={setSnapLines} onImageLoaded={handleImageLoaded} />;
                if (layer.type === 'text') return <TextNode key={layer.id} textObj={layer} isTypingOverlayOpen={isTypingOverlayOpen} selectedLayerId={selectedLayerId} isSpacePressed={isSpacePressed} isShiftPressed={isShiftPressed} multiSelectedIds={multiSelectedIds} setMultiSelectedIds={setMultiSelectedIds} setSelectedLayer={setSelectedLayer} handleDoubleTap={handleDoubleTap} handleSnapMove={handleSnapMove} setSnapLines={setSnapLines} updateLayer={updateLayer} />;
                return null;
              })}
            </Group>
            
            {snapLines.v !== null && <Line points={[snapLines.v, 0, snapLines.v, canvasHeight]} stroke="#ec4899" strokeWidth={2 / finalScale} dash={[15 / finalScale, 10 / finalScale]} />}
            {snapLines.h !== null && <Line points={[0, snapLines.h, canvasWidth, snapLines.h]} stroke="#ec4899" strokeWidth={2 / finalScale} dash={[15 / finalScale, 10 / finalScale]} />}
            
            {activeIdsForTr.length > 0 && !isTypingOverlayOpen && !isSpacePressed && (
              <Transformer 
                ref={trRef} 
                enabledAnchors={isCropMode && activeIdsForTr.length === 1 ? ['top-left', 'top-right', 'bottom-left', 'bottom-right'] : ['top-left', 'top-center', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right']} 
                boundBoxFunc={(oldBox, newBox) => newBox.width < 10 || newBox.height < 10 ? oldBox : newBox} 
                borderStroke={isCropMode ? "#10b981" : "#3b82f6"} 
                anchorStroke={isCropMode ? "#10b981" : "#3b82f6"} 
                anchorFill="#ffffff" anchorSize={12 / finalScale} cornerRadius={5} 
              />
            )}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}