/* eslint-disable @next/next/no-img-element */
'use client';

// ─── INPUT STYLE SWITCH ─────────────────────────────────────────────────────
// Change this constant to switch between glass and opaque input styles.
// Nothing else needs to change.
const INPUT_STYLE: 'glass' | 'opaque' = 'glass';
// ────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Background images — 8 images in /public/landing/
const BG_IMAGES = Array.from({ length: 8 }, (_, i) => `/landing/bg${i + 1}.webp`);
const BG_INTERVAL_MS = 5000;  // time each image is shown (ms)
const BG_FADE_MS = 1500;       // crossfade duration (ms)

export default function LandingPage() {
  const router = useRouter();
  const [vibe, setVibe] = useState('');
  const [error, setError] = useState('');

  // ── Background image cycling ──────────────────────────────────────────────
  // We render two <img> elements stacked on top of each other.
  // `currentIdx` is the image that is fully visible.
  // `nextIdx` is the one fading in. Once the fade completes we swap them.
  const [currentIdx, setCurrentIdx] = useState(0);
  const [nextIdx, setNextIdx] = useState(1);
  const [isFading, setIsFading] = useState(false);
  const cycleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fadeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Preload a single image by URL
  const preload = useCallback((src: string) => {
    const img = new Image();
    img.src = src;
  }, []);

  useEffect(() => {
    // Preload the very first image immediately (next.js serves /public statically)
    preload(BG_IMAGES[0]);

    const startCycle = () => {
      cycleTimerRef.current = setInterval(() => {
        setCurrentIdx((cur) => {
          const next = (cur + 1) % BG_IMAGES.length;
          const afterNext = (next + 1) % BG_IMAGES.length;

          // Start the fade-in of the next image
          setNextIdx(next);
          setIsFading(true);

          // Preload the image AFTER next so it's ready before it's needed
          preload(BG_IMAGES[afterNext]);

          // After the fade completes, snap current → next and reset fading
          fadeTimerRef.current = setTimeout(() => {
            setCurrentIdx(next);
            setIsFading(false);
          }, BG_FADE_MS);

          return cur; // currentIdx doesn't change here — it changes inside fadeTimer
        });
      }, BG_INTERVAL_MS);
    };

    // Preload image 1 (the first to appear after image 0)
    preload(BG_IMAGES[1]);
    startCycle();

    return () => {
      if (cycleTimerRef.current) clearInterval(cycleTimerRef.current);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Navigation ────────────────────────────────────────────────────────────
  const handleGenerate = useCallback(() => {
    const trimmed = vibe.trim();
    if (!trimmed) return;
    setError('');
    router.push(`/moodboard?vibe=${encodeURIComponent(trimmed)}`);
  }, [vibe, router]);

  const handleKey = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleGenerate();
      }
    },
    [handleGenerate],
  );

  // ── Style derivations ─────────────────────────────────────────────────────
  const isGlass = INPUT_STYLE === 'glass';

  const containerStyle: React.CSSProperties = {
    background: isGlass
      ? 'rgba(255, 255, 255, 0.08)'
      : '#faf7f2',
    backdropFilter: isGlass ? 'blur(12px)' : undefined,
    WebkitBackdropFilter: isGlass ? 'blur(12px)' : undefined,
    border: isGlass
      ? '1px solid rgba(255, 255, 255, 0.18)'
      : '1px solid #e7e5e4',
    boxShadow: isGlass
      ? 'inset 0 1px 0 rgba(255,255,255,0.2), 0 8px 40px rgba(0,0,0,0.3)'
      : '0 8px 40px rgba(0,0,0,0.15)',
    borderRadius: '20px',
    padding: '32px 36px',
    width: 'min(560px, 90vw)',
  };

  const textareaBottomBorder = isGlass
    ? '1px solid rgba(255,255,255,0.25)'
    : '1px solid #d6d3ce';

  const wordmarkColor = isGlass ? '#ffffff' : '#1a3a2a';
  const taglineColor = isGlass ? 'rgba(255,255,255,0.7)' : '#78716c';
  const inputTextColor = isGlass ? 'rgba(255,255,255,0.95)' : '#1c1917';
  const placeholderOpacity = isGlass ? 0.45 : 0.55;
  const errorColor = isGlass ? 'rgba(255,200,100,0.9)' : '#b45309';

  return (
    <main
      style={{
        position: 'relative',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Background image layer ─────────────────────────────────────── */}
      {/* "Current" image — always fully opaque */}
      <img
        src={BG_IMAGES[currentIdx]}
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          zIndex: 0,
          opacity: 1,
        }}
      />

      {/* "Next" image — fades in during transition */}
      <img
        src={BG_IMAGES[nextIdx]}
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          zIndex: 1,
          opacity: isFading ? 1 : 0,
          transition: isFading ? `opacity ${BG_FADE_MS}ms ease-in-out` : 'none',
        }}
      />

      {/* Dark overlay for readability */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.45)',
          zIndex: 2,
        }}
      />

      {/* ── UI layer (above images + overlay) ─────────────────────────── */}
      <div
        style={{
          position: 'relative',
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          padding: '28px 32px',
        }}
      >
        {/* Wordmark — top-left */}
        <div>
          <span
            style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '28px',
              fontWeight: 400,
              color: wordmarkColor,
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            Motif
          </span>
        </div>

        {/* Center content — true viewport center */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Tagline */}
          <p
            style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontStyle: 'italic',
              fontSize: '15px',
              color: taglineColor,
              letterSpacing: '0.02em',
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            Turn a feeling into a design direction.
          </p>

          {/* Input container */}
          <div style={containerStyle}>
            <textarea
              id="vibe-input"
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
              onKeyDown={handleKey}
              rows={3}
              placeholder="Describe a project vibe, a feeling, a brand..."
              aria-label="Project Vibe Description"
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderBottom: textareaBottomBorder,
                outline: 'none',
                resize: 'none',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '18px',
                fontWeight: 300,
                color: inputTextColor,
                lineHeight: 1.5,
                caretColor: isGlass ? 'white' : '#1a3a2a',
                // Use CSS custom property trick for placeholder color
                // We set it via a style tag below
              }}
            />

            {error && (
              <p
                style={{
                  color: errorColor,
                  fontSize: '12px',
                  fontFamily: 'DM Sans, sans-serif',
                  marginTop: '8px',
                }}
              >
                {error}
              </p>
            )}

            {/* Generate Brief button — 20px below textarea */}
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
              <button
                id="generate-btn"
                onClick={handleGenerate}
                aria-label="Generate an AI driven creative brief"
                style={{
                  background: isGlass ? 'white' : '#1a3a2a',
                  color: isGlass ? '#1a3a2a' : '#faf7f2',
                  border: isGlass ? '1px solid white' : 'none',
                  padding: '12px 36px',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease, color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  if (isGlass) {
                    el.style.background = 'transparent';
                    el.style.color = 'white';
                  } else {
                    el.style.background = '#2d5a3d';
                  }
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  if (isGlass) {
                    el.style.background = 'white';
                    el.style.color = '#1a3a2a';
                  } else {
                    el.style.background = '#1a3a2a';
                  }
                }}
              >
                Generate Brief
              </button>
            </div>
          </div>
        </div>

        {/* Footer — bottom-left */}
        <div>
          <p
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '11px',
              color: isGlass ? 'rgba(255,255,255,0.4)' : '#78716c',
              letterSpacing: '0.04em',
            }}
          >
            Made by Mithun Srinivasa
          </p>
        </div>
      </div>


      {/* ── Placeholder color override via scoped style tag ─────────────── */}
      {/* React does not support ::placeholder in inline styles, so we inject
          a minimal <style> tag to set the placeholder color per INPUT_STYLE  */}
      <style>{`
        #vibe-input::placeholder {
          color: ${isGlass
          ? `rgba(255,255,255,${placeholderOpacity})`
          : `rgba(28,25,23,${placeholderOpacity})`
        };
        }
      `}</style>
    </main>
  );
}
