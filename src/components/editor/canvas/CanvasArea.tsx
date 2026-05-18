'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Text, Image as KonvaImage, Transformer, Line, Group } from 'react-konva';
import { useEditorStore, TextLayer, ImageLayer } from '../../../store/useEditorStore';
import useImage from 'use-image';
import Konva from 'konva';
import { Check, Trash2, Maximize } from 'lucide-react';

// --- ১. ইমজ রেন্ডারিং (Masking & Crop Support) ---
const RenderImageNode = ({ layer, isTypingOverlayOpen, isSpacePressed, isShiftPressed, isCropMode, multiSelectedIds, setSelectedLayer, setMultiSelectedIds, updateLayer, handleSnap }: any) => {
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
};

export default function CanvasArea() {
  const { 
    bgColor, bgImage, bgBlur, bgBrightness, bgScale, bgX, bgY, customFonts,
    layers, updateLayer, setSelectedLayer, selectedLayerId,
    multiSelectedIds, setMultiSelectedIds, isCropMode, // NEW
    isTypingOverlayOpen, setTypingOverlayOpen, initPersistentFonts,
    canvasWidth, canvasHeight,
    stageScale, stagePosition, setStageScale, setStagePosition, resetWorkspace
  } = useEditorStore();
  
  const [stageSize, setStageSize] = useState({ width: 360, height: 640 });
  const [localTextValue, setLocalTextValue] = useState("");
  const [snapLines, setSnapLines] = useState<{v: number | null, h: number | null}>({v: null, h: null});
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isShiftPressed, setIsShiftPressed] = useState(false); // NEW
  
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const bgImageRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [bgImg] = useImage(bgImage || '', 'anonymous');

  useEffect(() => { initPersistentFonts(); }, [initPersistentFonts]);

  // Spacebar Pan & Shift Multi-Select Logic
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { 
      if (e.key === 'Shift') setIsShiftPressed(true);
      if (e.code === 'Space' && !isTypingOverlayOpen && document.activeElement?.tagName !== 'INPUT') { e.preventDefault(); setIsSpacePressed(true); } 
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

  // Export Engine
  useEffect(() => {
    const handleDownload = (e: any) => {
      const targetWidth = e.detail?.targetWidth || canvasWidth; 
      if (stageRef.current) {
        setSelectedLayer(null);
        setMultiSelectedIds([]);
        setTimeout(() => {
          const pixelRatio = targetWidth / (canvasWidth * (stageRef.current.scaleX() || 1));
          const link = document.createElement('a');
          link.download = `StoryMaker_${targetWidth}px.png`;
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
    const activeIds = multiSelectedIds.length > 0 ? multiSelectedIds : (selectedLayerId ? [selectedLayerId] : []);
    if (activeIds.length > 0 && trRef.current && stageRef.current && !isTypingOverlayOpen) {
      const nodes = activeIds.map(id => stageRef.current.findOne(`#layer-${id}`)).filter(Boolean);
      const validNodes = nodes.filter(node => {
        const l = layers.find(layer => layer.id === node.id().replace('layer-', ''));
        return l && !l.locked && l.visible;
      });
      if (validNodes.length > 0) {
        trRef.current.nodes(validNodes);
        trRef.current.getLayer().batchDraw();
      } else {
        trRef.current.nodes([]);
      }
    } else if (trRef.current) trRef.current.nodes([]);
  }, [selectedLayerId, multiSelectedIds, layers, isTypingOverlayOpen]);

  const handleDoubleTap = (id: string, text: string) => { setLocalTextValue(text); setSelectedLayer(id); setTypingOverlayOpen(true); setTimeout(() => textareaRef.current?.focus(), 100); };
  const closeTypingOverlay = () => { if (selectedLayerId) updateLayer(selectedLayerId, { text: localTextValue } as any); setTypingOverlayOpen(false); };

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
    <div ref={containerRef} className={`w-full h-full flex items-center justify-center bg-[#09090b] overflow-hidden relative ${isSpacePressed ? 'cursor-grab active:cursor-grabbing' : ''}`}>
      <style dangerouslySetInnerHTML={{ __html: customFonts.map(f => `@font-face { font-family: '${f.name}'; src: url('${f.url}'); }`).join('\n') }} />

      {(stageScale !== 1 || stagePosition.x !== 0 || stagePosition.y !== 0) && (
        <button onClick={resetWorkspace} className="absolute bottom-6 left-6 z-10 p-3 bg-black/50 hover:bg-blue-600 border border-white/10 rounded-full text-white backdrop-blur-md shadow-lg transition-all active:scale-90" title="Reset View">
           <Maximize size={16} />
        </button>
      )}

      <div className="shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative border border-white/10 pointer-events-auto" style={{ borderRadius: canvasWidth === 1080 && canvasHeight === 1080 ? '4px' : '12px' }}>
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
              if (layer.type === 'image') return <RenderImageNode key={layer.id} layer={layer as ImageLayer} isTypingOverlayOpen={isTypingOverlayOpen} isSpacePressed={isSpacePressed} isShiftPressed={isShiftPressed} isCropMode={isCropMode} multiSelectedIds={multiSelectedIds} setSelectedLayer={setSelectedLayer} setMultiSelectedIds={setMultiSelectedIds} updateLayer={updateLayer} handleSnap={handleSnapMove} />;
              
              if (layer.type === 'text') {
                const textObj = layer as TextLayer;
                const fontStyleStr = `${textObj.isItalic ? 'italic' : 'normal'} ${textObj.isBold ? 'bold' : 'normal'}`;
                return (
                  <Text
                    key={textObj.id} id={`layer-${textObj.id}`}
                    text={isTypingOverlayOpen && selectedLayerId === textObj.id ? "" : textObj.text}
                    x={textObj.x} y={textObj.y} rotation={textObj.rotation} scaleX={textObj.scaleX} scaleY={textObj.scaleY}
                    opacity={textObj.opacity} globalCompositeOperation={textObj.blendMode as any}
                    fontSize={textObj.fontSize} fontFamily={`${textObj.fontFamily}, sans-serif`}
                    fontStyle={fontStyleStr} textDecoration={textObj.isUnderline ? 'underline' : ''}
                    fill={textObj.isGradient ? undefined : textObj.fill} fillLinearGradientStartPoint={textObj.isGradient ? { x: 0, y: 0 } : undefined} fillLinearGradientEndPoint={textObj.isGradient ? { x: 0, y: textObj.fontSize * 3 } : undefined} fillLinearGradientColorStops={textObj.isGradient ? [0, textObj.gradientColors[0], 1, textObj.gradientColors[1]] : undefined}
                    align={textObj.align} letterSpacing={textObj.letterSpacing} lineHeight={textObj.lineHeight} shadowColor={textObj.shadowColor} shadowBlur={textObj.shadowBlur} shadowOffsetX={textObj.shadowOffsetX} shadowOffsetY={textObj.shadowOffsetY} stroke={textObj.stroke} strokeWidth={textObj.strokeWidth} fillAfterStrokeEnabled={textObj.strokeType === 'outer'}
                    draggable={!textObj.locked && !isTypingOverlayOpen && !isSpacePressed}
                    onClick={(e) => { 
                      e.cancelBubble = true; 
                      if(!isSpacePressed) {
                        if(isShiftPressed) {
                          const newSelection = multiSelectedIds.includes(textObj.id) ? multiSelectedIds.filter(id => id !== textObj.id) : [...multiSelectedIds, textObj.id];
                          setMultiSelectedIds(newSelection);
                          setSelectedLayer(null);
                        } else {
                          setSelectedLayer(textObj.id);
                        }
                      } 
                    }} 
                    onTap={(e) => { e.cancelBubble = true; if(!isSpacePressed) setSelectedLayer(textObj.id); }}
                    onDblClick={() => handleDoubleTap(textObj.id, textObj.text)} onDblTap={() => handleDoubleTap(textObj.id, textObj.text)}
                    onDragMove={handleSnapMove} onDragEnd={(e) => { setSnapLines({ v: null, h: null }); updateLayer(textObj.id, { x: e.target.x(), y: e.target.y() }); }} onTransformEnd={(e) => { const node = e.target; updateLayer(textObj.id, { x: node.x(), y: node.y(), scaleX: node.scaleX(), scaleY: node.scaleY(), rotation: node.rotation() }); }}
                  />
                );
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
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-xl flex flex-col p-6 animate-in fade-in duration-200">
          <div className="flex justify-between items-center mb-6">
            <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Editor Keyboard</span>
            <div className="flex gap-3">
              <button onClick={() => setLocalTextValue("")} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-full font-bold flex items-center gap-1.5 transition-colors border border-red-500/20"><Trash2 size={16} /> Clear</button>
              <button onClick={closeTypingOverlay} className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2 rounded-full font-bold flex items-center gap-1.5 shadow-lg active:scale-95 transition-transform"><Check size={16} /> Done</button>
            </div>
          </div>
          <textarea autoFocus value={localTextValue} onChange={(e) => setLocalTextValue(e.target.value)} className="flex-1 w-full bg-transparent text-white text-2xl text-center resize-none outline-none font-sans pt-12 placeholder-white/10" placeholder="Type content here..." />
        </div>
      )}
    </div>
  );
}