'use client';

import React from 'react';
import { Label, Tag, Text } from 'react-konva';
import { Html } from 'react-konva-utils';
import { EmojiText } from '@/components/EmojiText';
import emojiRegex from 'emoji-regex';
import Konva from 'konva';
import { TextLayer } from '../../../store/editorTypes';

interface TextNodeProps {
  textObj: TextLayer;
  isTypingOverlayOpen: boolean;
  selectedLayerId: string | null;
  isSpacePressed: boolean;
  isShiftPressed: boolean;
  multiSelectedIds: string[];
  setMultiSelectedIds: (ids: string[]) => void;
  setSelectedLayer: (id: string | null) => void;
  handleDoubleTap: (id: string, text: string) => void;
  handleSnapMove: (e: Konva.KonvaEventObject<DragEvent>) => void;
  setSnapLines: (lines: { v: number | null; h: number | null }) => void;
  updateLayer: (id: string, attrs: Partial<TextLayer>) => void;
}

export default function TextNode({ textObj, isTypingOverlayOpen, selectedLayerId, isSpacePressed, isShiftPressed, multiSelectedIds, setMultiSelectedIds, setSelectedLayer, handleDoubleTap, handleSnapMove, setSnapLines, updateLayer }: TextNodeProps) {
  const hasEmoji = emojiRegex().test(textObj.text);
  const fontStyleStr = `${textObj.isItalic ? 'italic' : 'normal'} ${textObj.isBold ? 'bold' : 'normal'}`;
  
  // Resolve Shadow vs Glow
  let appliedShadowColor = 'transparent';
  let appliedShadowBlur = 0;
  let appliedShadowOffsetX = 0;
  let appliedShadowOffsetY = 0;
  let appliedShadowOpacity = 0;

  if (textObj.glowEnabled) {
    appliedShadowColor = textObj.glowColor || '#ffffff';
    appliedShadowBlur = textObj.glowIntensity !== undefined ? textObj.glowIntensity : 15;
    appliedShadowOffsetX = 0;
    appliedShadowOffsetY = 0;
    appliedShadowOpacity = 1;
  } else if (textObj.shadowEnabled) {
    appliedShadowColor = textObj.shadowColor || 'rgba(0,0,0,0.5)';
    appliedShadowBlur = textObj.shadowBlur || 0;
    appliedShadowOffsetX = textObj.shadowOffsetX || 0;
    appliedShadowOffsetY = textObj.shadowOffsetY || 0;
    appliedShadowOpacity = textObj.shadowOpacity !== undefined ? textObj.shadowOpacity : 1;
  }

  return (
    <Label
      id={`layer-${textObj.id}`}
      x={textObj.x} y={textObj.y} rotation={textObj.rotation} scaleX={textObj.scaleX} scaleY={textObj.scaleY}
      opacity={textObj.opacity} globalCompositeOperation={textObj.blendMode as GlobalCompositeOperation}
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
            window.dispatchEvent(new CustomEvent('layer-tapped'));
          }
        } 
      }} 
      onTap={(e) => { e.cancelBubble = true; if(!isSpacePressed) { setSelectedLayer(textObj.id); window.dispatchEvent(new CustomEvent('layer-tapped')); } }}
      onDblClick={() => handleDoubleTap(textObj.id, textObj.text)} 
      onDblTap={() => handleDoubleTap(textObj.id, textObj.text)}
      onDragMove={handleSnapMove} 
      onDragEnd={(e) => { setSnapLines({ v: null, h: null }); updateLayer(textObj.id, { x: e.target.x(), y: e.target.y() }); }} 
      onTransformEnd={(e) => { 
        const node = e.target as unknown as Konva.Label; 
        const newScaleX = node.scaleX();
        const newScaleY = node.scaleY();
        const newFontSize = Math.max(1, Math.round(textObj.fontSize * newScaleY));
        const textNode = node.findOne('Text');
        const newWidth = textNode ? textNode.width() * newScaleX : (textObj.width || 0) * newScaleX;
        
        node.scaleX(1);
        node.scaleY(1);
        
        updateLayer(textObj.id, { 
          x: node.x(), y: node.y(), 
          fontSize: newFontSize,
          scaleX: 1, scaleY: 1, 
          rotation: node.rotation(),
          width: newWidth,
        }); 
      }}
    >
      {textObj.hasBgHighlight && (
        <Tag
          fill={textObj.bgHighlightColor || '#ffea00'}
          opacity={textObj.bgHighlightOpacity !== undefined ? textObj.bgHighlightOpacity : 1}
          cornerRadius={textObj.bgHighlightRadius || 0}
        />
      )}
      {hasEmoji ? (
        <Html
          divProps={{
            style: {
              width: textObj.width ? `${textObj.width}px` : 'auto',
              fontFamily: `${textObj.fontFamily}, sans-serif`,
              fontSize: `${textObj.fontSize}px`,
              fontStyle: textObj.isItalic ? 'italic' : 'normal',
              fontWeight: textObj.isBold ? 'bold' : 'normal',
              textDecoration: textObj.isUnderline ? 'underline' : 'none',
              color: textObj.isGradient ? 'transparent' : textObj.fill,
              backgroundImage: textObj.isGradient ? `linear-gradient(to bottom, ${textObj.gradientColors[0]}, ${textObj.gradientColors[1]})` : 'none',
              WebkitBackgroundClip: textObj.isGradient ? 'text' : 'none',
              textAlign: textObj.align,
              letterSpacing: `${textObj.letterSpacing}px`,
              lineHeight: textObj.lineHeight,
              textShadow: appliedShadowOpacity > 0 ? `${appliedShadowOffsetX}px ${appliedShadowOffsetY}px ${appliedShadowBlur}px ${appliedShadowColor}` : 'none',
              WebkitTextStroke: textObj.strokeWidth ? `${textObj.strokeWidth}px ${textObj.stroke}` : 'none',
              pointerEvents: 'none', // Let Konva handle clicks
              whiteSpace: 'pre-wrap',
              display: isTypingOverlayOpen && selectedLayerId === textObj.id ? 'none' : 'block',
            }
          }}
        >
          <EmojiText text={textObj.text} />
        </Html>
      ) : (
        <Text
          text={isTypingOverlayOpen && selectedLayerId === textObj.id ? "" : textObj.text}
          width={textObj.width}
          fontSize={textObj.fontSize} fontFamily={`${textObj.fontFamily}, sans-serif`}
          fontStyle={fontStyleStr} textDecoration={textObj.isUnderline ? 'underline' : ''}
          fill={textObj.isGradient ? undefined : textObj.fill} 
          fillLinearGradientStartPoint={textObj.isGradient ? { x: 0, y: 0 } : undefined} 
          fillLinearGradientEndPoint={textObj.isGradient ? { x: 0, y: textObj.fontSize * 3 } : undefined} 
          fillLinearGradientColorStops={textObj.isGradient ? [0, textObj.gradientColors[0], 1, textObj.gradientColors[1]] : undefined}
          align={textObj.align} letterSpacing={textObj.letterSpacing} lineHeight={textObj.lineHeight} 
          shadowColor={appliedShadowColor} shadowBlur={appliedShadowBlur} shadowOffsetX={appliedShadowOffsetX} shadowOffsetY={appliedShadowOffsetY} shadowOpacity={appliedShadowOpacity}
          stroke={textObj.stroke} strokeWidth={textObj.strokeWidth} fillAfterStrokeEnabled={textObj.strokeType === 'outer'}
          padding={textObj.hasBgHighlight ? (textObj.bgHighlightPadding || 8) : 0}
        />
      )}
    </Label>
  );
}