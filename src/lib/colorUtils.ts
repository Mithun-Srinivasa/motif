import type { ColorSwatch } from '@/types';

// ─── SWITCH HERE ──────────────────────────────────────────────────────────────
// 'palette-surface' → uses the AI-generated surface color directly (default, more variety)
// 'derived-tint'    → mathematically derives a tint from the primary color (more subtle)
export const CANVAS_BG_MODE: 'palette-surface' | 'derived-tint' = 'derived-tint';
// ─────────────────────────────────────────────────────────────────────────────

export function getCanvasBackground(palette: ColorSwatch[]): string {
  if (CANVAS_BG_MODE === 'palette-surface') {
    return palette.find((c) => c.role === 'surface')?.hex ?? '#f5f1ea';
  } else {
    const primaryHex = palette.find((c) => c.role === 'primary')?.hex ?? '#8B4513';
    return deriveTintFromPrimary(primaryHex);
  }
}

// ── Hex ↔ HSL helpers ─────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return [r, g, b];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break;
      case gn: h = ((bn - rn) / d + 2) / 6; break;
      case bn: h = ((rn - gn) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  const ln = l / 100;
  const sn = s / 100;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = ln - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function deriveTintFromPrimary(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  const [h] = rgbToHsl(r, g, b);
  // Keep hue, flatten saturation to 20, lighten to 88
  return hslToHex(h, 20, 88);
}

// ── Contrast text helper ──────────────────────────────────────────────────────
export function getContrastText(bgHex: string): '#1c1917' | '#faf7f2' {
  const [r, g, b] = hexToRgb(bgHex);
  // Perceived luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#1c1917' : '#faf7f2';
}
