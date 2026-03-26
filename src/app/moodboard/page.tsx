'use client';

import { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import type { MoodboardData, PartialMoodboardData } from '@/types';
import MoodboardCanvas from '@/components/MoodboardCanvas';
import ColorSwatch from '@/components/ColorSwatch';
import ToneChips from '@/components/ToneChips';
import StreamingText from '@/components/StreamingText';
import Link from 'next/link';
import { getContrastText } from '@/lib/colorUtils';

// The moodboard page — handles the streaming + sidebar + canvas layout
// This page is reached after the landing page fires /api/generate and
// redirects here with `?vibe=...` for a fresh generate, or /board/[id] for share view.
// Actually in our flow, landing page navigates to /board/[encoded] directly after getting
// full JSON. This file handles the NEW brief flow from landing when we want live streaming.
// We keep this as the "generate with sidebar" view for the interactive experience.

function MoodboardPageInner() {
  const searchParams = useSearchParams();

  const [data, setData] = useState<PartialMoodboardData>({});
  const [images, setImages] = useState<(string | null)[]>([null, null]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [vibe, setVibe] = useState('');
  const [newVibe, setNewVibe] = useState('');
  const [generating, setGenerating] = useState(false);
  const hasFiredRef = useRef(false);

  // useSearchParams is reactive — updates when the URL changes
  const searchVibe = searchParams.get('vibe');

  const accentColor = data.palette?.find((c) => c.role === 'accent')?.hex ?? '#1a3a2a';

  const streamBrief = useCallback(async (vibeText: string) => {
    setIsStreaming(true);
    setIsComplete(false);
    setData({});
    setImages([null, null]);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vibe: vibeText }),
      });

      if (!res.ok || !res.body) throw new Error('Failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });

        // Strip markdown code fences (model sometimes wraps JSON in ```json...```)
        // then try progressive JSON parse
        const clean = stripCodeFences(accumulated);
        const parsed = tryPartialParse(clean.trim());
        if (parsed) setData(parsed);
      }

      // Final full parse
      try {
        const clean = stripCodeFences(accumulated);
        const finalParsed: MoodboardData = JSON.parse(clean.trim());
        setData(finalParsed);
        setIsComplete(true);
        setIsStreaming(false);

        // Fire image generation once we have prompts
        if (finalParsed.imagePrompts?.length) {
          fetch('/api/images', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompts: finalParsed.imagePrompts }),
          })
            .then((r) => r.json())
            .then((d) => { if (d.images) setImages(d.images); })
            .catch(() => { });
        }
      } catch {
        setIsStreaming(false);
        setIsComplete(true);
      }
    } catch {
      setIsStreaming(false);
    }
  }, []);

  useEffect(() => {
    if (searchVibe && !hasFiredRef.current) {
      hasFiredRef.current = true;
      setVibe(searchVibe);
      streamBrief(searchVibe);
    }
  }, [searchVibe, streamBrief]);

  const handleNewBrief = useCallback(async () => {
    const trimmed = newVibe.trim();
    if (!trimmed) return;
    setGenerating(true);
    setVibe(trimmed);
    setNewVibe('');
    await streamBrief(trimmed);
    setGenerating(false);
  }, [newVibe, streamBrief]);

  const sidebarSection: React.CSSProperties = {
    paddingBottom: '24px',
    borderBottom: '1px solid #e7e5e4',
    marginBottom: '24px',
  };

  const sectionLabel: React.CSSProperties = {
    fontSize: '9px',
    fontFamily: 'DM Sans, sans-serif',
    fontWeight: 600,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: '#78716c',
    marginBottom: '12px',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#faf7f2' }}>
      {/* LEFT SIDEBAR */}
      <aside
        style={{
          width: '280px',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
          borderRight: '1px solid #e7e5e4',
          background: '#faf7f2',
          display: 'flex',
          flexDirection: 'column',
          padding: '28px 24px',
          gap: '0',
        }}
      >
        {/* Motif wordmark */}
        <div style={{ marginBottom: '28px' }}>
          <Link
            href="/"
            style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '26px',
              fontWeight: 400,
              color: '#1a3a2a',
              textDecoration: 'none',
              letterSpacing: '-0.02em',
            }}
          >
            Motif
          </Link>
        </div>

        {/* New brief input */}
        <div style={{ ...sidebarSection }}>
          <textarea
            value={newVibe}
            onChange={(e) => setNewVibe(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleNewBrief();
              }
            }}
            rows={2}
            placeholder="New project vibe…"
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid #e7e5e4',
              outline: 'none',
              resize: 'none',
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontStyle: 'italic',
              fontSize: '14px',
              color: '#1c1917',
              padding: '8px 0',
              lineHeight: 1.5,
              caretColor: '#1a3a2a',
            }}
          />
          <button
            onClick={handleNewBrief}
            disabled={generating || isStreaming}
            style={{
              marginTop: '12px',
              width: '100%',
              padding: '9px 0',
              background: generating || isStreaming ? '#e7e5e4' : accentColor,
              color: generating || isStreaming ? '#78716c' : getContrastText(accentColor),
              border: 'none',
              borderRadius: '2px',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              cursor: generating || isStreaming ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {generating || isStreaming ? 'Generating…' : 'New Brief'}
          </button>
        </div>

        {/* Project title */}
        {data.projectTitle && (
          <div style={sidebarSection} className="fade-up">
            <p style={sectionLabel}>Project</p>
            <h2
              style={{
                fontFamily: 'Cormorant Garamond, Georgia, serif',
                fontSize: '20px',
                fontWeight: 400,
                color: '#1c1917',
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
              }}
            >
              {data.projectTitle}
            </h2>
          </div>
        )}

        {/* Project Essence */}
        {data.projectEssence !== undefined && (
          <div style={sidebarSection} className="fade-up">
            <p style={sectionLabel}>Essence</p>
            <p
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '12px',
                color: '#78716c',
                lineHeight: 1.7,
              }}
            >
              <StreamingText
                text={data.projectEssence ?? ''}
                isStreaming={isStreaming && !data.toneWords}
              />
            </p>
          </div>
        )}

        {/* Tone */}
        {data.toneWords && data.toneWords.length > 0 && (
          <div style={sidebarSection} className="fade-up">
            <p style={sectionLabel}>Tone of Voice</p>
            <ToneChips words={data.toneWords} accentColor={accentColor} />
          </div>
        )}

        {/* Palette mini swatches */}
        {data.palette && data.palette.length > 0 && (
          <div style={sidebarSection} className="fade-up">
            <p style={sectionLabel}>Palette</p>
            <div style={{ display: 'flex', gap: '6px' }}>
              {data.palette.map((swatch) => (
                <ColorSwatch key={swatch.role} swatch={swatch} size="sm" />
              ))}
            </div>
          </div>
        )}

        {/* Typography (personality fonts shown by name — invisible personality key) */}
        {data.suggestedFonts && data.suggestedFonts.length > 0 && (
          <div style={{ ...sidebarSection, borderBottom: 'none', marginBottom: 0 }} className="fade-up">
            <p style={sectionLabel}>Typography</p>
            {data.suggestedFonts.map((font, i) => (
              <div key={i} style={{ marginBottom: i < data.suggestedFonts!.length - 1 ? '10px' : 0 }}>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: '#1c1917', fontWeight: 500 }}>
                  {font.name}
                </p>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '10px', color: '#78716c' }}>
                  {font.role}
                </p>
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* MAIN CANVAS */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        {isStreaming && !data.projectTitle ? (
          /* Loading shimmer before first key arrives */
          <div style={{ padding: '48px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="shimmer" style={{ height: '60px', width: '50%', borderRadius: '4px' }} />
            <div className="shimmer" style={{ height: '20px', width: '80%', borderRadius: '4px' }} />
            <div className="shimmer" style={{ height: '20px', width: '60%', borderRadius: '4px' }} />
          </div>
        ) : (
          <MoodboardCanvas
            data={data}
            images={images}
            isStreaming={isStreaming}
            isReadOnly={false}
          />
        )}
      </main>
    </div>
  );
}

// Suspense wrapper required by Next.js App Router when using useSearchParams()
export default function MoodboardPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#faf7f2' }}>
        <div className="shimmer" style={{ width: '200px', height: '12px', borderRadius: '4px' }} />
      </div>
    }>
      <MoodboardPageInner />
    </Suspense>
  );
}

// ── Strip markdown code fences ─────────────────────────────────────────────────
// Gemini sometimes wraps its JSON in ```json...``` despite instructions.
function stripCodeFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, '')  // leading ```json or ```
    .replace(/\s*```\s*$/i, '');       // trailing ```
}

// ── Progressive JSON parser ────────────────────────────────────────────────────
// Tries to extract whatever keys are available in a partial JSON stream
function tryPartialParse(text: string): PartialMoodboardData | null {
  // Direct parse first
  try { return JSON.parse(text); } catch { /* fall through */ }

  // Try to close the JSON with a } and parse
  const attempts = [
    text + '}',
    text + '"}',
    text + '"]}',
    text + '"]}',
  ];

  for (const attempt of attempts) {
    try { return JSON.parse(attempt); } catch { /* continue */ }
  }

  return null;
}
