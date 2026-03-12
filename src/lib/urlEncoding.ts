import type { MoodboardData } from '@/types';

export function encodeMoodboard(data: MoodboardData): string {
  return btoa(encodeURIComponent(JSON.stringify(data)));
}

export function decodeMoodboard(encoded: string): MoodboardData {
  return JSON.parse(decodeURIComponent(atob(encoded)));
}

export function buildShareUrl(data: MoodboardData): string {
  if (typeof window === 'undefined') return '';
  const encoded = encodeMoodboard(data);
  return `${window.location.origin}/board/${encoded}`;
}
