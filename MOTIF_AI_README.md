# AI_README.md — Motif Project Context

> **FOR AI ASSISTANTS:** This file is your single source of truth for this project.
> Read this BEFORE writing any code. Update this file as you make progress.
> Do not refactor working code unless explicitly asked by the user.
> When you complete tasks, mark them ✅. When you add new decisions, log them below.

---

## Project Overview

**Name:** Motif
**Tagline:** Turn a feeling into a design direction.
**What it does:** A user types a plain-English project vibe. Motif streams an AI-generated creative brief and renders it as a beautifully designed moodboard — with a color palette, typography pairing, mood images, and tone of voice. The moodboard can be shared via URL or saved as a PNG.
**Who built it:** Mithun Srinivasa (portfolio project)
**Purpose:** Portfolio showcase for Full Stack / Frontend Developer roles at Indian startups and product companies. Demonstrates real-time streaming AI responses, complex UI interactions, and creative product thinking.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| AI (streaming brief) | Google Gemini API — model: `gemini-2.5-flash-lite` |
| Image generation | Hugging Face — `@huggingface/inference` SDK, FLUX.1-schnell via fal-ai provider |
| Sharing | URL state encoding — no database |
| Save as image | html2canvas library |
| Deployment | Vercel (free tier) |
| Fonts | Google Fonts (loaded dynamically) |

---

## Design System

**DO NOT deviate from this unless told to by Mithun.**

| Token | Value |
|-------|-------|
| Background | `#faf7f2` (warm cream) |
| Surface | `#f5f1ea` (slightly deeper cream for cards) |
| Border | `#e7e5e4` |
| Text Primary | `#1c1917` (warm near-black) |
| Text Muted | `#78716c` |
| Accent | `#1a3a2a` (deep forest green) |
| Accent Hover | `#2d5a3d` |
| Border Radius | 4px cards, 2px inputs |
| App Font (UI chrome) | Cormorant Garamond (display), DM Sans (body/UI) |

**NEVER use:** purple gradients, generic SaaS blues, Inter as a display font, harsh drop shadows.

---

## Font Personality System

This is the most important architectural decision in the project.
**All font config lives in ONE file: `src/lib/fontPersonalities.ts`**
Changing fonts only ever requires editing this one file.

**CRITICAL UX RULE: The font personality system is invisible to the user.**
Never label, name, or expose which personality is active. The moodboard simply renders in the personality fonts — the user experiences variety without understanding the mechanism. Do NOT add any "Card Personality" label or section to the UI.

The personalities are defined by **vibe axis** (slow/fast + soft/hard), not just aesthetic category:

```typescript
// src/lib/fontPersonalities.ts
export const FONT_PERSONALITIES = {
  'editorial-luxury': {
    displayFont: 'Cormorant Garamond',
    bodyFont: 'DM Sans',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap',
    vibes: ['cozy', 'slow', 'artisan', 'japanese', 'minimal', 'café', 'ritual', 'quiet', 'refined'],
    axis: 'slow + refined',
  },
  'bold-geometric': {
    displayFont: 'Bebas Neue',
    bodyFont: 'Inter',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600&display=swap',
    vibes: ['tech', 'startup', 'gen-z', 'bold', 'digital', 'fashion', 'energy', 'modern', 'loud'],
    axis: 'fast + loud',
  },
  'organic-warmth': {
    displayFont: 'Fraunces',
    bodyFont: 'Lora',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,700;1,400&family=Lora:wght@400;500&display=swap',
    vibes: ['wellness', 'nature', 'earthy', 'retreat', 'botanical', 'soft', 'warm', 'feminine', 'gentle'],
    axis: 'slow + soft',
  },
  'sharp-minimal': {
    displayFont: 'Syne',
    bodyFont: 'Space Grotesk',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Space+Grotesk:wght@300;400;500&display=swap',
    vibes: ['brutalist', 'architecture', 'stark', 'urban', 'streetwear', 'raw', 'design-forward', 'editorial'],
    axis: 'fast + clean',
  },
  'playful-loud': {
    displayFont: 'Righteous',
    bodyFont: 'Nunito',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Righteous&family=Nunito:wght@400;600;700&display=swap',
    vibes: ['playful', 'children', 'community', 'approachable', 'friendly', 'joyful', 'fun', 'vibrant', 'brand'],
    axis: 'fast + fun',
  },
} as const;

export type FontPersonalityKey = keyof typeof FONT_PERSONALITIES;
```

**How font loading works:**
- Gemini returns a `fontPersonality` key (one of the 5 above)
- A `useEffect` in the moodboard component injects a `<link>` tag to Google Fonts using `googleFontsUrl`
- The moodboard canvas element gets CSS variables `--font-display` and `--font-body` set to the personality fonts
- All text inside the canvas uses these variables — never hardcoded font names
- The app chrome (nav, buttons, sidebar UI) always uses Cormorant Garamond + DM Sans regardless of personality

---

## Color Palette System

Gemini returns 5 colors with explicit roles.

**5 color roles:**
| Role | Key | What it means |
|------|-----|---------------|
| Primary | `primary` | The dominant brand color — most used |
| Accent | `accent` | The energy color — CTAs, highlights |
| Surface | `surface` | Background of UI — usually light/neutral |
| Text | `text` | Primary type color |
| Highlight | `highlight` | The surprise — used sparingly for delight |
| Card | `card` | The moodboard canvas backdrop — mathematically derived from primary (S=20, L=88), not from Gemini |

---

## Canvas Background System — SWITCHABLE

**The canvas background has two modes. Both are implemented. A single constant controls which is active.**

```typescript
// src/lib/colorUtils.ts

// ─── SWITCH HERE ──────────────────────────────────────────────
// 'palette-surface' → uses the AI-generated surface color directly (default, more variety)
// 'derived-tint'    → mathematically derives a tint from the primary color (more subtle)
export const CANVAS_BG_MODE: 'palette-surface' | 'derived-tint' = 'palette-surface';
// ──────────────────────────────────────────────────────────────

export function getCanvasBackground(palette: ColorSwatch[]): string {
  if (CANVAS_BG_MODE === 'palette-surface') {
    // palette is an array — find the surface swatch
    return palette.find(c => c.role === 'surface')?.hex ?? '#f5f1ea';
  } else {
    // Derive a tint: take primary hex → HSL → set L=88, S=20 → back to hex
    const primaryHex = palette.find(c => c.role === 'primary')?.hex ?? '#8B4513';
    return deriveTintFromPrimary(primaryHex);
  }
}

function deriveTintFromPrimary(hex: string): string {
  // Convert hex → HSL → set L=88, S=20 → convert back to hex
  // Full hex/HSL conversion helpers also live in this file
}
```

**To switch modes:** Open `src/lib/colorUtils.ts`, find the `CANVAS_BG_MODE` constant near the top, change `'palette-surface'` to `'derived-tint'` (or back). That is the only change needed. Nothing else touches this logic.

**Why two modes exist:**
- `palette-surface` gives more visual variety — each brief's surface color is semantically chosen by Gemini and often more interesting (warm linen, pale sage, cool slate)
- `derived-tint` is more predictable and always harmonises with the primary color mathematically — good fallback if Gemini surface colors feel inconsistent

---

## Gemini API Usage

### /api/generate — Streaming route

**Model:** `gemini-2.5-flash-lite`
**Method:** Streaming via `generateContentStream`

**System prompt:**
```
You are a senior creative director and brand strategist. Generate a structured creative brief for the project described. Return ONLY valid JSON — no markdown, no explanation, no code fences.

Return this exact structure:
{
  "projectTitle": "string — a evocative project name, max 6 words",
  "projectEssence": "string — 2-3 sentences describing the soul of the project. Vivid, specific, no clichés.",
  "toneWords": ["string", "string", "string", "string", "string"],
  "palette": [
    { "role": "primary", "hex": "#xxxxxx", "name": "string — evocative color name", "emotion": "string — 1 sentence on what this color evokes" },
    { "role": "accent", "hex": "#xxxxxx", "name": "string", "emotion": "string" },
    { "role": "surface", "hex": "#xxxxxx", "name": "string", "emotion": "string" },
    { "role": "text", "hex": "#xxxxxx", "name": "string", "emotion": "string" },
    { "role": "highlight", "hex": "#xxxxxx", "name": "string", "emotion": "string" }
  ],
  "fontPersonality": "editorial-luxury | bold-geometric | organic-warmth | sharp-minimal | playful-loud",
  "suggestedFonts": [
    { "name": "string — exact Google Fonts name", "role": "display | body", "rationale": "string — 1 sentence why this font fits" },
    { "name": "string — exact Google Fonts name", "role": "display | body", "rationale": "string" }
  ],
  "imagePrompts": [
    "string — detailed image generation prompt, photorealistic style, mood-focused, no people faces",
    "string — detailed image generation prompt"
  ]
}

Rules:
- Colors must be hex codes, high contrast between text and surface
- fontPersonality must be exactly one of the 5 keys provided
- imagePrompts should be rich, specific, painterly descriptions optimized for FLUX.1-schnell image generation
- suggestedFonts must be real fonts available on Google Fonts
- Never use clichés like "timeless" or "innovative"
```

**Streaming implementation:**
- Stream the JSON token by token
- Client accumulates the stream and attempts `JSON.parse` on each chunk
- Once valid JSON is parseable, progressively reveal sections as their keys become available
- Show a typing cursor animation while streaming

---

## Hugging Face Image Generation

**Model:** `black-forest-labs/FLUX.1-schnell` (Apache 2.0, open-source)
**Provider:** `fal-ai` routed through HF — reliable GPU access via HF monthly credits
**SDK:** `@huggingface/inference` (official JS SDK — installed as part of the full dependency install)

**Why not direct HF inference API:**
As of mid-2025, HF's own `hf-inference` serverless tier focuses on CPU tasks only. GPU image generation must go through a third-party provider routed via HF. Use `fal-ai` via the official SDK. Do NOT use `stabilityai/stable-diffusion-xl-base-1.0` or any direct `hf-inference` image model — they will 503.

**API call (in /api/images/route.ts):**
```typescript
import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(process.env.HF_API_KEY);

const blob = await client.textToImage({
  model: "black-forest-labs/FLUX.1-schnell",
  provider: "fal-ai",
  inputs: prompt + STYLE_SUFFIX,
});

const buffer = await blob.arrayBuffer();
const base64 = Buffer.from(buffer).toString("base64");
// Return as: `data:image/png;base64,${base64}`
```

**Style suffix appended to every prompt:**
```
, editorial photography, soft natural lighting, high detail, no text, no legible words, no faces, moodboard aesthetic
```

**Getting the HF token (for Mithun's reference):**
1. huggingface.co → Settings → Access Tokens → New token
2. Name: `motif`, Role: Read → Generate
3. Add to .env.local using: `Add-Content -Encoding UTF8 .env.local "`nHF_API_KEY=hf_your_token"`
   (Use Add-Content NOT echo — echo on PowerShell saves as UTF-16 which breaks env reading)

**Free tier / billing notes:**
- Every HF user gets monthly free credits — enough for a portfolio project
- Indian credit cards are NOT supported by HF for adding paid credits (RBI compliance)
- Graceful degradation to shimmer placeholder is acceptable if credits run out

**Implementation notes:**
- Fire both image requests in parallel with `Promise.all`
- Show shimmer placeholder while loading (typically 3-8 seconds with fal-ai)
- If request fails or times out (>25s), return null — client shows shimmer with prompt text
- Do NOT block moodboard rendering on image completion — images fade in when ready

---

## URL State Sharing

**No database.** Moodboard state is encoded in the URL as a base64 compressed JSON string.

```typescript
// Encoding
const encoded = btoa(encodeURIComponent(JSON.stringify(moodboardData)));
const shareUrl = `${window.location.origin}/board/${encoded}`;

// Decoding (in /app/board/[id]/page.tsx)
const decoded = JSON.parse(decodeURIComponent(atob(params.id)));
```

**Note:** Images from Hugging Face are not stored — they are regenerated when a shared link is opened. This is intentional and keeps the project zero-cost.

---

## Save as PNG

Use `html2canvas` to capture the moodboard canvas element.

```typescript
import html2canvas from 'html2canvas';

await document.fonts.ready; // wait for web fonts — critical for correct font rendering
const canvas = await html2canvas(moodboardRef.current, {
  scale: 2,
  backgroundColor: canvasBackground,
  useCORS: true,
  allowTaint: true,
});
const link = document.createElement('a');
link.download = `motif-${projectTitle.toLowerCase().replace(/\s/g, '-')}.png`;
link.href = canvas.toDataURL();
link.click();
```

---

## Project Structure

```
motif/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout, fonts, metadata
│   │   ├── page.tsx                      # Landing page with animated input
│   │   ├── board/
│   │   │   └── [id]/
│   │   │       └── page.tsx              # Shared moodboard view (read-only)
│   │   └── api/
│   │       ├── generate/
│   │       │   └── route.ts              # Streaming Gemini route
│   │       └── images/
│   │           └── route.ts              # Hugging Face proxy route
│   ├── components/
│   │   ├── LandingInput.tsx              # Animated hero input
│   │   ├── MoodboardCanvas.tsx           # Main moodboard output
│   │   ├── ColorSwatch.tsx               # Individual color swatch with role
│   │   ├── TypographyPanel.tsx           # Suggested fonts only (personality is invisible to user)
│   │   ├── ToneChips.tsx                 # Tone of voice keyword chips
│   │   ├── MoodImage.tsx                 # Image with shimmer loader
│   │   ├── StreamingText.tsx             # Typing cursor animation
│   │   └── ShareSaveBar.tsx              # Share link + Save as PNG buttons
│   ├── lib/
│   │   ├── fontPersonalities.ts          # SINGLE SOURCE OF TRUTH for all fonts
│   │   ├── colorUtils.ts                 # deriveCanvasBackground + hex/HSL utils
│   │   ├── urlEncoding.ts                # encode/decode moodboard state
│   │   └── gemini.ts                     # Gemini client setup
│   └── types/
│       └── index.ts                      # MoodboardData, ColorSwatch, FontPersonality etc.
├── .env.local                            # NEVER COMMIT
├── .env.example                          # Commit this
├── AI_README.md                          # This file
└── README.md                             # Human-facing GitHub readme
```

---

## Landing Page — Animated Background

The landing page background cycles through 3 warm color washes as example prompts change.
Each prompt has an associated background radial gradient using hex values (not Tailwind classes):

```typescript
const EXAMPLE_PROMPTS = [
  { text: 'A cozy Japanese coffee shop rebrand. Autumn. Unhurried.', bg: ['#fef3c7', '#fde68a', '#fef9ee'] },
  { text: 'Tech startup for sustainable fashion. Bold. Gen-Z.',      bg: ['#d1fae5', '#a7f3d0', '#f0fdf4'] },
  { text: 'Luxury wellness retreat in Bali. Serene. Earthy.',        bg: ['#fce7f3', '#fbcfe8', '#fff1f2'] },
];
```

Applied as inline style using `radial-gradient`:
```typescript
background: `radial-gradient(ellipse at 15% 40%, ${activeBg.bg[0]} 0%, ${activeBg.bg[2]} 45%, #faf7f2 100%)`
```

The background transitions with a `2.5s ease` CSS transition on the background property.
The "Motif" wordmark uses `clamp(80px, 16vw, 180px)` font sizing.

---

## Constraints (NEVER violate these)

- No database
- No user authentication
- Images regenerate on share link open — never stored
- HF_API_KEY never exposed to client — always proxied through /api/images route
- GEMINI_API_KEY never exposed to client — always server-side in /api/generate route
- html2canvas PNG export happens client-side — no server involvement

---

## Environment Variables

```
GEMINI_API_KEY=your_gemini_key_here
HF_API_KEY=your_huggingface_key_here
```

Get Gemini key: aistudio.google.com (free, no card)
Get HF key: huggingface.co/settings/tokens (free, no card)

---

## Current State

> AI assistants: update this section as you build.

### Completed
- ✅ Project scaffolded
- ✅ Dependencies installed (`@google/generative-ai`, `@huggingface/inference`, `html2canvas`)
- ✅ Environment variables set up
- ✅ Types defined (`src/types/index.ts`)
- ✅ `fontPersonalities.ts` (single config file with all 5 personalities)
- ✅ `colorUtils.ts` (both CANVAS_BG_MODE modes — palette-surface and derived-tint)
- ✅ `urlEncoding.ts` (encodeMoodboard / decodeMoodboard / buildShareUrl)
- ✅ `/api/generate` streaming route (model priority: gemini-2.5-flash-lite → gemini-2.0-flash, with 429 retry)
- ✅ `/api/images` proxy route (FLUX.1-schnell via HF free serverless/nscale, parallel, 25s timeout)
- ✅ `StreamingText` component with blinking cursor
- ✅ `ColorSwatch` component (sm + lg variants, inset border for light swatches)
- ✅ `ColorComposition` component — weighted color shapes: Primary (big block), Accent (thin stripe), Surface (background container), Text (Aa specimen), Highlight (glowing dot)
- ✅ `ToneChips` component
- ✅ `TypographyPanel` component (suggested fonts only — personality invisible)
- ✅ `MoodImage` component with shimmer loader
- ✅ `ShareSaveBar` component (clipboard share + html2canvas PNG export via toBlob)
- ✅ `MoodboardCanvas` component (font injection, CSS vars, all sections, color composition)
- ✅ Landing page (`app/page.tsx`) — animated gradient, wordmark, example chips
- ✅ Moodboard page (`app/moodboard/page.tsx`) — sidebar + streaming canvas, useSearchParams, Suspense wrapper, double-fire guard
- ✅ Shared board view (`app/board/[id]/page.tsx`) — decode URL, regenerate images
- ✅ `globals.css` — design tokens, shimmer, fade-up, cursor-blink, grain overlay
- ✅ `app/layout.tsx` — Cormorant Garamond + DM Sans preloaded for app chrome
- ✅ `stripCodeFences()` — strips markdown code fences from Gemini responses before JSON parsing
- ✅ Color palette using full-width detailed swatches (rolled back from compact left-column mode, then repositioned into left column of 2-col grid below Tone of Voice)
- ✅ "Color in Context" weighted composition section (full-width, below palette)
- ✅ 6th "Card" swatch added — computed via `buildCardSwatch()` in `colorUtils.ts`, not sourced from Gemini
- ✅ Palette rendered as a 3-column × 2-row CSS grid so all 6 descriptions are fully visible

### In Progress
_(AI assistant: move items here when you start them)_

### Not Started
- [ ] README.md written (human-facing)
- [ ] Deployed on Vercel

---

## Known Issues / Decisions Log

> AI assistants: log architectural decisions and known issues here as you build.

| Date | Decision / Issue | Resolved? |
|------|-----------------|-----------|
| — | Images regenerate on share — intentional, zero-cost tradeoff | Yes |
| — | Streaming JSON parsed progressively — sections reveal as keys become parseable | Yes |
| 2026-03-09 | No separate `lib/gemini.ts` — Gemini client init is inline in `/api/generate/route.ts` to keep it minimal | Yes |
| 2026-03-09 | Landing page redirects to `/moodboard?vibe=...` immediately for streaming UX (not to `/board/[id]`) | Yes |
| 2026-03-10 | Model priority updated to `gemini-2.5-flash-lite` → `gemini-2.0-flash` after ListModels confirmed availability. `gemini-1.5-flash` removed (not available on this API key) | Yes |
| 2026-03-10 | Replaced `window.location.search` with `useSearchParams()` + `<Suspense>` wrapper for reactive search param access | Yes |
| 2026-03-10 | Added `stripCodeFences()` — Gemini wraps JSON in ` ```json ``` ` fences despite instructions. All parse calls strip them first | Yes |
| 2026-03-10 | Added `hasFiredRef` guard to prevent React strict mode from double-firing `streamBrief` on mount | Yes |
| 2026-03-11 | Removed `provider: 'fal-ai'` from images route — fal-ai requires paid credits. HF SDK auto-selects free `nscale` provider | Yes |
| 2026-03-11 | `html2canvas` type assertion `as (el, opts?) => Promise<HTMLCanvasElement>` works around old `@types` mismatch | Yes |
| 2026-03-11 | PNG export switched from `toDataURL()` to `toBlob('image/png')` + `URL.createObjectURL()` for reliable binary downloads | Yes |
| 2026-03-11 | Color swatches get `boxShadow: inset 0 0 0 1px rgba(0,0,0,0.08)` border so light colors don't blend into canvas | Yes |
| 2026-03-11 | Color palette rectangles moved from full-width section to left column of 2-col grid (balances tall images) | Yes |
| 2026-03-11 | Added `ColorComposition` — weighted color shapes as "Color in Context" section (full-width, above typography) | Yes |
| 2026-03-12 | Rolled back color palette to full-width detailed swatches, maintaining `ColorComposition` below it. | Yes |
| 2026-03-14 | Moved color palette from full-width section (below images) into left column of 2-col grid in `MoodboardCanvas`, below Tone of Voice chips — now sits beside mood images as requested. | Yes |
| 2026-03-14 | Fixed TEXT color swatch taller-than-others bug: added fixed `height: 72px` + `overflow: hidden` to the info block in `ColorSwatch.tsx`, emotion text clamped to 2 lines via `-webkit-line-clamp: 2`. Root cause: TEXT role consistently receives longer emotion descriptions from Gemini. | Yes |
| 2026-03-14 | Added 6th "Card" swatch (`role: 'card'`) — not from Gemini, built by `buildCardSwatch()` in `colorUtils.ts`. Hex = `getCanvasBackground(palette)` (primary hue, S=20, L=88). Static name "Motif Card", static poetic description. Injected in `MoodboardCanvas` before rendering. | Yes |
| 2026-03-14 | Palette grid changed from single flex-row to 3-column CSS grid (2 rows × 3 cols) to give each swatch enough space for full description text. Fixed-height cap and line-clamp removed from `ColorSwatch` info block; replaced with `minHeight: 80px` so all text is visible and swatches remain uniform. | Yes |

---

## Onboarding Prompt for New AI Assistants

```
I'm working on a project called Motif — an AI creative brief generator.
Please read the AI_README.md file in this repository carefully before doing anything.

Key things to know:
1. Next.js 14 App Router, TypeScript, Tailwind CSS
2. Gemini API (gemini-2.5-flash-lite) for streaming brief generation
3. Hugging Face images — @huggingface/inference SDK, model: FLUX.1-schnell, auto-selected free provider (nscale)
4. Font personalities configured ONLY in src/lib/fontPersonalities.ts — never hardcode fonts elsewhere
5. The font personality is INVISIBLE to the user — never label or expose it in the UI
6. Canvas background controlled by CANVAS_BG_MODE constant in src/lib/colorUtils.ts
7. palette is always an array of ColorSwatch — use .find(c => c.role === '...') not keyed access
8. No database — URL encoding for sharing, html2canvas for PNG export
9. The Current State checklist shows what's done and what's not

Your job: [DESCRIBE WHAT YOU NEED]

After completing your task:
- Update the Current State section in AI_README.md
- Log any architectural decisions in the Decisions Log
- Do not refactor existing working code
- Do not change the design system
```

---

## Resume Bullet (for Mithun's reference)

> Built Motif, an AI creative brief generator that streams structured design briefs in real time using Gemini, dynamically loads Google Font personalities based on project vibe, generates mood images via Hugging Face, and renders shareable moodboards exportable as PNG — built with Next.js 14, TypeScript, and Tailwind CSS.

---

## Last Updated By

`Antigravity AI — 2026-03-14`
