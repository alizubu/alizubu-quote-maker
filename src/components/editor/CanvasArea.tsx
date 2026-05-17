'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Text, Image as KonvaImage, Transformer } from 'react-konva';
import { useEditorStore } from '../../store/useEditorStore';
import useImage from 'use-image';
import Konva from 'konva';
import { Check } from 'lucide-react';

const CanvasArea = () => {
  const {
    bgColor, bgImage, bgBlur, bgBrightness, customFonts,
    texts, updateText, setSelectedText, selectedTextId,
    isTypingOverlayOpen, setTypingOverlayOpen
  } = useEditorStore();

  const [stageSize, setStageSize] = useState({ width: 360, height: 640 });
  const [localTextValue, setLocalTextValue] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const imageRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [image] = useImage(bgImage || '', 'anonymous');

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        const scale = Math.min(clientWidth / 1080, clientHeight / 1920);
        setStageSize({ width: 1080 * scale, height: 1920 * scale });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // ডাইনামিক এবং ১০০% নিরাপদ হাই-কোয়ালিটি সেভ লজিক (মোবাইল ফ্রেন্ডলি)
  useEffect(() => {
    const handleSafeDownload = (e: Event) => {
      const customEvent = e as CustomEvent;
      const targetWidth = customEvent.detail?.targetWidth || 1080; // মোডাল থেকে আসা নির্দিষ্ট উইডথ

      if (stageRef.current) {
        setSelectedText(null); // সিলেকশন বক্স রিমুভ

        setTimeout(() => {
          const currentScale = stageRef.current.scaleX() || 1;
          // স্ক্রিন সাইজ ও টার্গেট সাইজের উপর ভিত্তি করে নিখুঁত পিক্সেল রেশিও নির্ণয়
          const safePixelRatio = targetWidth / (1080 * currentScale);

          try {
            const dataURL = stageRef.current.toDataURL({
              pixelRatio: safePixelRatio,
              mimeType: 'image/png'
            });

            const link = document.createElement('a');
            link.download = `StoryMaker_${targetWidth}p_${Date.now()}.png`;
            link.href = dataURL;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } catch (error) {
            alert("Export failed due to browser canvas memory limit. Please try 'High' or 'Medium' quality.");
          }
        }, 150);
      }
    };

    window.addEventListener('trigger-safe-download', handleSafeDownload);
    return () => window.removeEventListener('trigger-safe-download', handleSafeDownload);
  }, [setSelectedText]);

  useEffect(() => { if (image && imageRef.current) imageRef.current.cache(); }, [image, bgBlur, bgBrightness]);

  useEffect(() => {
    if (selectedTextId && trRef.current && stageRef.current && !isTypingOverlayOpen) {
      const selectedNode = stageRef.current.findOne(`#text-${selectedTextId}`);
      const currentLayerData = texts.find(t => t.id === selectedTextId);
      if (selectedNode && currentLayerData && !currentLayerData.locked && currentLayerData.visible) {
        trRef.current.nodes([selectedNode]);
        trRef.current.getLayer().batchDraw();
      } else {
        trRef.current.nodes([]);
      }
    } else if (trRef.current) {
      trRef.current.nodes([]);
    }
  }, [selectedTextId, texts, isTypingOverlayOpen]);

  const scale = (stageSize.width / 1080) || 1;

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
    if (selectedTextId) updateText(selectedTextId, { text: localTextValue });
    setTypingOverlayOpen(false);
  };

  let imageProps = {};
  if (image) {
    const imgScale = Math.max(1080 / image.width, 1920 / image.height);
    imageProps = { width: image.width * imgScale, height: image.height * imgScale, x: (1080 - image.width * imgScale) / 2, y: (1920 - image.height * imgScale) / 2 };
  }

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center bg-[#09090b] overflow-hidden relative">
      <style dangerouslySetInnerHTML={{ __html: customFonts.map(font => `@font-face { font-family: '${font.name}'; src: url('${font.url}'); }`).join('\n') }} />

      <div className="shadow-2xl shadow-black/80 rounded-lg overflow-hidden relative border border-white/5">
        <Stage ref={stageRef} width={stageSize.width || 360} height={stageSize.height || 640} scaleX={scale} scaleY={scale} onClick={handleDeselect} onTap={handleDeselect}>
          <Layer>
            <Rect width={1080} height={1920} fill={bgColor} name="background" />
            {image && <KonvaImage ref={imageRef} image={image} name="background" {...imageProps} filters={[Konva.Filters.Blur, Konva.Filters.Brighten]} blurRadius={bgBlur} brightness={bgBrightness / 100} />}

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
                  onDragEnd={(e: any) => updateText(textObj.id, { x: e.target.x(), y: e.target.y() })}
                  onTransformEnd={(e: any) => {
                    const node = e.target; const scaleX = node.scaleX(); node.scaleX(1); node.scaleY(1);
                    updateText(textObj.id, { x: node.x(), y: node.y(), fontSize: Math.max(12, Math.round(textObj.fontSize * scaleX)) });
                  }}
                  shadowColor={textObj.shadowColor} shadowBlur={textObj.shadowBlur} shadowOffsetX={textObj.shadowOffsetX} shadowOffsetY={textObj.shadowOffsetY}
                  shadowOpacity={textObj.shadowBlur > 0 || textObj.shadowOffsetX !== 0 || textObj.shadowOffsetY !== 0 ? 0.8 : 0}
                  stroke={textObj.stroke} strokeWidth={textObj.strokeWidth} fillAfterStroke={true}
                />
              );
            })}

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

      {/* Fullscreen Smooth Typing Overlay */}
      {isTypingOverlayOpen && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-xl flex flex-col p-6 animate-in fade-in duration-200">
          <div className="flex justify-between items-center mb-6">
            <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Editor Keyboard</span>
            <button onClick={closeTypingOverlay} className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2 rounded-full font-bold flex items-center gap-1.5 shadow-lg active:scale-95 transition-transform">
              <Check size={16} /> Done
            </button>
          </div>
          <textarea
            ref={textareaRef}
            value={localTextValue}
            onChange={(e) => setLocalTextValue(e.target.value)}
            className="flex-1 w-full bg-transparent text-white text-2xl text-center resize-none outline-none font-sans pt-12 placeholder-white/10"
            placeholder="Type content here..."
          />
        </div>
      )}
    </div>
  );
};

export default CanvasArea;