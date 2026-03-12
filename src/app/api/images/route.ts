import { InferenceClient } from '@huggingface/inference';
import { NextRequest, NextResponse } from 'next/server';

const STYLE_SUFFIX =
  ', editorial photography, soft natural lighting, high detail, no text, no legible words, no faces, moodboard aesthetic';

const TIMEOUT_MS = 25_000;

async function generateImage(client: InferenceClient, prompt: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const result = await client.textToImage({
      model: 'black-forest-labs/FLUX.1-schnell',
      inputs: prompt + STYLE_SUFFIX,
    });

    clearTimeout(timer);

    // The SDK types textToImage as string|Blob depending on response_format;
    // with no response_format specified it returns a Blob at runtime.
    const blob = result as unknown as Blob;
    const buffer = await blob.arrayBuffer();
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

    const client = new InferenceClient(apiKey);

    // Fire all image requests in parallel
    const images = await Promise.all(
      prompts.map((prompt: string) => generateImage(client, prompt))
    );

    return NextResponse.json({ images });
  } catch (err) {
    console.error('Images route error:', err);
    return NextResponse.json({ error: 'Image generation failed' }, { status: 500 });
  }
}
