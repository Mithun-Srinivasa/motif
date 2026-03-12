'use client';

interface ToneChipsProps {
  words: string[];
  accentColor?: string;
}

export default function ToneChips({ words, accentColor = '#1a3a2a' }: ToneChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {words.map((word, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            padding: '4px 12px',
            border: `1px solid ${accentColor}`,
            borderRadius: '2px',
            color: accentColor,
            fontSize: '11px',
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {word}
        </span>
      ))}
    </div>
  );
}
