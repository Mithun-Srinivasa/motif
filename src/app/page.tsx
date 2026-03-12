'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const EXAMPLE_PROMPTS = [
  { text: 'A cozy Japanese coffee shop rebrand. Autumn. Unhurried.', bg: ['#fef3c7', '#fde68a', '#fef9ee'] },
  { text: 'Tech startup for sustainable fashion. Bold. Gen-Z.', bg: ['#d1fae5', '#a7f3d0', '#f0fdf4'] },
  { text: 'Luxury wellness retreat in Bali. Serene. Earthy.', bg: ['#fce7f3', '#fbcfe8', '#fff1f2'] },
];

export default function LandingPage() {
  const router = useRouter();
  const [vibe, setVibe] = useState('');
  const [activePrompt, setActivePrompt] = useState(0);
  const [promptVisible, setPromptVisible] = useState(false);
  const [error, setError] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const activeBg = EXAMPLE_PROMPTS[activePrompt];

  useEffect(() => {
    const t = setTimeout(() => setPromptVisible(true), 400);
    intervalRef.current = setInterval(() => {
      setActivePrompt((p) => (p + 1) % EXAMPLE_PROMPTS.length);
    }, 4000);
    return () => {
      clearTimeout(t);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleGenerate = useCallback(() => {
    const trimmed = vibe.trim();
    if (!trimmed) {
      setError('Tell me what you\'re building first.');
      return;
    }
    if (trimmed.length < 5) {
      setError('Give me a bit more to work with.');
      return;
    }
    setError('');
    // Redirect immediately — moodboard page handles streaming
    router.push(`/moodboard?vibe=${encodeURIComponent(trimmed)}`);
  }, [vibe, router]);

  const handleKey = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  }, [handleGenerate]);

  const bgGradient = `radial-gradient(ellipse at 15% 40%, ${activeBg.bg[0]} 0%, ${activeBg.bg[2]} 45%, #faf7f2 100%)`;

  return (
    <main
      className="transition-bg"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        background: bgGradient,
        position: 'relative',
      }}
    >
      {/* Wordmark */}
      <h1
        style={{
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: 'clamp(80px, 16vw, 180px)',
          fontWeight: 300,
          color: '#1a3a2a',
          letterSpacing: '-0.04em',
          lineHeight: 0.9,
          marginBottom: '12px',
          textAlign: 'center',
        }}
      >
        Motif
      </h1>

      <p
        style={{
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontStyle: 'italic',
          fontSize: 'clamp(14px, 2vw, 18px)',
          color: '#78716c',
          marginBottom: '52px',
          textAlign: 'center',
          letterSpacing: '0.02em',
        }}
      >
        Turn a feeling into a design direction.
      </p>

      {/* Input area */}
      <div style={{ width: '100%', maxWidth: '680px' }}>
        <textarea
          id="vibe-input"
          value={vibe}
          onChange={(e) => setVibe(e.target.value)}
          onKeyDown={handleKey}
          rows={3}
          placeholder="Describe your project vibe…"
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            borderBottom: '1px solid #1a3a2a',
            outline: 'none',
            resize: 'none',
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontStyle: 'italic',
            fontSize: 'clamp(18px, 2.5vw, 26px)',
            color: '#1c1917',
            padding: '16px 0',
            lineHeight: 1.5,
            caretColor: '#1a3a2a',
          }}
        />

        {error && (
          <p style={{ color: '#b45309', fontSize: '12px', fontFamily: 'DM Sans, sans-serif', marginTop: '8px' }}>
            {error}
          </p>
        )}

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            id="generate-btn"
            onClick={handleGenerate}
            style={{
              background: '#1a3a2a',
              color: '#faf7f2',
              border: 'none',
              padding: '12px 32px',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              borderRadius: '2px',
              cursor: 'pointer',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#2d5a3d'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#1a3a2a'; }}
          >
            Generate Brief
          </button>
        </div>

        {/* Example prompt chips */}
        <div
          style={{
            marginTop: '40px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          {EXAMPLE_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => {
                setVibe(prompt.text);
                setActivePrompt(i);
              }}
              style={{
                background: 'rgba(255,255,255,0.5)',
                border: '1px solid #e7e5e4',
                borderRadius: '2px',
                padding: '8px 14px',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '12px',
                color: '#78716c',
                cursor: 'pointer',
                transition: 'all 0.2s ease, opacity 0.8s ease, transform 0.8s ease',
                backdropFilter: 'blur(4px)',
                opacity: promptVisible ? 1 : 0,
                transform: promptVisible ? 'translateY(0)' : 'translateY(8px)',
                transitionDelay: `${i * 120}ms`,
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.background = 'rgba(255,255,255,0.85)';
                el.style.color = '#1c1917';
                el.style.borderColor = '#78716c';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.background = 'rgba(255,255,255,0.5)';
                el.style.color = '#78716c';
                el.style.borderColor = '#e7e5e4';
              }}
            >
              {prompt.text}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <p
        style={{
          position: 'absolute',
          bottom: '24px',
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '11px',
          color: '#78716c',
          letterSpacing: '0.04em',
        }}
      >
        Made by Mithun Srinivasa
      </p>
    </main>
  );
}
