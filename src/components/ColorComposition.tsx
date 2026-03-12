'use client';

import type { ColorSwatch } from '@/types';
import { getContrastText } from '@/lib/colorUtils';

interface ColorCompositionProps {
  palette: ColorSwatch[];
}

/**
 * Weighted color composition — each role gets a shape
 * that reflects its semantic weight in the design system.
 *
 * Surface = large background container everything sits on
 * Primary = big bold block (~40% width, full height)
 * Accent  = thin vertical stripe (energy, used sparingly)
 * Text    = "Aa" specimen rendered in text color on surface
 * Highlight = small glowing dot/square
 */
export default function ColorComposition({ palette }: ColorCompositionProps) {
  const get = (role: string) => palette.find((c) => c.role === role);

  const primary = get('primary');
  const accent = get('accent');
  const surface = get('surface');
  const text = get('text');
  const highlight = get('highlight');

  if (!primary || !accent || !surface || !text || !highlight) return null;

  const surfaceBg = surface.hex;
  const surfaceText = getContrastText(surfaceBg);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 9',
        borderRadius: '6px',
        overflow: 'hidden',
        background: surfaceBg,
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)',
        display: 'flex',
      }}
    >
      {/* PRIMARY — big bold block, left 42% */}
      <div
        style={{
          width: '42%',
          height: '100%',
          background: primary.hex,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '14px',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            color: getContrastText(primary.hex),
            fontSize: '9px',
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            opacity: 0.7,
          }}
        >
          Primary
        </span>
        <span
          style={{
            color: getContrastText(primary.hex),
            fontSize: '11px',
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 500,
            marginTop: '2px',
          }}
        >
          {primary.hex}
        </span>
      </div>

      {/* ACCENT — thin vertical stripe */}
      <div
        style={{
          width: '10%',
          minWidth: '28px',
          height: '100%',
          background: accent.hex,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '10px 6px',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            color: getContrastText(accent.hex),
            fontSize: '8px',
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            opacity: 0.7,
          }}
        >
          Accent
        </span>
      </div>

      {/* SURFACE — the remaining area is the surface itself */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '14px',
        }}
      >
        {/* Surface label */}
        <span
          style={{
            color: surfaceText,
            fontSize: '9px',
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            opacity: 0.45,
          }}
        >
          Surface · {surface.hex}
        </span>

        {/* TEXT specimen — "Aa" in the text color, centered */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            gap: '4px',
          }}
        >
          <span
            className="canvas-display"
            style={{
              color: text.hex,
              fontSize: 'clamp(32px, 4vw, 48px)',
              fontWeight: 300,
              lineHeight: 1,
            }}
          >
            Aa
          </span>
          <span
            style={{
              color: text.hex,
              fontSize: '9px',
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              opacity: 0.6,
            }}
          >
            Text · {text.hex}
          </span>
        </div>

        {/* HIGHLIGHT — glowing square, bottom right (pushed up to avoid label clipping) */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span
            style={{
              color: surfaceText,
              fontSize: '8px',
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              opacity: 0.5,
              whiteSpace: 'nowrap',
            }}
          >
            Highlight
          </span>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '5px',
              background: highlight.hex,
              boxShadow: `0 0 14px ${highlight.hex}66, 0 0 28px ${highlight.hex}22`,
              flexShrink: 0,
            }}
          />
        </div>
      </div>
    </div>
  );
}
