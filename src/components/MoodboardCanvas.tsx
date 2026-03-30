'use client';

import { useRef, useEffect, useCallback } from 'react';
import type { MoodboardData, PartialMoodboardData } from '@/types';
import { FONT_PERSONALITIES } from '@/lib/fontPersonalities';
import { getCanvasBackground, buildCardSwatch } from '@/lib/colorUtils';
import ColorSwatch from './ColorSwatch';
import ColorComposition from './ColorComposition';
import ToneChips from './ToneChips';
import TypographyPanel from './TypographyPanel';
import MoodImage from './MoodImage';
import StreamingText from './StreamingText';
import ShareSaveBar from './ShareSaveBar';

interface MoodboardCanvasProps {
  data: PartialMoodboardData;
  images: (string | null)[];
  isStreaming?: boolean;
  isReadOnly?: boolean;
}

export default function MoodboardCanvas({
  data,
  images,
  isStreaming = false,
  isReadOnly = false,
}: MoodboardCanvasProps) {
  const moodboardRef = useRef<HTMLDivElement>(null);
  const fontLinkRef = useRef<HTMLLinkElement | null>(null);


  const canvasBg = data.palette && data.palette.length > 0
    ? getCanvasBackground(data.palette as MoodboardData['palette'])
    : '#f5f1ea';

  const accentColor = data.palette?.find((c) => c.role === 'accent')?.hex ?? '#1a3a2a';
  const textColor = data.palette?.find((c) => c.role === 'text')?.hex ?? '#1c1917';

  // Build the 6-swatch palette: the 5 AI colours + the computed card/backdrop swatch
  const fullPalette = data.palette && data.palette.length > 0
    ? [...(data.palette as import('@/types').ColorSwatch[]), buildCardSwatch(data.palette as import('@/types').ColorSwatch[])]
    : [];

  // Inject personality fonts dynamically
  useEffect(() => {
    if (!data.fontPersonality) return;
    const p = FONT_PERSONALITIES[data.fontPersonality];
    if (!fontLinkRef.current) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = p.googleFontsUrl;
      document.head.appendChild(link);
      fontLinkRef.current = link;
    } else {
      fontLinkRef.current.href = p.googleFontsUrl;
    }

    // Set CSS variables on canvas element
    if (moodboardRef.current) {
      moodboardRef.current.style.setProperty('--font-display', `'${p.displayFont}', serif`);
      moodboardRef.current.style.setProperty('--font-body', `'${p.bodyFont}', sans-serif`);
    }

    return () => {
      // Don't remove on cleanup — avoid flash. A new personality will update href.
    };
  }, [data.fontPersonality]);

  const sectionLabel: React.CSSProperties = {
    fontSize: '9px',
    fontFamily: 'DM Sans, sans-serif',
    fontWeight: 600,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: '#78716c',
    marginBottom: '14px',
  };

  const divider: React.CSSProperties = {
    width: '100%',
    height: '1px',
    background: '#e7e5e4',
    margin: '32px 0',
  };

  return (
    <div
      ref={moodboardRef}
      style={{
        background: canvasBg,
        minHeight: '100%',
        padding: '48px',
        transition: 'background 0.5s ease',
      }}
    >
      {/* Project Title */}
      {data.projectTitle && (
        <div className="fade-up" style={{ marginBottom: '40px' }}>
          <p style={sectionLabel}>Project</p>
          <h1
            className="canvas-display"
            style={{
              fontSize: 'clamp(36px, 5vw, 60px)',
              fontWeight: 300,
              color: textColor,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            {data.projectTitle}
          </h1>
        </div>
      )}

      {/* 2-col grid: Essence + Tone + Palette  |  Images */}
      {(data.projectEssence || data.toneWords) && (
        <div
          className="fade-up"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '32px',
            marginBottom: '0',
          }}
        >
          {/* Left: Essence + Tone + Palette */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {data.projectEssence !== undefined && (
              <div style={{ marginBottom: '24px' }}>
                <p style={sectionLabel}>Essence</p>
                <p
                  className="canvas-body"
                  style={{
                    fontSize: '15px',
                    lineHeight: 1.75,
                    color: textColor,
                    opacity: 0.9,
                  }}
                >
                  <StreamingText
                    text={data.projectEssence ?? ''}
                    isStreaming={isStreaming && !data.toneWords}
                  />
                </p>
              </div>
            )}

            {data.toneWords && data.toneWords.length > 0 && (
              <div style={{ marginBottom: '28px' }}>
                <p style={sectionLabel}>Tone of Voice</p>
                <ToneChips words={data.toneWords} accentColor={accentColor} />
              </div>
            )}

            {/* Color Palette — in left column, below Tone of Voice, beside images */}
            {fullPalette.length > 0 && (
              <div style={{ marginTop: '4px' }}>
                <p style={sectionLabel}>Color Palette</p>
                {/* 2 rows × 3 columns grid — gives each swatch room to show full description */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {fullPalette.map((swatch) => (
                    <ColorSwatch key={swatch.role} swatch={swatch} size="lg" />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Mood images */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <MoodImage
              src={images[0] ?? null}
              prompt={data.imagePrompts?.[0]}
              alt="Mood image 1"
            />
            <MoodImage
              src={images[1] ?? null}
              prompt={data.imagePrompts?.[1]}
              alt="Mood image 2"
            />
          </div>
        </div>
      )}

      {/* Color Palette moved into left column of the 2-col grid above */}

      {/* Color in Context — weighted composition */}
      {data.palette && data.palette.length >= 5 && (
        <div className="fade-up">
          <div style={divider} />
          <p style={sectionLabel}>Color in Context</p>
          <ColorComposition palette={data.palette} />
        </div>
      )}

      {/* Typography */}
      {data.suggestedFonts && data.suggestedFonts.length > 0 && (
        <div className="fade-up">
          <div style={divider} />
          <p style={sectionLabel}>Typography</p>
          <TypographyPanel fonts={data.suggestedFonts} />
        </div>
      )}

      {/* Action bar — only when not read-only and data is complete */}
      {!isReadOnly && !isStreaming && data.projectTitle && data.palette && data.suggestedFonts && (
        <div className="fade-up" style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid #e7e5e4' }}>
          <ShareSaveBar
            data={data as MoodboardData}
            moodboardRef={moodboardRef}
            canvasBackground={canvasBg}
            accentColor={accentColor}
          />
        </div>
      )}
    </div>
  );
}
