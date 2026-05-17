'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Text, Image as KonvaImage, Transformer } from 'react-konva';
import { useEditorStore } from '../../store/useEditorStore';
import useImage from 'use-image';
import Konva from 'konva';

const CanvasArea = () => {
  const { 
    bgColor, bgImage, bgBlur, bgBrightness, customFonts,
    texts, updateText, setSelectedText, selectedTextId 
  } = useEditorStore();
  
  const [stageSize, setStageSize] = useState({ width: 360, height: 640 });
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const imageRef = useRef<any>(null);
  const trRef = useRef<any>(null);

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

  // আল্ট্রা-হাই কোয়ালিটি ৪K এক্সপোর্ট লজিক
  useEffect(() => {
    const handleExport = () => {
      if (stageRef.current) {
        setSelectedText(null);
        setTimeout(() => {
          // pixelRatio: 4 সেট করায় ইমেজ ৪৩২০x৭৬৮০ পিক্সেলের এক্সট্রিম শার্প আউটপুট দিবে
          const dataURL = stageRef.current.toDataURL({ pixelRatio: 4, mimeType: 'image/png' });
          const link = document.createElement('a');
          link.download = `Aesthetic-Story-${Date.now()}.png`;
          link.href = dataURL;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }, 100);
      }
    };
    window.addEventListener('export-story', handleExport);
    return () => window.removeEventListener('export-story', handleExport);
  }, [setSelectedText]);

  useEffect(() => {
    if (image && imageRef.current) {
      imageRef.current.cache();
    }
  }, [image, bgBlur, bgBrightness]);

  useEffect(() => {
    if (selectedTextId && trRef.current && stageRef.current) {
      const selectedNode = stageRef.current.findOne(`#text-${selectedTextId}`);
      const currentLayerData = texts.find(t => t.id === selectedTextId);
      
      if (selectedNode && currentLayerData && !currentLayerData.locked && currentLayerData.visible) {
        trRef.current.nodes([selectedNode]);
        trRef.current.getLayer().batchDraw();
      } else {
        trRef.current.nodes([]);
      }
    }
  }, [selectedTextId, texts]);

  const scale = (stageSize.width / 1080) || 1; 

  const handleDeselect = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage() || e.target.name() === 'background';
    if (clickedOnEmpty) setSelectedText(null);
  };

  let imageProps = {};
  if (image) {
    const imgScale = Math.max(1080 / image.width, 1920 / image.height);
    imageProps = { 
      width: image.width * imgScale, 
      height: image.height * imgScale, 
      x: (1080 - image.width * imgScale) / 2, 
      y: (1920 - image.height * imgScale) / 2 
    };
  }

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center bg-zinc-950 overflow-hidden">
      
      <style dangerouslySetInnerHTML={{ __html: customFonts.map(font => `
        @font-face {
          font-family: '${font.name}';
          src: url('${font.url}');
        }
      `).join('\n') }} />

      <div className="shadow-2xl shadow-black/50 border border-white/10 rounded-lg overflow-hidden relative">
        <Stage
          ref={stageRef} 
          width={stageSize.width || 1080}
          height={stageSize.height || 1920}
          scaleX={scale}
          scaleY={scale}
          onClick={handleDeselect}
          onTap={handleDeselect}
        >
          <Layer>
            <Rect width={1080} height={1920} fill={bgColor} name="background" />
            
            {image && (
              <KonvaImage
                ref={imageRef}
                image={image}
                name="background"
                {...imageProps}
                filters={[Konva.Filters.Blur, Konva.Filters.Brighten]}
                blurRadius={bgBlur}
                brightness={bgBrightness / 100}
              />
            )}

            {texts.map((textObj) => {
              if (!textObj.visible) return null;

              // ফন্ট অর্ডারে 'Mont Blanc' এবং iOS এর জন্য অ্যাপল ইমোজি স্ট্যাক সবার আগে হ্যান্ডেল করা হয়েছে 
              const premiumFontStack = `${textObj.fontFamily}, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;

              return (
                <Text
                  key={textObj.id}
                  id={`text-${textObj.id}`}
                  text={textObj.text}
                  x={textObj.x}
                  y={textObj.y}
                  fontSize={textObj.fontSize}
                  fontFamily={premiumFontStack}
                  fill={textObj.fill}
                  align={textObj.align}
                  letterSpacing={textObj.letterSpacing}
                  lineHeight={textObj.lineHeight || 1.2}
                  draggable={!textObj.locked}
                  onClick={() => setSelectedText(textObj.id)}
                  onTap={() => setSelectedText(textObj.id)}
                  onDragEnd={(e: any) => {
                    updateText(textObj.id, { x: e.target.x(), y: e.target.y() });
                  }}
                  onTransformEnd={(e: any) => {
                    const node = e.target;
                    const scaleX = node.scaleX();
                    node.scaleX(1);
                    node.scaleY(1);
                    updateText(textObj.id, {
                      x: node.x(),
                      y: node.y(),
                      fontSize: Math.max(12, Math.round(textObj.fontSize * scaleX)),
                    });
                  }}
                  // ইমোজি এবং টেক্সট শার্প রাখার অপ্টিমাইজেশন
                  perfectDrawEnabled={true}
                  shadowColor={textObj.shadowColor}
                  shadowBlur={textObj.shadowBlur}
                  shadowOffsetX={textObj.shadowOffsetX}
                  shadowOffsetY={textObj.shadowOffsetY}
                  shadowOpacity={textObj.shadowBlur > 0 || textObj.shadowOffsetX !== 0 || textObj.shadowOffsetY !== 0 ? 0.8 : 0}
                  stroke={textObj.stroke}
                  strokeWidth={textObj.strokeWidth}
                  fillAfterStroke={true}
                />
              );
            })}

            {selectedTextId && (
              <Transformer 
                ref={trRef} 
                boundBoxFunc={(oldBox, newBox) => {
                  if (newBox.width < 50 || newBox.height < 50) return oldBox;
                  return newBox;
                }}
                enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                borderStroke="#ffffff"
                anchorStroke="#ffffff"
                anchorFill="#000000"
                anchorSize={12}
                borderDash={[5, 5]}
              />
            )}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default CanvasArea;