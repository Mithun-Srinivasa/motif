'use client';

import { use, useEffect, useState } from 'react';
import { decodeMoodboard } from '@/lib/urlEncoding';
import type { MoodboardData } from '@/types';
import MoodboardCanvas from '@/components/MoodboardCanvas';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BoardPage({ params }: PageProps) {
  const { id } = use(params);
  const [data, setData] = useState<MoodboardData | null>(null);
  const [images, setImages] = useState<(string | null)[]>([null, null]);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const load = async () => {
      try {
        const decoded = decodeMoodboard(id);
        if (!mounted) return;
        setData(decoded);

        // Only regenerate images if prompts were included in the share data
        if (decoded.imagePrompts && decoded.imagePrompts.length > 0) {
          fetch('/api/images', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompts: decoded.imagePrompts }),
          })
            .then((r) => r.json())
            .then((d) => {
              if (!mounted) return;
              if (d.images) setImages(d.images);
            })
            .catch(() => {
              // Graceful degradation — shimmer stays
            });
        }
      } catch {
        if (!mounted) return;
        setError(true);
      }
    };
    
    load();
    
    return () => {
      mounted = false;
    };
  }, [id]);

  if (error) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#faf7f2',
          gap: '24px',
          fontFamily: 'DM Sans, sans-serif',
        }}
      >
        <p style={{ fontSize: '14px', color: '#78716c' }}>This link seems to have expired or is invalid.</p>
        <Link
          href="/"
          style={{
            padding: '10px 24px',
            background: '#1a3a2a',
            color: '#faf7f2',
            fontSize: '11px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            borderRadius: '2px',
          }}
        >
          Make your own
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#faf7f2',
        }}
      >
        <div
          className="shimmer"
          style={{ width: '200px', height: '12px', borderRadius: '4px' }}
        />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf7f2' }}>
      {/* Shared view top bar */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(250, 247, 242, 0.85)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #e7e5e4',
          padding: '12px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: '22px',
            fontWeight: 400,
            color: '#1a3a2a',
            letterSpacing: '-0.02em',
          }}
        >
          Motif
        </span>
        <Link
          href="/"
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#1a3a2a',
            textDecoration: 'none',
            padding: '8px 20px',
            border: '1px solid #1a3a2a',
            borderRadius: '2px',
            transition: 'all 0.2s ease',
          }}
        >
          Make your own →
        </Link>
      </div>

      {/* Canvas — read-only */}
      <MoodboardCanvas
        data={data}
        images={images}
        isStreaming={false}
        isReadOnly={true}
      />

      {/* CTA bottom */}
      <div
        style={{
          padding: '48px',
          borderTop: '1px solid #e7e5e4',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          background: '#faf7f2',
        }}
      >
        <p
          style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: '22px',
            color: '#1c1917',
            fontStyle: 'italic',
          }}
        >
          Turn your feeling into a design direction.
        </p>
        <Link
          href="/"
          style={{
            padding: '12px 32px',
            background: '#1a3a2a',
            color: '#faf7f2',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            borderRadius: '2px',
          }}
        >
          Make your own →
        </Link>
        <p
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '11px',
            color: '#78716c',
          }}
        >
          Made by Mithun Srinivasa
        </p>
      </div>
    </div>
  );
}
