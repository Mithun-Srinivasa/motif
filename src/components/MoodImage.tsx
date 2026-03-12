'use client';

import { useState } from 'react';

interface MoodImageProps {
  src: string | null;
  prompt?: string;
  alt?: string;
}

export default function MoodImage({ src, prompt, alt = 'Mood image' }: MoodImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const showImage = src && !error;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '4/3',
        borderRadius: '4px',
        overflow: 'hidden',
        background: '#ede8e0',
      }}
    >
      {/* Shimmer while loading */}
      {(!loaded || !showImage) && (
        <div
          className="shimmer"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'flex-end',
            padding: '12px',
          }}
        >
          {prompt && !showImage && (
            <p
              style={{
                color: '#78716c',
                fontSize: '10px',
                fontFamily: 'DM Sans, sans-serif',
                lineHeight: 1.4,
                opacity: 0.7,
              }}
            >
              {prompt.length > 80 ? prompt.slice(0, 80) + '…' : prompt}
            </p>
          )}
        </div>
      )}

      {/* Actual image */}
      {showImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.6s ease',
          }}
        />
      )}
    </div>
  );
}
