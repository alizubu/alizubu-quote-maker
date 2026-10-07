import React from 'react';
import { replaceEmojisWithNodes } from '@/lib/emoji-utils';

export interface EmojiTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  text: string;
}

export const EmojiText: React.FC<EmojiTextProps> = ({ text, ...props }) => {
  return (
    <span {...props}>
      {replaceEmojisWithNodes(text)}
    </span>
  );
};
