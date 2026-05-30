'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useEditorStore } from '../../../store/useEditorStore';
import { Image as ImageIcon, Upload, Trash2, Sun, Moon, Monitor, Palette, Settings2, MoveHorizontal, MoveVertical } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HexAlphaColorPicker } from 'react-colorful';

// --- Shared Component: Stepper Slider ---
export const StepperSlider = ({ label, value, min, max, step = 1, onChange, onAction, unit = '' }: any) => {
  const handleDecrement = () => { if (value > min) { onAction(); onChange(Math.max(min, value - step)); } };
  const handleIncrement = () => { if (value < max) { onAction(); onChange(Math.min(max, value + step)); } };
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{label}</label>
        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-white/10 px-2 py-1 rounded-md min-w-[44px] text-center">{typeof value === 'number' ? Number(value.toFixed(1)) : value}{unit}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleDecrement}
          className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-white/10 hover:bg-zinc-200 dark:hover:bg-white/20 active:bg-zinc-300 dark:active:bg-white/30 text-zinc-600 dark:text-zinc-300 transition-colors shrink-0 text-sm font-bold"
        >-</button>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onMouseDown={onAction}
          onTouchStart={onAction}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="flex-1 accent-blue-500 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer"
          style={{ touchAction: 'none' }}
        />
        <button
          onClick={handleIncrement}
          className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-white/10 hover:bg-zinc-200 dark:hover:bg-white/20 active:bg-zinc-300 dark:active:bg-white/30 text-zinc-600 dark:text-zinc-300 transition-colors shrink-0 text-sm font-bold"
        >+</button>
      </div>
    </div>
  );
};

// --- Shared Component: Color Picker Popup (with opacity support) ---
export interface ColorPickerPopupProps {
  label: string;
  color: string;
  onChange: (c: string) => void;
  onAction: () => void;
}

export const ColorPickerPopup = ({ label, color, onChange, onAction }: ColorPickerPopupProps) => {
  const presets = ['#FFFFFF', '#000000', '#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#8b5cf6', 'transparent'];
  const displayColor = color === 'transparent' || !color ? '#ffffff00' : color;

  return (
    <div className="flex items-center justify-between p-2.5 bg-zinc-100 dark:bg-black/40 rounded-xl border border-zinc-200/50 dark:border-white/5">
      <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 pl-2">{label}</span>
      <Popover>
        <PopoverTrigger asChild>
          <button
            onClick={onAction}
            className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-700 shadow-md transition-transform active:scale-90 hover:scale-110 cursor-pointer"
            style={{
              backgroundColor: color === 'transparent' ? '#e4e4e7' : color,
              backgroundImage: color === 'transparent' ? 'repeating-conic-gradient(#a1a1aa 0% 25%, transparent 0% 50%)' : '',
              backgroundSize: '8px 8px'
            }}
          />
        </PopoverTrigger>
        <PopoverContent align="end" className="w-auto p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-2xl z-50">
          <HexAlphaColorPicker color={displayColor} onChange={onChange} />
          <div className="grid grid-cols-4 gap-2 mt-4 w-full">
            {presets.map(p => (
              <button
                key={p}
                onClick={() => onChange(p)}
                className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${color === p ? 'scale-110 border-blue-500 shadow-md' : 'border-zinc-200 dark:border-zinc-700 hover:scale-105'}`}
                style={{
                  backgroundColor: p === 'transparent' ? '#e4e4e7' : p,
                  backgroundImage: p === 'transparent' ? 'repeating-conic-gradient(#a1a1aa 0% 25%, transparent 0% 50%)' : '',
                  backgroundSize: '8px 8px'
                }}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default function BackgroundPanel() {
  const {
    bgColor, setBgColor,
    bgImage, setBgImage,
    bgBlur, setBgBlur,
    bgBrightness, setBgBrightness,
    bgScale, setBgScale,
    bgX, setBgX,
    bgY, setBgY,
    saveHistory
  } = useEditorStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      saveHistory();
      const reader = new FileReader();
      reader.onload = (event) => setBgImage(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    saveHistory();
    setBgImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in slide-in-from-right-4 duration-300 pb-4">

      {/* App Appearance */}
      <div className="bg-white dark:bg-white/5 p-3 sm:p-4 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm space-y-3">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5"><Settings2 size={14}/> APP APPEARANCE</h4>
        {mounted ? (
          <div className="flex p-1 bg-zinc-100 dark:bg-black/40 rounded-xl relative">
            <button onClick={() => setTheme('light')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all z-10 ${theme === 'light' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}><Sun size={14} /> Light</button>
            <button onClick={() => setTheme('dark')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all z-10 ${theme === 'dark' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}><Moon size={14} /> Dark</button>
            <button onClick={() => setTheme('system')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all z-10 ${theme === 'system' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}><Monitor size={14} /> System</button>
          </div>
        ) : (
          <div className="h-[36px] w-full bg-zinc-100 dark:bg-black/40 rounded-xl animate-pulse"></div>
        )}
      </div>

      {/* Canvas Background Color */}
      <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm space-y-4">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-blue-500 flex items-center gap-1.5"><Palette size={14} /> Canvas Background</h4>
        <ColorPickerPopup
          label="Background Color"
          color={bgColor}
          onAction={() => {}}
          onChange={(c) => setBgColor(c)}
        />
      </div>

      {/* Background Image & Filters */}
      <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm space-y-5">
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-blue-500 mb-3 flex items-center gap-1.5"><ImageIcon size={14} /> Background Image</h4>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />

          <div className="flex gap-2">
            <button onClick={() => fileInputRef.current?.click()} className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl flex items-center justify-center gap-2 text-xs font-semibold transition-colors shadow-sm"><Upload size={14} /> Upload Image</button>
            {bgImage && <button onClick={handleRemoveImage} className="px-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors"><Trash2 size={16} /></button>}
          </div>
        </div>

        {bgImage && (
          <div className="space-y-4 pt-3 border-t border-zinc-100 dark:border-white/5">
            <StepperSlider label="Blur Radius" value={bgBlur} min={0} max={50} step={1} onAction={saveHistory} onChange={setBgBlur} unit="px" />
            <StepperSlider label="Brightness" value={bgBrightness} min={-100} max={100} step={5} onAction={saveHistory} onChange={setBgBrightness} unit="%" />
            <StepperSlider label="Zoom / Scale" value={bgScale} min={0.5} max={3} step={0.1} onAction={saveHistory} onChange={setBgScale} unit="x" />
            <div className="pt-2 border-t border-zinc-100 dark:border-white/5 space-y-4">
              <h5 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <MoveHorizontal size={12} /> Position Offset
              </h5>
              <StepperSlider label="Offset X" value={bgX} min={-400} max={400} step={5} onAction={saveHistory} onChange={setBgX} unit="px" />
              <StepperSlider label="Offset Y" value={bgY} min={-400} max={400} step={5} onAction={saveHistory} onChange={setBgY} unit="px" />
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
