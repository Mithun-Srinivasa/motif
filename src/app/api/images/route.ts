import { NextRequest, NextResponse } from 'next/server';

const STYLE_SUFFIX =
  ', editorial photography, soft natural lighting, high detail, no text, no legible words, no faces, moodboard aesthetic';

const TIMEOUT_MS = 25_000;

async function generateImage(apiKey: string, prompt: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const model = 'black-forest-labs/FLUX.1-schnell';
    const url = `https://router.huggingface.co/hf-inference/models/${model}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs: prompt + STYLE_SUFFIX }),
      signal: controller.signal
    });

    clearTimeout(timer);

    if (!res.ok) {
      console.error('HF API Error:', res.status, await res.text());
      return null;
    }

    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:image/png;base64,${base64}`;
  } catch (err) {
    console.error('Image generation failed:', err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { prompts } = await req.json();

    if (!Array.isArray(prompts) || prompts.length === 0) {
      return NextResponse.json({ error: 'prompts array required' }, { status: 400 });
    }

    const apiKey = process.env.HF_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'HF_API_KEY not configured' }, { status: 500 });
    }

    // Fire all image requests in parallel
    const images = await Promise.all(
      prompts.map((prompt: string) => generateImage(apiKey, prompt))
    );

    return NextResponse.json({ images });
  } catch (err) {
    console.error('Images route error:', err);
    return NextResponse.json({ error: 'Image generation failed' }, { status: 500 });
  }
}
