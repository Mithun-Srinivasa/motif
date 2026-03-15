// ── Motif Types ────────────────────────────────────────────────

export type ColorRole = 'primary' | 'accent' | 'surface' | 'text' | 'highlight' | 'card';

export interface ColorSwatch {
  role: ColorRole;
  hex: string;
  name: string;
  emotion: string;
}

export type FontPersonalityKey =
  | 'editorial-luxury'
  | 'bold-geometric'
  | 'organic-warmth'
  | 'sharp-minimal'
  | 'playful-loud';

export interface SuggestedFont {
  name: string;
  role: 'display' | 'body';
  rationale: string;
}

export interface MoodboardData {
  projectTitle: string;
  projectEssence: string;
  toneWords: string[];
  palette: ColorSwatch[];
  fontPersonality: FontPersonalityKey;
  suggestedFonts: SuggestedFont[];
  imagePrompts: string[];
}

// Partial version built up progressively during streaming
export type PartialMoodboardData = Partial<MoodboardData>;
