import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Motif: Turn a feeling into a design direction',
  description:
    'An AI creative brief generator. Type your project vibe and get a streaming moodboard with colors, typography, tone of voice, and mood images.',
  keywords: ['creative brief', 'moodboard generator', 'AI design', 'brand identity', 'color palette'],
  authors: [{ name: 'Mithun Srinivasa' }],
  openGraph: {
    title: 'Motif: Turn a feeling into a design direction',
    description: 'AI creative brief generator. Vibe → Moodboard.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* App chrome fonts — always Cormorant Garamond + DM Sans */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="grain">
        {children}
      </body>
    </html>
  );
}
