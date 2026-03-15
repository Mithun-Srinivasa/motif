'use client';

import type { ColorSwatch as ColorSwatchType } from '@/types';
import { getContrastText } from '@/lib/colorUtils';

interface ColorSwatchProps {
  swatch: ColorSwatchType;
  size?: 'sm' | 'lg';
}

export default function ColorSwatch({ swatch, size = 'lg' }: ColorSwatchProps) {
  const { role, hex, name, emotion } = swatch;
  const textColor = getContrastText(hex);

  const roleLabels: Record<string, string> = {
    primary: 'Primary',
    accent: 'Accent',
    surface: 'Surface',
    text: 'Text',
    highlight: 'Highlight',
    card: 'Card',
  };

  if (size === 'sm') {
    return (
      <div className="flex flex-col items-center gap-1">
        <div
          className="w-10 h-10 rounded-sm border border-white/20 shadow-sm"
          style={{ backgroundColor: hex }}
          title={`${name} — ${emotion}`}
        />
        <span style={{ color: '#78716c', fontSize: '10px', fontFamily: 'DM Sans, sans-serif' }}>
          {hex}
        </span>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0 overflow-hidden" style={{ borderRadius: '4px' }}>
      {/* Color block */}
      <div
        className="h-28 flex flex-col justify-between p-3"
        style={{
          backgroundColor: hex,
          color: textColor,
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)',
        }}
      >
        <span
          className="uppercase tracking-widest"
          style={{ fontSize: '9px', fontFamily: 'DM Sans, sans-serif', opacity: 0.7 }}
        >
          {roleLabels[role] ?? role}
        </span>
        <span style={{ fontSize: '11px', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>
          {hex}
        </span>
      </div>
      {/* Info block — min-height ensures uniform baseline; text always fully visible */}
      <div className="p-3" style={{ background: '#f5f1ea', minHeight: '80px' }}>
        <p style={{ color: '#1c1917', fontSize: '12px', fontWeight: 500, fontFamily: 'DM Sans, sans-serif', marginBottom: '4px' }}>
          {name}
        </p>
        <p style={{
          color: '#78716c',
          fontSize: '11px',
          fontFamily: 'DM Sans, sans-serif',
          lineHeight: 1.5,
        }}>
          {emotion}
        </p>
      </div>
    </div>
  );
}
