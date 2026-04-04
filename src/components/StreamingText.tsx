'use client';

interface StreamingTextProps {
  text: string;
  isStreaming?: boolean;
  className?: string;
}

export default function StreamingText({ text, isStreaming = false, className = '' }: StreamingTextProps) {
  return (
    <span 
      className={className} 
      aria-live="polite" 
      aria-atomic="true"
    >
      {text}
      {isStreaming && <span className="cursor-blink" aria-hidden="true" />}
    </span>
  );
}
