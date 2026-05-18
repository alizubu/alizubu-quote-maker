'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useEditorStore } from '../../../store/useEditorStore';
import { Image as ImageIcon, Upload, Trash2, Sun, Moon, Monitor, Palette, Settings2 } from 'lucide-react';
import { useTheme } from 'next-themes';

// --- Shared Component: Stepper Slider (এটি TextPanel এবং ImagePanel এও ব্যবহৃত হয়, তাই ডিলিট করা যাবে না) ---
export const StepperSlider = ({ label, value, min, max, step = 1, onChange, onAction, unit = '' }: any) => {
  const handleDecrement = () => { if (value > min) { onAction(); onChange(Math.max(min, value - step)); } };
  const handleIncrement = () => { if (value < max) { onAction(); onChange(Math.min(max, value + step)); } };
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{label}</label>
        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-white/10 px-2 py-1 rounded-md">{typeof value === 'number' ? Number(value.toFixed(1)) : value}{unit}</span>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={handleDecrement} className="w-7 h-7 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-white/10 hover:bg-zinc-200 dark:hover:bg-white/20 text-zinc-600 dark:text-zinc-300 transition-colors">-</button>
        <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => { onAction(); onChange(parseFloat(e.target.value)); }} className="flex-1 accent-blue-500 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer" />
        <button onClick={handleIncrement} className="w-7 h-7 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-white/10 hover:bg-zinc-200 dark:hover:bg-white/20 text-zinc-600 dark:text-zinc-300 transition-colors">+</button>
      </div>
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
    saveHistory 
  } = useEditorStore();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Theme Toggle Engine
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Hydration mismatch রোধ করতে
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

  const presetColors = ['#ffffff', '#000000', '#f1f5f9', '#fefce8', '#fce7f3', '#dbeafe', '#e0e7ff', '#d1fae5', '#3b82f6', '#ec4899'];

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 pb-4">
      
      {/* 🌙 App Appearance (Dark/Light Mode) Fixed 🌙 */}
      <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm space-y-3">
         <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5"><Settings2 size={14}/> APP APPEARANCE</h4>
         
         {/* Mounted চেক দিয়েছি যেন রিফ্রেশে এরর না আসে */}
         {mounted ? (
           <div className="flex p-1 bg-zinc-100 dark:bg-black/40 rounded-xl relative">
              <button 
                onClick={() => setTheme('light')} 
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all z-10 ${theme === 'light' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
              >
                 <Sun size={14} /> Light
              </button>
              <button 
                onClick={() => setTheme('dark')} 
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all z-10 ${theme === 'dark' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
              >
                 <Moon size={14} /> Dark
              </button>
              <button 
                onClick={() => setTheme('system')} 
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all z-10 ${theme === 'system' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
              >
                 <Monitor size={14} /> System
              </button>
           </div>
         ) : (
           <div className="h-[36px] w-full bg-zinc-100 dark:bg-black/40 rounded-xl animate-pulse"></div>
         )}
      </div>

      {/* Canvas Background Color */}
      <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm space-y-4">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-blue-500 flex items-center gap-1.5"><Palette size={14} /> Canvas Background</h4>
        
        <div className="flex items-center gap-3">
          <input 
            type="color" 
            value={bgColor} 
            onChange={(e) => setBgColor(e.target.value)} 
            className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent p-0 overflow-hidden" 
          />
          <div className="flex flex-1 flex-wrap gap-2">
            {presetColors.map((color) => (
              <button 
                key={color} 
                onClick={() => setBgColor(color)} 
                className={`w-6 h-6 rounded-full border border-zinc-200 dark:border-zinc-700 transition-transform ${bgColor === color ? 'scale-125 shadow-md border-blue-500' : 'hover:scale-110'}`} 
                style={{ backgroundColor: color }} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* Background Image & Filters */}
      <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm space-y-5">
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-blue-500 mb-3">Background Image</h4>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
          
          <div className="flex gap-2">
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl flex items-center justify-center gap-2 text-xs font-semibold transition-colors shadow-sm"
            >
              <Upload size={14} /> Upload Image
            </button>
            {bgImage && (
              <button 
                onClick={handleRemoveImage} 
                className="px-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors"
                title="Remove Background Image"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Filters (Only show if image is uploaded) */}
        {bgImage && (
          <div className="space-y-4 pt-3 border-t border-zinc-100 dark:border-white/5">
             <StepperSlider label="Blur Radius" value={bgBlur} min={0} max={50} step={1} onAction={saveHistory} onChange={setBgBlur} unit="px" />
             <StepperSlider label="Brightness" value={bgBrightness} min={-100} max={100} step={5} onAction={saveHistory} onChange={setBgBrightness} unit="%" />
             <StepperSlider label="Zoom / Scale" value={bgScale} min={0.5} max={3} step={0.1} onAction={saveHistory} onChange={setBgScale} unit="x" />
          </div>
        )}
      </div>
      
    </div>
  );
}