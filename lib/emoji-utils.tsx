import React from 'react';
import emojiRegex from 'emoji-regex';

// Function to convert unicode character to a normalized hex code string.
// This handles surrogate pairs properly.
export function toCodePoint(unicodeSurrogates: string, sep = '-') {
  const r = [];
  let c = 0,
    p = 0,
    i = 0;
  while (i < unicodeSurrogates.length) {
    c = unicodeSurrogates.charCodeAt(i++);
    if (p) {
      r.push((0x10000 + ((p - 0xd800) << 10) + (c - 0xdc00)).toString(16));
      p = 0;
    } else if (0xd800 <= c && c <= 0xdbff) {
      p = c;
    } else {
      r.push(c.toString(16));
    }
  }
  return r.join(sep);
}

// Remove variation selectors that might not be in the image filename.
// emoji-datasource generally strips -fe0f from filenames for standard emojis,
// but leaves it for some compound ones. The logic below is a simplification 
// that usually matches emoji-datasource-apple filename formats.
export function getAppleEmojiUrl(emojiStr: string) {
  let hex = toCodePoint(emojiStr);
  
  // Clean up fe0f if it's the only variation selector at the end
  if (hex.endsWith('-fe0f')) {
      // Keep it if it's a compound emoji (contains 200d) maybe?
      // Actually emoji-datasource-apple sometimes keeps fe0f.
      // Let's try removing it for single emojis, as it's a common issue.
      if (!hex.includes('200d')) {
          hex = hex.replace('-fe0f', '');
      }
  }

  // Handle special cases where emoji-datasource differs slightly,
  // but mostly it maps directly to standard unicode hex.
  return `https://unpkg.com/emoji-datasource-apple@15.0.1/img/apple/64/${hex}.png`;
}

export function replaceEmojisWithNodes(text: string) {
  if (!text) return text;
  
  const regexGlobal = emojiRegex();
  const parts: React.ReactNode[] = [];
  let match;
  let lastIndex = 0;
  let partKey = 0;

  while ((match = regexGlobal.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const segment = text.substring(lastIndex, match.index);
      // Wrap text segments in inline spans to prevent line-break opportunities around emojis
      parts.push(
        <span key={`t-${partKey++}`} style={{ whiteSpace: 'pre-wrap' }}>{segment}</span>
      );
    }
    
    const emojiStr = match[0];
    const url = getAppleEmojiUrl(emojiStr);
    
    parts.push(
      <img
        key={`e-${partKey++}`}
        src={url}
        alt={emojiStr}
        style={{
          display: 'inline',
          width: '1em',
          height: '1em',
          verticalAlign: 'text-bottom',
          margin: '0',
        }}
        draggable={false}
        onError={(e) => {
          // Fallback: show native emoji text instead of broken image
          const span = document.createElement('span');
          span.textContent = emojiStr;
          e.currentTarget.replaceWith(span);
        }}
        title={emojiStr}
      />
    );
    lastIndex = match.index + emojiStr.length;
  }
  
  if (lastIndex < text.length) {
    const segment = text.substring(lastIndex);
    parts.push(
      <span key={`t-${partKey++}`} style={{ whiteSpace: 'pre-wrap' }}>{segment}</span>
    );
  }
  
  return parts.length > 0 ? parts : [text];
}

