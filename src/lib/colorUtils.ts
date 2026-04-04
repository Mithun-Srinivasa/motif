import type { ColorSwatch } from '@/types';
import chroma from 'chroma-js';

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

// ── Hex ↔ HSL helpers replaced by chroma-js mathematically accurate logic ──

export function deriveTintFromPrimary(hex: string): string {
  try {
    const [h] = chroma(hex).hsl();
    const hue = isNaN(h) ? 0 : h;
    // Keep hue, flatten saturation to 20%, lighten to 88%
    return chroma.hsl(hue, 0.20, 0.88).hex();
  } catch {
    return '#f5f1ea'; // Safe fallback
  }
}

// ── WCAG Contrast text helper ────────────────────────────────────────────────
export function getContrastText(bgHex: string): '#1c1917' | '#faf7f2' {
  try {
    const contrastDark = chroma.contrast(bgHex, '#1c1917');
    const contrastLight = chroma.contrast(bgHex, '#faf7f2');
    
    // Choose the text color with the highest relative contrast ratio against the background
    return contrastDark > contrastLight ? '#1c1917' : '#faf7f2';
  } catch {
    return '#1c1917'; // Safe fallback
  }
}

// ── Card swatch builder ───────────────────────────────────────────────────────
// Constructs the 6th ColorSwatch representing the moodboard canvas backdrop.
// The hex is the same value returned by getCanvasBackground — derived mathematically
// from the primary color's hue (S=20, L=88), ensuring it always harmonises.
export function buildCardSwatch(palette: ColorSwatch[]): ColorSwatch {
  const hex = getCanvasBackground(palette);
  return {
    role: 'card',
    hex,
    name: 'Motif Card',
    emotion:
      'The whispered backdrop of your moodboard. A mathematically derived tint of the primary hue, softened to near-neutrality so every other colour breathes against it with quiet authority.',
  };
}
