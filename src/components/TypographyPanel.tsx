'use client';

import type { SuggestedFont } from '@/types';

interface TypographyPanelProps {
  fonts: SuggestedFont[];
}

export default function TypographyPanel({ fonts }: TypographyPanelProps) {
  return (
    <div style={{ display: 'flex', gap: '16px' }}>
      {fonts.map((font, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            background: '#f5f1ea',
            borderRadius: '4px',
            padding: '20px',
            border: '1px solid #e7e5e4',
          }}
        >
          {/* Role badge */}
          <span
            style={{
              display: 'inline-block',
              padding: '2px 8px',
              background: '#e7e5e4',
              borderRadius: '2px',
              fontSize: '9px',
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#78716c',
              marginBottom: '12px',
            }}
          >
            {font.role}
          </span>
          {/* Font name */}
          <p
            style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '22px',
              color: '#1c1917',
              fontWeight: 500,
              marginBottom: '8px',
              lineHeight: 1.2,
            }}
          >
            {font.name}
          </p>
          {/* Specimen text */}
          <p
            style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '13px',
              color: '#78716c',
              fontStyle: 'italic',
              marginBottom: '12px',
              lineHeight: 1.5,
            }}
          >
            The quick brown fox jumps over the lazy dog
          </p>
          {/* Rationale */}
          <p
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '11px',
              color: '#78716c',
              lineHeight: 1.6,
            }}
          >
            {font.rationale}
          </p>
        </div>
      ))}
    </div>
  );
}
