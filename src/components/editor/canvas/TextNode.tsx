'use client';

import React from 'react';
import { Text } from 'react-konva';

export default function TextNode({ textObj, isTypingOverlayOpen, selectedLayerId, isSpacePressed, isShiftPressed, multiSelectedIds, setMultiSelectedIds, setSelectedLayer, handleDoubleTap, handleSnapMove, setSnapLines, updateLayer }: any) {
  const fontStyleStr = `${textObj.isItalic ? 'italic' : 'normal'} ${textObj.isBold ? 'bold' : 'normal'}`;
  
  return (
    <Text
      id={`layer-${textObj.id}`}
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
      perfectDrawEnabled={textObj.textSharpening ? false : undefined}
      draggable={!textObj.locked && !isTypingOverlayOpen && !isSpacePressed}
      onClick={(e) => { 
        e.cancelBubble = true; 
        if(!isSpacePressed) {
          if(isShiftPressed) {
            const newSelection = multiSelectedIds.includes(textObj.id) ? multiSelectedIds.filter((id: string) => id !== textObj.id) : [...multiSelectedIds, textObj.id];
            setMultiSelectedIds(newSelection);
            setSelectedLayer(null);
          } else {
            setSelectedLayer(textObj.id);
          }
        } 
      }} 
      onTap={(e) => { e.cancelBubble = true; if(!isSpacePressed) setSelectedLayer(textObj.id); }}
      onDblClick={() => handleDoubleTap(textObj.id, textObj.text)} 
      onDblTap={() => handleDoubleTap(textObj.id, textObj.text)}
      onDragMove={handleSnapMove} 
      onDragEnd={(e) => { setSnapLines({ v: null, h: null }); updateLayer(textObj.id, { x: e.target.x(), y: e.target.y() }); }} 
      onTransformEnd={(e) => { const node = e.target; updateLayer(textObj.id, { x: node.x(), y: node.y(), scaleX: node.scaleX(), scaleY: node.scaleY(), rotation: node.rotation() }); }}
    />
  );
}