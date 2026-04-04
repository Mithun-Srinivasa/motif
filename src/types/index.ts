import { z } from 'zod';

// ── Motif Types ────────────────────────────────────────────────

export const ColorRoleSchema = z.enum(['primary', 'accent', 'surface', 'text', 'highlight', 'card']);
export type ColorRole = z.infer<typeof ColorRoleSchema>;

export const ColorSwatchSchema = z.object({
  role: ColorRoleSchema,
  hex: z.string().regex(/^#([0-9A-Fa-f]{3}){1,2}$/, 'Invalid hex color'),
  name: z.string(),
  emotion: z.string(),
});
export type ColorSwatch = z.infer<typeof ColorSwatchSchema>;

export const FontPersonalityKeySchema = z.enum([
  'editorial-luxury',
  'bold-geometric',
  'organic-warmth',
  'sharp-minimal',
  'playful-loud'
]);
export type FontPersonalityKey = z.infer<typeof FontPersonalityKeySchema>;

export const SuggestedFontSchema = z.object({
  name: z.string(),
  role: z.enum(['display', 'body']),
  rationale: z.string()
});
export type SuggestedFont = z.infer<typeof SuggestedFontSchema>;

export const MoodboardDataSchema = z.object({
  projectTitle: z.string(),
  projectEssence: z.string(),
  toneWords: z.array(z.string()).max(10).default([]),
  palette: z.array(ColorSwatchSchema).default([]),
  fontPersonality: FontPersonalityKeySchema,
  suggestedFonts: z.array(SuggestedFontSchema).default([]),
  imagePrompts: z.array(z.string()).default([]),
});
export type MoodboardData = z.infer<typeof MoodboardDataSchema>;

// Partial version built up progressively during streaming
export type PartialMoodboardData = Partial<MoodboardData>;

