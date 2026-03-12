import { GoogleGenerativeAI, GenerateContentStreamResult } from '@google/generative-ai';
import { NextRequest } from 'next/server';

const SYSTEM_PROMPT = `You are a senior creative director and brand strategist. Generate a structured creative brief for the project described. Return ONLY valid JSON — no markdown, no explanation, no code fences.

Return this exact structure:
{
  "projectTitle": "string — an evocative project name, max 6 words",
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
- Never use clichés like "timeless" or "innovative"`;

// Model priority — gemini-2.0-flash first, fallback to gemini-1.5-flash if rate limited
// Per ListModels: gemini-2.5-flash-lite is the AI_README target model.
// gemini-2.0-flash is the fallback. gemini-1.5-flash does NOT exist on this key.
const MODEL_PRIORITY = ['gemini-2.5-flash-lite', 'gemini-2.0-flash'];

async function getStream(
  genAI: GoogleGenerativeAI,
  vibe: string
): Promise<GenerateContentStreamResult> {
  let lastError: unknown;

  for (const modelName of MODEL_PRIORITY) {
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: SYSTEM_PROMPT,
    });

    // Retry up to 2 times on 429
    for (let attempt = 0; attempt <= 2; attempt++) {
      try {
        const result = await model.generateContentStream(
          `Generate a creative brief for this project vibe: "${vibe}"`
        );
        return result; // success
      } catch (err: unknown) {
        lastError = err;
        const msg = String((err as { message?: string })?.message ?? err);
        const is429 = msg.includes('429') || msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('rate');
        if (is429 && attempt < 2) {
          await new Promise((res) => setTimeout(res, (attempt + 1) * 4000)); // 4s, 8s
          continue;
        }
        break; // not 429 or exhausted retries for this model
      }
    }
    // Try next model
  }

  throw lastError ?? new Error('All models exhausted');
}

export async function POST(req: NextRequest) {
  try {
    const { vibe } = await req.json();

    if (!vibe || typeof vibe !== 'string') {
      return new Response(JSON.stringify({ error: 'vibe is required' }), { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not configured' }), { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const streamResult = await getStream(genAI, vibe);

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamResult.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    console.error('Generate route error:', {
      message: e?.message,
      status: e?.status,
      raw: String(err),
    });
    return new Response(
      JSON.stringify({ error: 'Generation failed', detail: e?.message ?? String(err) }),
      { status: 500 }
    );
  }
}
