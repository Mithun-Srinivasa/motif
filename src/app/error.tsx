'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if hooked up
    console.error('Motif Application Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#faf7f2] p-6 text-center antialiased">
      <div className="fade-up max-w-md space-y-6">
        <h2 className="text-3xl font-light text-[#1c1917] tracking-tight">Something went wrong.</h2>
        <p className="text-[#57534e] text-sm leading-relaxed">
          The application encountered an unexpected error. This might be due to a network interruption or an AI service timeout.
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex h-10 items-center justify-center rounded-full bg-[#1c1917] px-6 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-black/80"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
