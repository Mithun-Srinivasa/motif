// ─────────────────────────────────────────────────────────────────────────────
// FONT PERSONALITIES — SINGLE SOURCE OF TRUTH
// All font configuration lives here. Never hardcode font names elsewhere.
// ─────────────────────────────────────────────────────────────────────────────

export const FONT_PERSONALITIES = {
  'editorial-luxury': {
    displayFont: 'Cormorant Garamond',
    bodyFont: 'DM Sans',
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap',
    vibes: ['cozy', 'slow', 'artisan', 'japanese', 'minimal', 'café', 'ritual', 'quiet', 'refined'],
    axis: 'slow + refined',
  },
  'bold-geometric': {
    displayFont: 'Bebas Neue',
    bodyFont: 'Inter',
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600&display=swap',
    vibes: ['tech', 'startup', 'gen-z', 'bold', 'digital', 'fashion', 'energy', 'modern', 'loud'],
    axis: 'fast + loud',
  },
  'organic-warmth': {
    displayFont: 'Fraunces',
    bodyFont: 'Lora',
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,700;1,400&family=Lora:wght@400;500&display=swap',
    vibes: ['wellness', 'nature', 'earthy', 'retreat', 'botanical', 'soft', 'warm', 'feminine', 'gentle'],
    axis: 'slow + soft',
  },
  'sharp-minimal': {
    displayFont: 'Syne',
    bodyFont: 'Space Grotesk',
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Space+Grotesk:wght@300;400;500&display=swap',
    vibes: ['brutalist', 'architecture', 'stark', 'urban', 'streetwear', 'raw', 'design-forward', 'editorial'],
    axis: 'fast + clean',
  },
  'playful-loud': {
    displayFont: 'Righteous',
    bodyFont: 'Nunito',
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Righteous&family=Nunito:wght@400;600;700&display=swap',
    vibes: ['playful', 'children', 'community', 'approachable', 'friendly', 'joyful', 'fun', 'vibrant', 'brand'],
    axis: 'fast + fun',
  },
} as const;

export type FontPersonalityKey = keyof typeof FONT_PERSONALITIES;
export type FontPersonality = (typeof FONT_PERSONALITIES)[FontPersonalityKey];
