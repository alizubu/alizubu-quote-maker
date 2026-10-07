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
  const parts: (string | React.ReactNode)[] = [];
  let match;
  let lastIndex = 0;

  while ((match = regexGlobal.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    
    const emojiStr = match[0];
    const url = getAppleEmojiUrl(emojiStr);
    
    parts.push(
      <img
        key={`${match.index}-${emojiStr}`}
        src={url}
        alt={emojiStr}
        className="inline-block w-[1.25em] h-[1.25em] align-text-bottom mx-[0.05em]"
        draggable={false}
        onError={(e) => {
          // Fallback if the image isn't found (e.g. newer emoji not in v15)
          // Hide the broken image icon and render the native emoji as fallback if possible.
          e.currentTarget.style.display = 'none';
          const nextNode = e.currentTarget.nextSibling;
          if (nextNode && nextNode.nodeType === Node.TEXT_NODE) {
              // we can't easily alter siblings here safely in React without refs,
              // but hiding the image is usually enough if we output standard text as title/alt.
          }
        }}
        title={emojiStr}
      />
    );
    lastIndex = match.index + emojiStr.length;
  }
  
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  return parts.length > 0 ? parts : [text];
}
