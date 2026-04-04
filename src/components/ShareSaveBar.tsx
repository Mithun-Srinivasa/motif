'use client';

import { useState, RefObject } from 'react';
import type { MoodboardData } from '@/types';
import { buildShareUrl } from '@/lib/urlEncoding';
import { getContrastText } from '@/lib/colorUtils';

interface ShareSaveBarProps {
  data: MoodboardData;
  moodboardRef: RefObject<HTMLDivElement | null>;
  canvasBackground: string;
  accentColor?: string; // derived from palette; falls back to #1a3a2a before data loads
}

export default function ShareSaveBar({ data, moodboardRef, canvasBackground, accentColor = '#1a3a2a' }: ShareSaveBarProps) {
  const fgColor = getContrastText(accentColor);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleShare = async () => {
    const url = buildShareUrl(data);
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      if (!moodboardRef.current) return;
      await document.fonts.ready;

      const canvas = await (html2canvas as (el: HTMLElement, opts?: Record<string, unknown>) => Promise<HTMLCanvasElement>)(
        moodboardRef.current,
        {
          scale: 2,
          backgroundColor: canvasBackground,
          useCORS: true,
          allowTaint: true,
          onclone: (clonedDoc: Document) => {
            clonedDoc.body.classList.remove('grain');
            const style = clonedDoc.createElement('style');
            style.innerHTML = '* { animation: none !important; transition: none !important; }';
            clonedDoc.head.appendChild(style);
          }
        }
      );

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/png')
      );
      if (!blob) throw new Error('Canvas toBlob returned null');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `motif-${data.projectTitle.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PNG export failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const btnBase: React.CSSProperties = {
    padding: '10px 20px',
    fontSize: '11px',
    fontFamily: 'DM Sans, sans-serif',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    borderRadius: '2px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      {/* Share Link — outlined, color derived from palette accent */}
      <button
        onClick={handleShare}
        aria-label="Share moodboard link"
        style={{
          ...btnBase,
          background: 'transparent',
          border: `1px solid ${accentColor}`,
          color: accentColor,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = accentColor;
          (e.currentTarget as HTMLButtonElement).style.color = fgColor;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          (e.currentTarget as HTMLButtonElement).style.color = accentColor;
        }}
      >
        {copied ? '✓ Copied' : 'Share Link'}
      </button>

      {/* Save as PNG — filled, color derived from palette accent */}
      <button
        onClick={handleSave}
        disabled={saving}
        aria-label="Export moodboard as a PNG image"
        style={{
          ...btnBase,
          background: accentColor,
          border: `1px solid ${accentColor}`,
          color: fgColor,
          opacity: saving ? 0.75 : 1,
        }}
        onMouseEnter={(e) => {
          if (!saving) (e.currentTarget as HTMLButtonElement).style.opacity = '0.85';
        }}
        onMouseLeave={(e) => {
          if (!saving) (e.currentTarget as HTMLButtonElement).style.opacity = '1';
        }}
      >
        {saving ? 'Saving…' : 'Save as PNG'}
      </button>
    </div>
  );
}
