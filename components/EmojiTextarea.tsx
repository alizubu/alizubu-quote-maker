import React, { useRef, useEffect, useState } from 'react';
import { replaceEmojisWithNodes } from '@/lib/emoji-utils';

export interface EmojiTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onValueChange: (val: string) => void;
}

export const EmojiTextarea: React.FC<EmojiTextareaProps> = ({ 
  value, 
  onValueChange, 
  className = '', 
  ...props 
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);
  
  // Sync scrolling between textarea and display div
  const handleScroll = () => {
    if (textareaRef.current && displayRef.current) {
      displayRef.current.scrollTop = textareaRef.current.scrollTop;
      displayRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Background display that shows the formatted emojis */}
      <div 
        ref={displayRef}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full p-3 whitespace-pre-wrap break-words overflow-hidden pointer-events-none text-transparent"
        style={{ color: 'transparent' }} // Make text transparent but keeps layout
      >
        {/* We need to render the text with normal color but the actual string is transparent in the div above.
            Wait, if the div is text-transparent, the images will still show, but the text will be invisible.
            So we need text-black dark:text-white inside here. */}
        <span className="text-foreground text-black dark:text-white">
          {replaceEmojisWithNodes(value + (value.endsWith('\n') ? ' ' : ''))}
        </span>
      </div>
      
      {/* Actual textarea, transparent text but visible caret */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        onScroll={handleScroll}
        className={`w-full h-full p-3 resize-none bg-transparent outline-none focus:ring-2 focus:ring-blue-500 rounded-md
                    text-transparent caret-black dark:caret-white`}
        style={{ 
            color: 'transparent', // Native text hidden
        }}
        {...props}
      />
    </div>
  );
};
