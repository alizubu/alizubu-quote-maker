'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Text, Image as KonvaImage, Transformer, Line } from 'react-konva';
import { useEditorStore } from '../../store/useEditorStore';
import Konva from 'konva';
import { Check } from 'lucide-react';

const aspectRatios: Record<string, { w: number, h: number }> = {
  '9:16': { w: 1080, h: 1920 },
  '1:1': { w: 1080, h: 1080 },
  '4:5': { w: 1080, h: 1350 },
  '16:9': { w: 1920, h: 1080 },
};

const CanvasArea = () => {
  const { 
    bgColor, bgImage, bgBlur, bgBrightness, customFonts, aspectRatio,
    texts, updateText, setSelectedText, selectedTextId, saveHistory,
    isTypingOverlayOpen, setTypingOverlayOpen
  } = useEditorStore();
  
  const [stageSize, setStageSize] = useState({ width: 360, height: 640 });
  const [localTextValue, setLocalTextValue] = useState("");
  const [snapLines, setSnapLines] = useState<any[]>([]);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const imageRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const targetW = aspectRatios[aspectRatio].w;
  const targetH = aspectRatios[aspectRatio].h;

  // --- ক্রসবর্ডার সিকিউরিটি (CORS) মেনে ইমেজ লোড করার ফিক্সড মেকানিজম ---
  useEffect(() => {
    if (!bgImage) {
      setLoadedImage(null);
      return;
    }

    const img = new window.Image();
    img.src = bgImage;
    // এই লাইনটি ব্রাউজারের ক্যানভাস ব্লকিং (Tainted Canvas Error) চিরতরে সমাধান করবে
    if (!bgImage.startsWith('data:') && !bgImage.startsWith('blob:')) {
      img.crossOrigin = 'Anonymous';
    }

    img.onload = () => {
      setLoadedImage(img);
    };
    img.onerror = () => {
      console.error("Failed to load background image smoothly.");
    };
  }, [bgImage]);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        const scale = Math.min((clientWidth - 40) / targetW, (clientHeight - 40) / targetH);
        setStageSize({ width: targetW * scale, height: targetH * scale });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [aspectRatio, targetW, targetH]);

  // --- PIXELLAB STYLE ULTRA HD (4K ENHANCE) EXPORT SYSTEM ---
  useEffect(() => {
    const handleExport = () => {
      if (stageRef.current) {
        // এক্সপোর্ট করার আগে সিলেকশন বক্স টেম্পোরারি রিমুভ করা
        setSelectedText(null);
        
        setTimeout(() => {
          try {
            const currentScale = stageRef.current.scaleX();
            // Pixellab-এর Ultra মোডের মতো ৩ গুণ শার্প রেজোলিউশনে রেন্ডার ম্যাথ
            const hqPixelRatio = 3 / currentScale;

            const dataURL = stageRef.current.toDataURL({ 
              pixelRatio: hqPixelRatio,
              mimeType: 'image/png',
              quality: 1.0 // সর্বোচ্চ ইমেজ কম্প্রেশন কোয়ালিটি
            });
            
            const link = document.createElement('a');
            link.download = `StoryMaker-UltraHD-${Date.now()}.png`;
            link.href = dataURL;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } catch (error) {
            console.error("Export failed due to canvas protection standard: ", error);
            alert("Export error! Please re-upload the background image or ensure proper server configuration.");
          }
        }, 150);
      }
    };
    window.addEventListener('export-story', handleExport);
    return () => window.removeEventListener('export-story', handleExport);
  }, [setSelectedText, aspectRatio]);

  useEffect(() => { 
    if (loadedImage && imageRef.current) {
      try {
        imageRef.current.cache();
      } catch (e) {
        console.warn("Caching ignored for local canvas resources.");
      }
    } 
  }, [loadedImage, bgBlur, bgBrightness]);

  useEffect(() => {
    if (selectedTextId && trRef.current && stageRef.current && !isTypingOverlayOpen) {
      const selectedNode = stageRef.current.findOne(`#text-${selectedTextId}`);
      const currentLayerData = texts.find(t => t.id === selectedTextId);
      if (selectedNode && currentLayerData && !currentLayerData.locked && currentLayerData.visible) {
        trRef.current.nodes([selectedNode]);
        trRef.current.getLayer().batchDraw();
      } else trRef.current.nodes([]);
    } else if (trRef.current) trRef.current.nodes([]);
  }, [selectedTextId, texts, isTypingOverlayOpen]);

  const scale = (stageSize.width / targetW) || 1; 

  const handleDeselect = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage() || e.target.name() === 'background';
    if (clickedOnEmpty) setSelectedText(null);
  };

  const handleDoubleTap = (id: string, currentText: string) => {
    setLocalTextValue(currentText);
    setSelectedText(id);
    setTypingOverlayOpen(true);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const closeTypingOverlay = () => {
    if (selectedTextId) { saveHistory(); updateText(selectedTextId, { text: localTextValue }); }
    setTypingOverlayOpen(false);
  };

  let imageProps = {};
  if (loadedImage) {
    const imgScale = Math.max(targetW / loadedImage.width, targetH / loadedImage.height);
    imageProps = { 
      width: loadedImage.width * imgScale, 
      height: loadedImage.height * imgScale, 
      x: (targetW - loadedImage.width * imgScale) / 2, 
      y: (targetH - loadedImage.height * imgScale) / 2 
    };
  }

  // --- MAGNETIC SNAP LOGIC ---
  const handleDragMove = (e: any) => {
    const node = e.target;
    const centerX = node.x() + (node.width() * node.scaleX()) / 2;
    const centerY = node.y() + (node.height() * node.scaleY()) / 2;
    const snapThreshold = 30; 
    const lines = [];

    if (Math.abs(centerX - targetW / 2) < snapThreshold) {
      node.x((targetW / 2) - (node.width() * node.scaleX()) / 2);
      lines.push({ id: 'v', points: [targetW / 2, 0, targetW / 2, targetH] });
    }
    if (Math.abs(centerY - targetH / 2) < snapThreshold) {
      node.y((targetH / 2) - (node.height() * node.scaleY()) / 2);
      lines.push({ id: 'h', points: [0, targetH / 2, targetW, targetH / 2] });
    }
    setSnapLines(lines);
  };

  const handleDragEnd = (e: any, id: string) => {
    setSnapLines([]);
    saveHistory();    
    updateText(id, { x: e.target.x(), y: e.target.y() });
  };

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center bg-[#09090b] overflow-hidden relative">
      <style dangerouslySetInnerHTML={{ __html: customFonts.map(font => `@font-face { font-family: '${font.name}'; src: url('${font.url}'); }`).join('\n') }} />

      <div className="shadow-2xl shadow-black/80 rounded-[4px] md:rounded-lg overflow-hidden relative border border-white/10 transition-all duration-300">
        <Stage width={stageSize.width || targetW} height={stageSize.height || targetH} scaleX={scale} scaleY={scale} onClick={handleDeselect} onTap={handleDeselect}>
          <Layer>
            <Rect width={targetW} height={targetH} fill={bgColor} name="background" />
            
            {loadedImage && (
              <KonvaImage 
                ref={imageRef} 
                image={loadedImage} 
                name="background" 
                {...imageProps} 
                filters={[Konva.Filters.Blur, Konva.Filters.Brighten]} 
                blurRadius={bgBlur} 
                brightness={bgBrightness / 100} 
              />
            )}
            
            {texts.map((textObj) => {
              if (!textObj.visible) return null;
              const premiumFontStack = `${textObj.fontFamily}, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;

              return (
                <Text
                  key={textObj.id}
                  id={`text-${textObj.id}`}
                  text={isTypingOverlayOpen && selectedTextId === textObj.id ? "" : textObj.text}
                  x={textObj.x} y={textObj.y} fontSize={textObj.fontSize} fontFamily={premiumFontStack}
                  fill={textObj.fill} align={textObj.align} letterSpacing={textObj.letterSpacing} lineHeight={textObj.lineHeight || 1.2}
                  draggable={!textObj.locked && !isTypingOverlayOpen}
                  onClick={() => setSelectedText(textObj.id)} onTap={() => setSelectedText(textObj.id)}
                  onDblClick={() => handleDoubleTap(textObj.id, textObj.text)} onDblTap={() => handleDoubleTap(textObj.id, textObj.text)}
                  
                  onDragMove={handleDragMove}
                  onDragEnd={(e) => handleDragEnd(e, textObj.id)}
                  
                  onTransformEnd={(e: any) => {
                    const node = e.target; const scaleX = node.scaleX(); node.scaleX(1); node.scaleY(1);
                    saveHistory();
                    updateText(textObj.id, { x: node.x(), y: node.y(), fontSize: Math.max(12, Math.round(textObj.fontSize * scaleX)) });
                  }}
                  shadowColor={textObj.shadowColor} shadowBlur={textObj.shadowBlur} shadowOffsetX={textObj.shadowOffsetX} shadowOffsetY={textObj.shadowOffsetY}
                  shadowOpacity={textObj.shadowBlur > 0 || textObj.shadowOffsetX !== 0 || textObj.shadowOffsetY !== 0 ? 0.8 : 0}
                  stroke={textObj.stroke} strokeWidth={textObj.strokeWidth} fillAfterStroke={true}
                />
              );
            })}

            {snapLines.map((line) => (
              <Line key={line.id} points={line.points} stroke="#3b82f6" strokeWidth={3} dash={[10, 10]} opacity={0.8} />
            ))}

            {selectedTextId && !isTypingOverlayOpen && (
              <Transformer 
                ref={trRef} boundBoxFunc={(oldBox, newBox) => newBox.width < 50 || newBox.height < 50 ? oldBox : newBox}
                enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                borderStroke="#3b82f6" anchorStroke="#3b82f6" anchorFill="#ffffff" anchorSize={14} borderDash={[4, 4]} cornerRadius={5}
              />
            )}
          </Layer>
        </Stage>
      </div>

      {isTypingOverlayOpen && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col p-4 animate-in fade-in duration-200">
          <div className="flex justify-between items-center mb-6">
            <span className="text-white/50 text-sm font-medium uppercase tracking-widest">Edit Text</span>
            <button onClick={closeTypingOverlay} className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-full font-semibold flex items-center gap-2 shadow-lg transition-transform active:scale-95"><Check size={18} /> Done</button>
          </div>
          <textarea ref={textareaRef} value={localTextValue} onChange={(e) => setLocalTextValue(e.target.value)} className="flex-1 w-full bg-transparent text-white text-3xl text-center resize-none outline-none font-sans placeholder-white/20" placeholder="Type your quote..." />
        </div>
      )}
    </div>
  );
};

export default CanvasArea;