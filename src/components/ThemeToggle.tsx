'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'icon' | 'segmented';
  className?: string;
}

export default function ThemeToggle({ variant = 'icon', className = '' }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // next-themes requires this to avoid hydration mismatch
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // Placeholder of the same size to avoid layout shift
    return <div className={`w-9 h-9 rounded-xl bg-white/5 animate-pulse ${className}`} />;
  }

  const current = (theme === 'system' ? resolvedTheme : theme) || 'dark';

  // --- Simple Icon Toggle (default) ---
  if (variant === 'icon') {
    const cycle = () => {
      // Cycle: dark -> light -> system -> dark
      if (theme === 'dark') setTheme('light');
      else if (theme === 'light') setTheme('system');
      else setTheme('dark');
    };

    const Icon = theme === 'system' ? Monitor : current === 'dark' ? Moon : Sun;
    const label =
      theme === 'system' ? 'System' : current === 'dark' ? 'Dark' : 'Light';

    return (
      <button
        onClick={cycle}
        title={`Theme: ${label} (click to change)`}
        aria-label={`Switch theme. Current: ${label}`}
        className={`relative p-2 sm:p-2.5 bg-white/5 hover:bg-white/15 backdrop-blur-sm rounded-lg sm:rounded-xl text-white border border-white/10 transition-all shadow-lg hover:shadow-xl active:scale-95 hover:border-white/30 ${className}`}
      >
        <Icon size={16} className="sm:w-[18px] sm:h-[18px] transition-transform duration-300" />
      </button>
    );
  }

  // --- Segmented Toggle (3 options) ---
  const options = [
    { id: 'light', icon: Sun, label: 'Light' },
    { id: 'dark', icon: Moon, label: 'Dark' },
    { id: 'system', icon: Monitor, label: 'System' },
  ] as const;

  return (
    <div
      className={`inline-flex items-center gap-0.5 p-1 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 ${className}`}
      role="group"
      aria-label="Theme selector"
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const active = theme === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => setTheme(opt.id)}
            title={opt.label}
            aria-label={opt.label}
            aria-pressed={active}
            className={`p-1.5 rounded-lg transition-all active:scale-90 ${
              active
                ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg'
                : 'text-zinc-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Icon size={14} />
          </button>
        );
      })}
    </div>
  );
}
