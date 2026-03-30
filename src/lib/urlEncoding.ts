import LZString from 'lz-string';
import type { MoodboardData } from '@/types';

// ── Share-payload type ─────────────────────────────────────────────────────────
// A slimmed-down version of MoodboardData for the share URL.
// Omits: palette[].emotion, suggestedFonts[].rationale, imagePrompts
interface SharePayload {
  projectTitle: string;
  projectEssence: string;
  toneWords: string[];
  palette: { role: string; hex: string; name: string }[];
  fontPersonality: string;
  suggestedFonts: { name: string; role: string }[];
  imagePrompts?: string[];
}

// ── Strip non-essential fields ─────────────────────────────────────────────────
function toSharePayload(data: MoodboardData): SharePayload {
  return {
    projectTitle: data.projectTitle,
    projectEssence: data.projectEssence,
    toneWords: data.toneWords,
    palette: data.palette.map(({ role, hex, name }) => ({ role, hex, name })),
    fontPersonality: data.fontPersonality,
    suggestedFonts: data.suggestedFonts.map(({ name, role }) => ({ name, role })),
    imagePrompts: data.imagePrompts,
  };
}

// ── Hydrate back to full MoodboardData ─────────────────────────────────────────
// Fills in stripped fields with sensible defaults so the board page can render.
export function hydrateMoodboard(payload: SharePayload): MoodboardData {
  return {
    projectTitle: payload.projectTitle,
    projectEssence: payload.projectEssence,
    toneWords: payload.toneWords,
    palette: payload.palette.map((p) => ({
      role: p.role as MoodboardData['palette'][0]['role'],
      hex: p.hex,
      name: p.name,
      emotion: '',
    })),
    fontPersonality: payload.fontPersonality as MoodboardData['fontPersonality'],
    suggestedFonts: payload.suggestedFonts.map((f) => ({
      name: f.name,
      role: f.role as 'display' | 'body',
      rationale: '',
    })),
    imagePrompts: payload.imagePrompts || [],
  };
}

// ── Encode / Decode ────────────────────────────────────────────────────────────
export function encodeMoodboard(data: MoodboardData): string {
  const slim = toSharePayload(data);
  const json = JSON.stringify(slim);
  return LZString.compressToEncodedURIComponent(json);
}

export function decodeMoodboard(encoded: string): MoodboardData {
  const json = LZString.decompressFromEncodedURIComponent(encoded);
  if (!json) throw new Error('Failed to decompress share data');
  const payload: SharePayload = JSON.parse(json);
  return hydrateMoodboard(payload);
}

export function buildShareUrl(data: MoodboardData): string {
  if (typeof window === 'undefined') return '';
  const encoded = encodeMoodboard(data);
  return `${window.location.origin}/board/${encoded}`;
}
