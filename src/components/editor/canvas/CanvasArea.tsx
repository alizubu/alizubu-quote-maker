'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Image as KonvaImage, Transformer, Line } from 'react-konva';
import { useEditorStore } from '../../../store/useEditorStore';
import useImage from 'use-image';
import Konva from 'konva';
import { Maximize } from 'lucide-react';

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
  const [localTextValue, setLocalTextValue] = useState("");
  const [snapLines, setSnapLines] = useState<{v: number | null, h: number | null}>({v: null, h: null});
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isShiftPressed, setIsShiftPressed] = useState(false); 
  
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const bgImageRef = useRef<any>(null);
  const trRef = useRef<any>(null);

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

  // Mouse Wheel Zoom
  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    const oldScale = stageScale;
    const pointer = stage.getPointerPosition();
    const mousePointTo = { x: (pointer.x - stagePosition.x) / oldScale, y: (pointer.y - stagePosition.y) / oldScale };
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    setStageScale(newScale);
    setStagePosition({ x: pointer.x - mousePointTo.x * newScale, y: pointer.y - mousePointTo.y * newScale });
  };

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const scale = Math.min(containerRef.current.clientWidth / canvasWidth, containerRef.current.clientHeight / canvasHeight) * 0.95;
        setStageSize({ width: canvasWidth * scale, height: canvasHeight * scale });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [canvasWidth, canvasHeight]); 

  // Export Engine — pixelRatio must be based on canvas logical size only, not display scale
  useEffect(() => {
    const handleDownload = (e: any) => {
      const targetWidth = e.detail?.targetWidth || canvasWidth; 
      if (stageRef.current) {
        setSelectedLayer(null);
        setMultiSelectedIds([]);
        setTimeout(() => {
          // FIX: divide by canvasWidth (logical), NOT by the display-scaled stage size.
          // Previously multiplying by stageRef.scaleX() caused wrong output dimensions when zoomed.
          const pixelRatio = targetWidth / canvasWidth;
          const link = document.createElement('a');
          link.download = `Alizubu_${targetWidth}px.png`;
          link.href = stageRef.current.toDataURL({ pixelRatio, mimeType: 'image/png' });
          link.click();
        }, 150);
      }
    };
    window.addEventListener('trigger-safe-download', handleDownload);
    return () => window.removeEventListener('trigger-safe-download', handleDownload);
  }, [setSelectedLayer, setMultiSelectedIds, canvasWidth]);

  useEffect(() => { if (bgImg && bgImageRef.current) bgImageRef.current.cache(); }, [bgImg, bgBlur, bgBrightness]);

  // Transformer Logic (Updated for Multi-Select)
  useEffect(() => {
    const attach = () => {
      if (!trRef.current || !stageRef.current) return;
      const activeIds = multiSelectedIds.length > 0
        ? multiSelectedIds
        : selectedLayerId ? [selectedLayerId] : [];

      if (activeIds.length === 0 || isTypingOverlayOpen) {
        trRef.current.nodes([]);
        return;
      }

      const nodes = activeIds
        .map((id: string) => stageRef.current.findOne(`#layer-${id}`))
        .filter(Boolean);

      const validNodes = nodes.filter((node: any) => {
        const l = layers.find(layer => layer.id === node.id().replace('layer-', ''));
        return l && !l.locked && l.visible;
      });

      if (validNodes.length > 0) {
        trRef.current.nodes(validNodes);
        trRef.current.getLayer()?.batchDraw();
      } else {
        trRef.current.nodes([]);
      }
    };

    // Run immediately (for text layers which render synchronously)
    attach();
    // Also run after a short delay so freshly-added image nodes
    // (which load asynchronously via useImage) are found in the stage
    const t = setTimeout(attach, 80);
    return () => clearTimeout(t);
  }, [selectedLayerId, multiSelectedIds, layers, isTypingOverlayOpen]);

  const handleDoubleTap = (id: string, text: string) => { setLocalTextValue(text); setSelectedLayer(id); setTypingOverlayOpen(true); };
  const closeTypingOverlay = () => { if (selectedLayerId) updateLayer(selectedLayerId, { text: localTextValue } as any); setTypingOverlayOpen(false); };

  // FIX #7: Listen for open-typing-overlay event from TextPanel so it pre-fills existing text
  useEffect(() => {
    const handler = (e: any) => {
      setLocalTextValue(e.detail.text || '');
      setSelectedLayer(e.detail.id);
      setTypingOverlayOpen(true);
    };
    window.addEventListener('open-typing-overlay', handler);
    return () => window.removeEventListener('open-typing-overlay', handler);
  }, [setSelectedLayer, setTypingOverlayOpen]);

  const handleSnapMove = (e: any) => {
    const node = e.target; const width = node.width() * node.scaleX(); const height = node.height() * node.scaleY();
    const centerX = node.x() + width / 2; const centerY = node.y() + height / 2;
    const SNAP_TOLERANCE = 30; let snapV = null, snapH = null;
    if (Math.abs(centerX - (canvasWidth / 2)) < SNAP_TOLERANCE) { node.x((canvasWidth / 2) - width / 2); snapV = canvasWidth / 2; }
    if (Math.abs(centerY - (canvasHeight / 2)) < SNAP_TOLERANCE) { node.y((canvasHeight / 2) - height / 2); snapH = canvasHeight / 2; }
    setSnapLines({ v: snapV, h: snapH });
  };

  let bgProps = { x: 0, y: 0, width: canvasWidth, height: canvasHeight };
  if (bgImg) {
    const scale = Math.max(canvasWidth / bgImg.width, canvasHeight / bgImg.height);
    bgProps = { width: bgImg.width * scale * bgScale, height: bgImg.height * scale * bgScale, x: ((canvasWidth - bgImg.width * scale * bgScale) / 2) + bgX, y: ((canvasHeight - bgImg.height * scale * bgScale) / 2) + bgY };
  }

  const finalScale = ((stageSize.width / canvasWidth) || 1) * stageScale;
  const activeIdsForTr = multiSelectedIds.length > 0 ? multiSelectedIds : (selectedLayerId ? [selectedLayerId] : []);

  return (
    <div ref={containerRef} className={`w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-[#09090b] overflow-hidden relative transition-colors duration-300 ${isSpacePressed ? 'cursor-grab active:cursor-grabbing' : ''}`}>
      <style dangerouslySetInnerHTML={{ __html: customFonts.map(f => `@font-face { font-family: '${f.name}'; src: url('${f.url}'); }`).join('\n') }} />

      {(stageScale !== 1 || stagePosition.x !== 0 || stagePosition.y !== 0) && (
        <button onClick={resetWorkspace} className="absolute bottom-6 left-6 z-10 p-3 bg-white/80 dark:bg-black/50 hover:bg-blue-500 dark:hover:bg-blue-600 border border-zinc-200 dark:border-white/10 rounded-full text-zinc-700 dark:text-white hover:text-white backdrop-blur-md shadow-lg transition-all active:scale-90" title="Reset View">
           <Maximize size={16} />
        </button>
      )}

      <div className="shadow-[0_0_50px_rgba(0,0,0,0.3)] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative border border-zinc-300/50 dark:border-white/10 pointer-events-auto" style={{ borderRadius: canvasWidth === 1080 && canvasHeight === 1080 ? '4px' : '12px' }}>
        <Stage 
          ref={stageRef} width={stageSize.width || 360} height={stageSize.height || 640} 
          scaleX={finalScale} scaleY={finalScale} x={stagePosition.x} y={stagePosition.y} draggable={isSpacePressed} onWheel={handleWheel}
          onDragEnd={(e) => { if(e.target === e.target.getStage()) setStagePosition({ x: e.target.x(), y: e.target.y() }); }}
          onClick={(e) => { if(!isSpacePressed && (e.target === e.target.getStage() || e.target.name() === 'bg')) { setSelectedLayer(null); setMultiSelectedIds([]); } }}
          onTap={(e) => { if(!isSpacePressed && (e.target === e.target.getStage() || e.target.name() === 'bg')) { setSelectedLayer(null); setMultiSelectedIds([]); } }}
        >
          <Layer>
            <Rect width={canvasWidth} height={canvasHeight} fill={bgColor} name="bg" />
            {bgImg && <KonvaImage ref={bgImageRef} image={bgImg} name="bg" {...bgProps} filters={[Konva.Filters.Blur, Konva.Filters.Brighten]} blurRadius={bgBlur} brightness={bgBrightness / 100} />}
            
            {layers.map((layer) => {
              if (!layer.visible) return null;
              
              if (layer.type === 'image') {
                return <ImageNode key={layer.id} layer={layer} isTypingOverlayOpen={isTypingOverlayOpen} isSpacePressed={isSpacePressed} isShiftPressed={isShiftPressed} isCropMode={isCropMode} multiSelectedIds={multiSelectedIds} setSelectedLayer={setSelectedLayer} setMultiSelectedIds={setMultiSelectedIds} updateLayer={updateLayer} handleSnap={handleSnapMove} setSnapLines={setSnapLines} />;
              }
              
              if (layer.type === 'text') {
                return <TextNode key={layer.id} textObj={layer} isTypingOverlayOpen={isTypingOverlayOpen} selectedLayerId={selectedLayerId} isSpacePressed={isSpacePressed} isShiftPressed={isShiftPressed} multiSelectedIds={multiSelectedIds} setMultiSelectedIds={setMultiSelectedIds} setSelectedLayer={setSelectedLayer} handleDoubleTap={handleDoubleTap} handleSnapMove={handleSnapMove} setSnapLines={setSnapLines} updateLayer={updateLayer} />;
              }
              
              return null;
            })}
            
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
          </Layer>
        </Stage>
      </div>

      {isTypingOverlayOpen && (
        <TypingOverlay localTextValue={localTextValue} setLocalTextValue={setLocalTextValue} closeTypingOverlay={closeTypingOverlay} />
      )}
    </div>
  );
}