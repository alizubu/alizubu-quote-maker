'use client';

import React from 'react';
import { useEditorStore } from '../../../store/useEditorStore';
import { useTheme } from 'next-themes';
import { ImagePlus, X, Sun, Moon, Monitor, Sliders, Palette, Minus, Plus } from 'lucide-react';

// Reusable Slider
export const StepperSlider = ({ label, value, min, max, step = 1, unit = "", onChange, onAction }: any) => (
  <div className="space-y-2">
    <div className="flex justify-between text-[11px] font-medium opacity-80 text-zinc-700 dark:text-zinc-300">
      <label>{label}</label>
      <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-zinc-200 dark:bg-white/10 text-blue-500">{value}{unit}</span>
    </div>
    <div className="flex items-center gap-3">
      <button onClick={() => { onAction(); onChange(Math.max(min, Number((value - step).toFixed(2)))); }} className="w-8 h-8 flex items-center justify-center bg-zinc-200 dark:bg-zinc-800 rounded-xl active:scale-90"><Minus size={14} /></button>
      <input type="range" min={min} max={max} step={step} value={value} onMouseDown={onAction} onTouchStart={onAction} onChange={(e) => onChange(Number(e.target.value))} className="flex-1 h-1.5 rounded-full appearance-none bg-zinc-300 dark:bg-zinc-700 accent-blue-500" />
      <button onClick={() => { onAction(); onChange(Math.min(max, Number((value + step).toFixed(2)))); }} className="w-8 h-8 flex items-center justify-center bg-zinc-200 dark:bg-zinc-800 rounded-xl active:scale-90"><Plus size={14} /></button>
    </div>
  </div>
);

export default function BackgroundPanel() {
  const { bgColor, setBgColor, bgImage, setBgImage, bgBlur, setBgBlur, bgBrightness, setBgBrightness, bgScale, setBgScale, bgX, setBgX, bgY, setBgY, saveHistory } = useEditorStore();
  const { theme, setTheme } = useTheme();
  const bgColors = ['transparent', '#000000', '#18181b', '#27272a', '#ffffff', '#1e1e1e', '#0f172a', '#450a0a'];

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 pb-4">
      
      {/* Theme Settings */}
      <div className="bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 p-4 rounded-2xl space-y-4 shadow-sm">
        <h4 className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 text-zinc-800 dark:text-white"><Sliders size={13} className="text-blue-500" /> App Appearance</h4>
        <div className="grid grid-cols-3 gap-2 p-1 bg-zinc-100 dark:bg-black/40 rounded-xl">
          {[{ name: 'light', icon: <Sun size={14} />, label: 'Light' }, { name: 'dark', icon: <Moon size={14} />, label: 'Dark' }, { name: 'system', icon: <Monitor size={14} />, label: 'System' }].map((t) => (
            <button key={t.name} onClick={() => setTheme(t.name)} className={`py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${theme === t.name ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm font-semibold' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Background Color & Image */}
      <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 opacity-80 text-zinc-800 dark:text-white"><Palette size={14} className="text-blue-500"/> Canvas Background</h3>
      <div className="flex flex-wrap gap-3 p-4 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-sm">
        {bgColors.map((color) => (
          <button key={color} onClick={() => { setBgColor(color); setBgImage(null); }} className={`w-10 h-10 rounded-full border-2 transition-all ${bgColor === color && !bgImage ? 'scale-110 border-zinc-900 dark:border-white shadow-md' : 'border-zinc-300 dark:border-zinc-700/50 hover:scale-105'}`} style={color === 'transparent' ? { backgroundImage: 'repeating-conic-gradient(#3f3f46 0% 25%, transparent 0% 50%)', backgroundSize: '10px 10px' } : { backgroundColor: color }} />
        ))}
        <label className="w-10 h-10 rounded-full border-2 border-dashed border-zinc-400 dark:border-zinc-500 hover:border-zinc-900 dark:hover:border-white flex items-center justify-center cursor-pointer transition-all bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400">
          <ImagePlus size={18} />
          <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if(f) setBgImage(URL.createObjectURL(f)); }} className="hidden" />
        </label>
      </div>
      
      {/* Background Image Adjustments */}
      {bgImage && (
        <div className="space-y-6 bg-white dark:bg-white/5 p-4 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-md">
          <div className="flex justify-between items-center border-b border-zinc-200 dark:border-white/5 pb-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Image Transform</h4>
            <button onClick={() => setBgImage(null)} className="p-1 text-zinc-400 hover:text-red-500"><X size={14} /></button>
          </div>
          <StepperSlider label="Zoom" value={bgScale} min={0.5} max={4} step={0.05} unit="x" onAction={saveHistory} onChange={setBgScale} />
          <StepperSlider label="Blur" value={bgBlur} min={0} max={50} onAction={saveHistory} onChange={setBgBlur} />
          <StepperSlider label="Brightness" value={bgBrightness} min={-100} max={100} unit="%" onAction={saveHistory} onChange={setBgBrightness} />
        </div>
      )}
    </div>
  );
}