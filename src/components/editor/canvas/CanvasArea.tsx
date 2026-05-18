'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Text, Image as KonvaImage, Transformer, Line } from 'react-konva';
import { useEditorStore, TextLayer, ImageLayer } from '../../../store/useEditorStore';
import useImage from 'use-image';
import Konva from 'konva';
import { Check, Trash2 } from 'lucide-react';

// --- ১. ইমজ/স্টিকার রেন্ডারিং কম্পোনেন্ট ---
const RenderImageNode = ({ layer, isTypingOverlayOpen, setSelectedLayer, updateLayer, handleSnap }: any) => {
  const [img] = useImage(layer.url, 'anonymous');
  return (
    <KonvaImage
      id={`layer-${layer.id}`} image={img} x={layer.x} y={layer.y}
      rotation={layer.rotation} scaleX={layer.scaleX} scaleY={layer.scaleY}
      opacity={layer.opacity} globalCompositeOperation={layer.blendMode as any}
      draggable={!layer.locked && !isTypingOverlayOpen}
      onClick={() => setSelectedLayer(layer.id)} onTap={() => setSelectedLayer(layer.id)}
      onDragMove={handleSnap}
      onDragEnd={(e) => updateLayer(layer.id, { x: e.target.x(), y: e.target.y() })}
      onTransformEnd={(e) => {
        const node = e.target;
        updateLayer(layer.id, { x: node.x(), y: node.y(), scaleX: node.scaleX(), scaleY: node.scaleY(), rotation: node.rotation() });
      }}
    />
  );
};

export default function CanvasArea() {
  const { 
    bgColor, bgImage, bgBlur, bgBrightness, bgScale, bgX, bgY, customFonts,
    layers, updateLayer, setSelectedLayer, selectedLayerId,
    isTypingOverlayOpen, setTypingOverlayOpen, initPersistentFonts,
    canvasWidth, canvasHeight 
  } = useEditorStore();
  
  const [stageSize, setStageSize] = useState({ width: 360, height: 640 });
  const [localTextValue, setLocalTextValue] = useState("");
  const [snapLines, setSnapLines] = useState<{v: number | null, h: number | null}>({v: null, h: null});
  
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const bgImageRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [bgImg] = useImage(bgImage || '', 'anonymous');

  useEffect(() => { initPersistentFonts(); }, [initPersistentFonts]);

  // Responsive Canvas Scaling
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
  }, [setSelectedLayer, canvasWidth]);

  useEffect(() => { if (bgImg && bgImageRef.current) bgImageRef.current.cache(); }, [bgImg, bgBlur, bgBrightness]);

  // Transformer Attachment Logic
  useEffect(() => {
    if (selectedLayerId && trRef.current && stageRef.current && !isTypingOverlayOpen) {
      const node = stageRef.current.findOne(`#layer-${selectedLayerId}`);
      const layerData = layers.find(l => l.id === selectedLayerId);
      if (node && layerData && !layerData.locked && layerData.visible) {
        trRef.current.nodes([node]);
        trRef.current.getLayer().batchDraw();
      } else trRef.current.nodes([]);
    } else if (trRef.current) trRef.current.nodes([]);
  }, [selectedLayerId, layers, isTypingOverlayOpen]);

  const handleDoubleTap = (id: string, text: string) => {
    setLocalTextValue(text); setSelectedLayer(id); setTypingOverlayOpen(true);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  // --- Missing Function Fixed Here ---
  const closeTypingOverlay = () => {
    if (selectedLayerId) updateLayer(selectedLayerId, { text: localTextValue } as any);
    setTypingOverlayOpen(false);
  };

  // Magnetic Snapping
  const handleSnapMove = (e: any) => {
    const node = e.target;
    const width = node.width() * node.scaleX();
    const height = node.height() * node.scaleY();
    const centerX = node.x() + width / 2;
    const centerY = node.y() + height / 2;
    const SNAP_TOLERANCE = 30;
    
    let snapV = null, snapH = null;
    if (Math.abs(centerX - (canvasWidth / 2)) < SNAP_TOLERANCE) { node.x((canvasWidth / 2) - width / 2); snapV = canvasWidth / 2; }
    if (Math.abs(centerY - (canvasHeight / 2)) < SNAP_TOLERANCE) { node.y((canvasHeight / 2) - height / 2); snapH = canvasHeight / 2; }
    setSnapLines({ v: snapV, h: snapH });
  };

  // Background Image Positioning
  let bgProps = { x: 0, y: 0, width: canvasWidth, height: canvasHeight };
  if (bgImg) {
    const scale = Math.max(canvasWidth / bgImg.width, canvasHeight / bgImg.height);
    bgProps = { 
      width: bgImg.width * scale * bgScale, height: bgImg.height * scale * bgScale, 
      x: ((canvasWidth - bgImg.width * scale * bgScale) / 2) + bgX, 
      y: ((canvasHeight - bgImg.height * scale * bgScale) / 2) + bgY 
    };
  }

  const scaleRatio = (stageSize.width / canvasWidth) || 1;

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center bg-[#09090b] overflow-hidden relative">
      <style dangerouslySetInnerHTML={{ __html: customFonts.map(f => `@font-face { font-family: '${f.name}'; src: url('${f.url}'); }`).join('\n') }} />

      <div className="shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative border border-white/10" style={{ borderRadius: canvasWidth === 1080 && canvasHeight === 1080 ? '4px' : '12px' }}>
        <Stage ref={stageRef} width={stageSize.width || 360} height={stageSize.height || 640} scaleX={scaleRatio} scaleY={scaleRatio} 
          onClick={(e) => { if(e.target === e.target.getStage() || e.target.name() === 'bg') setSelectedLayer(null); }}
          onTap={(e) => { if(e.target === e.target.getStage() || e.target.name() === 'bg') setSelectedLayer(null); }}>
          
          <Layer>
            <Rect width={canvasWidth} height={canvasHeight} fill={bgColor} name="bg" />
            {bgImg && <KonvaImage ref={bgImageRef} image={bgImg} name="bg" {...bgProps} filters={[Konva.Filters.Blur, Konva.Filters.Brighten]} blurRadius={bgBlur} brightness={bgBrightness / 100} />}
            
            {/* --- ২. ডায়নামিক লেয়ার রেন্ডারিং --- */}
            {layers.map((layer) => {
              if (!layer.visible) return null;
              
              if (layer.type === 'image') {
                return <RenderImageNode key={layer.id} layer={layer as ImageLayer} isTypingOverlayOpen={isTypingOverlayOpen} setSelectedLayer={setSelectedLayer} updateLayer={updateLayer} handleSnap={handleSnapMove} />;
              }

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
                    fill={textObj.isGradient ? undefined : textObj.fill}
                    fillLinearGradientStartPoint={textObj.isGradient ? { x: 0, y: 0 } : undefined}
                    fillLinearGradientEndPoint={textObj.isGradient ? { x: 0, y: textObj.fontSize * 3 } : undefined}
                    fillLinearGradientColorStops={textObj.isGradient ? [0, textObj.gradientColors[0], 1, textObj.gradientColors[1]] : undefined}
                    align={textObj.align} letterSpacing={textObj.letterSpacing} lineHeight={textObj.lineHeight}
                    shadowColor={textObj.shadowColor} shadowBlur={textObj.shadowBlur} shadowOffsetX={textObj.shadowOffsetX} shadowOffsetY={textObj.shadowOffsetY}
                    stroke={textObj.stroke} strokeWidth={textObj.strokeWidth} fillAfterStrokeEnabled={textObj.strokeType === 'outer'}
                    draggable={!textObj.locked && !isTypingOverlayOpen}
                    onClick={() => setSelectedLayer(textObj.id)} onTap={() => setSelectedLayer(textObj.id)}
                    onDblClick={() => handleDoubleTap(textObj.id, textObj.text)} onDblTap={() => handleDoubleTap(textObj.id, textObj.text)}
                    onDragMove={handleSnapMove}
                    onDragEnd={(e) => { setSnapLines({ v: null, h: null }); updateLayer(textObj.id, { x: e.target.x(), y: e.target.y() }); }}
                    onTransformEnd={(e) => {
                      const node = e.target;
                      updateLayer(textObj.id, { x: node.x(), y: node.y(), scaleX: node.scaleX(), scaleY: node.scaleY(), rotation: node.rotation() });
                    }}
                  />
                );
              }
              return null;
            })}

            {/* Guides & Transformer */}
            {snapLines.v !== null && <Line points={[snapLines.v, 0, snapLines.v, canvasHeight]} stroke="#ec4899" strokeWidth={2} dash={[15, 10]} />}
            {snapLines.h !== null && <Line points={[0, snapLines.h, canvasWidth, snapLines.h]} stroke="#ec4899" strokeWidth={2} dash={[15, 10]} />}
            {selectedLayerId && !isTypingOverlayOpen && (
              <Transformer ref={trRef} boundBoxFunc={(oldBox, newBox) => newBox.width < 10 || newBox.height < 10 ? oldBox : newBox} borderStroke="#3b82f6" anchorStroke="#3b82f6" anchorFill="#ffffff" anchorSize={12} cornerRadius={5} />
            )}
          </Layer>
        </Stage>
      </div>

      {/* Typing Overlay */}
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