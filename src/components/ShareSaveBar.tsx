'use client';

import { useState, RefObject } from 'react';
import type { MoodboardData } from '@/types';
import { buildShareUrl } from '@/lib/urlEncoding';

interface ShareSaveBarProps {
  data: MoodboardData;
  moodboardRef: RefObject<HTMLDivElement | null>;
  canvasBackground: string;
}

export default function ShareSaveBar({ data, moodboardRef, canvasBackground }: ShareSaveBarProps) {
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
      {/* Share Link — outlined */}
      <button
        onClick={handleShare}
        style={{
          ...btnBase,
          background: 'transparent',
          border: '1px solid #1a3a2a',
          color: '#1a3a2a',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = '#1a3a2a';
          (e.currentTarget as HTMLButtonElement).style.color = '#faf7f2';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          (e.currentTarget as HTMLButtonElement).style.color = '#1a3a2a';
        }}
      >
        {copied ? '✓ Copied' : 'Share Link'}
      </button>

      {/* Save as PNG — filled */}
      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          ...btnBase,
          background: saving ? '#2d5a3d' : '#1a3a2a',
          border: '1px solid #1a3a2a',
          color: '#faf7f2',
          opacity: saving ? 0.75 : 1,
        }}
        onMouseEnter={(e) => {
          if (!saving) (e.currentTarget as HTMLButtonElement).style.background = '#2d5a3d';
        }}
        onMouseLeave={(e) => {
          if (!saving) (e.currentTarget as HTMLButtonElement).style.background = '#1a3a2a';
        }}
      >
        {saving ? 'Saving…' : 'Save as PNG'}
      </button>
    </div>
  );
}
